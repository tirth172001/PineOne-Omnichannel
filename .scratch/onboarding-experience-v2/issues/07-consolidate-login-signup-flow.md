Type: grilling
Status: resolved

## Question

`app/login/page.tsx` currently treats email entry, password creation, and OTP confirmation as separate steps (exact current sequencing needs to be read from the file as part of resolving this). The user wants these "clubbed" into one seamless flow rather than feeling like disconnected screens.

This explicitly reverses the v1 map's ruling that login/signup was out of scope ("login is treated as functionally fine; only correct auth-state routing... required") — see map Notes.

Resolve: what "clubbed" means concretely — one continuous scrolling/stepping screen with the same panel never remounting (mirroring how ticket 15 in v1 made the onboarding preview persistent rather than swapped), vs. still-distinct steps but with the seamless transition choreography from ticket 09 applied between them. Use `/flow-architecture` to work through the step sequencing. This ticket's resolution defines the step boundaries that ticket 08 needs to wire back-navigation against.

## Answer

**The ticket's premise was wrong, and reframed before any building started.** `app/login/page.tsx` has no password or OTP step — it's a single identifier field for returning users. There was no email/password/OTP sequence anywhere to "smooth transitions between" — `app/onboarding/account/` was an empty directory, the only OTP-capable code was an unrelated lending flow and a dead, unimported chatbot-style component (`account-onboarding-flow.tsx`), and nothing in the live app linked into the onboarding sequence at all (`/onboarding/business-verification` and `/onboarding/request-access-existing-merchant` were only reachable by typing the URL). So this ticket became "design and build the account-creation sequence from scratch," confirmed with the user before writing code.

**Architecture decided via grilling:**
- Lives at `/signup/*` (not `/onboarding/account`) — fixes `app/login/page.tsx`'s existing "Sign up" link, which 404'd before this ticket.
- Distinct routed steps (matching how the rest of onboarding works), not a single stateful mega-screen — gives ticket 08 real routes to wire back-nav against and ticket 09 real transition boundaries.
- Shell mirrors `app/login/page.tsx`'s exact panel split (decorative visual left, form right) — not the onboarding sequence's split (form left, data preview right), since signup has no business data yet to preview. The decorative panel was extracted to a new shared `AuthVisualPanel` component and both `/login` and `/signup/*` now use it identically.
- Right panel stays purely decorative throughout — no preview content invented that ticket 02 would either collide with or discard.

**Screens built, via `/flow-architecture` (one decision per screen):**
1. `/signup/email` — email field, "Already have an account? Log in" back to `/login`.
2. `/signup/password` — single password field (show/hide toggle covers the typo problem instead of a second confirm field) + live strength meter.
3. `/signup/otp` — 6-digit code (`components/ui/input-otp.tsx`), shows the email captured in step 1, resend timer, inline wrong-code error.
4. `/signup/business-name` — single text field.
5. `/signup/get-started` — the fork the v1 map's destination described but never built: two direct-trigger cards (no separate Continue button, matching the single-CTA precedent), "Create a new business" → `/onboarding/business-verification` (existing, untouched) and "Request access to an existing merchant" → `/onboarding/request-access-existing-merchant` (existing, untouched). Doesn't count toward the "Step X of 4" progress indicator — it's a decision point, not a form step.

New shared infrastructure: `components/onboarding/auth-visual-panel.tsx` (extracted from login), `components/onboarding/signup-shell.tsx` (persistent chrome + progress bar), `components/onboarding/signup-sequence.ts` (the 4-step position helper), `components/onboarding/signup-session.ts` (module-scoped store carrying the email forward to the OTP screen, same pattern as `onboarding-profile.ts` — no redirect-gating on incomplete steps, matching how the rest of this app's routes stay directly reachable).

**Bug found and fixed during verification:** the OTP screen's wrong-code state left the 6 digits sitting in the input with no way to retype without manually clearing them. Fixed — a wrong code now shows the error for 400ms, then clears the field automatically.

Verified end-to-end in an isolated worktree dev server: `/login` renders identically after the panel extraction; "Sign up" now lands on a real screen instead of a 404; walked the full sequence (email → strong-password meter → OTP wrong-code-then-correct-code → business name) confirming the email persisted through to the OTP screen and the progress bar/step label advanced correctly at each screen; both fork destinations confirmed reachable and unchanged. `tsc --noEmit` clean.
