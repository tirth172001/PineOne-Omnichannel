Type: prototype
Status: resolved

## Question

This amends the shell decided in [Architect the post-business-name sequence](01-architect-post-business-name-sequence.md) and its as-built implementation. Two things diverged from that ticket's own decision, and the user now wants both changed:

1. **Ticket 01 decided** a persistent, slim left navigation rail (4 macro-sections, jumpable once completed) alongside the content area. **What shipped** (`components/onboarding/onboarding-rail-shell.tsx:8-12`) deliberately dropped the rail — its own comment says progress is shown only inside each screen's content, "not a persistent sidebar." The user has now confirmed (per this map's amendment round): **reinstate the persistent left rail.**
2. **What shipped** for progress (`components/onboarding/step-progress-bar.tsx`) is a segmented pill bar — one visible segment per sub-step *within the current macro-section* (e.g. "Business verification · 1 of 4"), with hard-edged gaps between segments. The user wants this replaced: **only 4 top-level steps should ever be user-visible** ("Step X of 4," one per macro-section — Business verification, Business details, KYC, Review and sign), rendered as a **single continuous, unsegmented track** (no visible gaps/segments). The fill should **creep smoothly** as sub-steps within the current macro-section complete (so a user on sub-step 2 of 4 within "Business verification" sees roughly 1/8 of total progress filled, not a discrete jump), but the **"Step X of 4" label only advances once every sub-step under the current macro-step is done** — never mid-step.

Also design the **sub-step transition** within the main content area, so moving between sub-steps of the *same* macro-step feels like a continuum rather than the existing route-level cross-fade (`onboarding-rail-shell.tsx:31-42`, which swaps the whole screen): the completing sub-step's content should fade out **upward**, and the next sub-step's fields should fade in **from below** — distinct from (and layered on top of, not replacing) the existing whole-page `AnimatePresence` cross-fade, since that fade still applies when moving between *macro-steps* rather than sub-steps.

Work out: what the left rail actually shows now that macro-steps (not sub-steps) are the unit of navigation shown top-level — does it list all 4 macro-sections with the current one expanded to show sub-step dots, or something else? How is "jumpable once completed" preserved? Does the rail's presence change the width available to the existing 50/50 input/preview split (ticket 01's Notes)?

Prototype and fold the winning variant into the shared shell components (`onboarding-rail-shell.tsx`, `step-progress-bar.tsx`) so every step in the sequence inherits it, per this map's existing pattern (see ticket 02's answer).

## Answer

**No left rail — superseding both this ticket's own framing and ticket 01's original decision.** Two rail variants were prototyped (a collapsed icon rail with substep pips; a full-width always-expanded section list with an embedded vertical progress dot) and rejected via live user feedback: both counted as "unnecessary elements" the user never actually asked for — the original request was only ever about the *top* progress indicator. The final direction has no sidebar at all; the shell is otherwise unchanged from before this ticket (still just chrome around the content).

**Continuous progress bar renders in place, not in a new zone.** It replaces the old segmented `StepProgressBar` in the exact same slot every step already had — top of the left input panel, above the screen heading — rather than adding a separate bar elsewhere. It's a single unsegmented track spanning the whole 4-macro-step journey, filling smoothly as sub-steps within the current macro-section complete (e.g. 2nd of 4 sub-steps in "Business verification" ≈ 2/9 of the total track), while the "Step X of 4 · [macro name]" caption only advances once every sub-step under the current macro is done — verified by clicking through all 4 "Business verification" sub-steps (label held at "Step 1 of 4" throughout) and crossing into "Business details" (label correctly flipped, and again for "KYC" on authorised-signatory).

**Sub-step transition:** fade out upward / fade in from below (`y: 20` in, `y: -20` out) for moves within the same macro-section; the existing whole-page cross-fade (`y: 12`/`y: -12`) is preserved for moves across a macro boundary — both live in `onboarding-rail-shell.tsx`, keyed by pathname, chosen via `useIsSubStepMove` in the new `onboarding-sequence.ts`.

**Additional decision surfaced during live iteration (not in the original question, but touches the same shared shell files):** the panel structure didn't match `app/login/page.tsx`'s convention — one single bordered box instead of two independently `rounded-md` panels with an 8px `gap-2`, and the logo sat in its own header row above the content instead of inside the left panel. Both fixed to match login exactly: `bg-sidebar p-2` outer, `gap-2` between two `rounded-md` panels (input panel `bg-background`, preview panel keeps its Grainient), logo absolute-positioned inside the left panel's own padding via the new `onboarding-panel-logo.tsx`, and nothing rendered above the two panels at all.

**Folded into (shared, all steps inherit):**
- `components/onboarding/onboarding-rail-shell.tsx` — chrome + transition logic, rail removed.
- `components/onboarding/step-progress-bar.tsx` — continuous track, no props (reads position itself).
- `components/onboarding/onboarding-panel-logo.tsx` — new, logo-in-panel.
- `components/onboarding/onboarding-sequence.ts` — new, macro/sub-step position math + transition-type hook, shared by the two above.

**Applied to all 9 routes in the sequence:** business-verification, business-basics, store-verification, website-app-details, banking-details, business-owners, authorised-signatory (all five-panel layout), plus face-authentication and review-and-sign (the two full-width exceptions from ticket 01 — same panel/logo/gap treatment, single panel instead of a 50/50 split). `request-access-existing-merchant` is untouched (its own shell, sibling to this sequence, per ticket 11).

**Fixed in passing:** review-and-sign's content is taller than the viewport; its wrapper used `items-center` for vertical centering, which combined with `overflow-y-auto` made the top of the scroll area (the progress bar, in this case) genuinely unreachable by scrolling — a pre-existing flexbox-centering-plus-overflow bug, not introduced by this ticket, but on the exact wrapper this ticket touches. Changed to `items-start` with explicit top margin.

All 9 routes verified in-browser (screenshots + `AnimatePresence`/console checks) — no console errors, sub-step and macro-boundary transitions both confirmed, progress math confirmed via DOM measurement (1/9, 2/9 fill fractions).
