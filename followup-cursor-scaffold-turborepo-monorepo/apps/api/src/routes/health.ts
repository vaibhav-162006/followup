import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { HealthResponse } from "@followup/types";

const healthResponseSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  service: z.literal("followup-api"),
  timestamp: z.string(),
  database: z.enum(["up", "down"]),
});

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async (): Promise<HealthResponse> => {
    let database: HealthResponse["database"] = "down";

    try {
      await app.prisma.$queryRaw`SELECT 1`;
      database = "up";
    } catch (error) {
      app.log.error(error, "Database health check failed");
    }

    return healthResponseSchema.parse({
      status: database === "up" ? "ok" : "degraded",
      service: "followup-api",
      timestamp: new Date().toISOString(),
      database,
    });
  });
}
