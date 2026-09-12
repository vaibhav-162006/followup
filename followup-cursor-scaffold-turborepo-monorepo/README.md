# FollowUp

FollowUp helps small businesses turn WhatsApp enquiries into paying customers by making sure no lead gets forgotten.

## Apps and packages

- `apps/web` — React + Vite frontend
- `apps/api` — Fastify API
- `packages/ui` — shared UI
- `packages/types` — shared TypeScript types
- `packages/config` — shared ports and origins

## Develop

Postgres should be running locally. Create the database once:

```sh
createdb followup
cp apps/api/.env.example apps/api/.env
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

- Web: http://localhost:5173
- API health: http://localhost:3001/health
- Leads: http://localhost:3001/leads
