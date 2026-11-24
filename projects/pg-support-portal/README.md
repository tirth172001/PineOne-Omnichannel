# Pine Labs PG Support portal

Complete standalone React/Vite source imported from the RAAS workspace on 2026-11-24.

## Run

Use Node 22, then `npm ci` and `npm run dev`. `npm run build` checks TypeScript and creates `dist/`.

## Deploy

Live and public at https://pine-labs-pg-support.vercel.app (Vercel project `pine-labs-pg-support`). Run `vercel deploy --prod` from this folder; `vercel.json` pins npm and the Vite build. The playground entry `playground/app/prototypes/pg-support-portal/` links to it.

All three support journeys and nine FAQs are included. Request adapters accept data in component/session state only: there is no authentication, ticketing backend, email delivery, or generated ticket reference. Uploaded files stay in memory. Public autofill values are fictional; real personal contact defaults from the local workspace are excluded.
