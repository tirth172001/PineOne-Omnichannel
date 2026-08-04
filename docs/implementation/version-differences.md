# Implementation Differences by Version

Last updated: 2026-04-17

## 1. Version Matrix

| Area | V1 | V2 | V3 | V3.1 |
|---|---|---|---|---|
| Navigation model | Legacy icon-rail | Product-first nested nav | Workflow-first + products | Workflow-first + products portfolio |
| Overview entry | `/` | `/` | `/` | `/` |
| Product admin section | Limited legacy routes | Product sections under side nav | `Products` section (business labels) | `Products` section (portfolio labels) |
| Help/support links | Basic | Support routes + floating help | Help and support section + floating help | Same as V3 |
| Cross-version route remap | N/A | N/A | V3 <-> V3.1 mapping enabled | V3 <-> V3.1 mapping enabled |

## 2. Navigation Definitions

- V2 nav source: `components/dashboard/v2-sidebar.tsx` (`navSectionsV2`).
- V3 nav source: `components/dashboard/v2-sidebar.tsx` (`navSectionsV3`).
- V3.1 nav source: `components/dashboard/v2-sidebar.tsx` (`navSectionsV31`).

## 3. Product Labeling and Structure

### Rebranding applied

- V3 uses business-facing naming in product administration:
  - `Checkout` -> `Online payment`
  - `POS terminal` -> `In-store payment`

### V3

- Top-level workflows:
  - Overview
  - Transactions
  - Settlement
  - Disputes
  - Refunds
  - Reports
- Products:
  - Online payment
  - In-store payment
  - Other products
  - Offer engine (coming soon)
  - GrowthX (coming soon)

### V3.1

- Products:
  - Online payment
  - In-store payment
  - Gift cards (coming soon)
  - Other products
  - Offer engine (coming soon)
  - GrowthX (coming soon)
- Includes product portfolio pages:
  - `/products/online-payments`
  - `/products/in-store-payments`
  - `/products/gift-cards-coming-soon`
  - `/products/other-products`
  - `/products/offer-engine-coming-soon`
  - `/products/growthx-coming-soon`
  - Other products is now dedicated to 3rd-party product discovery.

## 4. Shared Behaviors Across Versions

- Topbar and sidebar shell is managed by `V2DashboardLayout` when version is not `v1`.
- Center panel width is controlled by demo settings (`maxWidth`, `customMaxWidth`).
- Right contextual panel uses fixed overlay behavior in `WorkspaceShell`.
- Data table behavior (status pills, search, filter, sort, columns, pinning, drag) is shared through `DataTable`.

## 5. Operational Flows

### Transactions

- Summary + table structure present.
- Row detail behavior varies by context:
  - For many contexts, row click opens right context panel.
  - Dedicated transaction route supports additional deep actions like IMEI verification and analytics navigation.

### Refunds

- Summary + table structure.
- Bulk refund upload-processing flow mirrors IMEI pattern.
- Refund analytics route available at `/refunds/analytics`.

### Settlements

- V3 has dedicated implementation in `components/settlements/v3-settlements-content.tsx`.
- Other versions still route through `HomeContent` sections.

### Reports

- Reports page uses mode-switch table navigation (`Report` and `Schedule`) in the top-left table switcher.
- `Report` mode:
  - quick-generate cards
  - generated report table
- `Schedule` mode:
  - dedicated schedules table
  - row actions: edit, pause, delete
- Status filtering is handled via table filters (not top-left tabs).

## 6. Current Divergences to Track

1. Settlements has a dedicated V3 module, while other workflow pages still rely heavily on `HomeContent` section rendering.
2. V3 and V3.1 share many workflow pages, but product IA differs significantly.
3. Some labels and route-group semantics are version-specific by design; route mapping must stay in sync during future updates.
