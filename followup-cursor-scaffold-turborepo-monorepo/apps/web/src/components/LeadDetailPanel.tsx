import type { LeadStatus } from "@followup/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { addNote, deleteLead, getLead, updateLead } from "../api/leads";
import {
  STATUS_BADGE,
  STATUS_LABEL,
  STATUS_ORDER,
  formatRelativeTime,
} from "../lib/status";

export function LeadDetailPanel({
  leadId,
  onClose,
}: {
  leadId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [noteError, setNoteError] = useState<string | null>(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => getLead(leadId),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
    queryClient.invalidateQueries({ queryKey: ["leads"] });
  }

  const statusMutation = useMutation({
    mutationFn: (status: LeadStatus) => updateLead(leadId, { status }),
    onSuccess: invalidate,
  });

  const noteMutation = useMutation({
    mutationFn: (body: string) => addNote(leadId, body),
    onSuccess: () => {
      invalidate();
      setNoteError(null);
    },
    onError: (err: Error) => setNoteError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteLead(leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      onClose();
    },
  });

  function handleNoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = String(new FormData(form).get("note") ?? "").trim();
    if (!body) return;
    noteMutation.mutate(body, { onSuccess: () => form.reset() });
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <aside className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-white/10 bg-zinc-950 p-6">
        <button
          onClick={onClose}
          className="self-end rounded-full p-1 text-zinc-400 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>

        {isPending && <p className="mt-4 text-sm text-zinc-400">Loading…</p>}
        {isError && (
          <p className="mt-4 text-sm text-red-400">Couldn't load this lead.</p>
        )}

        {data && (
          <>
            <h2 className="mt-2 text-xl font-semibold">{data.lead.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
              <span>{data.lead.phone}</span>
              {data.lead.email && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{data.lead.email}</span>
                </>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {STATUS_ORDER.map((status) => (
                <button
                  key={status}
                  onClick={() => statusMutation.mutate(status)}
                  disabled={statusMutation.isPending}
                  className={`rounded-full border px-3 py-1.5 text-sm transition disabled:opacity-50 ${
                    data.lead.status === status
                      ? STATUS_BADGE[status] + " bg-white/5"
                      : "border-white/10 text-zinc-500 hover:text-white"
                  }`}
                >
                  {STATUS_LABEL[status]}
                </button>
              ))}
            </div>

            <p className="mt-4 text-sm text-zinc-500">
              Last contacted: {formatRelativeTime(data.lead.lastContactedAt)}
            </p>

            {data.lead.notes && (
              <p className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
                {data.lead.notes}
              </p>
            )}

            <section className="mt-8">
              <h3 className="text-sm font-semibold text-emerald-300">
                Activity
              </h3>
              <ol className="mt-3 flex flex-col gap-3 border-l border-white/10 pl-4">
                {data.activities.length === 0 && (
                  <li className="text-sm text-zinc-500">No activity yet.</li>
                )}
                {data.activities.map((activity) => (
                  <li key={activity.id} className="relative text-sm">
                    <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-emerald-400/60" />
                    <p className="text-zinc-200">{activity.body}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>

              <form onSubmit={handleNoteSubmit} className="mt-4 flex flex-col gap-2">
                <textarea
                  name="note"
                  rows={2}
                  placeholder="Add a note about this lead…"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/50"
                />
                {noteError && (
                  <p className="text-sm text-red-400">{noteError}</p>
                )}
                <button
                  type="submit"
                  disabled={noteMutation.isPending}
                  className="self-start rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
                >
                  {noteMutation.isPending ? "Adding…" : "Add note"}
                </button>
              </form>
            </section>

            <div className="mt-8 border-t border-white/10 pt-4">
              <button
                onClick={() => {
                  if (confirm(`Delete ${data.lead.name}? This can't be undone.`)) {
                    deleteMutation.mutate();
                  }
                }}
                disabled={deleteMutation.isPending}
                className="text-sm text-red-400 hover:text-red-300 disabled:opacity-60"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete lead"}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
