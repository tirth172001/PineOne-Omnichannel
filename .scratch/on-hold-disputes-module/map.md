# Map: On-hold & Disputes module

Label: wayfinder:map

## Destination

A single canonical On-hold & Disputes module living at `/on-hold-disputes`:

- **List page** (refine existing): tabbed On-hold / Disputes view, in-store/online channel filter actually wired to data (currently decorative), summary cards ("Amount on hold" / "Amount released") computed from real data instead of hardcoded.
- **Detail pages** (new): dedicated routes `/on-hold-disputes/on-hold/[id]` and `/on-hold-disputes/disputes/[id]`, following the `/transactions/[transactionId]` pattern (wrapped in `TransactionsPlatformShell`, back-link to list). Read-only — no write/action flows.
- **Data layer** (new): extracted to `components/on-hold-disputes/on-hold-disputes-data.ts` with `findOnHoldById` / `findDisputeById` lookups, shared by list + both detail pages, with a `channel: "in-store" | "online"` field added to each row.
- **Cleanup**: delete the standalone `/disputes` route (`app/disputes/page.tsx`, `components/disputes/disputes-route-content.tsx`, `components/disputes/disputes-content.tsx`) and repoint its two callers (`components/home/home-content.tsx`, `components/home/overview-detail-cards.tsx`) to `/on-hold-disputes`.

Reaching the end of this map means: both detail page designs are settled (via prototype), and nothing about the module's shape is left to decide — ready to build straight through.

## Notes

- Domain: merchant-facing payments dashboard (Pine One). This module sits under the Transactions platform shell nav ("On-hold & disputes").
- Existing sibling pattern to match: `components/transactions/transaction-detail-content.tsx` + `app/transactions/[transactionId]/page.tsx` + `components/transactions/transactions-data.ts` (`findTransactionById`). Use the same shape (shell wrapper, back-link, `detailChannel` prop convention) for both new detail pages.
- Channel taxonomy is already established elsewhere in the codebase as `"in-store" | "online"` — reuse it, don't invent a new one.
- Standing decisions locked while naming this destination (grilled 2026-08-03, not re-litigated by tickets):
  - Unify the three existing disputes fragments (`/disputes`, `/on-hold-disputes`, four dead per-channel links) into the one `/on-hold-disputes` module.
  - `/disputes` is deleted outright (no redirect) — this is a prototype repo, no real inbound-link compatibility burden.
  - Detail views are read-only for this effort; action flows (Defend a dispute, upload a document to release a hold) are a future effort, comparable in scope to the onboarding flows (`lending-application-flow`, `pos-onboarding-flow`).
  - Detail pages use two distinct route segments (`on-hold/[id]`, `disputes/[id]`), not one shared dynamic route sniffing the ID prefix.
- Use `/mattpocock-skills:prototype` for the two detail-page design tickets below — the question in each is "how should it look/behave," answered with a concrete, reactable artifact.

## Decisions so far

- [Design the on-hold detail page](issues/01-design-on-hold-detail-page.md) — Variant A ("Receipt style," mirrors `transaction-detail-content.tsx`) won; folded into `components/on-hold-disputes/on-hold-detail-content.tsx` + `app/on-hold-disputes/on-hold/[id]/page.tsx`. Entry-point/back-link-state questions deferred to `02-design-dispute-detail-page`.
- [Design the dispute detail page](issues/02-design-dispute-detail-page.md) — Variant A won again, for consistency; folded into `components/on-hold-disputes/dispute-detail-content.tsx` + `app/on-hold-disputes/disputes/[id]/page.tsx`. Also settled entry point (whole row clickable) and back-link (no filter/tab state restoration) for both detail pages, and wired row-click navigation into `on-hold-disputes-content.tsx`.

## Not yet specified

(none — both detail-page designs are settled; see below)

## Ready to build (frontier clear)

Both prototype tickets are resolved. Nothing about the module's shape is left to decide. What remains is straight implementation, per the Destination and Notes above, not further wayfinding:

- [x] Extract `components/on-hold-disputes/on-hold-disputes-data.ts` with `findOnHoldById` / `findDisputeById`, replacing the inline mock lookups currently duplicated across `on-hold-disputes-content.tsx` and both `[id]/page.tsx` files, and add the `channel` field to every row.
- [x] Wire the in-store/online channel toggle on the list to actually filter, using that new field.
- [x] Compute the "Amount on hold" / "Amount released" summary cards from the data instead of the hardcoded values.
- [x] Delete `/disputes` (`app/disputes/page.tsx`, `components/disputes/disputes-route-content.tsx`, `components/disputes/disputes-content.tsx`) and repoint `home-content.tsx` / `overview-detail-cards.tsx` to `/on-hold-disputes`.

All four items above are done. Two additional cleanups landed alongside them (found during an architecture review, 2026-08-03):

- `components/home/home-content.tsx` had a third, previously-undiscovered disputes fragment: a full inline `navSection === "disputes"` tab (state, columns, a "Defend a dispute" action flow, ~600 lines) behind the `ProductWorkspaceNav` component-level "Disputes" section, unreachable in the live UI (`WorkspaceShell`'s `showLeftContext` is `false` on this page) but still shipped in the bundle. Removed entirely; the Home page's `ProductWorkspaceNav` now routes "disputes" to `/on-hold-disputes` via `router.push` instead of rendering inline, in case that nav is ever re-shown. Left `online-payments-content.tsx` and `offline-payments-content.tsx`'s own per-channel disputes tabs untouched — those remain the separate, larger out-of-scope effort noted below.
- `on-hold-disputes-content.tsx` hand-rolled its own dot-based `StatusBadge` instead of composing the shared `components/shared/status-pill.tsx` (already used correctly by the two detail pages). Replaced with `StatusPill`, backed by two new shared tone helpers in `on-hold-disputes-data.ts` (`onHoldStatusTone`, `disputeStatusTone`/`disputeStatusLabel`) so list and detail pages now derive tone from one place instead of three.

## Out of scope

- The four dead per-channel dispute links (`/online-payments/disputes`, `/offline-payments/disputes`, `/payment-links/disputes`, `/cross-border/disputes`) declared in `lib/navigation/routes.ts` — no page currently links to them, so nothing is broken. Building per-channel dispute views is a larger, separate effort.
- Write/action flows on disputes and on-hold items (Defend a dispute with evidence, upload a document to release a hold, any state-changing action). Detail views in this effort are read-only.
