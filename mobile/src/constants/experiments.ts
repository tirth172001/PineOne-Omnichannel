/**
 * Layout experiments, each behind one switch. To drop one, set it to false
 * (or delete it and the files its comment lists).
 */

/**
 * Listing pages as "the answer, then the records". Every listing shares one
 * format: a single card holding search, Filters, the list's dates, one-tap
 * suggestions, applied-filter chips and the count, then the rows grouped by
 * day (rows without dates — roles, report schedules — stay ungrouped).
 *
 * Pages whose number matters also get a full-width hero card with that
 * number (and its period) above the records: Payments, Settlements, Refunds,
 * Disputes, Payment links and In-store devices. Stores, Users and roles,
 * Reports history and schedules, Support tickets and the device Audit log
 * use the records card on its own.
 *
 * Files: components/listing-hero/*, the *-hero-view.tsx files beside each
 * page's view (payments: transactions, settlements, refunds; disputes) with
 * the switches in app/payments/index.tsx, app/settlements/index.tsx,
 * app/refunds.tsx and app/disputes/index.tsx; the other pages branch on it
 * inside their component (products/payment-links.tsx,
 * products/terminal-devices.tsx, account/manage-stores.tsx,
 * account/users-roles.tsx, reports/report-listing.tsx,
 * support/support-tickets.tsx).
 */
export const LISTING_HERO_LAYOUT = true;
