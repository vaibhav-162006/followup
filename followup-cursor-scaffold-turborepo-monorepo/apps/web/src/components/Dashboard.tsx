import type { Lead } from "@followup/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listLeads } from "../api/leads";
import {
  STATUS_DOT,
  STATUS_LABEL,
  STATUS_ORDER,
  formatRelativeTime,
} from "../lib/status";
import { AddLeadPanel } from "./AddLeadPanel";
import { LeadDetailPanel } from "./LeadDetailPanel";

export function Dashboard({ onBack }: { onBack: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const { data: leads, isPending, isError, error } = useQuery({
    queryKey: ["leads"],
    queryFn: () => listLeads(),
  });

  const columns = useMemo(() => {
    const grouped: Record<string, Lead[]> = {};
    for (const status of STATUS_ORDER) grouped[status] = [];
    for (const lead of leads ?? []) {
      grouped[lead.status]?.push(lead);
    }
    return grouped;
  }, [leads]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-semibold tracking-tight text-white"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-400 text-sm text-emerald-950">
            FU
          </span>
          FollowUp
        </button>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
        >
          + Add lead
        </button>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-16">
        {isPending && <p className="text-sm text-zinc-400">Loading leads…</p>}
        {isError && (
          <p className="text-sm text-red-400">
            Couldn't load leads: {(error as Error).message}
          </p>
        )}

        {leads && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {STATUS_ORDER.map((status) => (
              <div key={status} className="flex min-w-0 flex-col">
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
                  <h2 className="text-sm font-semibold text-zinc-300">
                    {STATUS_LABEL[status]}
                  </h2>
                  <span className="text-xs text-zinc-600">
                    {columns[status]?.length ?? 0}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {(columns[status] ?? []).map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-emerald-400/30 hover:bg-white/[0.07]"
                    >
                      <p className="font-medium text-white">{lead.name}</p>
                      <p className="mt-1 text-sm text-zinc-400">{lead.phone}</p>
                      {lead.notes && (
                        <p className="mt-2 line-clamp-2 text-xs text-zinc-500">
                          {lead.notes}
                        </p>
                      )}
                      <p className="mt-3 text-xs text-zinc-600">
                        {formatRelativeTime(lead.lastContactedAt)}
                      </p>
                    </button>
                  ))}

                  {(columns[status] ?? []).length === 0 && (
                    <p className="rounded-2xl border border-dashed border-white/10 p-4 text-center text-xs text-zinc-600">
                      No leads here
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isAdding && <AddLeadPanel onClose={() => setIsAdding(false)} />}
      {selectedLeadId && (
        <LeadDetailPanel
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
        />
      )}
    </div>
  );
}
