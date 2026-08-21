Type: grilling
Status: resolved

Blocked by: 02

## Question

For a merchant with both in-store and online access, is the business snapshot unified or does it need a channel split/toggle?

Context: `lib/role-permissions.ts` already models `AccessScope` as `"In-store" | "Online" | "In-store and Online"`. Depends on `02-business-snapshot-structure` because the answer shapes how each snapshot module renders once its shape is known. Resolve:

- For an "In-store and Online" merchant, does each snapshot module blend both channels into one number (e.g. total transactions across both), split into a toggle/tab, or show both side by side?
- Does this vary by module (e.g. Transactions needs a channel split, but Disputes doesn't), or is it a single consistent rule across the whole snapshot?
- For single-channel merchants ("In-store" only or "Online" only), does anything channel-specific need to be hidden or relabeled?

Use `/mattpocock-skills:grilling` to resolve. Write the answer into `docs/flows/merchant-homepage.md` and a terse decision-log entry.

## Answer

**Aggregation, not a toggle.** For an `"In-store and Online"` merchant, every snapshot module (Settlements/Transactions/Refunds/Disputes) shows one number summed across both channels — one consistent rule, no per-module exceptions. Every underlying list page (transactions, settlements, refunds, on-hold-disputes) already has its own in-store/online tab toggle, so the homepage doesn't duplicate it: clicking through from a card lands on that module's list page, defaulting to its in-store tab, where the bifurcation is already available. Same rule for the needs-attention surface (§1) — counts/amounts summed across channels, click-through defaults to in-store.

**Scope disambiguation.** `AccessScope` (`lib/role-permissions.ts`) reflects a *role's* permission keys (`offline:`/`online:` prefixes), not what channels the business actually runs — a role can be scoped to `"In-store"` even when the merchant's business also does online, with no way for the UI to tell the two cases apart. To avoid a role-scoped merchant mistaking a partial aggregate for the whole business (and panicking over apparently missing revenue), whenever `AccessScope !== "In-store and Online"`, the Business Snapshot section and the needs-attention surface each show the existing `AccessScopeBadge` (`components/account/settings-slide-panel.tsx:562`, previously only used in Settings' team/role tables) next to their heading, persistent — not dismissible. No badge when scope is `"In-store and Online"`. Card content itself stays channel-agnostic; the badge is the one disambiguation point, not per-card relabeling.

Recorded in `docs/flows/merchant-homepage.md` §4 and `docs/decisions/decision-log.md` (entry 83, Overview and Analytics).
