Type: prototype
Blocked by: 04
Status: claimed

## Question

What should the needs-attention surface (`docs/flows/merchant-homepage.md` §1) actually look like and behave like, under the principles and component-reuse policy locked in tickets 03-04?

Context: five possible card types (2 Tier-1 singular account blockers, 3 Tier-2 aggregate-by-type item-level blocks), max 5 cards total, "All caught up" empty state when nothing's pending, a distinct first-time-merchant empty state (§6.2). Resolve:

- Visual differentiation between Tier 1 (account blockers) and Tier 2 (item-level blocks) — §1.3 already fixes Tier 1 always ranking first; does the design need to visually group/separate the tiers too, or is ranking order sufficient on its own?
- Card content layout: how count + amount-at-risk render on an aggregate card (§1.4), and how the singular KYC / bank-account cards read differently from the aggregate cards.
- `AccessScopeBadge` placement next to the section heading (§4.2) — confirm it composes cleanly with whatever heading treatment this ticket lands on.
- Which existing components serve this (candidates: `Alert`, `Card`, `Badge`, `components/shared/status-pill.tsx`) vs. where ticket 04's deviation threshold actually gets invoked, if at all.

Use `/mattpocock-skills:prototype` to produce a concrete artifact to react to.
