# Pine Labs PG Support portal

Complete standalone React/Vite source imported from the RAAS workspace on 2026-11-24.

## Run

Use Node 22, then `npm ci` and `npm run dev`. `npm run build` checks TypeScript and creates `dist/`.

## Playground snapshot

Build with `npm run build -- --base=/embeds/pg-support-portal/`, then copy `dist/` to `../../playground/public/embeds/pg-support-portal/`. The gallery entry is `playground/app/prototypes/pg-support-portal/`.

All three support journeys and nine FAQs are included. Request adapters accept data in component/session state only: there is no authentication, ticketing backend, email delivery, or generated ticket reference. Uploaded files stay in memory. Public autofill values are fictional; real personal contact defaults from the local workspace are excluded.
