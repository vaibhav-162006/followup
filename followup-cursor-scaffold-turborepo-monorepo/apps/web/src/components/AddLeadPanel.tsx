import type { CreateLeadInput, LeadSource } from "@followup/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { createLead } from "../api/leads";

const SOURCES: { value: LeadSource; label: string }[] = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "MANUAL", label: "Manual" },
  { value: "OTHER", label: "Other" },
];

export function AddLeadPanel({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<LeadSource>("WHATSAPP");

  const mutation = useMutation({
    mutationFn: (input: CreateLeadInput) => createLead(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      onClose();
    },
    onError: (err: Error) => setError(err.message),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();

    mutation.mutate({
      name,
      phone,
      email: email || undefined,
      notes: notes || undefined,
      source,
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-white/10 bg-zinc-950 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add a lead</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Field label="Name" name="name" required autoFocus />
          <Field label="Phone" name="phone" required placeholder="+91…" />
          <Field label="Email (optional)" name="email" type="email" />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-zinc-400">Where did this come from?</label>
            <div className="flex gap-2">
              {SOURCES.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setSource(option.value)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    source === option.value
                      ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                      : "border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-zinc-400" htmlFor="notes">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/50"
              placeholder="What do they need?"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="mt-2 flex gap-3">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {mutation.isPending ? "Saving…" : "Save lead"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoFocus,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-zinc-400" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/50"
      />
    </div>
  );
}
