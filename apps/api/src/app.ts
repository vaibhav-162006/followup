import cors from "@fastify/cors";
import Fastify from "fastify";
import { ZodError } from "zod";
import { WEB_ORIGIN } from "@followup/config";
import { prismaPlugin } from "./plugins/prisma.js";
import { healthRoutes } from "./routes/health.js";
import { leadRoutes } from "./routes/leads.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: WEB_ORIGIN,
  });
  await app.register(prismaPlugin);
  await app.register(healthRoutes);
  await app.register(leadRoutes);

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: "Validation failed",
        details: error.issues,
      });
    }

    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
        ? error.statusCode
        : 500;

    if (statusCode >= 500) {
      request.log.error(error);
    }

    const message =
      error instanceof Error ? error.message : "Internal server error";

    return reply.code(statusCode).send({
      error: statusCode >= 500 ? "Internal server error" : message,
    });
  });

  return app;
}
