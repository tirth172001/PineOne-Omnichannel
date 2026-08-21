Type: grilling
Status: resolved

Blocked by: 01, 02, 03

## Question

What's the scope of homepage customization (reorder/hide modules), and what do the attention surface and business snapshot look like in empty / first-time states?

Context: a half-built "Customize cards" sheet already exists (`overviewSnapshotCards` / `overviewHiddenSnapshotCards` in `components/home/home-content.tsx`) — evaluate reviving it rather than starting fresh. Depends on `01`, `02`, `03` because both customization and empty states need the final module list to reason about. Resolve:

- Customization: can merchants reorder and/or hide business-snapshot modules? Can they hide attention-item categories, or is the attention surface always fully shown (since hiding "needs attention" items seems risky)? Does the existing dead "Customize cards" sheet's shape (per-card visibility toggle, no reorder) match what's wanted, or does this need reorder too?
- Empty states: what does the attention surface show when nothing needs attention (a clean "all caught up" state, or does it collapse/disappear)? What does the business snapshot show for a brand-new merchant with no transaction history yet?

Use `/mattpocock-skills:grilling` to resolve. Write the answer into `docs/flows/merchant-homepage.md` and a terse decision-log entry.

## Answer

**Customization:** Snapshot modules support show/hide only (no reorder) — revives the dead "Customize cards" sheet (`home-content.tsx:2912-2950`) as-is (right-side panel, per-card `Switch`), with its card list updated to match ticket 02's fixed 4-module set (drop `transaction-state-flow`). No reorder, since ticket 02 already fixed the priority order for a stated reason. Attention items are never hideable — always fully shown, no entry in the customize sheet — hiding a money-blocking alert is a real risk, not a preference.

**Empty states:**
- Attention surface, all 5 types zero: a positive "All caught up" state, not a vanishing section — reassures rather than reading as broken. Text-only, matching the app's existing lightweight empty-state convention (`transactions-content.tsx`'s "No results found." / "No transactions found.").
- Business snapshot, brand-new merchant (zero transactions ever): a distinct first-time state instead of four zeroed cards — e.g. "Your business snapshot will appear here once you start taking payments."
- Business snapshot, existing merchant with a quiet Today/Week/Month range: shows the real zero values — legitimate data, not an empty state.

Recorded in `docs/flows/merchant-homepage.md` §6 and `docs/decisions/decision-log.md` (entry 85, Overview and Analytics).
