# Map: Merchant Homepage Experience

Label: wayfinder:map

## Destination

A **decision document** for the merchant homepage — not a visual spec. Output is a dedicated flow doc, `docs/flows/merchant-homepage.md` (created on the first ticket that resolves), plus terse entries appended to `docs/decisions/decision-log.md`'s "Overview and Analytics" section — matching the existing `settlements-v3.md` + decision-log.md pairing used elsewhere in this repo.

The document locks the homepage's conceptual structure around the two ideas the user came in with:

- **Needs-attention surface**: what merchants should quickly understand and act on.
- **Business snapshot**: a glanceable view of the business that lets merchants quickly decide where to dive deeper.

Reaching the end of this map means all of the following are decided and written up, ready to hand to a separate follow-on visual-design effort:

1. Needs-attention taxonomy, severity model, and action model (deep-link vs. filtered list).
2. Business snapshot structure — modules, priority order, time range, and whether it revives the existing hidden trend cards or is designed fresh.
3. Where/how "download reports" surfaces on the homepage.
4. Channel representation for merchants with both in-store and online access.
5. Role → module permission mapping.
6. Customization scope (reorder/hide modules).
7. Empty / first-time states for both the attention surface and the snapshot.

This map does **not** produce pixel-level layouts, component code, or backend data wiring — those are explicitly out of scope (see below).

## Notes

- Domain: merchant-facing payments dashboard (Pine One), serving both in-store (terminal) and online checkout merchants. Merchants come here to check transactions, settlements, refunds, disputes, on-hold items, and to download reports.
- Existing reality: the current homepage (`components/home/home-content.tsx`, `components/home/overview-detail-cards.tsx`) is four static, hardcoded cards (Transactions/Settlements/Refunds/Disputes) with 2-3 sub-stats each, all linking to their respective list pages. No "needs attention" surface exists today.
- Dead code worth evaluating, not ignoring: a richer set of trend/chart cards (`OverviewSnapshotChartCard` for Transactions/Settlements/Refunds/Disputes, with real charts) already exists in `home-content.tsx` behind a `hidden` wrapper, along with a half-built "Customize cards" sheet (`overviewSnapshotCards` / `overviewHiddenSnapshotCards`) that lets users toggle card visibility. Decide whether to revive, adapt, or replace this rather than starting from a blank page.
- Permission system already exists and should be reused, not reinvented: `lib/role-permissions.ts` — `AccessScope` (`"In-store" | "Online" | "In-store and Online"`) computed via `computeAccessScope()` from a merchant's permission keys. Roles include Owner, Admin, Store Manager, User Admin, Store Cashier, Accountant, EMI World User (offline) and Owner, Operations, Finance, Support (online), each with different permission sets across groups like "Transactions & Settlements", "Refunds", "Reports".
- IA reference: `docs/architecture/v3-information-architecture.md` — Overview is a top-level nav item alongside Transactions/Settlement/Disputes/Refunds/Reports/Products/Help. This effort does not restructure nav — home content links into existing routes only.
- Sibling precedent for map shape: `.scratch/on-hold-disputes-module/map.md` — note this map's destination is deliberately narrower (decisions only, no prototyping) by explicit user choice.
- Use `/mattpocock-skills:grilling` for every ticket on this map. Visual/component-level design is an explicit non-goal here — a later, separate effort will use `/mattpocock-skills:prototype` once these decisions are locked.
- When resolving a ticket: write the answer into `docs/flows/merchant-homepage.md` (create the file structure on the first resolution) and append a terse rationale entry to `docs/decisions/decision-log.md`.

## Decisions so far

- [Needs-attention taxonomy](issues/01-needs-attention-taxonomy.md) — Money-blocking issues only (no exceptions): KYC incomplete, bank account issue (account-level, Tier 1), disputes/on-hold items needing action, failed/on-hold settlements (item-level, Tier 2). Grouped by type with count + amount at risk, not per-record; Tier 1 always ranks above Tier 2; Tier 2 orders by deadline/how-long-outstanding, not amount. Recorded in `docs/flows/merchant-homepage.md` §1.
- [Business snapshot structure](issues/02-business-snapshot-structure.md) — Four fixed modules, fixed order: Settlements → Transactions → Refunds → Disputes (no separate on-hold module). Shared Today/This Week/This Month range, default Today. Absolute-number cards, not charts; trend delta only on Transactions' success rate. Fresh design — supersedes `OverviewDetailCards`, does not revive the hidden `OverviewSnapshotChartCard` set. Recorded in `docs/flows/merchant-homepage.md` §2.
- [Reports touchpoint](issues/03-reports-touchpoint.md) — No homepage touchpoint at all: disqualified as an attention item (not money-blocking) and doesn't fit the snapshot's business-health definition (it's a utility action). Sidebar nav already gives one-click access. Recorded in `docs/flows/merchant-homepage.md` §3.
- [Channel representation](issues/04-channel-representation.md) — Aggregate sum across channels, no toggle (click-through defaults to each module's existing in-store tab); `AccessScopeBadge` shown next to the Snapshot/Attention headings whenever `AccessScope` is single-channel, to disambiguate a role-scoped view from the whole business. Recorded in `docs/flows/merchant-homepage.md` §4.
- [Role → permission mapping](issues/05-role-permission-mapping.md) — Each module/attention card gates on a specific permission key (Disputes piggybacks on Transactions — no dedicated key exists); Tier-1 blockers gate on Financial Details/Payouts & Beneficiaries. Roles left empty (User Admin, EMI World User, online Finance) get a plain empty-state message, no routing changes. Recorded in `docs/flows/merchant-homepage.md` §5.
- [Customization and empty states](issues/06-customization-and-empty-states.md) — Snapshot modules: show/hide only (revives the dead "Customize cards" sheet), no reorder. Attention items never hideable. "All caught up" state when nothing's pending; brand-new merchants get a distinct first-time state instead of four zeroed cards. Recorded in `docs/flows/merchant-homepage.md` §6.

## Not yet specified

- **Fate of the dead `OverviewSnapshotChartCard` chart-card code** (`components/home/home-content.tsx` ~2756-2910) — confirmed out of scope for the homepage snapshot (ticket 02), and no other ticket on this map ended up needing it either. Whether it's repurposed into a future dedicated analytics page, adapted, or deleted outright stays unresolved — that question belongs to a future analytics-page effort, not this one, so it's left as fog rather than forced into a ticket here.

## Destination reached

All seven items in the Destination are decided and written up in `docs/flows/merchant-homepage.md` (§1–§6) and `docs/decisions/decision-log.md` (entries 22, 81–85, Overview and Analytics). Nothing left to decide on this map — ready to hand off to a separate visual-design effort using `/mattpocock-skills:prototype`, per the Notes above.

## Out of scope

- **Multi-store/location selection** on the homepage — no existing pattern to build on anywhere in the IA (only a per-store *filter* inside the Transactions list, `components/transactions/transactions-content.tsx`); would expand this into a materially larger effort with its own state model.
- **Notification infrastructure** (push/email/SMS alerts) — this map decides only what's shown in-app when a merchant visits the homepage, not how they're pulled back into the app.
- **IA/navigation restructuring** — the existing sidebar and top-level nav stay as-is; the homepage links into existing routes only, no new nav entries.
- **Pixel-level visual/component design** — a separate, later effort using `/mattpocock-skills:prototype`, once the decisions in this map are locked.
- **Backend data wiring / real data integration** — this is a decision document for a prototype/demo repo; connecting to real data sources is future work beyond this effort.
