# Progressive Merchant Onboarding Implementation Plan

> **For agentic workers:** Execute the steps below inline; request a focused plan and code review. Preserve the existing uncommitted web prototype and do not start the mobile app.

**Goal:** Make phone signup lead to a small dashboard that grows with the merchant's product setup.

**Architecture:** Extend the existing getting-started localStorage model and product gates. Keep established merchant screens intact; give new merchants scoped empty activity screens and explicitly introduce new navigation. This is a local prototype: signup, payment, delivery and activation are simulated.

**Tech Stack:** Next.js, React, TypeScript, Tailwind, existing Radix primitives, Node test runner.

**Visual thesis:** Quiet Pine One surfaces, clear type, restrained green accents and spacious product education using existing tokens.
**Content plan:** Welcome and resume; three product entry points; product education; focused setup; order tracking and installation; live status and navigation introduction.
**Interaction thesis:** Preserve step transitions with reduced-motion support; use clear selected and completed states; introduce newly available sections at activation.

## Tasks

- [x] Add behavioral tests (`tests/getting-started.test.mjs`) for progressive section visibility, saved drafts/defaults, first-link resumption and terminal delivery progression. Run with `node --experimental-strip-types --test tests/getting-started.test.mjs` and confirm missing behavior fails.
- [x] Extend `lib/getting-started.ts` with persisted drafts, link defaults, staged tools and an activation introduction. Preserve existing stored progress. Make subscriptions hydration-safe.
- [x] Wire `/signup` and login to phone signup; stabilize `components/onboarding/stagger-fields.tsx`; preserve account identity as demo-only. Files: `app/signup/page.tsx`, `app/login/page.tsx`, `components/onboarding/stagger-fields.tsx`.
- [x] Save form edits immediately and restore after refresh; persist defaults and created link; fix device customisation remounting. Files: `components/getting-started/product-setup.tsx`, `setup-frame.tsx`, `terminal-journey.tsx`.
- [x] Add a navigation introduction and optional tools; preserve access to order/setup guide after activation. Files: `components/getting-started/product-page.tsx`, `getting-started-home.tsx`, new `activation-intro.tsx`, `catalog.ts`.
- [x] Add scoped empty Payments/Settlement/optional-tool screens for new merchants, block premature direct routes and update sidebar visibility. Files: new `components/getting-started/activity-page.tsx`, `components/transactions/transactions-platform-shell.tsx`, hydration-safe subscription in `lib/business-profiles.ts`.
- [x] Verify behavioral tests, web TypeScript diagnostics against baseline and browser flows: signup/home; save/exit/reload; payment links/live; checkout/live; terminal purchase/delivery/install/live; new sections and established merchant regression. Review code, fix material findings, capture final screenshot. Keep web server running on port 3000.

## Constraints and evidence

- Figma connector denied access to `UfH7eN5dEVtRSDM1g9YQjW`, node `97:8353`; do not claim pixel fidelity. Reuse the current web design system.
- Existing work is uncommitted, including all getting-started components. Do not reset, stash, commit or move it.
- No production integrations or real payment/SMS actions are requested. Label demo payment and activation clearly.

## Verification result

Follow-up: product onboarding now runs on dedicated `/onboarding/products/[product]` routes outside the main platform shell. Product education and activated product pages retain normal navigation. Verified all three entries, refresh/resume, exit and completion return; 10 behavioral tests pass. The Figma connector still denies access, and the browser shows the file login gate; local inspiration notes were reviewed without claiming access to all visual references.

Eight behavioral tests pass. Browser walkthroughs pass for signup, saved drafts, payment links, checkout, terminal order/payment/tracking/installation, activation education, scoped activity, optional tools and established-merchant regression. Focused review findings were fixed and re-reviewed. Scoped diff whitespace checks pass. TypeScript has no new diagnostics compared with the pre-change baseline (1,395 existing diagnostics, including mobile sources). Mobile remains stopped. Test-created product progress was reset; the local web Overview is ready for a fresh test.
