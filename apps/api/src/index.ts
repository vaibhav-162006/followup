import cors from "@fastify/cors";
import Fastify from "fastify";
import { z } from "zod";
import { API_ORIGIN, API_PORT, WEB_ORIGIN } from "@followup/config";
import type { HealthResponse } from "@followup/types";

const healthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.literal("followup-api"),
  timestamp: z.string(),
});

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: WEB_ORIGIN,
});

app.get("/health", async (): Promise<HealthResponse> => {
  return healthResponseSchema.parse({
    status: "ok",
    service: "followup-api",
    timestamp: new Date().toISOString(),
  });
});

const port = Number(process.env.PORT ?? API_PORT);

await app.listen({ port, host: "127.0.0.1" });

app.log.info(`FollowUp API ready at ${API_ORIGIN}`);
