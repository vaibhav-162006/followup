import type {
  CreateLeadInput,
  Lead,
  LeadActivity,
  LeadStatus,
  UpdateLeadInput,
} from "@followup/types";

async function handle<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // response had no JSON body
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function listLeads(status?: LeadStatus): Promise<Lead[]> {
  const query = status ? `?status=${status}` : "";
  const response = await fetch(`/api/leads${query}`);
  const data = await handle<{ leads: Lead[] }>(response);
  return data.leads;
}

export async function getLead(
  id: string,
): Promise<{ lead: Lead; activities: LeadActivity[] }> {
  const response = await fetch(`/api/leads/${id}`);
  return handle(response);
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await handle<{ lead: Lead }>(response);
  return data.lead;
}

export async function updateLead(
  id: string,
  input: UpdateLeadInput,
): Promise<Lead> {
  const response = await fetch(`/api/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await handle<{ lead: Lead }>(response);
  return data.lead;
}

export async function deleteLead(id: string): Promise<void> {
  const response = await fetch(`/api/leads/${id}`, { method: "DELETE" });
  await handle<void>(response);
}

export async function addNote(
  id: string,
  body: string,
): Promise<LeadActivity> {
  const response = await fetch(`/api/leads/${id}/activities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  const data = await handle<{ activity: LeadActivity }>(response);
  return data.activity;
}
