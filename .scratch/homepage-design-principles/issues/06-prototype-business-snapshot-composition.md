Type: prototype
Blocked by: 04
Status: claimed

## Question

What should the four-module business snapshot (`docs/flows/merchant-homepage.md` §2) look like, and how does it combine with the needs-attention surface (ticket 05) into one coherent homepage?

Context: fixed order Settlements → Transactions → Refunds → Disputes, shared Today/This Week/This Month range control (Settlements' next-payout content exempt), absolute-number cards with no charts, trend delta only on Transactions' success rate (§2.4). Customization is show/hide only, reviving the dead "Customize cards" sheet shape (§6.1). Resolve:

- Overall page order: attention surface above or below the snapshot, and why — does an urgent Tier-1 blocker need to be the very first thing a merchant sees, or does the snapshot's daily-glance habit take priority?
- Card layout for the four modules: grid vs. row, and how the shared range control attaches to the group vs. individual cards.
- Where the "Customize cards" entry point surfaces on the page (§6.1 says right-side panel, matching decision-log entry 21 — where's the trigger for opening it?).
- Empty states: "All caught up" (attention) and the brand-new-merchant first-time state (snapshot) — distinct visual treatment, or can they share a pattern?
- Which existing components serve this (candidates: `SectionSummaryStrip`, `Card`) vs. where they don't — e.g. `OverviewAnalyticsCanvas`'s drag-reorder conflicts with §6.1's "no reorder" decision, so it likely doesn't fit as-is; confirm whether it's adapted or bypassed entirely.

Use `/mattpocock-skills:prototype` to produce a concrete artifact to react to.
