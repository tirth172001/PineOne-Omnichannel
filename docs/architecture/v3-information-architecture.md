# V3 Information Architecture (Shareable)

Last updated: 2026-04-17
Audience: Product, Design, Engineering, GTM enablement

## 1) Purpose

This document explains the **current V3 platform information architecture** in a way that can be shared with internal teams.

V3 is designed as a **workflow-first platform**:
- Core operations (Transactions, Settlements, Disputes, Refunds, Reports) are primary.
- Product administration (Online payments, In-store payments, etc.) is grouped under **Products**.
- Learning and support are grouped under **Help and support**.

## 2) IA Principles

1. Keep merchant daily workflows at top level.
2. Keep product configuration separate from operational monitoring.
3. Keep support discoverable with minimal navigation depth.
4. Use consistent page structure: `PageHeader` -> summary (if needed) -> table/cards -> detail action panel/page.
5. Keep deep actions contextual (open from row/page action, not global menu).

## 3) Top-Level Navigation Model

```text
V3 Platform
├─ Overview
├─ Transactions
├─ Settlement
├─ Disputes
├─ Refunds
├─ Reports
├─ Products
│  ├─ Online payment
│  ├─ In-store payment
│  ├─ Other products
│  ├─ Offer engine (Soon)
│  └─ GrowthX (Soon)
└─ Help and support
   ├─ Knowledge hub
   └─ Support queries
```

## 4) Route Taxonomy (V3)

### 4.1 Workflow Routes

- `/` (Overview)
- `/transactions`
- `/settlements`
- `/disputes`
- `/refunds`
- `/reports`

Workflow detail/secondary routes:
- `/transactions/analytics`
- `/refunds/analytics`
- `/settlements/[batchId]`

### 4.2 Product Routes

Online payments:
- `/products/online-payments`
- `/online-payments`
- `/online-payments/configuration`
- `/payment-links`
- `/payment-links/all`

In-store payments:
- `/products/in-store-payments`
- `/offline-payments`
- `/offline-payments/manage-devices`
- `/offline-payments/manage-stores`
- `/offline-payments/order-devices`
- `/products/in-store-payments/upi-qr-sticker`

Other/expansion:
- `/products/other-products`
- `/products/third-party-offers`
- `/products/offer-engine-coming-soon`
- `/products/growthx-coming-soon`
- `/products/gift-cards-coming-soon`

### 4.3 Help & Support Routes

- `/support`
- `/support/knowledge-hub`
- `/support/faqs`
- `/support/training-videos`
- `/support/support-queries`
- `/support/ticket-history`
- `/support/knowledge-hub/[topic]`

### 4.4 Account / Profile Routes

- `/account/profile`
- `/account/business-details`
- `/account/users`
- `/account/users/roles`
- `/account/preferences`
- `/account/security`
- `/account/feedback`

## 5) Feature Hierarchy by Area

### 5.1 Overview

- Global payments health snapshot.
- Product/date filters.
- Widget grid with configurable layout (merchant-facing metrics first).

### 5.2 Transactions

- Summary strip: count, value, success rate, refunded amount.
- Table-first operations.
- Row -> dedicated details page.
- CTAs: View analytics, View IMEI details, Refund action flow.

### 5.3 Settlements

- On-demand eligibility banner.
- Settlement mode controls (same-day / on-demand).
- Batch table and batch detail drill-down.
- Transaction-level payout breakdown from batch detail.

### 5.4 Disputes

- Summary: total, under review, amount at risk.
- Table with dispute lifecycle statuses.
- Row -> action panel with single-surface radio-driven flow:
  - Accept
  - Defend
  - Partially defend

### 5.5 Refunds

- Summary: total refund count + amount.
- Table mirrors transaction mental model for operator consistency.
- Bulk refund processing via side panel flow.

### 5.6 Reports

- Predefined report cards + report table + schedule table.
- Create report, customize columns, create schedules (email/SFTP).
- Status-based asynchronous processing pattern.

### 5.7 Products

Online payment:
- Checkout
- Smart routing
- Payment links (manage + configure)

In-store payment:
- Device catalog (A891, Mini, Go, Duo, Voice POD, etc.)
- Manage devices / manage stores / order devices
- UPI QR Sticker (QR preview + store link + transaction lookup)

Other products:
- Third-party offers
- Coming soon products for roadmap visibility

### 5.8 Help and Support

- Knowledge hub as primary self-serve destination.
- Support queries for ticket lifecycle.
- Raise request as a guided chat-like flow (including suggested quick fixes).

## 6) Cross-Cutting UX Structure

Global elements across most authenticated pages:
- Top bar: centered search, language switch, mode switcher, notifications, profile.
- Floating help FAB (global quick support entry).
- Left sidebar navigation (desktop) + bottom navigation/sheets (mobile).

Reusable page composition:
1. `PageHeader`
2. Optional summary (`SectionSummaryStrip`)
3. Primary data surface (`DataTable` or widget grid)
4. Contextual detail via inner page or side panel

## 7) Mobile IA Behavior

- Sidebar turns into hamburger + sheet pattern.
- Heavy tables transform into mobile cards.
- Filters/sort/search actions open as bottom-sheet overlays.
- Summary cards can be horizontally scrollable with indicators.

## 8) Ownership (Code Pointers)

- Navigation source of truth:
  - `lib/navigation/navigation-model.ts`
- Main shell:
  - `components/dashboard/v2-dashboard-layout.tsx`
  - `components/dashboard/v2-sidebar.tsx`
  - `components/dashboard/v2-topbar.tsx`
- Shared content scaffolding:
  - `components/dashboard/workspace-shell.tsx`
  - `components/ui/panels.tsx`
  - `components/ui/data-table.tsx`

## 9) Change Management Rules

When adding new information architecture:
1. Add/modify navigation in `lib/navigation/navigation-model.ts`.
2. Add route pages under `app/*` with existing page pattern.
3. Reuse shared components before creating new primitives.
4. Update docs:
   - `docs/architecture/v3-information-architecture.md`
   - `docs/decisions/decision-log.md`
   - `docs/implementation/periodic-progress-log.md`

