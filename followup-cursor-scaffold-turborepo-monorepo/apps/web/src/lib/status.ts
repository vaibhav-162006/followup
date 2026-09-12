import type { LeadStatus } from "@followup/types";

export const STATUS_ORDER: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "FOLLOW_UP",
  "WON",
  "LOST",
];

export const STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  FOLLOW_UP: "Follow up",
  WON: "Won",
  LOST: "Lost",
};

export const STATUS_DOT: Record<LeadStatus, string> = {
  NEW: "bg-sky-400",
  CONTACTED: "bg-amber-400",
  FOLLOW_UP: "bg-emerald-400",
  WON: "bg-lime-400",
  LOST: "bg-zinc-500",
};

export const STATUS_BADGE: Record<LeadStatus, string> = {
  NEW: "border-sky-400/30 text-sky-300",
  CONTACTED: "border-amber-400/30 text-amber-300",
  FOLLOW_UP: "border-emerald-400/30 text-emerald-300",
  WON: "border-lime-400/30 text-lime-300",
  LOST: "border-zinc-500/30 text-zinc-400",
};

export function nextStatus(status: LeadStatus): LeadStatus | null {
  const index = STATUS_ORDER.indexOf(status);
  if (index === -1 || index >= 3) return null; // WON/LOST are terminal
  return STATUS_ORDER[index + 1] ?? null;
}

export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "Never contacted";
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}
