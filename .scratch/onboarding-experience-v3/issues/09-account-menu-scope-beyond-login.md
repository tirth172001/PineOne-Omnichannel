Type: grilling

## Question

Ticket 03 added the three-dot account menu (`DotsThreeIcon` → "Logout") only to `app/login/page.tsx`'s top bar, next to that page's theme toggle and language switcher. Should the same menu also appear on the signup (`/signup/*`) and onboarding (`/onboarding/*`) screens?

Grounding for the decision:

- Neither shell currently has a top-bar row to drop the menu into. `SignupShell` (`components/onboarding/signup-shell.tsx`) and every onboarding step (via `OnboardingPanelLogo`, `components/onboarding/onboarding-panel-logo.tsx`) render only a bare, absolutely-positioned logo — no theme toggle, no language switcher, nothing resembling login's `<div className="absolute ... flex items-center justify-between">` header row. `OnboardingRailShell` (`components/onboarding/onboarding-rail-shell.tsx`) doesn't even render the logo itself — each step's own panel does.
- So this isn't just "add one dropdown" — extending the account menu here means deciding whether to introduce that whole top-bar row for the first time on these screens (and if so, whether it also carries the theme toggle and language switcher login groups it with, or the account menu alone, orphaned from its usual siblings).
- Resolve for both surfaces separately if the answer differs: signup (`SignupShell`, shared across all `/signup/*` steps) and onboarding (`OnboardingPanelLogo`, shared across all `/onboarding/*` steps except the full-width routes in `FULL_WIDTH_ROUTES`, which render no shell chrome at all).
- If the answer is "yes, add it": specify what ships alongside it (menu alone vs. full header row) and where it sits relative to `OnboardingPanelLogo`'s `absolute left-6 top-6 sm:left-10 sm:top-10` positioning, so implementation doesn't have to re-litigate placement.
- If the answer is "no, login-only for now": say so explicitly and this ticket resolves as "no build" — the map's fog entry retires either way.
