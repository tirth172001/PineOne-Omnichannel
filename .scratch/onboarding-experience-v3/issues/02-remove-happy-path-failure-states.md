Type: task
Status: resolved

## Question

Remove the happy-path failure states that currently exist in the core onboarding sequence, since this app should demo a clean happy path only:

1. `verification.failed` in `components/onboarding/onboarding-profile.ts`, and whatever UI branch renders "Verification failed" in `components/onboarding/onboarding-preview.tsx` (~line 78-80), plus wherever `business-verification`'s Singpass/manual flow sets it — including any "Try again" retry affordance tied to it (the v2 map's Singpass ticket notes "V1's first-attempt-fails pattern is preserved" — that pattern is what's being removed here).
2. `banking.step === "failed"` in `components/onboarding/onboarding-profile.ts`, and any "failed" branch/copy in the `banking-details` step and its preview treatment.

Trace every read and write of both fields and delete the failure branch entirely, leaving only the success path (upload → reading → confirm, verify → verified).

**Explicitly out of scope**: `lending-application-flow.tsx`'s "Resend OTP" button and any failure states in `pos-onboarding-flow.tsx` — those are separate flows outside `SEQUENCE` in `components/onboarding/onboarding-sequence.ts`, not part of the core onboarding sequence this ticket covers.

## Answer

Traced every read/write of both fields and deleted the failure branch entirely:

1. **`verification.failed`**
   - `components/onboarding/onboarding-profile.ts`: removed `failed: boolean` from `OnboardingProfile["verification"]` and from `EMPTY_PROFILE`.
   - `app/onboarding/business-verification/_variant-a.tsx`: removed the `"failed"` member of the local `Step` union, the `FAILURE_COPY` copy table, the `attempts`/`attemptNumber` retry-counter logic in `startVerification` (the `window.setTimeout` now always resolves to the success path — Singpass pushes straight to `/onboarding/business-basics`, manual upload goes to the `"confirm"` fields-review screen), the `WarningCircleIcon` import, and the whole failure-branch JSX (icon, title/description from `FAILURE_COPY`, "Try again"/"Upload ACRA instead"/"Verify via Singpass instead" buttons, "Contact support" link).
   - `components/onboarding/onboarding-preview.tsx`: removed the `hasFailure` derivation (`profile.verification.failed || profile.banking.step === "failed"`) and its three call sites (header shield-icon color, header status text, header status-pill background) — these now key off `verification.verified`/`verifying` only.
2. **`banking.step === "failed"`**
   - `components/onboarding/onboarding-profile.ts`: removed `"failed"` from `banking.step`'s union (`"upload" | "reading" | "confirm"` only).
   - `app/onboarding/banking-details/_variant-a.tsx`: removed the `"failed"` `Step` member, the `attempts` counter (the `window.setTimeout` after upload now always resolves to `"confirm"`), the `WarningCircleIcon` import, and the failure-branch JSX (destructive banner, "Try again" button, "Contact support" link).
   - `components/onboarding/onboarding-preview.tsx`'s `BankingBody`: removed the `failed` local and its three branches (icon-circle background/icon, and the destructive "Couldn't extract details" box), leaving only `complete`/`active` states.

Out-of-scope flows (`lending-application-flow.tsx`, `pos-onboarding-flow.tsx`) untouched — confirmed neither reads `SEQUENCE` or these profile fields.

Verified live in the browser end-to-end on a fresh session: business-name → get-started → business-verification (Singpass login+consent succeeds on the very first attempt, no failure screen, routes straight to business-basics) → category → store-verification → website-app-details → banking-details (upload UI renders cleanly, no failure branch reachable). `npx tsc --noEmit` clean on all four touched files. Recorded in `docs/decisions/decision-log.md` entry 82.
