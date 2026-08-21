Type: grilling
Status: resolved

## Question

What modules make up the "business snapshot," in what priority order, over what time range, and does it revive the existing hidden trend cards or is it designed fresh?

Context: today's `OverviewDetailCards` shows four static cards (Transactions/Settlements/Refunds/Disputes) with hardcoded totals. A richer, currently-hidden set of trend/chart cards (`OverviewSnapshotChartCard` in `components/home/home-content.tsx`, lines ~2756-2910) already exists with real charts per area, plus a half-built "Customize cards" sheet. Resolve:

- Which business areas get a snapshot module: Transactions, Settlements, Refunds, Disputes, on-hold — all of them, or a subset? Any area beyond what's already cardified today (e.g. a dedicated on-hold module, since it currently only appears folded into Disputes)?
- Priority order / visual hierarchy: which module matters most to a merchant landing on the page, and does that order ever change (e.g. by role, by channel) or is it fixed?
- Time range: fixed to "today," or a selectable range (today/7d/30d/custom)? If selectable, does the whole snapshot share one range control, or does each module have its own?
- Revive vs. fresh: does the snapshot become the existing `OverviewSnapshotChartCard` trend cards (un-hide + adapt), replace `OverviewDetailCards`'s current static-stat format, or something structurally different from both?

Use `/mattpocock-skills:grilling` to resolve. Write the answer into `docs/flows/merchant-homepage.md` and a terse decision-log entry.

## Answer

**Modules (4, fixed):** Settlements, Transactions, Refunds, Disputes. No separate on-hold module — on-hold state is folded into Disputes here and already gets dedicated visibility on the attention surface (ticket 01) when action-pending.

**Priority order (fixed for all merchants/roles/channels):** Settlements → Transactions → Refunds → Disputes. Settlements leads because payout certainty ("will I actually get paid, how much, when") is the sharper day-to-day anxiety for a small merchant than same-day transaction status.

**Time range:** One shared control, Today / This Week / This Month, default Today — replaces the existing unused `overviewDateRange` (7d/30d/90d) state, which reads as analytics-tool granularity rather than a daily glance. Settlements' next-payout content is exempt (forward-looking, not a historical rollup).

**Card content — absolute numbers, not charts, per module:**
- Settlements: next payout amount + date; last payout amount. No trend delta (forward-looking).
- Transactions: total collected (amount) + success rate. Trend delta only on success rate (a rate stays meaningful at low volume; raw counts don't).
- Refunds: total refunded amount. No trend delta.
- Disputes: count + amount at risk. No trend delta — passive awareness only, actionable items already surface via the attention taxonomy (ticket 01).

**Structural verdict — fresh, not revived:** Replaces `OverviewDetailCards`'s current static-stat format. Does **not** revive the hidden `OverviewSnapshotChartCard` set (`components/home/home-content.tsx` ~2756-2910) — full charts were explicitly ruled out for the homepage snapshot based on cross-platform research (Stripe, Razorpay, Adyen, Paytm all push charts to a separate analytics destination and keep the homepage to lightweight KPI cards).

**Explicitly deferred, not decided here:**
- Fate of the now-fully-dead hidden chart-card code (repurpose into a future analytics page vs. delete) — noted as a fog item on the map, not this ticket's call.
- "Customize cards" show/hide capability — ticket 06's scope (Customization and Empty States).

Recorded in `docs/flows/merchant-homepage.md` §2 and `docs/decisions/decision-log.md` (entry 81, Overview and Analytics).
