import type { Lead as LeadRecord, LeadActivity as ActivityRecord } from "@prisma/client";
import type { Lead, LeadActivity } from "@followup/types";

export function serializeLead(lead: LeadRecord): Lead {
  return {
    id: lead.id,
    businessId: lead.businessId,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    notes: lead.notes,
    status: lead.status,
    source: lead.source,
    lastContactedAt: lead.lastContactedAt?.toISOString() ?? null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

export function serializeActivity(activity: ActivityRecord): LeadActivity {
  return {
    id: activity.id,
    leadId: activity.leadId,
    userId: activity.userId,
    type: activity.type,
    body: activity.body,
    createdAt: activity.createdAt.toISOString(),
  };
}

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
