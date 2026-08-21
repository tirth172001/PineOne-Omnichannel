Type: prototype
Blocked by: 01
Status: resolved

## Question

Design the "Business owners" screen: a Yes/No toggle for "any owner over 25% shareholding," then building an ownership list. Each owner is added via a contextual side panel (owner type, full name, date of appointment, ownership %, NRIC/passport upload) rather than a full-page form.

Build in this repo using `/prototype`, following the shell and interaction standard from "Architect the post-business-name sequence." The right-panel preview should be meaningful — e.g. an ownership visualization building as owners are added, not a generic placeholder. This ticket's output (the owners list) feeds "Prototype: Authorised signatory," which is blocked by it.

## Answer

The add mechanism (a contextual side panel — name, ownership %, NRIC upload) was already decided by this ticket's own question, so all three variants share one `AddOwnerSheet` component and instead vary the owner-list display and preview visualization (verified end-to-end in the browser, including the full add-owner flow and multi-owner state, no console/server errors):

- **A — Row list + donut chart**: owners as list rows with colored initials avatars; preview is a CSS conic-gradient donut chart building a slice per owner, with a running "% allocated" total and legend.
- **B — Card grid + ID-card roster**: owners as a 2-column card grid with an inline "add" tile; preview is a roster of physical ID-card mockups, one per owner.
- **C — Progress rows + org chart**: each owner row carries its own ownership progress bar; preview is an org-chart hierarchy (business at the root, owners as connected child nodes).

**Winner: Variant A** — the donut chart gives the clearest at-a-glance read of "how much ownership is accounted for," which is the actual question this screen is answering. Folded into `app/onboarding/business-owners/` (renamed from the throwaway `prototype-business-owners` path); the shared `_owner.ts` and `_add-owner-sheet.tsx` came along since Variant A depends on them. This closes the "Business details" macro-section (tickets 06–07) and unblocks "Prototype: Authorised signatory."

Variants B and C were archived on the throwaway branch `prototype/ticket-07-business-owners` and removed from `main`.
