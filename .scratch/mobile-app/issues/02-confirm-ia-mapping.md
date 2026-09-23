Type: grilling
Status: resolved

## Question

The web app (`pineone-omni/phase_2`) has ~20 top-level modules: checkout, payment-links, online-payments, offline-payments, cross-border, transactions, settlements, refunds, disputes, reports, support, account, account-settings, settings, products, online-products, onboarding, signup, partners, search, component-docs, overview-scenarios.

The mobile app's reference IA has 5 bottom tabs: Overview, Payments, Reports, Support, More.

Resolve, module by module:

1. Which tab does each module live under? (e.g. transactions/settlements/refunds likely nest under Payments, per the sub-tab pattern seen in the Figma reference frame)
2. Are any modules excluded from mobile v1? In particular: is `component-docs` in scope (looks like internal dev documentation, not merchant-facing product) — is `overview-scenarios` (looks like a scenario-picker/dev tool) in scope — do `onboarding`/`signup`/`login` belong inside the tabbed app shell, or are they a separate pre-login flow that sits outside the 5-tab navigation entirely?
3. For channel-scoped modules (online-payments, offline-payments, cross-border, payment-links) that each currently have their own transactions/settlements/refunds/reports/disputes sub-routes on web — does mobile consolidate these into one unified Payments/Reports tab (as the Figma reference suggests), or keep them channel-separated?

The answer becomes the per-module ticket breakdown for the rest of this map — resolving this graduates the "full per-module ticket breakdown" fog into concrete tickets, one (or one group) per module.

## Answer

1. **Excluded from mobile v1**: `component-docs`, `overview-scenarios` — both internal dev tooling, no merchant-facing content.
2. **`onboarding`/`signup`/`login`**: separate pre-login flow, outside the 5-tab shell entirely — mirrors the web app's own structure and standard mobile-app convention.
3. **Channel consolidation**: consolidate. `online-payments`, `offline-payments`, `cross-border`, `payment-links`, `checkout` each keep their own product-level activation/config screens, but their transaction-shaped data (transactions/settlements/refunds) rolls into one filterable view rather than 5 separate tab trees.

**Full tab mapping:**

| Tab | Web modules |
|---|---|
| Overview | `app/page.tsx` (dashboard home — not `overview-scenarios`); `search` surfaces as a header search bar, not its own tab |
| Payments | `transactions`, `settlements`, `refunds` only — consolidated across `online-payments`/`offline-payments`/`cross-border`/`payment-links`/`checkout` via a channel filter. **No disputes here.** |
| Reports | `reports`, consolidated the same way across channels |
| Support | `support` (chat, faqs, tickets, ticket-history, training-videos) |
| More | Product activation/config (`products`, `online-products`, and each channel's own setup screens — checkout activation, offline-payments device management, online-products QR codes/smart-routing), `partners`, `account`, `account-settings`, `settings`, and **`disputes`** |

This unblocks concrete per-tab build tickets — see 04–08.
