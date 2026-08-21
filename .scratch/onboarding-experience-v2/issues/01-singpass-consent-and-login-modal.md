Type: prototype
Status: resolved

## Question

Build the Singpass "verify via Singpass" path on the business-verification screen as a two-step modal flow, per the user's reference screenshots (described in the map's Notes):

1. **Login to Singpass** — Corppass ID + password fields, "Forgot your ID?" / "Forgot your password?" links, a "Login" CTA, a "Register with Singpass" secondary CTA, and a QR-code "Instant login" panel alongside it.
2. **Consent modal** — lists exactly what will be fetched, split into "Additional details" (UEN Registration Number, Business Name, Merchant type, Nature of business, Date of Incorporation, Registered Address, Business Owner Details) and "Personal details" (NRIC/FIN, Name, Email ID, Contact details), a terms-of-usage line, and Proceed/Cancel.

On Proceed, the flow should move straight into the next onboarding step with the fetched fields already populating the right-side preview — no separate "confirm these details" screen (this replaces the redundant re-confirmation step the user flagged for the Singpass path specifically).

Resolve: what the two modals look like in this repo's design system (using `app/onboarding/business-verification/_variant-a.tsx`'s existing Singpass button as the trigger), how the two steps chain together, and how "Proceed" hands off into the next step's populated preview. The Singpass wordmark is available at `public/brand/singpass-logo.svg`.

## Answer

Built as a single stateful `Dialog` (`app/onboarding/business-verification/_singpass-dialog.tsx`, new) with two internal stages, `"login"` and `"consent"`, driven by one `singpassStage` state var in `_variant-a.tsx` instead of the old direct `startVerification("singpass")` call:

- **Login stage**: two-column `sm:max-w-xl` dialog — left column is the "Instant login" QR panel (a `QrCodeIcon` standing in for a real QR code, plus the Singpass wordmark), right column is the Corppass ID/password form (prefilled demo values `j.tan@kopiandco.com.sg` / `pinelabs123`, password visibility toggle) with "Forgot your ID?/password?" links, a primary "Login" CTA and an outline "Register with Singpass" CTA. Both CTAs advance to the consent stage (this is a prototype demo — no real Corppass auth).
- **Consent stage**: `sm:max-w-md` dialog — Singpass wordmark, "Pine Labs is requesting the following information from Singpass, to apply for their payment solution," a two-column checklist (Additional details: UEN Registration Number, Business Name, Merchant type, Nature of business, Date of Incorporation, Registered Address, Business Owner Details / Personal details: NRIC/FIN, Name, Email ID, Contact details), a terms-of-usage line, and Proceed (primary) / Cancel (outline) stacked full-width.
- **Hand-off**: clicking Proceed closes the dialog and calls the existing `startVerification("singpass")`, but that function now branches on method — for singpass, a successful attempt updates the shared profile store directly (`verified: true`) and calls `router.push("/onboarding/business-basics")` immediately, skipping the old `step === "confirm"` screen (fields list + Edit buttons + Continue button) entirely. That screen still exists and is unchanged for the manual-upload path, which is out of this ticket's scope. V1's "first attempt always fails" pattern (ticket 18) is preserved for singpass: a failed attempt now re-opens the dialog at the login stage via "Try again," rather than re-calling `startVerification` directly.
- **Bug found and fixed during verification**: the Singpass wordmark SVG has black ink for the "i" dot and other glyph details, which disappeared against this app's dark-themed dialog surface. Fixed by wrapping the logo in a small white background chip everywhere it's used in this dialog.

Verified end-to-end in an isolated worktree dev server: method card → login stage renders correctly (wordmark legible) → Login advances to consent stage (matches the reference screenshots) → Proceed → first attempt deterministically fails (existing v1 behavior preserved) → Try again reopens the login stage → second Proceed succeeds and lands directly on business-basics with the preview panel showing "4 details confirmed" and all four fetched fields populated, no intermediate confirm screen. Manual-upload path confirmed unchanged by code inspection.

New files: `app/onboarding/business-verification/_singpass-dialog.tsx`, `public/brand/singpass-logo.svg`. Modified: `app/onboarding/business-verification/_variant-a.tsx`.
