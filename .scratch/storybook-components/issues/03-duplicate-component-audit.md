Type: task
Status: resolved

## Question

Scan the codebase outside the in-scope set (`components/ui/`, `components/shared/`, `components/brand/`) for hand-rolled UI patterns that duplicate or nearly duplicate something already in those folders, or that duplicate each other across feature folders — components/patterns that *should* be a single shared implementation so that editing it once propagates everywhere, but currently aren't.

Concretely:

- Grep/review the feature folders (`account/`, `dashboard/`, `home/`, `offline-payments/`, `on-hold-disputes/`, `payments/`, `payment-links/`, `products/`, `refunds/`, `reports/`, `settlements/`, `settings/`, `subscriptions/`, `support/`, `transactions/`, `onboarding/`, `online-payments/`, `cross-border/`, `search/`, `auth/`) for repeated bespoke JSX/className patterns — e.g. ad-hoc status badges/pills, summary metric cards, empty states, table toolbars, drawer/panel headers — that either (a) duplicate an existing `components/ui/*` or `components/shared/*` component instead of using it, or (b) are copy-pasted across 2+ feature files without a shared implementation at all.
- For each finding, record: the pattern name, every file/location it appears in, whether a canonical shared version already exists (and where) or needs to be created, and a rough severity (identical copy-paste vs. merely similar/should-probably-converge).
- Do not perform the consolidation itself in this ticket — this ticket produces the findings list only. Each finding that warrants action becomes its own follow-on ticket (grilling, if the canonical shape needs a decision; task, if it's a mechanical swap).

Output: a findings list appended to this ticket's `## Answer`, which the map uses to graduate new consolidation tickets (see map's "Not yet specified").

## Answer

Scanned via targeted grep across all feature folders for repeated status/badge markup, metric-card grids, empty-state blocks, table implementations, and avatar/initials patterns, then read the actual source of every candidate to filter false positives.

**Finding 1 — Empty states: three independent implementations, one completely unused. (Medium severity — spun off as [Canonical empty-state component](05-canonical-empty-state-component.md))**

- `components/ui/panels.tsx` exports `PanelEmpty` (icon + title + description) — the one actually in production use, imported by `components/payments/payments-content.tsx`, `components/products/products-content.tsx`, `components/offline-payments/offline-payments-content.tsx`, `components/account/account-page-content.tsx`.
- `components/ui/empty.tsx` exports a fuller shadcn-style composable primitive (`Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`) — **imported nowhere in the app.** Dead code (or an abandoned migration toward it).
- `components/ui/data-table.tsx` and `components/shared/transaction-style-table.tsx` (both in-scope) each independently render their own minimal `emptyText` string directly in a table row (`"No records found"` / `"No records found."`), rather than using either primitive above.
- Four different affordances for one concern, in a codebase where the intended pattern is presumably "one canonical empty state." Real propagation win if consolidated: today, improving the empty state (e.g. adding an action button) only reaches whichever of the four spots you happen to edit.

**Finding 2 — Two competing table components, overlapping consumers. (Needs more investigation before it's ticket-ready — left in map's Not yet specified.)**

- `components/ui/data-table.tsx` (1290 lines) — full-featured (columns, sorting, filters) — used by `home-content.tsx`, `cross-border-content.tsx`, `online-payments-content.tsx`, `support-route-content.tsx`, `offline-payments-content.tsx`, `settings-slide-panel.tsx`.
- `components/shared/transaction-style-table.tsx` (164 lines) — a lighter table — used by `settings-slide-panel.tsx`, `manage-user-roles-content.tsx`, `account-page-content.tsx`.
- `components/account/settings-slide-panel.tsx` uses **both** in different sections.
- Not flagged as an immediate consolidation ticket because it's unclear yet whether this is genuine duplication (should converge) or two deliberately different tools (heavy vs. light use case) — needs someone to actually compare their feature sets before this is a decidable question.

**Finding 3 — Minor: one-off bespoke pill markup. (Low severity, not ticketed.)**

- `components/account/configure-checkout-section.tsx` (lines 176, 284) hardcodes `<span className="rounded-full bg-emerald-600 ...">Active</span>`-style pills instead of `StatusPill`/`Badge`. This is decorative mock-checkout-preview content (simulating what a shopper sees), not a real status indicator reflecting app state, so `StatusPill`'s data-driven semantics don't cleanly apply. Noted but not worth a ticket.

**Checked, no finding:** `StatusPill` adoption is already fairly broad (10 consumers) with no widespread bespoke duplicate found beyond Finding 3. `components/ui/avatar.tsx` has few importers (2) but no bespoke duplicate initials/avatar markup was found elsewhere — candidates that matched the grep pattern turned out to be plain decorative icon circles, not avatars.
