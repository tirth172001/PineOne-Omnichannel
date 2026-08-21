Type: grilling
Status: resolved

## Question

V1 ticket 12 established a page-level fade-up/fade-in-from-bottom transition between sub-steps (see `useIsSubStepMove` in `components/onboarding/onboarding-sequence.ts`). The user wants finer-grained, field-level choreography instead:

- **Left side (inputs):** when advancing to the next sub-step, already-filled input fields should fade out and translate upward, and the new step's fields should fade in from the bottom — not a single whole-panel cross-fade.
- **Right side (preview):** newly-introduced content should feel like a seamless extension of the same evolving profile "card" being built up, not a jarring swap or sudden addition of new UI.

Resolve the concrete motion spec (durations, easing, stagger, what "seamless extension" means technically for the preview panel — does it reuse ticket 02's redesigned panel structure?) using `/motion-design`. This becomes a standing pattern other tickets in this map inherit once resolved, the same way v1 ticket 12's pattern was inherited by tickets 02–10.

## Answer

**Left side (inputs)** — new component `components/onboarding/stagger-fields.tsx`, exporting `<StaggerFields>` (container) and `<StaggerField>` (per-field wrapper), built on Framer Motion variant propagation: old fields fade out + translate up (`y: -16`, 180ms ease-in) on exit, new fields fade in from below (`y: 16→0`, 280ms ease-out) on enter, each offset ~60ms after the previous (`staggerChildren: 0.06`). This replaces the old whole-panel `subStepFade` in `onboarding-rail-shell.tsx` and `signup-shell.tsx`'s equivalent — both wrappers now go visually neutral (`opacity: 1` constant) for sub-step/signup moves, letting the nested `<StaggerFields>` do the real work. Confirmed during implementation that Framer Motion's exit-propagation still lets the *old* screen's fields play their exit animation even though the outer wrapper itself no longer animates — `AnimatePresence` finds nested motion components with `exit` variants regardless of how many levels down they sit.

**Right side (preview) — "seamless extension"** traced to something concrete already in the code: `onboarding-preview.tsx` swapped a skeleton for its confirmed value with an instant, un-animated conditional render — that abrupt swap *is* the "sudden new UI" feeling described. New component `components/onboarding/reveal-field.tsx` (`<RevealField>`) crossfades the swap (220ms) instead. Applied to all four skeleton→value sites in `DocumentBody` (identity fields, category, address, store location) — centralized in one file, so full coverage was cheap.

**Scope, as flagged when proposing this**: rather than mechanically retrofitting all 14+ step files in one pass, applied `<StaggerFields>`/`<StaggerField>` to two representative screens — `business-basics` (onboarding, multi-field, proves real stagger) and `/signup/password` (signup, single-field, proves the pattern still holds with one item). Verified both render correctly and that form submission/typing still work after the wrapper restructuring. The remaining screens are a graduated follow-up: [Apply motion pattern to remaining screens](issues/12-apply-motion-pattern-to-remaining-screens.md), which also resolves the map's open "does this need exceptions for face-auth/review-and-sign" fog question.

`tsc --noEmit` clean on all touched files.
