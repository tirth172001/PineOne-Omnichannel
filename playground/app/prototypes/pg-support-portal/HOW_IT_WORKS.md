# PG Support portal

## What It Does
Three support journeys for customers, new merchants and existing merchants, with nine bucket-specific FAQs.

## Architecture
```text
Gallery card → new tab → pine-labs-pg-support.vercel.app (public, Vite static build)
                         → local request adapters → in-memory form and file state
```

## Frontend / API
- Responsive React portal with keyboard accessible controls and per-topic drafts.
- No external API, real authentication, ticket delivery or email integration.
- Deployed separately and **public** (no playground password) at https://pine-labs-pg-support.vercel.app. The card opens it in a new tab (`external.embed: "none"`).
- Hash-only navigation (`#main`, `#help/<faq>`), so no host rewrites are needed.
- Public autofill data is fictional. No credentials or personal contact defaults are committed.

## Key Dependencies
React 18, Vite 6, TypeScript, Tailwind 3 and lucide-react, isolated from playground dependencies.

## Component Tree
App → SupportJourney → NewMerchantJourney / ExistingMerchantJourney; HelpCenter; ImageUpload.

## Error Handling
Browser form validation, image type/size validation, and request error handling in the adapters.

## File Structure
- `page.tsx`: `ExternalApp` page (Open button) for direct visits to `/prototypes/pg-support-portal`.
- `metadata.json`: gallery metadata.
- Repository `projects/pg-support-portal/`: complete source and `vercel.json` (npm install, Vite build, `dist/`).

## Deploy
Source: local RAAS workspace, imported 2026-11-24 (no original git history). Vercel project `pine-labs-pg-support`, on the same Vercel account as `pine-one-playground`. From `projects/pg-support-portal`, run `vercel deploy --prod`. Updates show up in the playground automatically. No environment variables required. After a visible change, run `npm run thumbnails -- pg-support-portal` here (it captures the public URL).

## Validation
Standalone TypeScript/Vite build and playground `npm run check` passed. On Nov 24 the gallery switched from an embedded static snapshot to the public deployment. The thumbnail script could not run because its Chromium download failed; equivalent static gallery screenshots were captured through the in-app browser and inspected at desktop and 390px mobile. The imported snapshot intentionally keeps its existing light Pine Labs appearance under either gallery theme.
