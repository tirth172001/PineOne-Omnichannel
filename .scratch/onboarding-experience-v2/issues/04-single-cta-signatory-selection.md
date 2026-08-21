Type: prototype
Status: resolved

## Question

Authorised-signatory (`app/onboarding/authorised-signatory/_variant-b.tsx`) currently requires two clicks on the main CTA: selecting a signatory sets `signed=false`, the button reads "Confirm signatory"; clicking it sets `signed=true`; only then does the button read "Continue" and actually navigate to the next step (`router.push("/onboarding/face-authentication")`).

The user doesn't want this — selecting the signatory card (the selector itself) should be enough; the main CTA should only need one click to proceed. Resolve what the single-click flow looks like: does selecting a `PersonCard` immediately arm the CTA as "Continue" (no intermediate "Confirm signatory" state), or does selection itself need some other lightweight acknowledgment that isn't a second CTA click?

## Answer

Selecting a `PersonCard` immediately arms the CTA — no intermediate "Confirm signatory" state. Removed the local `signed` state entirely; the button is now always "Continue", `disabled={!selected}` where `selected` is just `useSignatory()`, and its `onClick` navigates straight to `/onboarding/face-authentication`. `PersonCard`'s `onClick` calls `setSignatory(person.id)` directly (previously went through a `selectSignatory` wrapper that also reset `signed`), and `AddSignatorySheet`'s `onAdd` does the same.

No separate lightweight acknowledgment was needed beyond what already existed: `PersonCard`'s own selected-state styling (`border-primary bg-primary/5 ring-1 ring-primary`) already gives clear visual confirmation of the pick, and the persistent preview panel (ticket 02/03) mirrors it immediately — that combination reads as sufficient acknowledgment without a second CTA click.

Verified in-browser: added a signatory via the sheet, "Continue" armed immediately (no "Confirm signatory" interstitial), one click navigated straight to face-authentication.

Files changed: [authorised-signatory/_variant-b.tsx](../../../app/onboarding/authorised-signatory/_variant-b.tsx).
