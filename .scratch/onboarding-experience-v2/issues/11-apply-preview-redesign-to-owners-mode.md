Type: prototype
Status: resolved

## Question

Ticket 02 established the redesigned preview-panel direction on document mode (accordion: collapse/expand/lock by progress) and signatory mode (`PersonCard`-first, letter demoted). `OwnersBody` in `components/onboarding/onboarding-preview.tsx` wasn't touched — it already renders a `PersonCard` list (now neutral-colored per ticket 05) plus an ownership-percent header, which is structurally different from document mode's "one section at a time" shape since owners are a growing list, not sequential sections.

Resolve what "matches the established pattern" means here, given owners doesn't have discrete sub-steps to collapse the way document mode does — likely a lighter consistency pass (does the ownership-percent header need the same visual treatment as the document accordion's active-section highlight? does an empty vs. partially-allocated vs. fully-allocated state deserve different visual weight?) rather than introducing an accordion where there's no natural "sections" to collapse.

## Answer

Resolved as the lighter consistency pass, same as ticket 10 did for banking — no accordion, since owners is a growing list with no natural sections. The header row now borrows the icon-circle-plus-label grammar: a `UsersIcon` in a neutral/primary circle, the "Business owners" label, and the `{total}% allocated` count pushed right.

Two states carry real visual weight, not three: **active** (`people.length > 0 && total < 100`) gets the same `bg-primary/5 ring-1 ring-primary/20` row highlight as document mode's active section; **complete** (`total >= 100`) swaps the icon circle to `bg-success/10 text-success` with a filled checkmark and drops the highlight, matching banking's completed treatment. An "over-allocated" state was considered and dropped — `_add-owner-sheet.tsx` already blocks totals over 100% at input time (ticket 17), so that state is structurally unreachable and not worth designing for. Empty state (no owners yet) is unchanged — neutral icon circle, no highlight, existing placeholder copy.

Verified in-browser: 0 owners → neutral header, 0% allocated; added Samuel King at 40% → primary-highlighted active row; added Seol Ali at 60% → row flips to the success checkmark treatment at 100% allocated.

Files changed: [onboarding-preview.tsx](../../../components/onboarding/onboarding-preview.tsx) (`OwnersBody`).
