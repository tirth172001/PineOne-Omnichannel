# Periodic Progress Log

Last updated: 2026-04-17

## Purpose

This log captures implementation checkpoints during active development.
Use this for execution traceability (what changed, why, and where), while `decision-log.md` stores stable ADR-style decisions.

## Entry Template

```md
## YYYY-MM-DD HH:mm (IST)
- Scope:
- Changes:
  - ...
- Touchpoints:
  - `path/to/file.tsx`
- Notes / Follow-ups:
  - ...
```

---

## 2026-04-16 13:10 (IST)
- Scope: Disputes workflow expansion (V3 cross-product disputes view).
- Changes:
  - Upgraded disputes summary to operational metrics (total disputes, under review, amount under review).
  - Reworked disputes table schema (dispute ID, payment ID, amount, due date, status, recovery status, action).
  - Added pending-action SLA context and row-level timeline rendering.
  - Added action side sheet with three actions: partially defend, defend, accept.
  - Added workflow validation for amount/documents/comments before submission.
- Touchpoints:
  - `components/home/home-content.tsx`
  - `docs/decisions/decision-log.md`
- Notes / Follow-ups:
  - Product-specific disputes pages can be aligned to the same model in a follow-up.

## 2026-04-16 13:30 (IST)
- Scope: Documentation systemization.
- Changes:
  - Added periodic progress log as a first-class documentation artifact.
  - Linked periodic log in docs index.
  - Added explicit documentation-cadence decision in decision log.
- Touchpoints:
  - `docs/implementation/periodic-progress-log.md`
  - `docs/README.md`
  - `docs/decisions/decision-log.md`
- Notes / Follow-ups:
  - Continue appending entries at major checkpoints (feature milestone, IA change, cross-version behavior change, or UX flow refactor).

## 2026-04-16 14:05 (IST)
- Scope: Disputes action UX simplification.
- Changes:
  - Removed secondary dispute action side sheet to avoid stacked side-panel interaction.
  - Moved dispute action flow into the existing dispute detail right panel.
  - Added radio-based action selector (`Partially defend`, `Defend`, `Accept`) in-panel.
  - Added conditional in-panel sections that switch by selected radio option (amount, documents, comments, confirm step).
- Touchpoints:
  - `components/home/home-content.tsx`
- Notes / Follow-ups:
  - Keep the same in-panel pattern when porting disputes workflow to product-specific pages.

## 2026-04-16 14:25 (IST)
- Scope: Disputes side panel stability fix.
- Changes:
  - Fixed runtime break in disputes panel caused by using `canSubmitDisputeAction` before declaration (temporal dead-zone issue).
  - Moved dispute action validation derivations earlier in component state/derived section, before right-panel render usage.
  - Removed duplicate late declarations to keep single source of truth for disputes action gating.
- Touchpoints:
  - `components/home/home-content.tsx`
- Notes / Follow-ups:
  - Keep type-check validation in CI for this module to catch similar ordering regressions early.

## 2026-04-16 15:05 (IST)
- Scope: V3 reports experience redesign.
- Changes:
  - Replaced reports summary strip with four quick-generate report cards: payment, refunds, settlements, payout.
  - Updated reports page header actions to `Schedule` and `Customized report`.
  - Rebuilt reports table schema to: report name, created on, date range, status, action/download.
  - Added report generation side panel with report type, format (Excel/CSV), optional name, date range, field mode (all/custom), field chooser, and selected-fields summary.
  - Added report customization side panel with two-step flow:
    - Step 1: choose report type and fields
    - Step 2: sequence selected columns and edit display labels (drag/drop reorder)
  - Added schedule side panel for recurring report setup.
  - Added simulated report processing lifecycle and status transitions for newly generated entries.
- Touchpoints:
  - `components/home/home-content.tsx`
- Notes / Follow-ups:
  - If needed, same report workflow pattern can be propagated to product-specific report routes.

## 2026-04-16 15:42 (IST)
- Scope: 3rd-party product link reliability + reports table filter model.
- Changes:
  - Implemented dynamic partner-offer route (`/partners/[slug]`) so all 3rd-party offer cards now navigate to working detail pages.
  - Added partner-offer detail surface with category badge, benefits list, and back-navigation to offers.
  - Updated reports table interaction model:
    - Left switcher now uses `Report` and `Schedule` options.
    - `Status` is no longer a left switch; it now appears in the Filters dropdown.
  - Added explicit `entryType` (`report | schedule`) on report rows and aligned generation/schedule flows to populate it.
- Touchpoints:
  - `app/partners/[slug]/page.tsx`
  - `components/home/home-content.tsx`
- Notes / Follow-ups:
  - Consider replicating the same report switcher model on product-specific reports tables if those routes are reintroduced in V3 flows.

## 2026-04-16 16:05 (IST)
- Scope: Floating demo controls launcher for live scenario switching.
- Changes:
  - Added a new hoverable FAB (`FloatingDemoFab`) with drag-and-drop repositioning and persisted screen position.
  - Implemented a floating menu with:
    - quick case navigation (overview, transactions, settlements, disputes, refunds, reports, products, support)
    - navigation version switching (V1/V2/V3/V3.1)
    - platform width presets + custom width input
    - theme controls and FAB reset action
  - Wired the new FAB into the shared V2/V3 dashboard layout so it is available across platform pages.
- Touchpoints:
  - `components/dashboard/floating-demo-fab.tsx`
  - `components/dashboard/v2-dashboard-layout.tsx`
- Notes / Follow-ups:
  - If needed, we can add page-specific component toggles per route in the same menu structure.

## 2026-04-16 16:18 (IST)
- Scope: FAB hover refinement (Agentation-style interaction polish).
- Changes:
  - Refined demo FAB hover/active/focus states with cleaner lift, stronger shadow layering, and subtle ring reveal.
  - Added icon micro-interaction on hover for clearer affordance while preserving icon-only round appearance.
  - Kept drag behavior and floating-menu behavior unchanged.
- Touchpoints:
  - `components/dashboard/floating-demo-fab.tsx`
- Notes / Follow-ups:
  - If needed, hover intensity can be tuned further after visual comparison with Agentation baseline.

## 2026-04-16 16:24 (IST)
- Scope: Floating demo FAB availability across all nav versions.
- Changes:
  - Mounted `FloatingDemoFab` in `DashboardLayout` so V1 now has the same floating controls as V2/V3/V3.1.
  - Kept existing mount in `V2DashboardLayout` for non-V1 versions.
- Touchpoints:
  - `components/dashboard/dashboard-layout.tsx`
- Notes / Follow-ups:
  - If required, we can expose FAB on auth routes too; currently it is platform-layout scoped.

## 2026-04-16 17:05 (IST)
- Scope: V3 reports + schedules split flow and navigation ordering.
- Changes:
  - Reordered workflow navigation so `Reports` is last in the first section for both V3 and V3.1 sidebars.
  - Kept reports table left switcher as a strict mode selector (`Report`, `Schedule`) without `All`.
  - Implemented distinct schedule-table mode with dedicated schema:
    - schedule name/report
    - frequency
    - format
    - status
    - created on
    - created by
    - actions (`Edit`, `Pause`, `Delete`)
  - Refactored reports header CTA to `Create a schedule` and wired it to an expanded side panel flow.
  - Upgraded schedule side panel fields to include:
    - report type
    - file format (Excel/CSV)
    - recipient destination (Email, SFTP)
    - frequency
    - recipient email
    - SFTP host/IP, port, user ID, path
    - SFTP authentication mode (`password` or `.ppk` upload)
  - Added create/edit schedule persistence against `scheduledRows` with toast feedback and view auto-switch to `Schedule`.
- Touchpoints:
  - `components/dashboard/v2-sidebar.tsx`
  - `components/home/home-content.tsx`
  - `components/ui/data-table.tsx` (leveraged recently added status view-only mode)
- Notes / Follow-ups:
  - If required, we can add inline validation messaging for malformed email/port values (currently save gating is enforced by disabled CTA).

## 2026-04-16 17:24 (IST)
- Scope: Reports mode UX continuity + schedule recipient scalability.
- Changes:
  - Kept quick report cards visible regardless of report table mode (`Report` or `Schedule`).
  - Added tertiary per-card CTA (`Schedule`) alongside `Generate`.
  - Enabled multi-recipient email entry in create schedule using delimiters (comma/semicolon/newline).
  - Added recipient token preview for entered schedule emails.
  - Simplified generate-report side panel visual density by removing excess boxed sections and using lighter section dividers.
- Touchpoints:
  - `components/home/home-content.tsx`
- Notes / Follow-ups:
  - If needed, we can add chip-based editable recipient inputs in a follow-up instead of delimiter parsing.

## 2026-04-16 17:42 (IST)
- Scope: Reports page polish (header + schedule UX + row interaction).
- Changes:
  - Removed Reports page header right CTA to keep header clean and action flow card-driven.
  - Reworked schedule side panel into a cleaner divider-based layout.
  - Replaced button toggles with accessible radio-box groups for:
    - report type
    - file format
    - frequency
    - SFTP authentication mode
  - Kept recipients multi-select and email multi-entry support while improving field semantics/labels.
  - Improved table row interactivity in shared `DataTable` with keyboard support (`Enter`/`Space`), focus ring, and clearer hover state to ensure detail side-panel discoverability.
- Touchpoints:
  - `components/home/home-content.tsx`
  - `components/ui/data-table.tsx`
- Notes / Follow-ups:
  - If needed, we can add dedicated `Open details` affordance in the first column for even stronger discoverability.

## 2026-04-16 17:56 (IST)
- Scope: Schedule email recipient interaction (chip-based UX).
- Changes:
  - Replaced free-form email textarea with add-and-chip interaction:
    - type email in input
    - press `Enter`, `,`, `;` or click `Add`
    - recipient appears as badge chip below input
    - quick remove via inline `X` on each chip
  - Updated schedule validation and save logic to use chip list as source of truth.
  - Updated edit/reset flows so existing schedule recipients are loaded as chips.
- Touchpoints:
  - `components/home/home-content.tsx`

## 2026-04-16 18:18 (IST)
- Scope: Platform-wide mobile responsive conversion baseline (navigation, drawers, data density).
- Changes:
  - Implemented mobile drawer behavior at shared `Sheet` primitive level:
    - side drawers (`left/right`) now resolve to bottom-sheet on mobile.
    - bottom-sheet gets mobile-friendly max-height and rounded top corners.
  - Introduced a mobile navigation system in V2/V3 layouts:
    - top-bar hamburger opens navigation in a bottom-sheet.
    - desktop sidebar remains unchanged and hidden on mobile.
    - added persistent mobile bottom navigation for high-frequency routes plus menu access.
  - Updated `V2Sidebar` to support reusable mobile rendering and auto-close on navigation.
  - Updated `V2Topbar` with mobile-aware layout:
    - hamburger entry point
    - compact search treatment
    - preserved right-side utility actions.
  - Added mobile card rendering in shared `DataTable`:
    - rows render as stacked cards on mobile.
    - desktop keeps full table behavior.
    - row click/key accessibility behavior preserved in both modes.
  - Updated `WorkspaceShell` responsive panel behavior:
    - left context hidden on mobile.
    - right context presents as bottom floating sheet on mobile.
- Touchpoints:
  - `components/ui/sheet.tsx`
  - `components/dashboard/v2-dashboard-layout.tsx`
  - `components/dashboard/v2-topbar.tsx`
  - `components/dashboard/v2-sidebar.tsx`
  - `components/dashboard/bottom-nav.tsx`
  - `components/dashboard/workspace-shell.tsx`
  - `components/ui/data-table.tsx`
- Notes / Follow-ups:
  - Next pass: compact mobile table filter affordances into a single “Controls” entry for denser screens.
  - Next pass: tune per-page bottom safe-area spacing for FAB + bottom nav coexistence.

## 2026-04-16 18:36 (IST)
- Scope: Mobile table-card UX strategy refinement.
- Changes:
  - Refined shared mobile card pattern in `DataTable` with stronger hierarchy:
    - heading
    - subheading
    - status badges
  - reduced label/value rows (capped for less cognitive load)
  - explicit actions (`View`, `View details`)

## 2026-04-16 18:44 (IST)
- Scope: Mobile card alignment adjustment.
- Changes:
  - Updated shared mobile table card alignment to keep primary content left-aligned.
  - Kept only label/value row values right-aligned for clearer scan rhythm.
  - Moved badge lane alignment to left to match heading/subheading orientation.
- Touchpoints:
  - `components/ui/data-table.tsx`

## 2026-04-16 18:56 (IST)
- Scope: Mobile page-level spacing consistency (header + card alignment).
- Changes:
  - Removed extra mobile horizontal gutter from shared `WorkspaceShell` wrapper to avoid double-inset against page headers.
  - Normalized key `centerMain` wrappers from `p-5` to `p-4` in dashboard content modules so page header and primary cards align on a single mobile gutter rhythm.
- Touchpoints:
  - `components/dashboard/workspace-shell.tsx`
  - `components/use-cases/use-cases-content.tsx`
  - `components/pos-device/pos-device-content.tsx`
  - `components/products/products-content.tsx`
  - `components/products/product-detail-content.tsx`
  - `components/card-payments/card-payments-content.tsx`
  - `components/international-payments/international-payments-content.tsx`
  - `components/payments/payments-content.tsx`

## 2026-04-16 19:03 (IST)
- Scope: Mobile page-header overflow handling for actions.
- Changes:
  - Updated shared `PageHeader` layout to wrap gracefully on mobile:
    - header container now supports wrapping
    - action area moves to a full-width next row on small screens
    - action buttons can wrap across multiple lines when needed
  - Updated title behavior to allow word wrapping on mobile while preserving truncation behavior on larger screens.
- Touchpoints:
  - `components/ui/panels.tsx`

## 2026-04-16 19:42 (IST)
- Scope: Global search navigation model update + inline table search consistency.
- Changes:
  - Replaced topbar inline common-search input with a compact search icon trigger.
  - Added dedicated `/search` page for global workspace search, preserving ranked page/action/config suggestions.
  - Added shared global-search utility module to centralize search item definitions and ranking logic.
  - Kept keyboard shortcut behavior (`Ctrl/Cmd + K`) and redirected it to the dedicated search page.
  - Updated shared `DataTable` mobile behavior to keep search inline in the table header controls.
  - Removed mobile full-screen search sheet from table component while retaining filters/sort/columns bottom sheets.
- Touchpoints:
  - `components/dashboard/v2-topbar.tsx`
  - `components/search/global-search-content.tsx`
  - `app/search/page.tsx`
  - `lib/global-search.ts`
  - `components/ui/data-table.tsx`
- Notes / Follow-ups:
  - If needed, we can add recent-search history and pinned-suggestion groups to `/search` in a follow-up.

## 2026-04-16 19:58 (IST)
- Scope: Summary strip interaction enhancement.
- Changes:
  - Updated shared `SectionSummaryStrip` from static auto-fit grid to horizontal snap-scrolling metric cards.
  - Added scroll-indicator dots below the strip when overflow exists so users can discover and navigate hidden cards.
  - Added dot-click navigation to jump to a specific summary card.
- Touchpoints:
  - `components/dashboard/section-summary-strip.tsx`
- Notes / Follow-ups:
  - If needed, we can add drag-hint microcopy for first-time users in extremely dense summary sets.

## 2026-04-16 20:12 (IST)
- Scope: Table header and container hierarchy refinement.
- Changes:
  - Removed monolithic table background treatment from shared `DataTable` wrapper.
  - Split table header into two distinct containers:
    - switcher/status row with dedicated muted background
    - controls row with separate background for search + filters + sort + customize.
  - Expanded search control treatment (no icon-only behavior in table header controls).
  - Replaced icon-only sort/columns controls with labeled actions (`Sort`, `Customize`) for clearer affordance.
  - Kept field customization behavior connected to mobile card rendering so enabled fields appear in cards.
- Touchpoints:
  - `components/ui/data-table.tsx`
- Notes / Follow-ups:
  - If needed, we can introduce a prop to toggle compact vs expanded controls per table instance.

## 2026-04-16 20:21 (IST)
- Scope: Desktop/mobile table container behavior split.
- Changes:
  - Restored desktop `DataTable` container/background/header behavior to the previous style.
  - Kept the new separated mobile header containers:
    - switchers row background
    - controls row background
    - expanded search + labeled controls (`Filters`, `Sort`, `Customize`).
  - Preserved field-visibility customization behavior for mobile cards.
- Touchpoints:
  - `components/ui/data-table.tsx`
- Notes / Follow-ups:
  - If needed, we can introduce explicit `mobileHeaderVariant`/`desktopHeaderVariant` props for per-screen control.

## 2026-04-16 20:30 (IST)
- Scope: Summary strip desktop/mobile behavior split.
- Changes:
  - Restored desktop summary cards to original auto-fit grid layout.
  - Kept horizontal snap scroll and indicator dots only for mobile summary cards.
  - Guarded mobile-only scroll indicator logic to avoid desktop-side behavior changes.
- Touchpoints:
  - `components/dashboard/section-summary-strip.tsx`

## 2026-04-16 20:41 (IST)
- Scope: Topbar search desktop/mobile behavior split.
- Changes:
  - Restored desktop topbar common search to inline input with suggestion dropdown behavior.
  - Kept mobile topbar common search as icon-only action that opens dedicated `/search` page.
  - Preserved keyboard shortcut behavior:
    - desktop: focuses inline search and opens suggestions
    - mobile: routes to `/search`.
- Touchpoints:
  - `components/dashboard/v2-topbar.tsx`

## 2026-04-16 20:48 (IST)
- Scope: Settlements header spacing consistency.
- Changes:
  - Removed settlements-specific `PageHeader` top-margin override (`mt-0`) so settlements now follows the shared page-header top spacing used across the platform.
- Touchpoints:
  - `components/settlements/v3-settlements-content.tsx`

## 2026-04-16 21:08 (IST)
- Scope: Help & support IA refactor + support request flow.
- Changes:
  - Reworked support navigation IA to only expose:
    - `Knowledge hub`
    - `Support queries` (rebrand of ticket history)
  - Removed direct `FAQs` and `Training videos` links from sidebar and folded both into Knowledge Hub experience.
  - Implemented Knowledge Hub landing with topic cards (icon, heading, subheading) and deep-link navigation.
  - Added rich topic pages under `/support/knowledge-hub/[topic]` with integrated FAQ accordions + training video cards.
  - Added redirects from legacy routes:
    - `/support/faqs` -> `/support/knowledge-hub`
    - `/support/training-videos` -> `/support/knowledge-hub`
  - Rebuilt support queries page flow to include a side-panel “Raise request” journey:
    - issue description input
    - POS device selection
    - automatic device health check simulation
    - surfaced printer-related issues
    - CTA to raise request with 48-hour expected resolution messaging
    - success confirmation state after submission.
- Touchpoints:
  - `components/dashboard/v2-sidebar.tsx`
  - `app/support/page.tsx`
  - `app/support/support-queries/page.tsx`
  - `app/support/knowledge-hub/[topic]/page.tsx`
  - `app/support/faqs/page.tsx`
  - `app/support/training-videos/page.tsx`
  - `lib/support-knowledge.ts`

## 2026-04-16 21:19 (IST)
- Scope: Support iconography + conversational request journey.
- Changes:
  - Updated sidebar iconography for support IA clarity:
    - `Knowledge hub` now uses a learning-focused icon
    - `Support queries` now uses a query/conversation-focused icon
  - Converted raise-request panel to a chat-style guided flow:
    - user submits issue message
    - assistant suggests next best action (select impacted POS)
    - automated health check runs in-flow
    - issue diagnosis shown (printer subsystem)
    - quick-fix actions suggested automatically
    - escalate path via `Raise request` CTA with 48-hour resolution expectation.
- Touchpoints:
  - `components/dashboard/v2-sidebar.tsx`
  - `app/support/page.tsx`

## 2026-04-16 22:26 (IST)
- Scope: Unified support request chat across FAB drawer and support page.
- Changes:
  - Created a shared support request chat component to eliminate duplicate drawer logic.
  - Aligned support-page `Raise request` side panel layout to the same visual/chat structure used by FAB support drawer.
  - Replaced FAB drawer internals so it now runs the same guided request flow (issue -> device select -> health check -> quick fixes -> raise request).
  - Added optional `Open support center` action only in FAB context while keeping request flow parity.
  - Removed duplicated local request-flow state/markup from support page and delegated to shared component.
- Touchpoints:
  - `components/support/support-request-chat-panel.tsx`
  - `components/dashboard/v2-support-drawer.tsx`
  - `app/support/page.tsx`
  - `docs/decisions/decision-log.md`

## 2026-04-17 12:10 (IST)
- Scope: Product IA refresh for V3 product surfaces.
- Changes:
  - Reworked V3 products navigation labels:
    - `Manage products` -> `Products`
    - `Checkout` -> `Online payment`
    - `POS terminal` -> `In-store payment`
  - Updated online payment products page to include:
    - `Checkout`
    - `Smart routing`
    - `Payment links` (dual CTAs: `Manage links` + `Configure`)
  - Updated in-store payment products page with:
    - page-header CTAs (`Manage devices`, `Manage store`, `Buy new device`)
    - per-device cards with icon imagery, added-device counts, and add/view actions
  - Added `Manage stores` route placeholder to support in-store header CTA destination.
  - Added filtered handoff behavior from product cards to manage-devices (`?model=` mapping).
  - Updated V3/V3.1 path remapping to keep product routes on `/products/*` during version switches.
  - Added `Offer engine` and `GrowthX` as coming-soon entries under Other products.
  - Extended shared `ManageProductListContent` to support:
    - multiple header actions
    - per-row multi-action CTA sets
    - optional image/icon slot
    - optional metric line
    - explicit coming-soon tagging
- Touchpoints:
  - `components/products/manage-product-list-content.tsx`
  - `components/dashboard/v2-sidebar.tsx`
  - `app/products/online-payments/page.tsx`
  - `app/products/in-store-payments/page.tsx`
  - `app/products/other-products/page.tsx`
  - `lib/demo-settings.ts`
  - `app/offline-payments/manage-devices/page.tsx`
  - `components/offline-payments/offline-payments-content.tsx`
  - `app/offline-payments/manage-stores/page.tsx`
- Notes / Follow-ups:
  - `npm run lint` currently fails in this environment (`eslint: command not found`).
  - `npm run build` passes after moving row icon rendering to serializable keys.

## 2026-04-17 12:24 (IST)
- Scope: V3 products sidebar cleanup.
- Changes:
  - Removed `Payment links` from the V3 `Products` sidebar section.
  - Kept the section label as `Products` and aligned the version-difference and IA docs to the new structure.
- Touchpoints:
  - `components/dashboard/v2-sidebar.tsx`
  - `docs/implementation/version-differences.md`
  - `docs/architecture/information-architecture.md`
  - `docs/decisions/decision-log.md`

## 2026-04-17 12:43 (IST)
- Scope: Sidebar roadmap visibility + other-products cleanup.
- Changes:
  - Added `Offer engine` and `GrowthX` into the V3 and V3.1 sidebar product sections as explicit `Soon` destinations.
  - Created dedicated empty-state pages for:
    - `/products/offer-engine-coming-soon`
    - `/products/growthx-coming-soon`
  - Simplified `/products/other-products` to focus only on 3rd-party product discovery.
  - Generalized `ThirdPartyOffersContent` so it can be reused as the main content for Other products with contextual title/subtitle.
- Touchpoints:
  - `components/dashboard/v2-sidebar.tsx`
  - `app/products/other-products/page.tsx`
  - `components/products/third-party-offers-content.tsx`
  - `app/products/offer-engine-coming-soon/page.tsx`
  - `app/products/growthx-coming-soon/page.tsx`
  - `docs/architecture/information-architecture.md`
  - `docs/implementation/version-differences.md`
  - `docs/decisions/decision-log.md`

## 2026-04-17 13:16 (IST)
- Scope: V3 isolation refactor, phase 1.
- Changes:
  - Created isolated refactor branch: `codex-v3-isolated-refactor`.
  - Extracted versioned navigation ownership into `lib/navigation/navigation-model.ts`.
  - Moved V3/V3.1 route remapping tables into `lib/navigation/version-routing.ts`.
  - Introduced shared client hooks for demo-settings subscriptions in `components/dashboard/use-demo-settings.ts`.
  - Rewired these consumers to use the extracted modules without changing UI or UX:
    - `components/dashboard/v2-sidebar.tsx`
    - `components/dashboard/bottom-nav.tsx`
    - `components/dashboard/v2-dashboard-layout.tsx`
    - `components/settlements/settlements-route-content.tsx`
    - `components/dashboard/workspace-shell.tsx`
  - Preserved current rendering and behavior while reducing version logic inside mixed UI components.
- Touchpoints:
  - `lib/navigation/navigation-model.ts`
  - `lib/navigation/version-routing.ts`
  - `components/dashboard/use-demo-settings.ts`
  - `lib/demo-settings.ts`
  - `components/dashboard/v2-sidebar.tsx`
  - `components/dashboard/bottom-nav.tsx`
  - `components/dashboard/v2-dashboard-layout.tsx`
  - `components/settlements/settlements-route-content.tsx`
  - `components/dashboard/workspace-shell.tsx`
- Verification:
  - `npm run build` passes on the refactor branch.

## 2026-04-17 13:29 (IST)
- Scope: V3 isolation refactor, phase 2 route ownership.
- Changes:
  - Added dedicated route-content wrappers for workflow routes:
    - transactions
    - disputes
    - refunds
    - reports
  - Updated app route files to enter through those wrappers instead of importing `HomeContent` directly.
  - Kept rendering behavior unchanged while creating explicit route-level ownership seams for future V3 extraction.
- Touchpoints:
  - `components/transactions/transactions-route-content.tsx`
  - `components/disputes/disputes-route-content.tsx`
  - `components/refunds/refunds-route-content.tsx`
  - `components/reports/reports-route-content.tsx`
  - `app/transactions/page.tsx`
  - `app/disputes/page.tsx`
  - `app/refunds/page.tsx`
  - `app/reports/page.tsx`

## 2026-04-17 13:52 (IST)
- Scope: V3-only branch collapse.
- Changes:
  - Removed runtime multi-version switching from this branch.
  - Simplified demo settings to width controls only.
  - Simplified navigation model to V3-only sidebar and bottom-nav definitions.
  - Removed cross-version route-mapping utility and deleted obsolete version-switcher component.
  - Flattened layout and route wrappers so they no longer branch on navigation version.
  - Removed navigation-model switching UI from the floating demo FAB and demo settings dialog.
- Touchpoints:
  - `lib/demo-settings.ts`
  - `lib/navigation/navigation-model.ts`
  - `components/dashboard/use-demo-settings.ts`
  - `components/dashboard/v2-dashboard-layout.tsx`
  - `components/dashboard/v2-sidebar.tsx`
  - `components/dashboard/bottom-nav.tsx`
  - `components/dashboard/demo-settings-dialog.tsx`
  - `components/dashboard/floating-demo-fab.tsx`
  - `components/settlements/settlements-route-content.tsx`
  - `components/transactions/transactions-route-content.tsx`
  - `components/disputes/disputes-route-content.tsx`
  - `components/refunds/refunds-route-content.tsx`
  - `components/reports/reports-route-content.tsx`
  - `components/dashboard/version-switcher.tsx`

## 2026-04-17 14:26 (IST)
- Scope: V3-only code compaction.
- Changes:
  - Replaced the legacy product catalog with a smaller V3-linked product data model.
  - Simplified global search and overview product references to use shared configured-product names instead of deriving from the old catalog.
  - Removed the unused dynamic product detail route and its supporting components.
  - Deleted the old dashboard shell files that were no longer part of the active app architecture.
  - Retargeted lingering CTA links to current V3 product destinations.
- Touchpoints:
  - `lib/products-data.ts`
  - `components/products/products-content.tsx`
  - `lib/global-search.ts`
  - `components/home/home-content.tsx`
  - `components/home/attention-strip.tsx`
  - `components/payments/contextual-insight.tsx`
  - `components/payments/failure-reasons.tsx`
  - `components/home/active-setup-card.tsx`
  - `app/partners/[slug]/page.tsx`
  - `lib/workspace-recipes.ts`
  - deleted:
    - `app/products/[slug]/page.tsx`
    - `components/products/product-detail-content.tsx`
    - `components/products/product-category.tsx`
    - `components/dashboard/dashboard-layout.tsx`
    - `components/dashboard/app-topbar.tsx`
    - `components/dashboard/secondary-rail.tsx`
    - `components/dashboard/sidebar.tsx`
- Verification:
  - `npm run build` passes after compaction.

## 2026-04-17 19:02 (IST)
- Scope: Users management workflow upgrade.
- Changes:
  - Reworked `/account/users` into the same summary + table pattern used on core ops pages.
  - Added a pending-user approval flow with explicit approve/reject actions.
  - Wired approvals so accepted users are promoted into the managed-users table with current timestamps.
  - Added top-left role profile filters on the table to match the requested user-profile switching behavior.
  - Updated users table to include the required columns:
    - full name
    - email id
    - role
    - created on
    - last modified on
    - action menu
- Touchpoints:
  - `components/account/account-page-content.tsx`
- Verification:
  - `npm run build` passes after users-management changes.

## 2026-04-17 19:28 (IST)
- Scope: Editable account pages with page-header CTA control.
- Changes:
  - Added a unified page-header edit pattern on editable account pages.
  - `Profile`, `Business details`, `Preferences`, and `Security` now default to read-only detail views.
  - Page header CTA now toggles between `Edit details` and `Save details`.
  - Clicking `Edit details` reveals input controls; clicking `Save details` returns to detail-view mode.
  - Preferences language selection now persists on save through the existing language preference store.
- Touchpoints:
  - `components/account/account-page-content.tsx`
- Verification:
  - `npm run build` passes after edit/save toggle changes.

## 2026-04-17 19:46 (IST)
- Scope: Users management UI realignment to V3 platform direction.
- Changes:
  - Replaced reference-like pending user cards with a platform-consistent approvals queue table.
  - Added two side-panel flows:
    - `Create user request` flow with profile, scope, and reason capture.
    - `Review approval` flow with full request context and approve/reject actions.
  - Promoted newly approved users directly into the managed-users directory table.
  - Kept top-left user profile filters in the directory table and retained the core summary + table page structure.
- Touchpoints:
  - `components/account/account-page-content.tsx`
- Verification:
  - `npm run build` passes after users-management realignment.

## 2026-04-17 20:05 (IST)
- Scope: Users directory role-filter simplification.
- Changes:
  - Updated top-left filters in users directory to reduce visual load.
  - Filter strip now shows:
    - `All` as the first option.
    - Top 3 roles by system availability/count as direct options.
    - `More` menu for remaining roles.
  - Removed role counts from visible filter labels per requested UX direction.
  - Applied filtering to table data upstream so table header controls stay clean.
- Touchpoints:
  - `components/account/account-page-content.tsx`
- Verification:
  - `npm run build` passes after role-filter UX update.

## 2026-04-17 20:27 (IST)
- Scope: Users management table behaviors and header actions update.
- Changes:
  - Removed users summary card from `/account/users`.
  - Updated page header actions to two CTAs:
    - `Create user role`
    - `Invite user`
  - Reworked approval queue into a structured table with:
    - leading checkbox column
    - row-level action menu (`Review request`, `Approve`, `Reject`)
    - bulk action menu (`Approve selected`, `Reject selected`)
  - Moved users-directory role filters into table header controls (top-left) and removed external filter strip.
  - Added support in shared `DataTable` for compact status controls with:
    - primary visible options
    - overflow options under `More`
- Touchpoints:
  - `components/account/account-page-content.tsx`
  - `components/ui/data-table.tsx`
- Verification:
  - `npm run build` passes after users-table behavior updates.

## 2026-04-17 20:48 (IST)
- Scope: Users management role administration split into inner page flow.
- Changes:
  - Replaced header CTA `Create user role` with `Manage user roles` on `/account/users`.
  - Added a dedicated inner route `/account/users/roles`.
  - New inner page includes:
    - page header with back navigation to users page
    - `Create user role` CTA in header
    - top summary strip
    - role-permissions table
    - role creation side-panel flow requiring explicit permission selection
  - Kept `Invite user` as the second users-page header CTA.
- Touchpoints:
  - `components/account/account-page-content.tsx`
  - `components/account/manage-user-roles-content.tsx`
  - `app/account/users/roles/page.tsx`
- Verification:
  - `npm run build` passes after user-role inner-page flow changes.

## 2026-04-17 21:02 (IST)
- Scope: Role-permission scalability in create-role side panel.
- Changes:
  - Reworked permission selection UI for long lists into a search-first grouped experience.
  - Added inline search (`Search permission or module`) for permission discovery.
  - Grouped permissions by module with collapsible sections, collapsed by default.
  - During active search, matching groups auto-expand while non-matching groups remain hidden.
  - Added per-group selected count to improve orientation when permission catalogs grow.
- Touchpoints:
  - `components/account/manage-user-roles-content.tsx`
- Verification:
  - `npm run build` passes after permission scalability update.

## 2026-04-17 14:59 (IST)
- Scope: Component-first enforcement for account operations (tables + summaries).
- Changes:
  - Replaced the custom approvals queue `<Table>` on `/account/users` with shared `DataTable`.
  - Preserved approval behaviors with component-based controls:
    - first-column row checkbox selection
    - select-all control
    - bulk action menu (`Approve selected`, `Reject selected`)
    - row action menu (`Review request`, `Approve`, `Reject`)
  - Replaced custom role-summary metric markup on `/account/users/roles` with shared `SectionSummaryStrip`.
  - Removed ad-hoc table imports from account users content and consolidated on shared components.
- Touchpoints:
  - `components/account/account-page-content.tsx`
  - `components/account/manage-user-roles-content.tsx`
- Verification:
  - `npm run build` passes after component-first refactor.

## 2026-04-17 15:02 (IST)
- Scope: Profile-menu cleanup and component-usage confirmation.
- Changes:
  - Removed `Demo settings` from the profile dropdown menu in the top bar.
  - Removed now-unused demo-settings wiring from the top bar (`demoOpen` state, `DemoSettingsDialog` mount, related icon imports).
  - Re-verified `/account/users` approval queue uses shared `DataTable` and not custom table markup.
- Touchpoints:
  - `components/dashboard/v2-topbar.tsx`
  - `components/account/account-page-content.tsx`
- Verification:
  - `npm run build` passes after topbar cleanup.

## 2026-04-17 15:09 (IST)
- Scope: In-store payment product expansion with UPI QR sticker configuration flow.
- Changes:
  - Added a new in-store product card: `UPI QR sticker` with single CTA `Configure QR`.
  - Added new inner page route:
    - `/products/in-store-payments/upi-qr-sticker`
  - Built a dedicated QR configuration surface with shared components only:
    - page header with back navigation
    - top CTAs: `Print QR` and `Order payment QR options`
    - center-visible QR preview with Pine Labs icon in QR center
    - store and UPI mapping controls (store selector + linked UPI details)
    - style and color customization controls
    - linked-store table (`DataTable`) with `View transactions` CTA against each QR mapping
  - Added search discoverability entry for the new UPI QR configuration page.
- Touchpoints:
  - `app/products/in-store-payments/page.tsx`
  - `app/products/in-store-payments/upi-qr-sticker/page.tsx`
  - `components/products/manage-product-list-content.tsx`
  - `components/products/upi-qr-sticker-content.tsx`
  - `lib/global-search.ts`
- Verification:
  - `npm run build` passes with new route and components.

## 2026-04-17 15:17 (IST)
- Scope: Unified product-card layout across Online payment, In-store payment, and Other products pages.
- Changes:
  - Introduced a shared reusable card primitive for product catalog surfaces:
    - `ProductCatalogCard`
  - Refactored `ManageProductListContent` to render vertical cards in a 4-column desktop grid (`xl:grid-cols-4`), using consistent structure:
    - icon block
    - title
    - top-right badge
    - subtext
    - two CTA slots with primary shown first, secondary second
  - Refactored `ThirdPartyOffersContent` to the same card primitive and 4-column grid behavior.
  - Updated product action configs on:
    - `/products/online-payments`
    - `/products/in-store-payments`
    so each card exposes clear primary-first CTA ordering.
- Touchpoints:
  - `components/products/product-catalog-card.tsx`
  - `components/products/manage-product-list-content.tsx`
  - `components/products/third-party-offers-content.tsx`
  - `app/products/online-payments/page.tsx`
  - `app/products/in-store-payments/page.tsx`
- Verification:
  - `npm run build` passes after shared card-system refactor.

## 2026-04-17 15:21 (IST)
- Scope: Product-catalog density and page-header cleanup.
- Changes:
  - Updated product-card grid density from 4-up to 3-up on desktop for all target product catalogs.
  - Removed top summary/configured cards from Online payment and In-store payment product pages.
  - Removed back-button behavior from Other products header surface.
  - Updated page-header copy across:
    - Online payment products
    - In-store payment products
    - Other products
  - Kept card hierarchy consistent (icon, title, badge, subtext, primary + secondary CTA).
- Touchpoints:
  - `components/products/manage-product-list-content.tsx`
  - `components/products/third-party-offers-content.tsx`
  - `app/products/online-payments/page.tsx`
  - `app/products/in-store-payments/page.tsx`
  - `app/products/other-products/page.tsx`
- Verification:
  - `npm run build` passes after layout and header updates.

## 2026-04-17 15:24 (IST)
- Scope: Other products header-to-content alignment correction.
- Changes:
  - Switched `ThirdPartyOffersContent` content container to `WorkspaceShell` so the cards use the same center-width and horizontal alignment system as the page header.
  - Removed ad-hoc custom width wrapper in favor of shared layout primitive.
- Touchpoints:
  - `components/products/third-party-offers-content.tsx`
- Verification:
  - `npm run build` passes after alignment fix.
