# V3 Settlements Flow

Last updated: 2026-04-16

Source: `components/settlements/v3-settlements-content.tsx`

## 1. Page Structure

List page (`/settlements`) includes:

1. Page header with settlement mode controls.
2. On-demand eligibility banner (positioned above summary).
3. Summary strip cards.
4. Settlement table with filtering and row navigation.

Batch detail page (`/settlements/[batchId]`) includes:

1. Internal page header with back action.
2. Batch-level summary cards.
3. Transaction-level table.
4. Right context panel on row click with transaction detail fields.

## 2. Summary Cards

Current list-page summary metrics:

- Today's payout (with amount breakdown tooltip)
- No. of transactions settled
- Settlement batches completed

## 3. On-Demand Eligibility Banner

Behavior:

- Banner appears above summary cards.
- Shows eligibility amount.
- Includes CTA (`Enable on-demand`) that opens right-side charge confirmation panel.
- Also communicates that paid modes can be enabled from header switches.

## 4. Settlement Mode Controls (Header)

Controls:

- On-demand toggle button (icon + label)
- Same day toggle button (icon + label)
- T+1 shown as default indicator

Rules:

- Enabling On-demand or Same day opens a confirmation side panel.
- Confirmation panel shows charge breakdown and net payout.
- T+1 is default and does not trigger extra-charge flow.

## 5. Settlement Type Display in Table

Table settlement-type column uses icon-only rendering:

- On-demand icon
- Same-day icon
- T+1 icon

Behavior:

- Labels are hidden in-cell.
- Hover tooltip reveals full settlement-type label.
- Icons are consistent with header control iconography.

## 6. Table Filters and Columns

Status modes in table header:

- Processing
- Settled

Additional filters present in table:

- Settlement date (Today, Previous day)
- Method group (UPI-led, Card-led, Mixed)
- Bank account
- Settlement type (On-demand, Same day, T+1)

Representative columns:

- UTR
- Bank reference
- Settlement date
- Settlement amount (with info breakdown)
- Payment methods
- Method group
- Transaction amount
- Bank account
- Initiation date
- No. of transactions
- Status
- ETA (for processing rows)
- Settlement type icon

## 7. Batch Detail Drilldown

Interaction:

- Clicking a settlement batch row navigates to `/settlements/[batchId]`.
- Detail page table shows transaction-level payout and deduction breakdown.
- Clicking transaction row opens right context panel.
