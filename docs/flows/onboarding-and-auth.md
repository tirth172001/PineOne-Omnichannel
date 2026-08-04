# Auth and Onboarding Flow

Last updated: 2026-04-16

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
