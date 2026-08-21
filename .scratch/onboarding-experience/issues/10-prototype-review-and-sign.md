Type: prototype
Blocked by: 02, 03, 04, 05, 06, 07, 08, 09
Status: resolved

## Question

Design the closing "Review" and "Sign agreement" screens: a read-only summary of every field collected across steps 1–8 (products selected, verification doc, map location, storefront photo, website/app links, banking, owners, signatory), each independently editable inline; then the merchant signing agreement text with a consent checkbox and sign action, ending in a success confirmation.

Build in this repo using `/prototype`. Per "Architect the post-business-name sequence," this is a full-width summary layout, not the standard input/preview split — there's nothing left to "build" in a preview at this point. Blocked by every content-collecting ticket above because it needs to know the real shape of each field to summarize meaningfully. This ticket's terminal action is the boundary with "Activation," which stays fog (see map's Not yet specified).

## Answer

Built three variants against a mock dataset representing everything collected across tickets 02–09 (verified end-to-end in the browser — full review-to-signed click-through on all three, no console/server errors):

- **A — Two-screen review + sign**: classic flow — grouped review cards, then a dedicated sign screen with the agreement, consent checkbox, and a full success screen.
- **B — Assembled document + inline sign**: the running "Business Profile" document from tickets 02–09 is fully assembled here — every field in one continuous certificate, with the signing agreement appended at the bottom of the same scroll, no screen transition.
- **C — Tabbed review + modal sign**: review sections as tabs; signing happens in a modal dialog, ending in a toast instead of a dedicated success screen.

**Winner: Variant B** — the strongest payoff for the "document builds live" motif that won every earlier ticket (02, 03, 04, 06): the document that's been assembling itself screen by screen finally gets shown whole here, with signing folded into the same artifact rather than treated as a separate step. Folded into `app/onboarding/review-and-sign/` (renamed from the throwaway `prototype-review-and-sign` path).

This closes the entire onboarding-experience prototype sequence (tickets 02–10) — every screen from business verification through review-and-sign is now built as a working (if unwired) route under `app/onboarding/`. "Activation" (what happens immediately after signing) remains fog per the map.

Variants A and C were archived on the throwaway branch `prototype/ticket-10-review-and-sign` and removed from `main`.
