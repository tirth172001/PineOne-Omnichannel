Type: prototype
Status: resolved

## Question

Audit the onboarding preview-panel card compositions in `components/onboarding/onboarding-preview.tsx` (the `document`, `banking`, `owners`, and `signatory` preview modes — i.e. `DocumentBody`'s accordion and its sibling bodies) against the interface cheat sheet the user supplied (https://interfaces.dev/cheat-sheet), specifically:

- **Layout**: "the gap between groups is at least twice the gap inside one: 8px within, 16px+ between." Where field groupings currently sit at a single flat gap value regardless of whether they're within one logical section or between two, fix the spacing to this rule.
- **UI**: "use concentric border radius on nested elements" and "align for optical alignment, not geometric alignment."
- **UI**: "give images a 1px outline, offset by -1px: black at 8% opacity in light mode, white at 8% in dark mode" — applies to the storefront photo in the `store` section and any avatar/image treatment in the `signatory`/`owners` bodies.

The three reference screenshots the user shared in chat (Adaline/Fireflies/Acctual split-screen onboarding previews) are inspiration only for card-grouping ideas — colored tag/pill rows, nested "team"/"summary" card treatment — not to be copied stylistically; this repo's own tokens and green Grainient identity stay as-is.

**Scope exclusions** (owned by other tickets, don't duplicate work here):
- `review-and-sign` — rebuilt structurally by ticket 04, which owns its own cheat-sheet compliance for the new card it builds.
- The new product-interest/intent cards on the business-name step — built by ticket 06, compliant from the start.

Land the fixes as real code changes, not just a list of findings.

## Answer

Audited `components/onboarding/onboarding-preview.tsx`'s `document`, `banking`, `owners`, and `signatory` bodies against the three cheat-sheet rules and landed fixes directly (no separate findings-only pass):

- **Layout (8px within / 16px+ between).** Two spots used one flat gap for both a group's internal spacing and the spacing between groups: the `website` document-section (label+browser-chrome-box vs. the separate app-link box, previously all `gap-3`) and the `BankingBody`/`OwnersBody` headers (icon+label vs. the content below, previously `gap-2.5`/`gap-3`). Restructured both into an explicit two-tier scale: `gap-2` (8px) for a group's own internal spacing (label→box, icon→label), `gap-4` (16px) between sibling groups. The `store` section's existing `gap-4`/`mb-1` already satisfied the ratio but was tightened to `gap-4`/`gap-2` for consistency with the rest. Identity/category sections were already compliant (near-zero internal gap under `gap-4` between fields) and left as-is.
- **UI — concentric radius.** The card shell is `rounded-2xl` (18px per this repo's overridden radius scale, `app/globals.css`). Content boxes sit inset ~12px inside it (the `px-3` accordion wrapper), so their radius should be ~6px, not the `rounded-lg` (10px) they all used — changed to `rounded-sm` (6px): store location/photo boxes, website browser-chrome box, app-link card, bank-detail card, signatory empty-state box. The active `DocumentBody` row sits at a shallower ~4px inset (`-mx-2`/`px-2`), so its highlight went from `rounded-lg` to `rounded-xl` (14px) instead, for the same concentric math at that inset.
- **UI — 1px image outline.** Added `ring-1 ring-inset ring-black/8 dark:ring-white/8` to the storefront photo `<img>` (the only actual image in these four bodies — `PersonCard`'s avatar in owners/signatory is an initials badge, not an image, so it's out of scope for this rule).
- Optical alignment: reviewed the icon-circle + label rows across all four bodies; they already use `items-center` against single/well-centered content, no violation found.

Scope exclusions honored: `review-and-sign` (ticket 04) and the business-name product-intent cards (ticket 06) untouched.

Verified live in the browser end-to-end: business-verification → business-basics (category) → store-verification (maps link + "add later" skip state) → website-app-details → banking-details, confirming the identity/category/store/website document sections and the banking body all render with the corrected spacing/radius. `npx tsc --noEmit` clean on the touched file. Decision recorded in `docs/decisions/decision-log.md` entry 81.
