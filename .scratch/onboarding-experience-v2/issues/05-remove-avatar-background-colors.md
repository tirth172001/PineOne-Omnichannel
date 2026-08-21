Type: prototype
Status: resolved

## Question

`PersonCard` (`components/onboarding/onboarding-person-card.tsx`) renders each avatar with a per-index background color via `colorForIndex(index)` (`components/onboarding/onboarding-person.ts`). The user dislikes this — wants the colored backgrounds removed altogether, for both business-owner and signatory avatars.

Resolve what replaces it: a single neutral/brand color for all avatars, or some other non-color-coded differentiator (initials only, a border treatment, etc.)? This affects every place `PersonCard` renders — business-owners list, authorised-signatory list, and (once ticket 03 lands) the KYC preview panel.

## Answer

Didn't invent a new style — this repo already has a canonical neutral-avatar convention: `AvatarFallback` (`components/ui/avatar.tsx`) renders `bg-muted text-muted-foreground`, and it's already used exactly that way in `account-page-content.tsx`. Matched `PersonCard`'s avatar span to the same two classes instead of the per-index `colorForIndex` inline style, keeping the rest of the card's structure (verified/verifying badge overlay, sizing) untouched.

`colorForIndex` and the `personColors` array it read from were deleted from `components/onboarding/onboarding-person.ts` — dead code once nothing calls it. Since color was the only thing `index` was used for, the `index` prop was removed from `PersonCard` entirely, and its three call sites updated to stop passing it: `components/onboarding/onboarding-preview.tsx`, `app/onboarding/business-owners/_variant-a.tsx`, `app/onboarding/authorised-signatory/_variant-b.tsx`.

Verified in an isolated worktree dev server: added two owners on business-owners — both "ST" and "PN" avatars render as identical neutral gray circles (no per-index color difference) in both the left-hand owner list and the right-hand preview panel; navigated in-app to authorised-signatory and confirmed the same neutral treatment on the signatory candidate list. `tsc --noEmit` clean on all touched files.

Modified: `components/onboarding/onboarding-person-card.tsx`, `components/onboarding/onboarding-person.ts`, `components/onboarding/onboarding-preview.tsx`, `app/onboarding/business-owners/_variant-a.tsx`, `app/onboarding/authorised-signatory/_variant-b.tsx`.
