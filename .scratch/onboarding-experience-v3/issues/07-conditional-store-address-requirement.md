Type: task
Status: resolved
Blocked by: 05, 06

## Question

Two changes, both driven by [ticket 05](05-product-intent-taxonomy-and-field-rules.md)'s resolved rule and reading [ticket 06](06-product-intent-capture-ui.md)'s stored selection:

1. **Remove the generic, unconditional shipping-address field.** Delete `basics.addressText` from `components/onboarding/onboarding-profile.ts`'s `OnboardingProfile.basics`, its "Device shipping address" field in `onboarding-preview.tsx`'s `category` section (~line 165, ~line 295), and its corresponding input in the `business-basics` step (`app/onboarding/business-basics/`).
2. **Make `store-verification` conditional.** The route (and its "Store details" `DOC_SECTIONS` entry in `onboarding-preview.tsx`) is present and required only when the merchant selected the "in-store devices" intent during ticket 06's capture step; otherwise it's skipped entirely from `SEQUENCE` in `components/onboarding/onboarding-sequence.ts`. `TOTAL_SUBSTEPS` and the progress display need to reflect the shorter sequence when the step is skipped.

## Answer

Both changes landed as real code:

1. **Removed the generic shipping-address field.** Deleted `basics.addressText` from `OnboardingProfile` (`onboarding-profile.ts`), the "Device shipping address" `RevealField` block from `onboarding-preview.tsx`'s `category` section content, the matching `count += 1` in `countConfirmedDetails`, and the whole "Where should we ship your devices?" `StaggerField` (address line / city / postal code inputs) plus its local state from `app/onboarding/business-basics/_variant-a.tsx`. The `category` DOC_SECTIONS label changed from "Category & shipping" to "Category"; its `isComplete` check now only requires `categoryId`.
2. **Made `store-verification` conditional**, driven by a single new predicate `isInStoreDevicesSelected()` in `onboarding-sequence.ts` (reads `getSignupSession().selectedCategories`), used in two places kept in lockstep:
   - `onboarding-sequence.ts`: `getActiveRoutes(macro)` filters `"store-verification"` out of the first macro's routes when the predicate is false. `getPosition()` was rewritten to compute `subIndex`/`globalIndex`/`progress` against the *active* routes per macro (summed fresh per call) instead of the static `SEQUENCE`/`TOTAL_SUBSTEPS` — `TOTAL_SUBSTEPS` is gone, nothing outside this file depended on it.
   - `onboarding-preview.tsx`: `ALL_DOC_SECTIONS` (renamed from `DOC_SECTIONS`) is filtered by the same predicate via `getDocSections()`, so the "store" section only appears in the preview accordion when the route is active — keeping `subIndex` (from the routes side) and the accordion's section indices aligned.
   - `app/onboarding/business-basics/_variant-a.tsx`'s Continue button now routes to `/onboarding/store-verification` if selected, `/onboarding/website-app-details` otherwise (skipping the step entirely rather than rendering it as a no-op).

Verified live end-to-end in the browser, both branches: (a) selected "Online checkout" only on business-name → preview panel never shows "Store details" → business-basics has no address fields → Continue lands directly on `website-app-details` ("Do you accept payments online?"), confirmed via `get_page_text`; (b) selected "In-store devices" → preview panel shows "Store details" in the section list once past business-basics, confirming `store-verification` stays in the active sequence. No console errors either run. `tsc --noEmit` error count unchanged at 29 (same pre-existing baseline as ticket 06's check) — no new errors from any of the three touched files.

This unblocks ticket 08 (store-address capture: Maps link / current location / inline full form on `store-verification`).
