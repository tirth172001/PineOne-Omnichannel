# Information Architecture

Last updated: 2026-04-17

## 1. IA Goals

The IA is structured to support three usage modes:

1. Product-first navigation (legacy and V2 style).
2. Workflow-first navigation (V3).
3. Product-portfolio navigation (V3.1).

The same page components are reused across versions, while the left navigation model changes based on demo settings.

## 2. Global Structure

### Auth Layer

- `/login`
- `/signup`
- `/onboarding/account`
- `/onboarding/lending`
- `/onboarding/pos`

### Workspace Layer

- Global shell:
  - Top bar (`V2Topbar`)
  - Left sidebar (`V2Sidebar` with version-specific section sets)
  - Center workspace (`WorkspaceShell` center pane)
  - Optional right overlay context panel (`WorkspaceShell` right overlay)

### Shared UI Primitives

- Header: `PageHeader`
- Summary strip: `SectionSummaryStrip`
- Tables: `DataTable`
- Analytics board: `OverviewAnalyticsCanvas`

## 3. Route Taxonomy

### Core Cross-Product Routes

- `/` overview
- `/transactions`
- `/settlements`
- `/disputes`
- `/refunds`
- `/reports`

### Product Routes

- Checkout / online payments:
  - `/online-payments`
  - `/online-payments/transactions`
  - `/online-payments/settlements`
  - `/online-payments/disputes`
  - `/online-payments/refunds`
  - `/online-payments/reports`
  - `/online-payments/configuration`
- POS terminal / offline payments:
  - `/offline-payments`
  - `/offline-payments/transactions`
  - `/offline-payments/settlements`
  - `/offline-payments/disputes`
  - `/offline-payments/refunds`
  - `/offline-payments/reports`
  - `/offline-payments/manage-devices`
  - `/offline-payments/manage-stores`
  - `/offline-payments/order-devices`
- Payment links:
  - `/payment-links`
  - `/payment-links/all`
  - `/payment-links/transactions`
  - `/payment-links/settlements`
  - `/payment-links/disputes`
  - `/payment-links/refunds`
  - `/payment-links/reports`

### Product Portfolio Routes (V3.1)

- `/products/online-payments`
- `/products/in-store-payments`
- `/products/gift-cards-coming-soon`
- `/products/other-products`
- `/products/third-party-offers`
- `/products/offer-engine-coming-soon`
- `/products/growthx-coming-soon`

### Support and Settings

- `/support`
- `/support/faqs`
- `/support/training-videos`
- `/support/knowledge-hub`
- `/support/ticket-history`
- `/settings`

## 4. Navigation Models

### V1

- Legacy icon-rail model.
- Routing constrained to `V1_ROUTES` fallback behavior.

### V2

- Product-first hierarchy with nested subnav under each product.
- Example: Checkout -> Overview, Transactions, Settlements, Disputes, Refunds, Reports, Configuration.

### V3

- Workflow-first hierarchy at top level:
  - Overview, Transactions, Settlement, Disputes, Refunds, Reports.
- Separate `Products` section for product administration:
  - Online payment, In-store payment, Other products, Offer engine (soon), GrowthX (soon).
- Separate "Help and support" section.

### V3.1

- Product portfolio framing:
  - Products section: Online payment, In-store payment, Gift cards (coming soon), Other products, Offer engine (soon), GrowthX (soon).
- Workflow top-level still present.
- Manage-products routes are remapped to product routes on version switch.

## 5. Cross-Context Navigation Mapping

Version-switch path preservation is handled in `resolvePathForVersion`.

Implemented mappings:

- V3 -> V3.1:
  - `/manage-products/checkout` -> `/products/online-payments`
  - `/manage-products/pos-terminal` -> `/products/in-store-payments`
  - `/manage-products/payment-links` -> `/products/online-payments`
  - `/products/third-party-offers` -> `/products/other-products`
- V3.1 -> V3:
  - `/products/online-payments` -> `/products/online-payments`
  - `/products/in-store-payments` -> `/products/in-store-payments`
  - `/products/gift-cards-coming-soon` -> `/products/other-products`
  - `/products/other-products` -> `/products/other-products`
  - `/products/offer-engine-coming-soon` -> `/products/offer-engine-coming-soon`
  - `/products/growthx-coming-soon` -> `/products/growthx-coming-soon`

## 6. IA Composition Rules

1. Any new product should be represented in:
   - V2 product section
   - V3 products section
   - V3.1 products section
2. Any new workflow module (for example Reconciliation) should be represented in:
   - V3 top-level workflow cluster
   - V3.1 top-level workflow cluster
3. Support destinations should be top-level links in support/help section, not nested inside side drawers.
4. Coming soon offerings should have explicit empty-state pages (not dead-end links).
