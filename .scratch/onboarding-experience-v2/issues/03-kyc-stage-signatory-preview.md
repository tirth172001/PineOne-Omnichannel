Type: prototype
Status: resolved
Blocked by: 02, 05

## Question

Face-authentication (`app/onboarding/face-authentication/`) currently has no right-side preview at all (`PreviewMode: "none"` in `components/onboarding/onboarding-sequence.ts`) — it's a full-width exception. The user wants something there consistently: specifically, the selected authorized signatory's card, shown in the preview panel throughout the KYC step, and marked as verified once face authentication succeeds.

Resolve: does face-authentication stay full-width with an added preview, or does it move to the standard split layout? What does "marked verified" look like on the card in this context vs. the existing verifying→verified badge animation on `PersonCard` (`components/onboarding/onboarding-person-card.tsx`)? Update `getPreviewMode`/`FULL_WIDTH_ROUTES` in `onboarding-sequence.ts` accordingly.

Depends on ticket 02 for the preview panel's redesigned visual language and ticket 05 for the card's avatar treatment (this preview will render the same `PersonCard` used elsewhere).

## Answer

Face-authentication moves into the standard split layout — removed from `FULL_WIDTH_ROUTES`, and its `PreviewMode` changes from `"none"` to `"signatory"` (`components/onboarding/onboarding-sequence.ts`). This means the whole KYC macro-section (`authorised-signatory` + `face-authentication`) now shares one preview mode, the same way `"document"` already spans all of `business-verification` — no new preview body needed, `SignatoryBody` (`components/onboarding/onboarding-preview.tsx`) is reused as-is.

"Marked verified" needed no new treatment: `_variant-a.tsx` was already calling `setVerificationStatus(signatory.id, "verifying" | "verified")` during capture (wired for a badge that had nowhere to render), so surfacing `SignatoryBody`'s `PersonCard` here picks up the existing spinner→checkmark badge animation for free.

`_variant-a.tsx`'s two phases (`confirm`, `capturing`/`success`) had their root wrapper and content width changed from an ad hoc full-width centering (`max-w-md`/`max-w-sm`, `<div>` root) to the same `<section>` + `mx-auto max-w-[420px]` convention every other split-layout step uses (e.g. `authorised-signatory/_variant-b.tsx`), so the camera stage and prep-tip grid now sit correctly in the half-width column instead of assuming the full viewport.

Verified in-browser: added a signatory on authorised-signatory, advanced to face-authentication — the split layout renders with the signatory's card in the preview panel; starting capture shows the spinner badge, and on completion it flips to the green checkmark badge, matching the existing `PersonCard` animation.

Files changed: [onboarding-sequence.ts](../../../components/onboarding/onboarding-sequence.ts), [face-authentication/_variant-a.tsx](../../../app/onboarding/face-authentication/_variant-a.tsx).
