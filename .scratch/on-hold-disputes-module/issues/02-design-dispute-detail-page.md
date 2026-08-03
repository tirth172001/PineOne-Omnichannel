Type: prototype
Status: resolved

## Question

What should the dispute detail page (`/on-hold-disputes/disputes/[id]`) look like and behave like?

Context: the list row today (`DisputeRow` in `components/on-hold-disputes/on-hold-disputes-content.tsx`) carries `createdOn`, `transactionId`, `amount`, `dueDate`, `status` (`DisputeStatus`), and `action` (currently plain text: "Defend" / "In review" / "Won" / "Lost" — not an actual button). The detail page is read-only for this effort (no defend/evidence-upload flow). Resolve:

- What fields does the detail page show beyond what's already in the row — does it need more mock fields (e.g. dispute reason/category, evidence checklist, timeline of status changes)?
- How is the `action` value represented on the detail page, given there's no real action to take yet — informational only (e.g. "Outcome: Won"), or omitted entirely for open disputes where it's just a placeholder today?
- Layout: same structural question as the on-hold detail page — closely follow `transaction-detail-content.tsx`, or something simpler given fewer fields.
- Entry point and back-link target: should match whatever `01-design-on-hold-detail-page` lands on, for consistency across the two tabs.

Use `/mattpocock-skills:prototype` to produce a concrete artifact to react to.

Note from `01-design-on-hold-detail-page` (resolved, variant A won — receipt style, mirrors `transaction-detail-content.tsx`): entry point (whole row clickable vs. a specific element) and whether the back-link restores prior tab/channel/filter state were left undecided there. Settle both here, in a way that applies to both detail pages, and update `01`'s implementation (`components/on-hold-disputes/on-hold-detail-content.tsx`) to match if it lands on something other than "whole row clickable, back-link to default `/on-hold-disputes` view."

## Answer

Prototyped 3 variants at the real route (`app/on-hold-disputes/disputes/[id]/page.tsx`), consistent in approach with `01-design-on-hold-detail-page`:

- **A — Receipt style** (winner): same structural language as the winning on-hold detail page — gradient header, amount + `StatusPill` hero, two-column body (Dispute details + Merchant details on the left, Activity timeline on the right). Dispute-specific fields: Dispute ID, Category, Reason. Closed disputes show the outcome (Won/Lost) as the status pill itself, not a separate field; open disputes show no placeholder action text.
- B — Urgency + checklist: due-date urgency banner as hero, read-only evidence checklist (Transaction receipt / Delivery proof / Customer communication log).
- C — Case file: tabbed dossier (Overview / Evidence / Timeline), compact header strip. Had a cosmetic Radix/Next dev-mode hydration warning on its Tabs (aria-id mismatch only, doesn't affect functionality) — moot since dropped.

Decision: **Variant A**, for consistency with the on-hold detail page.

Entry point / back-link (deferred from ticket 01, settled here for both pages): **whole row is clickable** (`cursor-pointer` + `onClick={() => router.push(...)}` on `TableRow`, matching the existing convention in `transactions-content.tsx`), back-link lands on the default `/on-hold-disputes` view — **no filter/tab state restoration**. Wired into both tabs of `components/on-hold-disputes/on-hold-disputes-content.tsx`.

Folded into real code: `components/on-hold-disputes/dispute-detail-content.tsx` (`DisputeDetailContent`) + `app/on-hold-disputes/disputes/[id]/page.tsx`, wrapped in `TransactionsPlatformShell`. Both detail pages' mock lookups were extended to cover every row currently in the list (not just the ones used while prototyping), so every row in both tabs is now clickable end-to-end. Still inline mock data — swap for `on-hold-disputes-data.ts` once that shared module is extracted. Variants B/C and the switcher were dropped from the working tree, not committed anywhere.
