/**
 * Layout experiments, each behind one switch. To drop one, set it to false
 * (or delete it and the files its comment lists).
 */

/**
 * Listing pages as "the answer, then the records": a full-width hero card with
 * the page's one number (and its period), then a single card holding search,
 * filters, applied-filter chips, the result count and the day-grouped rows.
 * Payments (one Window number; the list follows its period) and Settlements
 * (draft of the two-number model: Settled is a Window number, Still to settle
 * a Snapshot, and the list keeps its own longer date range).
 *
 * Files: components/listing-hero/*, components/payments/transactions-hero-view.tsx,
 * components/payments/settlements-hero-view.tsx, and the switches in
 * app/payments/index.tsx and app/settlements/index.tsx.
 */
export const LISTING_HERO_LAYOUT = true;
