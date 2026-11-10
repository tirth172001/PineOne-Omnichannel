# Auth and Onboarding Flow

Last updated: 2026-11-10

## Current web prototype: progressive onboarding

Entry: `/onboarding-demo` on the same web app and port (locally `http://localhost:3000/onboarding-demo`). It always starts with the phone-number input. OTP, password, home, products, setup and activity remain under this namespace. Main `/`, product routes and `/signup/email` retain the established app experience. Earlier phone-signup and dedicated-setup URLs redirect into the demo namespace.

1. Phone → demo OTP `123456` → password (minimum 8 characters) → Overview as `new-merchant`.
2. The initial sidebar contains only Overview and Products: In-store, Payment links and Checkout. Setup screens offer a support link; account actions are in the profile menu. Established merchants retain the full navigation.
3. Each product opens education before setup; Learn more opens a product-specific explanation, including where its future activity belongs.
   All three first-time pages use the same product header, explanation, setup summary and action placement. In-store includes the actionable device catalogue immediately: choose models, buy/rent and quantities before Continue to setup. This choice is saved on the normal In-store page, before dedicated onboarding starts.
   Get started (or Continue to setup for In-store) opens `/onboarding-demo/setup/in-store`, `/onboarding-demo/setup/payment-links` or `/onboarding-demo/setup/checkout`. These dedicated pages share the same SetupFrame layout and show only the onboarding progress rail, never the main platform sidebar. In-store starts at Delivery address (step 1 of 4); device selection is not repeated. Back from delivery returns to the catalogue with choices preserved. Save and exit returns to Overview; Continue resumes the appropriate product page or dedicated step. Online completion returns to Overview and introduces the new activity sections. In-store activation returns to its product context.
4. Product setup and incomplete field drafts are saved in `onboarding-demo:pine-one-getting-started.v1`. Overview resumes the most recently edited unfinished journey. Business and bank details are shared between products.
5. In-store: terminal/plan/quantity → delivery → business → bank → review → simulated payment → tracking. Use Next status to simulate courier updates. Delivery opens the four-item setup guide; completing it activates In-store. Order and guide remain available after activation.
6. Both online products use the Figma business/KYC flow: PAN fetch + linked-mobile OTP → GST selection/manual fetch → website/app verify or explicit skip → business documents + authenticity declaration → settlement account with confirmation/IFSC or cancelled-cheque upload → beneficial-owner declaration and optional owner collection → authorised signatory PAN/designation → political exposure → simulated DigiLocker OTP → simulated Video KYC → editable review → agreement acceptance → KYC-submitted screen → Overview.
7. A shared online verification profile persists alongside independent product progress. Starting the second online product reuses verified data but clears agreement consent and submission. PAN/phone/signatory edits invalidate dependent proof; any substantive edit clears agreement/submission. First payment-link creation and Checkout API keys are optional actions inside their activated product pages.
8. Activation introduces Payments and Settlement with product context. These pages show only live product sources and honest empty states, rather than the established merchant's seeded transactions. A second activation adds its source to the shared sections.
9. Refunds, Disputes and Reports appear only after Add more tools on Overview. Direct visits before availability show an explanation and return action.

Isolation: demo authentication, profile and progress use separate `onboarding-demo:` localStorage keys. Demo profile is fixed to new-merchant; reset/logout cannot alter main-app state. Main app ignores the new-merchant profile from earlier prototype tests. No additional port or app instance is used.

Implementation: `app/onboarding-demo/[[...path]]/page.tsx`, `lib/onboarding-environment.js`, `components/getting-started/navigation.tsx`, `lib/getting-started.ts`, `components/getting-started/`, `components/transactions/transactions-platform-shell.tsx`, `app/signup/{phone,verify-phone,set-password}/`.

Behavioral checks: `node --experimental-strip-types --test tests/getting-started.test.mjs tests/product-navigation.test.mjs tests/onboarding-isolation.test.mjs tests/online-onboarding.test.mjs`.

All authentication, orders, payments, verification and activation in this prototype are simulated; no real integrations were added. The online reference was read through the local Figma desktop MCP connection: file `gTal6M0e7vNU0gZz6lqJuE`, section `501:24107`. It supplies the online step sequence, fields and original content assets. Online setup now reuses the same full-page SetupFrame layout as In-store. See `docs/flows/online-payment-onboarding-parity.md` for the source map and reference ambiguities.

The earlier email/KYC flow below remains available as a separate prototype; its sequence does not describe the phone signup journey.

## 1. Login

Route: `/login`

Behavior:

- Top bar with PineLabs icon on left and outline CTA on right (`Create account`).
- Centered auth card with:
  - heading/subtext
  - email and password fields
  - show/hide password
  - primary CTA (`Log in`) aligned with current auth card standard.

## 2. Create Account (Signup)

Route: `/signup`

Top-level sequence:

1. Mobile number collection
2. Work email collection
3. Company name
4. Screening questionnaire
5. Legal name
6. Email + password
7. Product selection
8. OTP verification (6-slot OTP input)
9. Verified state -> continue to onboarding

Behavior highlights:

- OTP uses six separate rounded slots.
- Primary CTA text changes by step (`Next`, `Start Application`, `Verify`, `Continue`).
- Flow copy is branded as "Create account".
- Signup topbar right CTA is outline (`Log in`).

## 3. Post-Signup Onboarding Workspace

Route: `/onboarding/account`

Layout model:

- Left rail: progress state and KYC step grouping.
- Center: onboarding/KYC forms.
- Right: assistant chat panel for guided input.
- Panels are visually separated; center and right have dedicated surfaces.

KYC sequence (high-level):

1. Account owner
2. Business details
3. KYC verification
4. Bank settlement
5. Activation

Product-aware KYC logic:

- PAN requirement depends on selected products.
- GST requirement depends on selected products.
- Address requirement depends on selected products.

## 4. Demo Dashboard Fast-Track

From onboarding, users can continue with demo mode where background progress is shown and dashboard demo state is written to local storage/session.

## 5. Shared Auth Card Contract

`components/auth/auth-flow-card.tsx` is used to standardize:

- heading and subtext hierarchy
- field-group spacing
- group spacing
- action area positioning and consistency

This ensures login and signup cards remain synchronized when spacing/typography tokens are adjusted.
