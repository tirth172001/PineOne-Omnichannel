# PG Support portal

## What It Does
Three support journeys for customers, new merchants and existing merchants, with nine bucket-specific FAQs.

## Architecture
```text
Gallery → iframe → static Vite application → local request adapters
                                     → in-memory form and file state
```

## Frontend / API
- Responsive React portal with keyboard accessible controls and per-topic drafts.
- No external API, real authentication, ticket delivery or email integration.
- Static snapshot preserves the original Pine Labs styling in an isolated frame.
- Public autofill data is fictional. No credentials or personal contact defaults are committed.

## Key Dependencies
React 18, Vite 6, TypeScript, Tailwind 3 and lucide-react, isolated from playground dependencies.

## Component Tree
App → SupportJourney → NewMerchantJourney / ExistingMerchantJourney; HelpCenter; ImageUpload.

## Error Handling
Browser form validation, image type/size validation, and request error handling in the adapters.

## File Structure
- `page.tsx`: iframe entry.
- `metadata.json`: gallery metadata.
- `../../../public/embeds/pg-support-portal/`: compiled snapshot.
- Repository `projects/pg-support-portal/`: complete original project source.

## Rebuild
Source: local RAAS workspace, imported 2026-11-24 (no original git history). In `projects/pg-support-portal`, run `npm ci`, then `npm run build -- --base=/embeds/pg-support-portal/`. Copy `dist/` contents into `playground/public/embeds/pg-support-portal/`, regenerate thumbnails, and run the playground checks. No environment variables required.

## Validation
Standalone TypeScript/Vite build and playground `npm run check` passed. The thumbnail script could not run because its Chromium download failed; equivalent static gallery screenshots were captured through the in-app browser and inspected at desktop and 390px mobile. The imported snapshot intentionally keeps its existing light Pine Labs appearance under either gallery theme.
