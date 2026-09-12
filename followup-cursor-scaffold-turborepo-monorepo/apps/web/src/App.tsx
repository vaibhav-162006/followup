import type { HealthResponse } from "@followup/types";
import { Button } from "@followup/ui/button";
import { Card } from "@followup/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Dashboard } from "./components/Dashboard";

async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch("/api/health");
  if (!response.ok) {
    throw new Error("API unavailable");
  }
  return response.json() as Promise<HealthResponse>;
}

export function App() {
  const [view, setView] = useState<"landing" | "dashboard">("landing");
  const health = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    retry: 2,
    refetchInterval: 10_000,
  });

  if (view === "dashboard") {
    return <Dashboard onBack={() => setView("landing")} />;
  }

  const apiLabel = health.isSuccess
    ? health.data.database === "up"
      ? "API + DB connected"
      : "API up, database down"
    : health.isPending
      ? "Checking API…"
      : "API offline";

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-72 w-72 rounded-full bg-lime-400/10 blur-3xl" />

      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-400 text-sm text-emerald-950">
            FU
          </span>
          FollowUp
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span
            className={`rounded-full border px-3 py-1 ${
              health.isSuccess && health.data.database === "up"
                ? "border-emerald-400/40 text-emerald-300"
                : "border-white/10 text-zinc-400"
            }`}
          >
            {apiLabel}
          </span>
          <Button variant="ghost" onClick={() => setView("dashboard")}>
            Log in
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
          For small businesses on WhatsApp
        </p>
        <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight">
          Turn WhatsApp enquiries into paying customers.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
          FollowUp makes sure no lead gets forgotten. Capture the chat, track
          the pipeline, and follow up at the right time — without another
          spreadsheet.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={() => setView("dashboard")}>Get started</Button>
          <Button variant="ghost" onClick={() => setView("dashboard")}>
            See the dashboard
          </Button>
        </div>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          <Card title="Capture">
            Every WhatsApp enquiry becomes a lead you can see, assign, and
            reopen later.
          </Card>
          <Card title="Follow up">
            Reminders keep conversations moving so warm leads do not go cold.
          </Card>
          <Card title="Close">
            A simple pipeline shows what is new, waiting, and ready to pay.
          </Card>
        </section>
      </main>
    </div>
  );
}
