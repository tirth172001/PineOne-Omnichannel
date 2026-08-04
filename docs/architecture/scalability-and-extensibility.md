# Scalability and Extensibility

Last updated: 2026-04-17

## 1. Current Scalability Model

This branch now scales as a V3-only app through composable UI primitives and route/domain isolation.

### Key mechanisms already in place

- V3-only navigation definitions in `lib/navigation/navigation-model.ts`.
- Shared layout shell (`V2DashboardLayout`, `WorkspaceShell`) for consistent page framing.
- Shared data grid (`DataTable`) with reusable filtering, sorting, pinning, drag-reorder, and pagination behavior.
- Shared summary module (`SectionSummaryStrip`) used across transactional sections.
- Shared analytics canvas (`OverviewAnalyticsCanvas`) with local persistence of widget layout.

On this branch, runtime version switching has been removed and the shell is treated as V3-native.

## 1.1 V3-only branch posture

- This branch is intentionally optimized for V3 speed of change.
- Historical version switching logic has been removed from runtime code.
- Legacy dashboard shells and dynamic product-detail surfaces that were no longer reachable from V3 have been deleted.
- If older version behavior needs to be inspected, it should be done by switching branches rather than reintroducing cross-version indirection here.

## 2. Scalability by Concern

### Navigation Scalability

Current state:

- V3 navigation definitions are centralized in `lib/navigation/navigation-model.ts`.
- Rendering remains in `components/dashboard/v2-sidebar.tsx` and `components/dashboard/bottom-nav.tsx`.
- This gives navigation a cleaner ownership boundary without changing UI behavior.

Recommended next step:

- Split `navigation-model.ts` into:
  - `sidebar.ts`
  - `bottom-nav.ts`
- Keep selectors stable so consuming components do not need to change.

### Route Scalability

Current state:

- Workflow routes are entering through dedicated route-content wrappers instead of importing shared content directly.

Recommended next step:

- Continue extracting domain logic out of `components/home/home-content.tsx` into workflow-owned modules.

### Table Scalability

Current state:

- `DataTable` supports a broad feature set already.
- `MIN_PAGINATION_ROW_COUNT` is centralized (currently 10) and drives pagination visibility.

Recommended next step:

- Externalize table presets by domain:
  - Transactions preset
  - Settlements preset
  - Refunds preset
- Add per-domain filter schemas to reduce page-level duplication.

### Analytics Scalability

Current state:

- `OverviewAnalyticsCanvas` supports widget order, width, hide/show, and persisted layout by `scopeId`.

Recommended next step:

- Introduce a widget registry:
  - `id`
  - data provider
  - chart type and config
  - default width
- Allow product-level and workflow-level widget composition from one registry.

### Flow Scalability (Auth + KYC + Operational Side Panels)

Current state:

- Signup and onboarding are step-driven state machines in component state.
- Operational side sheets (IMEI, bulk refund, settlement mode confirmation) are embedded in page modules.

Recommended next step:

- Extract reusable flow primitives:
  - `ActionSheetFlow`
  - `UploadAndProcessFlow`
  - `StepFlowLayout`
- Model step definitions as data to reduce conditional rendering complexity.

### Branch Isolation

Current state:

- This branch is now V3-only at runtime.
- Isolation work has started by extracting:
  - V3 nav ownership into `lib/navigation/navigation-model.ts`
  - demo-settings subscriptions into `components/dashboard/use-demo-settings.ts`
  - workflow route ownership into dedicated route-content wrappers

Recommended next step:

- Continue moving workflow content out of mixed shared files.
- Create a route ownership map so shared primitives remain shared and workflow behavior stays localized.

## 3. Performance and Operational Notes

- Right panel is implemented as fixed overlay in `WorkspaceShell`, which prevents center layout shifts.
- Center width is controlled from demo settings and broadcast via `DEMO_SETTINGS_CHANGED_EVENT`.
- Table features are client-side; if row volumes increase significantly, server-driven pagination and filtering should be introduced.

## 4. Proposed Target Architecture

### Module boundaries

- `lib/navigation/*` for V3 nav definitions.
- `lib/table-presets/*` for column and filter presets.
- `lib/analytics-widgets/*` for widget registry and defaults.
- `components/flows/*` for operational upload/process/confirmation flows.

### Why this scales

- Product additions become mostly config changes.
- Workflow behavior remains isolated.
- UI consistency improves because behavior comes from shared typed modules.
