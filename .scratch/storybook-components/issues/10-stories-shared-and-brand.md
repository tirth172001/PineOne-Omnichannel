Type: task
Status: resolved

## Question

Write stories for `components/shared/*` and `components/brand/*`, following [Story authoring conventions](02-story-authoring-conventions.md), title-prefixed `Shared/<Name>` / `Brand/<Name>`:

`activity-timeline-sidepanel.tsx`, `bulk-operation-sheet.tsx`, `listing-page-primitives.tsx` (exports `ListingPageHeader`, `ListingToolbar`, `ListingSummaryCards` — one story per exported component, same file), `status-pill.tsx`, `summary-card-group.tsx`, `summary-metrics-row.tsx`, `transaction-style-listing-page.tsx`, `transaction-style-table.tsx`, `brand/logo-mark.tsx`.

These composites expect domain-shaped props (rows, filters, cards) — use small inline mock data per convention #6, never importing production `lib/*-data.ts` fixtures. `transaction-style-table.tsx`'s story is independent of the still-open `data-table.tsx` convergence question (see map's Not yet specified) — write it against the component as it exists today.

## Answer

All 9 files storied: `status-pill`, `brand/logo-mark`, `summary-metrics-row`, `summary-card-group`, `listing-page-primitives` (3 stories: `Header`/`Toolbar`/`SummaryCards`), `activity-timeline-sidepanel` (2 stories: `Shell`/`TransactionDetail`), `bulk-operation-sheet`, `transaction-style-table`, `transaction-style-listing-page`.

**Multi-component files needed a convention exception**: `listing-page-primitives.tsx` and `activity-timeline-sidepanel.tsx` each export more than one genuinely distinct component (`ListingPageHeader`/`ListingToolbar`/`ListingSummaryCards`; `DetailSidepanelShell`/`ActivityTimelineSidepanel`) sharing one source file. CSF3 requires exactly one `component` per `Meta`, and picking one made the other stories' `render` functions fail type-checking (Storybook still validates `args`/`render` against the declared `component`'s required props even when a story ignores them). Fixed by omitting `component` from `meta` entirely for these two files (it's optional) — every story stays fully self-contained via `render`. Costs the autodocs props table for these two files specifically (no single component to extract types from); everything else about the stories (rendering, Controls where applicable) is unaffected.

**`bulk-operation-sheet.tsx` reproduces a known pre-existing bug, unfixed (correctly out of scope):** it calls `SheetContent` with `a11yTitle`/`a11yDescription` props that don't exist on `SheetContent`'s real type (`components/ui/sheet.tsx`) — this is 1 of the pre-existing baseline TS errors (also present in `home-content.tsx` ×2, `support-route-content.tsx`, `data-table.tsx` ×3 — a real, widespread, multi-file issue, not a contained one like `resizable.tsx` was in ticket 9). Storied the component faithfully as it exists today: it renders correctly, but throws the expected "React does not recognize the `a11yTitle` prop" console warning — confirmed live, matches the known baseline, not something to silently paper over in a story.

`TransactionStyleListingPage` and other components with required callback/reactive props (`search`/`onSearchChange`, etc.) use static no-op args (`onSearchChange: () => {}`) rather than a `useState` wrapper, matching the simpler pattern already used successfully for `DataTable` in ticket 8 — avoids the same required-args-vs-render TS friction hit on the multi-component files above.

**Verified live in the browser**: `BulkOperationSheet` renders its processing state correctly (progress bar, row counts, file name) with the expected (harmless) console warning. `TransactionStyleListingPage` renders the full assembled page (header, toolbar, summary cards, table) correctly. `ActivityTimelineSidepanel`'s `TransactionDetail` story renders the complete hardcoded transaction-detail content correctly. `ListingPagePrimitives`' `Toolbar` story renders search + filter correctly. No console/server errors beyond the one expected `a11yTitle` warning. `tsc --noEmit` stayed at 29 errors (the post-ticket-9 baseline) — no new errors from any of the 9 new story files.

This was the last story-writing ticket — every in-scope component in `components/ui/`, `components/shared/`, and `components/brand/` (minus the two flagged-not-fixed exceptions: `toaster.tsx`, broken, and the still-open `data-table`/`transaction-style-table` convergence question) now has a Storybook story.
