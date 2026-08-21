Type: prototype
Blocked by: 07
Status: resolved

## Question

Design the "Authorised signatory" screen: card-select from the business owners collected in "Prototype: Business owners," or add a new person (not an owner) via a contextual side panel (name, designation, mobile, email, NRIC upload, authorisation-letter upload).

Build in this repo using `/prototype`, following the shell and interaction standard from "Architect the post-business-name sequence." Blocked by "Prototype: Business owners" because the owner cards need real data to select from. This ticket's output (who the signatory is) feeds "Prototype: Face authentication," which is blocked by it.

## Answer

The card-select-from-owners + side-panel-add-new mechanism was already decided by this ticket's own question, so all three variants share one `AddSignatorySheet` and vary the card layout and preview visualization instead (verified end-to-end in the browser, including selection and the live-filling preview, no console/server errors):

- **A — Card grid + document badge**: compact 3-up card grid; the running Business Profile document gains a "Ready" e-signature badge once someone's selected.
- **B — Role-forward list + letter**: larger stacked cards leading with designation; preview is a formal Letter of Authorisation whose text fills in live with the chosen name/designation, plus a "Signed" stamp on confirm.
- **C — Chip row + ID badge**: fast horizontal chip selection; preview is an ID/lanyard-badge mockup with an "AUTHORISED SIGNATORY" ribbon that activates once picked.

**Winner: Variant B** — the letter mockup makes the legal weight of this decision concrete (this is genuinely authorizing someone to sign on the company's behalf), which the other two previews treat too lightly. Folded into `app/onboarding/authorised-signatory/` (renamed from the throwaway `prototype-authorised-signatory` path); the shared `_signatory.ts` and `_add-signatory-sheet.tsx` came along since Variant B depends on them. This is the first screen of the "KYC" macro-section and unblocks "Prototype: Face authentication."

Variants A and C were archived on the throwaway branch `prototype/ticket-08-authorised-signatory` and removed from `main`.
