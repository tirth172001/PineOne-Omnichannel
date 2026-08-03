Type: prototype
Status: resolved

## Question

What should the on-hold item detail page (`/on-hold-disputes/on-hold/[id]`) look like and behave like?

Context: the list row today (`OnHoldRow` in `components/on-hold-disputes/on-hold-disputes-content.tsx`) carries `datePrimary`, `dateSecondary`, `transactionId`, `amount`, `status` (`OnHoldStatus`), and `reason`. The detail page is read-only for this effort (no upload/release action). Resolve:

- What fields does the detail page show beyond what's already in the row — does it need more mock fields added to the data model (e.g. a linked underlying transaction, hold-history timeline, who/what triggered the hold)?
- Layout: does it follow `transaction-detail-content.tsx`'s structure (header summary + sectioned detail blocks) closely, or does the on-hold nature (single status + reason, no line items) call for something simpler?
- Entry point: is the whole list row clickable, or a specific element (e.g. the transaction ID) — should match whatever `02-design-dispute-detail-page` lands on, for consistency across the two tabs.
- Back-link target: back to `/on-hold-disputes` — does it need to restore the previously active tab/channel/filters, or is landing on the default view acceptable?

Use `/mattpocock-skills:prototype` to produce a concrete artifact to react to.

## Answer

Prototyped 3 structurally different variants at the real route (`app/on-hold-disputes/on-hold/[id]/page.tsx`), switchable via `?variant=`:

- **A — Receipt style** (winner): mirrors `transaction-detail-content.tsx` closely — gradient header, amount + `StatusPill` as the hero, "On hold since" line. Two-column body: left column has "Hold details" (Transaction ID, Channel, Reason) and "Merchant details" sections; right column is a vertical Activity timeline (Payment placed on hold → Document requested → current status).
- B — Reason forward: single column, reason as a highlighted hero callout, compact metadata grid, collapsible status history.
- C — Timeline-driven: horizontal lifecycle stepper as hero, side-by-side Transaction/Hold cards, full-width activity log.

Decision: **Variant A**. No new mock fields were needed beyond the existing `OnHoldRow` shape (`transactionId`, `amount`, `status`, `reason`, dates) plus a synthesized 3-event activity timeline and a static merchant-details block (name/store/MID), matching the transactions convention.

Folded into real code: `components/on-hold-disputes/on-hold-detail-content.tsx` (`OnHoldDetailContent`) + `app/on-hold-disputes/on-hold/[id]/page.tsx`, wrapped in `TransactionsPlatformShell`. Still reads from an inline mock lookup in the page — swap for `on-hold-disputes-data.ts` once that shared data module is extracted during the full build. Variants B and C and the switcher (`PrototypeSwitcher`) were dropped from the working tree per the prototype skill's cleanup step — not committed to a throwaway branch, since committing wasn't requested this session.

**Not resolved here, carried to `02-design-dispute-detail-page`:** whether the whole list row is clickable vs. a specific element, and whether the back-link needs to restore the previous tab/channel/filter state — these need to land the same way on both detail pages, so ticket 02 should settle both.
