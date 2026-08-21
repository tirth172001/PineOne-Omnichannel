Type: prototype
Status: resolved
Blocked by: 05

## Question

Build the product-interest + intent capture UI on `app/signup/business-name/_client.tsx`, using [ticket 05](05-product-intent-taxonomy-and-field-rules.md)'s resolved taxonomy. Directly below the business-name field (before the Continue button): a row of product cards (per ticket 05's product list), each with a "View more" CTA that opens a side panel (`Sheet`) showing the full catalog with a multi-select (checkboxes) over ticket 05's intent list.

Persist the selection somewhere the rest of the signup/onboarding sequence can read — extend the existing module-scoped store pattern (either `components/onboarding/onboarding-profile.ts` or a new signup-scoped equivalent, consistent with how `onboarding-person.ts` / `onboarding-profile.ts` already survive client-side navigation between routes).

Build this new UI cheat-sheet-compliant (8px-within / 16px+-between group spacing, concentric radii) from the start, rather than relying on ticket 01's audit to catch it — ticket 01 explicitly excludes this new UI from its scope.

## Answer

Built directly in the repo, real code:

- **`components/onboarding/product-catalog.ts`** — new data module: `PRODUCT_CATEGORIES` (the 4 categories from ticket 05, each with a `teaser` string and `catalogGroups` for the side panel) and `findProductCategory()`. Catalog content matches ticket 05's answer verbatim for In-store devices (Swipe machines: A910/A50/A920; QR devices: Mini Pro/Mini) and Online checkout (Payment gateway/Tap to Pay on iPhone); Payment links and Subscriptions got two illustrative cards each, written fresh since no reference existed for them.
- **`components/onboarding/signup-session.ts`** — extended `SignupSession` with `selectedCategories: ProductCategoryId[]` and a `toggleProductCategory()` setter, same module-scoped-store pattern as the existing `email` field. This is readable from anywhere client-side-navigated to, including from inside `app/onboarding/*` later — ticket 07 reads it directly, no new store needed.
- **`components/onboarding/product-intent-picker.tsx`** (new) — `ProductIntentPicker`:
  - A vertical list of 4 selectable rows (not a 2x2 card grid — the shell's `max-w-[320px]` column made a grid too cramped for icon + label + teaser + affordance). Each row is a real `<label htmlFor>` + `<Checkbox>` (native, accessible, no nested-interactive-element problem) with a sibling "Know more" `<button>` — clicking the row toggles selection, clicking "Know more" opens the catalog sheet scoped to that category without touching selection. Selected state reuses the existing `border-primary bg-primary/5 ring-1 ring-primary` convention from `PersonCard`.
  - A `Sheet` catalog ("Explore our products") with `Tabs` (All + one per category) filtering which groups show. Per ticket 05's answer, the sheet has **no selection of its own** — it's browsing-only; tabs just filter the view. Item cards inside show name, optional tag `Badge`, and description — plain, non-interactive.
- **`app/signup/business-name/_client.tsx`** — split the old single input+button `StaggerField` into three: name input, `<ProductIntentPicker />`, then the Continue button — each its own stagger group (32px apart via the existing `space-y-8` wrapper), satisfying the cheat sheet's group-spacing rule against the picker's internal 8-12px gaps. Selecting a category is **not** required to proceed — `Continue` still only gates on the business name, matching the ticket's "just collect the intent" framing (nothing indicated it should block submission).

Verified live in the browser (localhost:3000/signup/business-name, screenshots + interaction test): all 4 rows render with icon/label/teaser, checkbox toggle shows the selected ring + checkmark correctly, "Know more" opens the sheet pre-filtered to the clicked category, the "All" tab shows every group stacked, per-category tabs filter correctly (verified In-store devices and Payment links), and no console errors. `tsc --noEmit` shows no new errors introduced (grepped the four changed/new files against the full error list — zero matches; all 29 pre-existing errors are unrelated).

This unblocks ticket 07 (remove generic shipping address, make store-verification conditional on `selectedCategories.includes("in-store-devices")`) and ticket 08 (store-address capture methods).
