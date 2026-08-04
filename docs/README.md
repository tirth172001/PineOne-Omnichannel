# Pine One User Journey Documentation

Last updated: 2026-04-17

This folder documents product and UX decisions captured during iterative demo development.

## Documentation Map

- `docs/architecture/information-architecture.md`
  - IA model, route taxonomy, and page hierarchy across dashboard and auth/onboarding.
- `docs/architecture/v3-information-architecture.md`
  - Shareable V3-only IA reference for stakeholder walkthroughs (navigation, routes, and page hierarchy).
- `docs/architecture/scalability-and-extensibility.md`
  - Current extensibility model and recommended scaling approach for navigation, data, and UI modules.
- `docs/implementation/version-differences.md`
  - Implementation matrix for V1, V2, V3, and V3.1 navigation and behavior differences.
- `docs/implementation/component-boundaries.md`
  - Core component ownership and boundaries for layout, table, analytics, and flows.
- `docs/flows/onboarding-and-auth.md`
  - Login, create-account, OTP, and account onboarding/KYC flow behavior.
- `docs/flows/settlements-v3.md`
  - V3 settlement UX behavior and data model (summary, toggles, batches, detail page).
- `docs/decisions/decision-log.md`
  - Consolidated decision log with rationale and implementation impact.
- `docs/implementation/periodic-progress-log.md`
  - Time-ordered implementation updates captured during active iterations.

## Source of Truth

- Navigation versioning and route mapping:
  - `lib/demo-settings.ts`
  - `components/dashboard/v2-sidebar.tsx`
  - `components/dashboard/demo-settings-dialog.tsx`
- Primary shell and layout behavior:
  - `components/dashboard/v2-dashboard-layout.tsx`
  - `components/dashboard/workspace-shell.tsx`
  - `components/ui/panels.tsx`
- Shared table behavior:
  - `components/ui/data-table.tsx`
- Overview and analytics widgets:
  - `components/dashboard/overview-analytics-canvas.tsx`
  - `components/home/home-content.tsx`
- V3 settlements implementation:
  - `components/settlements/v3-settlements-content.tsx`

## Working Rules

- New UX decisions should be added to `docs/decisions/decision-log.md` with date, context, and impact.
- Ongoing implementation progress should be captured in `docs/implementation/periodic-progress-log.md` at meaningful checkpoints.
- If a decision changes IA or version behavior, also update:
  - `information-architecture.md`
  - `version-differences.md`
- If a decision changes shared primitives, update `component-boundaries.md`.
