Type: prototype
Status: resolved

## Question

`app/onboarding/review-and-sign/_variant-b.tsx` currently renders a bespoke two-card split (agreement card left with checkbox + "Sign agreement" CTA; a read-only, plain-surface business-details summary card right) per v2's [ticket 06](../onboarding-experience-v2/issues/06-restructure-review-and-sign.md). That was deliberately *not* the shared live preview-panel pattern, since review-and-sign sits in `FULL_WIDTH_ROUTES` and its data isn't threaded through the shared preview store.

The user now wants this screen's right side to be visually consistent with the rest of onboarding's standard 50/50 split: the same green Grainient-animated panel treatment as `components/onboarding/auth-visual-panel.tsx` / `OnboardingRailShell`'s preview side, with the business-details summary rendered on top of that green animated background — not a plain white/card-surface summary. The agreement content, checkbox, and "Sign agreement" CTA move to the left column, reading against the standard light surface used everywhere else in the sequence.

Decide:
1. Whether this route stays in `FULL_WIDTH_ROUTES` (`components/onboarding/onboarding-sequence.ts`) or moves onto the standard `OnboardingRailShell` split now that it has a real two-side layout, and implement accordingly.
2. How the business-details fields are grouped on top of the green panel — apply the interface cheat sheet's group-spacing rule (8px within / 16px+ between groups) from the start, since this is new/rebuilt card composition, not something ticket 01's audit will catch.

## Answer

1. **Stays in `FULL_WIDTH_ROUTES`.** `onboarding-sequence.ts` is unchanged. `reviewGroups` (`_review-data.ts`) is this screen's own static mock summary, never threaded through the shared `onboarding-profile.ts`/`onboarding-preview.tsx` store the rest of the sequence's accordion preview reads from. Building a new `OnboardingPreview` "review" mode to host it would mean duplicating this file's grouping/rendering logic against a store it doesn't use, for no benefit over the screen owning its own two-column layout — which it already does. Only the right column's *visual treatment* changed, not the routing/shell decision.
2. **Implementation** (`app/onboarding/review-and-sign/_variant-b.tsx`):
   - Right column now renders `<GrainientBackground />` (the same component `onboarding-preview.tsx` uses) as the outer layer, with a padding inset (`p-5`) around a floating white card (`rounded-2xl border border-border bg-card shadow-lg`) holding the "Business Profile" header and grouped fields — mirroring `OnboardingPreview`'s own green-backdrop-plus-floating-card framing rather than inventing a new pattern.
   - The agreement column (left) was already the standard light `bg-card` surface with the checkbox/CTA — no change needed there beyond what the ticket already described as the target state.
   - Parent grid changed `items-start` → `items-stretch` so both columns match height (needed for the green panel's `h-full` to resolve against a real track height).
   - Field-grid spacing tightened to the cheat sheet's literal 8px/16px scale: `gap-y-2.5` → `gap-y-2`, group-title `mb-2.5` → `mb-2` (the `divide-y` + `py-4` between-groups spacing was already ≥16px, left as-is).

Verified live in the browser: the green panel renders correctly around the floating summary card, matching the rest of onboarding's preview treatment; the checkbox → "Sign agreement" → "You're all set" success flow is unaffected. `npx tsc --noEmit` clean. Recorded in `docs/decisions/decision-log.md` entry 84.
