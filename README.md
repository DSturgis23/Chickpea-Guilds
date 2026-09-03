# Chickpea Guilds

Mobile-first web app for the Chickpea **Guilds** programme — sparks, leaderboards
and recognition. Built as an installable PWA so a Capacitor/native wrapper can be
added later without a rewrite.

## Stack

- **React 19 + Vite + TypeScript**
- **Tailwind CSS v4**
- **vite-plugin-pwa** — installable, offline app shell
- **react-router** — client-side routing (no SSR, wrapper-friendly)
- **Supabase** (planned) — Postgres + Auth + Row-Level Security + Storage

## Running locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build
```

## Current status — Slice 1 (scaffold)

Runs entirely on **seed data** (`src/data/seed.ts`). No backend yet.

- Login is a stub: on the preview build, pick a person to explore the app as them
  (roles: member / GM / P&C / director / super admin).
- Screens: Home, Leaderboard (guild + pillar + people, month + financial year),
  Nominate (3-step flow), Events, Documents, Profile, About, and the P&C admin
  area (Approvals, Behaviours, People, Reports).
- Nominations and approval decisions are held in memory for the session.

## Wiring Supabase (Slice 2)

1. Create a Supabase project. Copy `.env.example` → `.env.local` and fill in
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. Review and apply `supabase/schema.sql`.
3. `src/lib/supabase.ts` auto-detects the env vars; the data layer then switches
   from seed data to live queries.
4. The `service_role` key goes **only** in a Supabase Edge Function (admin user
   creation) — never in this repo or the client bundle.

## Domain glossary

| Term | Meaning |
|---|---|
| Craft | Hospitality — what Chickpea does. |
| Guild | One of six groups; membership is automatic and random. |
| Friction | A behaviour that earns sparks. |
| Spark | A point. |
| Bright Spark | Individual with the most sparks in a month. |
| Guild Cup | Guild with the most sparks in the financial year (Aug–Jul). |
| Brightest Spark | Individual with the most sparks in the year → Dream Team. |
| Kindling | New starter who made the biggest early impact. |

Pillars: **People · Content · Environment · Engagement**.
