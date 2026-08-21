Type: prototype
Status: resolved

## Question

This amends the interaction decided in [Prototype: Business verification](02-prototype-business-verification.md) (Variant A, folded into `app/onboarding/business-verification/_variant-a.tsx:19-100`).

Today the step is a two-part interaction: pick one of two `MethodCard`s in a `radiogroup` ("Verify via Singpass" / "Upload your ACRA document"), then press a separate shared CTA button below both cards to actually continue. The user's feedback: this selector-then-continue pattern is unnecessary friction for a binary, unambiguous choice — each card should be its own direct call to action.

Decide and prototype: should each `MethodCard` become its own button that immediately starts that path on click (no intermediate "selected" state, no separate CTA below)? Specifically for the manual path — should "Upload your ACRA document" open a real file picker directly (there's currently no actual upload UI; selecting "manual" just relabels the shared CTA and later shows a static filename chip, `_variant-a.tsx:266-271`), making it a genuinely distinct upload affordance rather than a second radio option? Work out the resulting states (idle → uploading/verifying → confirmed) for both paths independently, and how this interacts with the existing shimmer/expand-to-center-stage verifying moment (ticket 01's Notes) — does clicking a card trigger that immediately, or is there still a brief "you picked X, starting..." beat?

## Answer

Both `MethodCard`s are now direct, independent CTAs — no `radiogroup`, no shared "select then continue" button. Clicking "Verify via Singpass" calls `startVerification("singpass")` immediately. Clicking "Upload your ACRA document" triggers a real hidden `<input type="file">` via a ref (`accept="application/pdf,image/png,image/jpeg"`) — a genuinely distinct upload affordance, not a second radio option; selecting a file (`onChange`) captures the real filename and calls `startVerification("manual")`. Canceling the file dialog leaves the screen untouched (no state change), matching how an upload button should behave.

**The brief beat:** kept, but in-place rather than as a separate step — the clicked card itself morphs to show a spinner in place of its icon and a status line ("Connecting to Singpass…" / "Reading your document…") in place of its description; the other card disables. This gives immediate visual feedback without introducing an intermediate "you picked X, now confirm" screen, which was the actual friction being removed. After the existing 1.5s timeout, both paths land on the same "You're verified" confirm screen as before — for the manual path, the subtitle and the preview's filename chip now show the real uploaded filename instead of a hardcoded placeholder.

Folded directly into `app/onboarding/business-verification/_variant-a.tsx` (this ticket only touches this one step — the interaction pattern doesn't recur elsewhere in the sequence). Verified in-browser: single click on either card runs straight through to the verified/confirm state, no console errors.
