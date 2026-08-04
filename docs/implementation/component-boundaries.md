# Component Boundaries and Ownership

Last updated: 2026-04-17

## 1. Layout and Shell

### `components/dashboard/v2-dashboard-layout.tsx`

Responsibilities:

- Auth gate for workspace pages.
- Reads and reacts to demo settings (max width only on this branch).
- Composes the V3 workspace shell: topbar, sidebar, page transition motion, support launcher, mobile nav, and FAB.

### `components/dashboard/workspace-shell.tsx`

Responsibilities:

- Main content orchestration for center + optional side contexts.
- Center width resolution using demo settings.
- Right panel overlay rendering (non-layout-shifting).

### `components/ui/panels.tsx` (`PageHeader`)

Responsibilities:

- Shared page header contract for main pages and internal pages.
- Back button support for internal pages.
- Right action area alignment consistency.

## 2. Navigation

### `components/dashboard/v2-sidebar.tsx`

Responsibilities:

- Renders the V3 sidebar and mobile sidebar.
- Supports parent/child nav patterns and active-state visuals.
- Handles coming-soon markers.

### `lib/navigation/navigation-model.ts`

Responsibilities:

- Owns V3 sidebar definitions.
- Owns V3 mobile bottom-nav definitions.
- Exposes typed navigation selectors:
  - `getSidebarSections`
  - `getBottomNavItems`

### `lib/demo-settings.ts`

Responsibilities:

- Stores workspace width preferences for the V3 branch.

### `components/dashboard/use-demo-settings.ts`

Responsibilities:

- Centralizes client-side subscription to demo settings changes.
- Exposes small hooks for:
  - full settings state
  - resolved max width
- Reduces repeated `window` event wiring inside layout components.

## 3. Table System

### `components/ui/data-table.tsx`

Responsibilities:

- Unified table header UX:
  - Left: status switches
  - Right: search, filters, sort, columns
- Column behavior:
  - pin/unpin
  - reorder (drag)
  - visibility toggle
- Footer behavior:
  - hidden when row count <= `MIN_PAGINATION_ROW_COUNT` (currently 10)
  - shown with previous/next + rows/page + page count when threshold exceeded

## 4. Summary and Analytics

### `components/dashboard/section-summary-strip.tsx`

Responsibilities:

- Reusable summary metric strip with card-like metric cells.
- Used across workflow sections to keep visual hierarchy consistent.

### `components/dashboard/overview-analytics-canvas.tsx`

Responsibilities:

- Widgetized analytics board.
- Supports:
  - drag reorder
  - width modes (`compact`, `wide`, `full`)
  - hide/show widget
  - persistent per-scope layout in localStorage
- Hosts date and compare filters and customization drawer.

## 5. Domain Modules

### Settlements (V3)

- `components/settlements/v3-settlements-content.tsx`
- Responsibilities:
  - V3 summary cards and settlement table
  - settlement mode toggles
  - on-demand/same-day charge confirmation sheet
  - batch detail route support and transaction side context

### Workflow Route Wrappers

- `components/transactions/transactions-route-content.tsx`
- `components/disputes/disputes-route-content.tsx`
- `components/refunds/refunds-route-content.tsx`
- `components/reports/reports-route-content.tsx`
- `components/settlements/settlements-route-content.tsx`

Responsibilities:

- Provide route-level ownership for workflow pages before they enter shared content modules.
- Act as the boundary where V3-specific behavior can be extracted incrementally.
- Keep app route files thin and stable while refactors happen behind them.

### Transactions, Refunds, Disputes, and Reports

- Main behavior is still orchestrated in `components/home/home-content.tsx` sections.
- Route entry ownership now exists in dedicated route wrappers for future extraction.
- Dedicated analytics pages exist in:
  - `components/transactions/transactions-analytics-content.tsx`
  - `components/refunds/refunds-analytics-content.tsx`

## 6. Auth and Onboarding

### `app/login/page.tsx`

- Login topbar + centered auth card.

### `app/signup/page.tsx`

- Multi-step create-account flow:
  - mobile
  - email
  - company
  - screening
  - legal
  - credentials
  - products
  - otp
  - verified

### `components/onboarding/account-onboarding-flow.tsx`

- Post-signup onboarding workspace:
  - left progress rail
  - center KYC forms
  - right assistant/chat panel
- Product-aware KYC requirement logic.

## 7. Product Administration Surfaces

### `components/products/manage-product-list-content.tsx`

Responsibilities:

- Shared product-list card framework for product administration pages.
- Supports:
  - multiple page-header actions
  - per-row action sets (single or dual CTA patterns)
  - optional row imagery (image or icon key mapping)
  - optional row metrics (for example configured device counts)
  - coming-soon tagging
- Keeps configured products sorted first.

## 8. Boundary Rules for Future Work

1. New workflow sections should prefer shared primitives first (`PageHeader`, `SectionSummaryStrip`, `DataTable`).
2. New product IA changes should be implemented at navigation definition level first, not ad hoc inside pages.
3. New upload/process operations should reuse common side-sheet flow patterns.
4. Keep V3 behavior encapsulated at routing/navigation boundaries whenever possible.
5. When workflow-specific behavior appears in more than one file, prefer extracting it into `lib/navigation/*` or a route wrapper before adding more conditionals.

## 9. Removed Legacy Boundaries

The following boundaries were removed from this branch because they no longer belong to the active V3 architecture:

- `components/dashboard/dashboard-layout.tsx`
- `components/dashboard/app-topbar.tsx`
- `components/dashboard/secondary-rail.tsx`
- `components/dashboard/sidebar.tsx`
- `app/products/[slug]/page.tsx`
- `components/products/product-detail-content.tsx`
- `components/products/product-category.tsx`

Their responsibilities are now either absorbed by the V3 shell (`V2DashboardLayout`, `WorkspaceShell`, `v2-sidebar`) or removed entirely because the related experience is no longer part of the reachable V3 surface.
