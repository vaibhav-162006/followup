export type HealthStatus = "ok" | "degraded";
export type DatabaseStatus = "up" | "down";

export type HealthResponse = {
  status: HealthStatus;
  service: "followup-api";
  timestamp: string;
  database: DatabaseStatus;
};

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "FOLLOW_UP"
  | "WON"
  | "LOST";

export type LeadSource = "WHATSAPP" | "MANUAL" | "OTHER";

export type ActivityType =
  | "CREATED"
  | "NOTE"
  | "STATUS_CHANGE"
  | "FOLLOW_UP_SCHEDULED"
  | "FOLLOW_UP_COMPLETED";

export type FollowUpStatus = "PENDING" | "DONE" | "CANCELLED";

export type Lead = {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  status: LeadStatus;
  source: LeadSource;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LeadActivity = {
  id: string;
  leadId: string;
  userId: string | null;
  type: ActivityType;
  body: string;
  createdAt: string;
};

export type CreateLeadInput = {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  source?: LeadSource;
};

export type UpdateLeadInput = {
  name?: string;
  phone?: string;
  email?: string | null;
  notes?: string | null;
  status?: LeadStatus;
};
