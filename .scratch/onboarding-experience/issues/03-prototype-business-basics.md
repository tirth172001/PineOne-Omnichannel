Type: prototype
Blocked by: 01
Status: resolved

## Question

Design the "Business basics" screen: business category selection (large enumerable set — MCC-style, e.g. "Food trucks, mobile catering services") and a device shipping address.

Build in this repo using `/prototype`, following the shell and interaction standard from "Architect the post-business-name sequence." Category selection uses a searchable select (not cards — the set is too large), per that ticket's answer.

## Answer

Built three variants (verified in the browser, all interactive, no console/server errors):

- **A — Document continues building**: the same "Business Profile" document from ticket 02 continues, with the verified Singpass fields collapsed into an expandable summary and two new rows (category, shipping address) that fill in live as fields are typed — no async delay, since this is data entry, not verification.
- **B — Sheet picker + two artifacts**: category picked via a browsable side-panel (grouped, searchable), shown as a removable chip. Preview splits into two real-world artifacts: a customer-facing tag card and a dashed-border courier shipping label.
- **C — Map-centric preview**: quick-pick chips for popular categories above a searchable combobox; preview is a single abstract map with a pin that drops in as the address is typed, tagged with the category icon.

**Winner: Variant A** — continues the document metaphor established in ticket 02, reinforcing one continuous "profile being assembled" narrative across the whole sequence rather than switching metaphors each step. Folded into `app/onboarding/business-basics/` (renamed from the throwaway `prototype-business-basics` path).

As a byproduct, the persistent rail shell was extracted out of ticket 02's route into `components/onboarding/onboarding-rail-shell.tsx`, parameterized by `activeStepId`/`completedStepIds` — both this ticket and ticket 02 now use the shared component instead of duplicating it. The variant switcher was likewise extracted to `components/prototype/prototype-switcher.tsx` for reuse by remaining prototype tickets.

Variants B and C were archived on the throwaway branch `prototype/ticket-03-business-basics` and removed from `main`.
