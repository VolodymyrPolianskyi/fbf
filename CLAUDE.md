# framebyframe

## Why this project exists

Two purposes, and both matter when deciding what to build:

1. **The product.** framebyframe is a film diary — Letterboxd-shaped, but
   adapted rather than copied. People log what they watch, rate it, write about
   it, and get a picture of their year in cinema back.

2. **The paper trail.** The owner works through **TwojStartup**, an arrangement
   in Poland where the firm employs you and a lower tax rate applies, on the
   condition that you hand over the code you produced each month after being
   paid. This repository *is* that deliverable, and the deployed site is what
   gets shown to the **urząd** as visible evidence of what the work bought.

   Practical consequences:
   - **Commit history is evidence.** Work in real commits with clear messages,
     spread across the month. Do not squash a month of work into one commit.
   - **Ship something visible each month.** A deployed page that a
     non-technical reviewer can open and understand beats invisible refactors.
   - Keep the site presentable at all times. There should never be a period
     where the public URL is broken or blank.

## Current stage

Pre-launch. The only thing built is the **coming-soon landing page**: it says
the product is in development and offers Google sign-up so people can claim an
early "founding member" account. No diary features exist yet.

## Stack

- **Next.js 15** (App Router, TypeScript, React 19, server components by default)
- **Tailwind CSS v4** — configured in `app/globals.css` via `@theme`, no
  `tailwind.config`
- **Supabase** — Google OAuth and Postgres. Will also hold films, diary entries
  and reviews later
- Deploy target: **Vercel**

## Layout

```
app/
  page.tsx              landing page (server component; reads the session)
  layout.tsx            fonts + metadata
  globals.css           theme tokens and the film-grain/projector effects
  auth/callback/        OAuth code -> session exchange
  auth/signout/         POST sign-out
components/             sign-in / sign-out buttons (client)
lib/supabase/
  client.ts             browser client
  server.ts             server-component / route-handler client
  session.ts            session refresh helper
proxy.ts                runs the refresh on every request
supabase/schema.sql     early_access table, RLS, new-user trigger
SETUP.md                how to create the Supabase + Google OAuth setup
```

## Commands

```bash
npm run dev      # http://localhost:3000
npm run build    # production build — run before pushing
npm start        # serve the production build
```

## Conventions

- **Server components by default.** Add `"use client"` only where there is
  state or an event handler (the sign-in button).
- **Colours come from the theme tokens** in `globals.css` (`ink`, `ink-soft`,
  `edge`, `haze`, `paper`, `amber`). Do not hard-code hex values in components.
- The design is dark-only on purpose — a cinema, not a document. `color-scheme`
  is pinned to dark.
- **Never commit secrets.** `.env.local` is gitignored. Only the Supabase
  *anon* key belongs in `NEXT_PUBLIC_*` vars; the `service_role` key must never
  reach the client or the repo.
- Database rules live in `supabase/schema.sql` and are applied by hand in the
  Supabase SQL editor. If you change the schema, update that file so it stays
  the source of truth.
- The page must render without Supabase configured — `configured` in
  `app/page.tsx` guards this, so a fresh clone still shows something.

## Roadmap

1. ~~Coming-soon page with Google early access~~ ← current
2. Film data source (TMDB API) + search
3. Diary: log a film with a date, rating, rewatch flag
4. Profiles and public diary pages
5. Lists and written reviews
6. Year-in-review stats

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
