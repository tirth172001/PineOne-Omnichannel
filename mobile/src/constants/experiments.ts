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

/**
 * Sample for review: listings as "information, then the listing", after the
 * Starling references in Figma (App references): the number centred on a
 * coloured hero, then the records on a white sheet with Search & filter
 * behind one button, by day. Takes precedence over LISTING_HERO_LAYOUT on
 * Payments and Settlements only.
 *
 * Files: components/listing-sample/*, the switches in app/payments/index.tsx
 * and app/settlements/index.tsx.
 */
export const LISTING_SAMPLE_LAYOUT = false;

/**
 * The app pages from Figma ("PineOne - Omni-channel", App: Home & Payments
 * 7132:120094, Settlement 7161:77755, Support 7228:156164): grey page, white
 * cards 8dp from the screen's edges and 8dp apart. A listing opens with its
 * dates as one full-width pill, then a summary card per number (icon and
 * title, the amount, one line, an optional footer row), then the records card:
 * search with Filters, grey day bands, 76dp rows. Takes precedence over the
 * two listing layouts above wherever they meet.
 *
 * Files: components/listing-hero/answer-hero.tsx (CardAnswerHero),
 * listing-hero/listing-card.tsx, shared/day-groups.tsx, shared/listing.tsx
 * (rows), tab-screen.tsx (page spacing).
 */
export const APP_PAGE_LAYOUT = true;


/**
 * Payment links in the app. On (Nov 23, 2026). Off would hide the Payment links row in the profile, the
 * Overview quick action and the card on the Payments sample; the page
 * (app/payment-links.tsx, components/products/payment-links.tsx) and its data
 * stay either way, so this switch alone shows or hides payment links.
 */
export const SHOW_PAYMENT_LINKS = true;
