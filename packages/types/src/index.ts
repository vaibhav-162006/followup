export type HealthStatus = "ok" | "degraded";

export type HealthResponse = {
  status: HealthStatus;
  service: "followup-api";
  timestamp: string;
};
