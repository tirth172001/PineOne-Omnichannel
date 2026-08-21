Type: task
Status: resolved
Blocked by: 07

## Question

No back navigation exists anywhere today — not in `app/login/page.tsx`, not in `components/onboarding/onboarding-rail-shell.tsx` (verified by reading both files: no back handler, no back button). The user wants the ability to go back to the previous step added across the whole journey — login/signup and the onboarding sequence alike.

Resolve: where the back control lives in the UI (shell-level, per-screen), what it does to already-filled fields and the persistent preview panel's accumulated state when a user goes back and changes an earlier answer, and how it interacts with the ticket 09 motion pattern in reverse (does fade-out-up/fade-in-from-bottom play backwards?).

Depends on ticket 07 for the login/signup step boundaries this needs to navigate between.

## Answer

Built one reusable `<BackButton />` (`components/onboarding/back-button.tsx`) driven by `router.back()` rather than a hardcoded prev-route map — this makes it correct automatically for both sequences (and for the fork screen returning into the signup sequence, or a mid-sequence screen returning to the previous macro-section) without needing per-route wiring.

**Where it lives, and why that placement needed no per-screen edits:**
- **Onboarding sequence**: wired into `StepProgressBar` (`components/onboarding/step-progress-bar.tsx`) itself, not into each of the 9 step files. This works because the mapping is exact: every screen that renders `StepProgressBar` is a screen where going back is meaningful, and the screens that don't render it — mid-verification "verifying" states, face-authentication's active capture phase, review-and-sign's post-submission success screen — are exactly the screens where back shouldn't be offered (you don't want to interrupt an in-progress camera scan or "undo" a submitted signature). So one edit to one shared component correctly covers all 9 onboarding routes with zero risk of adding back where it doesn't belong.
- **Signup sequence**: wired into `SignupShell` (unconditionally, including the `get-started` fork screen, since reconsidering your business name or which path to take is legitimate there too).
- Deliberately did not touch `request-access-existing-merchant` — it's a separate, conversational-chat-style surface from v1, not part of what this ticket (or the original "no back nav anywhere" finding) was pointing at.

**Data on back:** no field-value restoration was built — going back re-mounts the previous screen's local component state fresh (e.g. a half-typed email is gone), matching how the rest of this app already works (nothing here persists in-progress field values, only completed-step data via the module stores). Not treated as a gap to fix — no ticket asked for it.

**Deferred:** the ticket asked how back should interact with ticket 09's motion pattern in reverse — ticket 09 hasn't resolved yet, so there's no reverse choreography to wire up. The back button works correctly today with whatever transition is currently in place; ticket 09 will need to account for the back direction when it resolves.

Verified end-to-end in an isolated worktree dev server: on `/signup/email` → `/signup/password`, clicking Back returned to `/signup/email` with the step counter correctly back at "1 of 4." On the onboarding sequence, walked through the Singpass dialog to `business-basics`, confirmed the back button appears even on business-verification's failed-attempt state, and clicking Back from `business-basics` correctly returned to `business-verification`. `tsc --noEmit` clean.
