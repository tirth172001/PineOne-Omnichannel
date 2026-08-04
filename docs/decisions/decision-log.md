# Decision Log

Last updated: 2026-04-17

## Format

- Date
- Area
- Decision
- Rationale
- Implementation touchpoints

---

## 2026-04 (Consolidated)

### Navigation and IA

1. Area: Versioned navigation
- Decision: Support four nav versions (`v1`, `v2`, `v3`, `v3.1`) controlled by demo settings.
- Rationale: Compare IA models without branching codebases.
- Touchpoints: `lib/demo-settings.ts`, `components/dashboard/demo-settings-dialog.tsx`, `components/dashboard/v2-sidebar.tsx`.

2. Area: V3 model
- Decision: Use workflow-first top-level navigation (Overview, Transactions, Settlement, Disputes, Reports, Refunds).
- Rationale: Optimize for operator workflows across products.
- Touchpoints: `navSectionsV3` in `components/dashboard/v2-sidebar.tsx`.

3. Area: V3.1 model
- Decision: Keep workflow top-level but switch product administration framing to portfolio-style Products section.
- Rationale: Make configuration/discovery easier for product managers.
- Touchpoints: `navSectionsV31` in `components/dashboard/v2-sidebar.tsx`.

4. Area: Version switch routing
- Decision: Add route remapping between V3 and V3.1 for equivalent destinations.
- Rationale: Preserve user context when switching versions.
- Touchpoints: `resolvePathForVersion` in `lib/demo-settings.ts`.

5. Area: International feature
- Decision: Mark international payments as coming soon and maintain explicit landing/empty state.
- Rationale: Communicate roadmap clearly while avoiding dead-end links.
- Touchpoints: `app/international-payments/*`, sidebar `comingSoon` metadata.

### Layout and Shell

6. Area: Top bar
- Decision: Make topbar full-width, distinct from side panel, and use solid surface color.
- Rationale: Strong global frame and consistent visual hierarchy.
- Touchpoints: `components/dashboard/v2-topbar.tsx`, layout wrappers.

7. Area: Right panel behavior
- Decision: Right context panels are overlays and should not reflow center content.
- Rationale: Preserve workspace stability during detail inspections.
- Touchpoints: `components/dashboard/workspace-shell.tsx`.

8. Area: Center max width
- Decision: Keep center content constrained by adjustable demo setting and align page header to the same max width.
- Rationale: Improve readability and consistent alignment.
- Touchpoints: `lib/demo-settings.ts`, `WorkspaceShell`, `PageHeader`.

9. Area: Side panel behavior
- Decision: Sidebar remains full-height while support/details panels open as overlays.
- Rationale: Maintain persistent information scent in navigation.
- Touchpoints: `V2Sidebar`, `V2SupportDrawer`, `WorkspaceShell`.

### Visual Language

10. Area: Control radii
- Decision: Standardize corner radius across inputs, buttons, dropdowns, sheets, and popovers.
- Rationale: Remove mixed rounded patterns and improve consistency.
- Touchpoints: shared UI components under `components/ui/*`.

11. Area: Side nav active marker
- Decision: Use path-line + arrow active-state pattern for nested nav to indicate selected child destination.
- Rationale: Stronger location awareness in deep product menus.
- Touchpoints: `NavGroup` rendering in `components/dashboard/v2-sidebar.tsx`.

12. Area: Floating support launcher
- Decision: Use icon-only default in V3, with label reveal on hover.
- Rationale: Keep UI quiet while preserving discoverability.
- Touchpoints: `components/dashboard/v2-dashboard-layout.tsx`.

### Header and Page Framing

13. Area: Header componentization
- Decision: Use a shared `PageHeader` pattern for all major and internal pages; internal pages get back action.
- Rationale: Standardized titles, subtitles, badges, and right actions.
- Touchpoints: `components/ui/panels.tsx` and page consumers.

14. Area: Header spacing and separators
- Decision: Remove unnecessary divider line below page header; use spacing instead.
- Rationale: Cleaner rhythm and reduced visual noise.
- Touchpoints: page-level layouts.

### Table Platform

15. Area: Unified table card
- Decision: Build table as single card with header controls and conditional footer.
- Rationale: Consistent list-view behavior and lower cognitive load.
- Touchpoints: `components/ui/data-table.tsx`.

16. Area: Header control order
- Decision: Table header order on right is Search -> Filters -> Sorting -> Columns.
- Rationale: Prioritize retrieval, then narrowing, then ordering, then view config.
- Touchpoints: `DataTable` header actions.

17. Area: Pinned columns
- Decision: Show explicit pin icon in headers; clicking the icon can unpin.
- Rationale: Better affordance than color-only pinned state.
- Touchpoints: `DataTable` header rendering.

18. Area: Pagination threshold
- Decision: Hide table footer when row count <= 10; show footer only above threshold.
- Rationale: Avoid unnecessary pagination controls for short lists.
- Touchpoints: `MIN_PAGINATION_ROW_COUNT` in `DataTable`.

### Overview and Analytics

19. Area: Widgetized overview
- Decision: Overview pages use configurable widgets with drag reorder and width modes (`compact`, `wide`, `full`).
- Rationale: Adapt dashboards to merchant-specific priorities.
- Touchpoints: `components/dashboard/overview-analytics-canvas.tsx`.

20. Area: Product-aware overviews
- Decision: Main and product-specific overview pages should share UX patterns and controls.
- Rationale: Consistency and learnability across contexts.
- Touchpoints: `OverviewAnalyticsCanvas` consumers.

21. Area: Customization interaction
- Decision: Use right-side panel for customization controls instead of modal-first behavior.
- Rationale: Better continuity with dashboard editing workflows.
- Touchpoints: sheet usage in overview modules.

### Transactions and Refunds

22. Area: Transaction UX (V3)
- Decision: Transaction rows navigate to internal detail page instead of side panel for deep workflow.
- Rationale: Enables richer detail and secondary flows.
- Touchpoints: transaction routing and `HomeContent` sections.

23. Area: IMEI verification
- Decision: Implement side-panel workflow with sample download window, upload, processing progress, and optional background progress.
- Rationale: Operational bulk-verification flow with async processing feedback.
- Touchpoints: transaction section in `components/home/home-content.tsx`.

24. Area: Refunds flow
- Decision: Add bulk refund side-panel workflow (sample download, upload, processing) plus row-level timeline detail context.
- Rationale: Mirror bulk operational process while preserving row-level auditability.
- Touchpoints: refund section in `components/home/home-content.tsx`.

25. Area: Analytics deep links
- Decision: Keep analytics as dedicated pages from transactions and refunds headers.
- Rationale: Separate investigative analysis from tabular operations.
- Touchpoints: `/transactions/analytics`, `/refunds/analytics`.

### Settlements (V3)

26. Area: Dedicated V3 settlement module
- Decision: Build settlements as dedicated V3 component with list and detail route (`/settlements` and `/settlements/[batchId]`).
- Rationale: Settlement requirements exceeded generic section complexity.
- Touchpoints: `components/settlements/v3-settlements-content.tsx`, `settlements-route-content.tsx`.

27. Area: Settlement summary
- Decision: Summary includes today's payout, transactions settled, and batch count with amount breakdown tooltips.
- Rationale: Provide quick payout health view.
- Touchpoints: V3 settlements summary strip/cards.

28. Area: Settlement modes
- Decision: On-demand and same-day are button-style toggles in header; enabling requires side-panel charge confirmation. T+1 remains default.
- Rationale: Explicit opt-in for paid acceleration modes.
- Touchpoints: `v3-settlements-content.tsx` state and sheet flow.

29. Area: On-demand banner
- Decision: Show eligibility banner above settlement summary and include CTA to enable on-demand mode.
- Rationale: Increase discoverability of accelerated settlement option.
- Touchpoints: list view order in `v3-settlements-content.tsx`.

30. Area: Settlement type display
- Decision: Table uses icon-only settlement-type cells, with tooltip labels on hover.
- Rationale: Reduce visual density while keeping recognizability.
- Touchpoints: settlement type column and tooltip configuration.

31. Area: Disputes workflow (V3 cross-product disputes view)
- Decision: Upgrade disputes to an operations workflow with:
  - summary metrics (total disputes, under review, amount under review)
  - expanded dispute table schema (dispute ID, payment ID, amount, due date, status, recovery status, action)
  - pending-action SLA context
  - row-level right-panel timeline
  - action side panel supporting partially defend, defend, and accept
- Rationale: Align dispute handling with chargeback operations and evidence submission workflow.
- Touchpoints: `components/home/home-content.tsx` (disputes section, right context, action sheet).

### Auth and Onboarding

32. Area: Signup sequencing
- Decision: Collect mobile and email in separate early steps, then company and screening, then legal/credentials/products, then OTP.
- Rationale: Improve completion flow and progressive disclosure.
- Touchpoints: `app/signup/page.tsx`.

33. Area: Onboarding workspace
- Decision: Post-signup onboarding uses left progress rail, center KYC forms, and right assistant panel.
- Rationale: Blend form and conversational guidance.
- Touchpoints: `components/onboarding/account-onboarding-flow.tsx`.

34. Area: Product-dependent KYC
- Decision: PAN/GST/address requirements are derived from selected products.
- Rationale: Avoid unnecessary KYC burden and keep compliance targeted.
- Touchpoints: `getKycRequirements` in onboarding flow component.

### Documentation and Traceability

35. Area: Documentation cadence
- Decision: Maintain a periodic implementation log alongside decision-level ADR notes, and update it at major workflow checkpoints during active iteration.
- Rationale: Preserve execution context, reduce knowledge loss, and make review handoff easier across long-running UI iterations.
- Touchpoints: `docs/implementation/periodic-progress-log.md`, `docs/decisions/decision-log.md`.

36. Area: Dispute action panel interaction
- Decision: Use a single dispute detail side panel for action handling, with radio-based action selection and context-sensitive form sections in the same panel.
- Rationale: Prevent stacked side-panel UX and reduce mode-switching friction during dispute operations.
- Touchpoints: `components/home/home-content.tsx` (dispute right context panel and action flow state).

37. Area: V3 reports workflow
- Decision: Redesign reports page to be generation-first:
  - no summary strip
  - quick-generate cards (payment/refunds/settlements/payout)
  - reports table with generation status and download action
  - side panels for schedule, generate, and customize (field selection + sequence + label mapping)
- Rationale: Align reports with operational intent and reduce report-creation friction.
- Touchpoints: `components/home/home-content.tsx`, V3 `/reports` route via `HomeContent initialSection=\"reports\"`.

38. Area: Partner offer routing + reports filter hierarchy
- Decision:
  - Introduce a dedicated dynamic route for partner offers (`/partners/[slug]`) and resolve offer cards against that route.
  - Make reports table left switcher represent entry type (`Report`, `Schedule`), while moving processing status filtering into the Filters menu.
- Rationale:
  - 3rd-party offer CTAs should never dead-end.
  - Entry type is a primary table mode; status is a secondary refinement.
- Touchpoints:
  - `app/partners/[slug]/page.tsx`
  - `components/home/home-content.tsx`

39. Area: Demo control access pattern
- Decision:
  - Introduce a draggable, hover-expand floating action button as a persistent demo-control launcher.
  - Keep demo controls in a floating menu (quick case navigation + version switching + layout width + theme) so scenario changes are available without leaving the current page.
- Rationale:
  - Demonstration users need instant access to global and page-level scenario toggles during walkthroughs.
  - Repositionable FAB avoids overlap with page-specific CTAs in varied layouts.
- Touchpoints:
  - `components/dashboard/floating-demo-fab.tsx`
  - `components/dashboard/v2-dashboard-layout.tsx`

40. Area: Workflow navigation ordering (V3/V3.1)
- Decision: Keep `Reports` as the last item in the first workflow section (after `Refunds`).
- Rationale: Preserve task-flow sequencing from execution workflows to reporting as the terminal analysis step.
- Touchpoints: `components/dashboard/v2-sidebar.tsx` (`navSectionsV3`, `navSectionsV31`).

41. Area: Reports page mode split
- Decision: Treat `Report` and `Schedule` as distinct table modes with a top-left view switch (no `All` option), each using its own table schema and row interactions.
- Rationale: Generated reports and recurring schedules are different operational objects and should not be mixed in a single table context.

42. Area: Schedule creation contract
- Decision: Standardize `Create a schedule` flow to collect:
  - report type
  - file format
  - delivery recipient(s): Email and/or SFTP
  - frequency
  - recipient email (when Email selected)
  - SFTP credentials (host/IP, port, user ID, path) and auth via password or `.ppk` upload (when SFTP selected)
- Rationale: Match enterprise delivery requirements and keep one reusable schedule definition across report types.
- Touchpoints: `components/home/home-content.tsx` schedule side-panel state model and save logic.

43. Area: Reports mode continuity
- Decision: Keep quick report cards visible in both `Report` and `Schedule` table modes, with both `Generate` and tertiary `Schedule` CTAs.
- Rationale: Preserve quick actions independent of currently selected table mode.
- Touchpoints: `components/home/home-content.tsx` reports section rendering.

44. Area: Schedule recipients scalability
- Decision: Support multi-recipient email entry via delimiter-based input (comma/semicolon/newline) with recipient token preview.
- Rationale: Operational teams often need distribution lists; single-email schedule target is insufficient.
- Touchpoints: `components/home/home-content.tsx` schedule validation and save flow.

45. Area: Reports action placement and schedule panel UX
- Decision:
  - Keep Reports page header action-free (right side), using table/cards as primary action surfaces.
  - Use divider-based schedule panel structure and radio-box groups for single-select choices.
- Rationale: Reduce header clutter and improve form scanability/accessibility in scheduling flow.
- Touchpoints:
  - `components/home/home-content.tsx`

46. Area: Shared table row accessibility
- Decision: Make interactive rows keyboard-accessible (`role="button"`, `tabIndex`, `Enter/Space` activation) with visible hover/focus affordances.
- Rationale: Improve accessibility and make detail panel entry behavior clearer across report/schedule and other table flows.
- Touchpoints: `components/ui/data-table.tsx`

47. Area: Schedule recipient entry pattern
- Decision: Use chip-based recipient entry for schedule emails, with add-on-delimiter/Enter behavior and inline chip removal.
- Rationale: Faster multi-recipient management and clearer visibility of who will receive scheduled reports.
- Touchpoints: `components/home/home-content.tsx`

48. Area: Mobile drawer interaction model
- Decision: Treat all side drawers as bottom-sheets on mobile by resolving `SheetContent` side (`left/right` -> `bottom`) at the shared UI primitive.
- Rationale:
  - Mobile ergonomics favor bottom-origin interactions and thumb-reachable dismissal/actions.
  - Centralizing behavior in the primitive avoids inconsistent route-level handling.
- Touchpoints: `components/ui/sheet.tsx`

49. Area: Mobile navigation and data presentation strategy
- Decision:
  - Use a two-layer mobile nav model in dashboard layouts:
    - hamburger-triggered full navigation sheet
    - persistent bottom nav for top workflows plus menu shortcut.
  - Keep desktop sidebar unchanged and hidden on mobile.
  - Render shared `DataTable` as card list on mobile while retaining full-feature table on desktop.
  - Render `WorkspaceShell` right context as bottom sheet on mobile.
- Rationale:
  - Matches common high-clarity mobile SaaS patterns.
  - Preserves information architecture while reducing cognitive load and horizontal overflow.
  - Enables broad responsive coverage without duplicating page-specific code.
- Touchpoints:
  - `components/dashboard/v2-dashboard-layout.tsx`
  - `components/dashboard/v2-topbar.tsx`
  - `components/dashboard/v2-sidebar.tsx`
  - `components/dashboard/bottom-nav.tsx`
  - `components/ui/data-table.tsx`
  - `components/dashboard/workspace-shell.tsx`

50. Area: Mobile table card information density and control affordances
- Decision:
  - Standardize mobile row rendering as structured cards with:
    - heading + subheading
    - status badge lane
    - limited label/value rows (intentional truncation of secondary details)
    - quick action affordances (`View`, `View details`).
  - Route all mobile table controls through bottom-sheet overlays.
  - Use full-height search bottom-sheet on mobile with card-format result list.
- Rationale:
  - Reduces overload from wide desktop schemas on small screens.
  - Keeps interaction model consistent across search/filter/sort/column controls.
  - Improves discoverability and thumb ergonomics in mobile contexts.
- Touchpoints:
  - `components/ui/data-table.tsx`

51. Area: Global search entry pattern
- Decision:
  - Replace topbar inline common search with an icon-only trigger that opens a dedicated `/search` page.
  - Keep `Ctrl/Cmd + K` mapped to the same dedicated page flow.
- Rationale:
  - Reduces persistent topbar visual weight.
  - Gives global search enough space for richer ranked results and navigation shortcuts.
- Touchpoints:
  - `components/dashboard/v2-topbar.tsx`
  - `components/search/global-search-content.tsx`
  - `app/search/page.tsx`
  - `lib/global-search.ts`

52. Area: Mobile table search behavior
- Decision:
  - Keep table search inline within the table header controls on mobile (desktop-like behavior), while retaining bottom-sheet overlays for filters/sorting/columns.
- Rationale:
  - Search is a high-frequency action and should remain one-tap, in-context, and visible.
  - Overlay-based controls are still useful for lower-frequency multi-option actions (filters/sort/columns).
- Touchpoints:
  - `components/ui/data-table.tsx`

53. Area: Summary metrics discoverability
- Decision:
  - Render top summary metrics as horizontally scrollable snap cards and show dot indicators below when additional cards are off-screen.
- Rationale:
  - Dense summary sets should remain scannable without shrinking typography or overloading a multi-row grid.
  - Dot indicators provide a clear affordance that more summary context is available via horizontal scroll.
- Touchpoints:
  - `components/dashboard/section-summary-strip.tsx`

54. Area: Table header container hierarchy
- Decision:
  - Use separate header containers in shared `DataTable`:
    - switchers/status row
    - controls row (search, filters, sort, customize fields)
  - Avoid a single monolithic background block for the complete table header.
- Rationale:
  - Improves visual grouping and reduces header clutter.
  - Makes status controls and operational controls easier to parse quickly.
- Touchpoints:
  - `components/ui/data-table.tsx`

55. Area: Help & support information architecture
- Decision:
  - Simplify help navigation to two parent links only:
    - `Knowledge hub`
    - `Support queries`
  - Merge FAQs and training videos into Knowledge Hub topic pages instead of separate nav destinations.
- Rationale:
  - Reduces navigation clutter and keeps learning content in one discoverable place.
  - Aligns support operations (`Support queries`) separately from self-serve learning (`Knowledge hub`).
- Touchpoints:
  - `components/dashboard/v2-sidebar.tsx`
  - `app/support/page.tsx`
  - `app/support/knowledge-hub/[topic]/page.tsx`

56. Area: Raise request assisted workflow
- Decision:
  - Implement request raising as a side-panel flow with assisted troubleshooting:
    - problem statement
    - impacted POS selection
    - automatic health-check run
    - surfaced issue diagnosis
    - request CTA + expected 48-hour resolution confirmation.
- Rationale:
  - Encourages structured issue submission and pre-triage signal capture before ticket creation.
  - Improves support quality and expectation setting at creation time.
- Touchpoints:
  - `app/support/page.tsx`

57. Area: Support drawer parity (FAB and support-page request panel)
- Decision:
  - Standardize FAB support drawer and support-page `Raise request` drawer on a single shared chat-flow component.
  - Keep one guided support journey across both entry points:
    - issue capture
    - POS selection
    - automated health check
    - quick remediation suggestions
    - request creation confirmation.
- Rationale:
  - Removes UX drift between two support entry points.
  - Reduces implementation duplication and keeps future support-flow changes scalable.
- Touchpoints:
  - `components/support/support-request-chat-panel.tsx`
  - `components/dashboard/v2-support-drawer.tsx`
  - `app/support/page.tsx`

58. Area: V3 products IA relabeling
- Decision: In V3, rename product administration labels to business-facing names:
  - `Checkout` -> `Online payment`
  - `POS terminal` -> `In-store payment`
  - section label `Manage products` -> `Products`
- Rationale: Keep V3 labels aligned with how merchants think about capabilities instead of internal product naming.
- Touchpoints:
  - `components/dashboard/v2-sidebar.tsx` (`navSectionsV3`)

59. Area: Online payment product composition
- Decision: Consolidate online payment setup surface to three cards: `Checkout`, `Smart routing`, and `Payment links`; `Payment links` card exposes dual actions (`Manage links`, `Configure`) where configure opens checkout whitelabel configuration.
- Rationale: Reduce product fragmentation and keep checkout-related controls in a single product surface.
- Touchpoints:
  - `app/products/online-payments/page.tsx`
  - `components/products/manage-product-list-content.tsx`

60. Area: In-store payment product composition
- Decision: In-store payment products page should expose:
  - page-header actions: `Manage devices`, `Manage store`, `Buy new device`
  - per-device cards with image/icon, configured count, and `View added devices` (filtered) plus `Add device` actions.
- Rationale: Make fleet management entry points explicit and shorten path to filtered manage-device views.
- Touchpoints:
  - `app/products/in-store-payments/page.tsx`
  - `app/offline-payments/manage-devices/page.tsx`
  - `components/offline-payments/offline-payments-content.tsx`
  - `components/products/manage-product-list-content.tsx`

61. Area: Product roadmap visibility
- Decision: Add `Offer engine` and `GrowthX` as explicit coming-soon products under Other products.
- Rationale: Communicate upcoming platform capabilities without dead-end product claims.
- Touchpoints:
  - `app/products/other-products/page.tsx`

62. Area: Version-switch route continuity for products
- Decision: Update V3 <-> V3.1 route remapping so product portfolio routes remain stable (`/products/*`) when switching between versions, with only gift-cards redirecting to other products in V3.
- Rationale: Prevent context jumps back to legacy `/manage-products/*` pages after product IA relabeling.
- Touchpoints:
  - `lib/demo-settings.ts` (`resolvePathForVersion`)
  - `docs/architecture/information-architecture.md`

63. Area: V3 products sidebar simplification
- Decision: Remove `Payment links` as a separate item from the V3 `Products` sidebar section, keeping that section limited to `Online payment`, `In-store payment`, and `Other products`.
- Rationale: Payment links is already represented within online payment product administration and does not need duplicate exposure in the V3 side navigation.
- Touchpoints:
  - `components/dashboard/v2-sidebar.tsx`
  - `docs/implementation/version-differences.md`
  - `docs/architecture/information-architecture.md`

64. Area: Sidebar roadmap visibility for upcoming products
- Decision: Move `Offer engine` and `GrowthX` out of the Other products page and surface them directly in the sidebar as clickable `Soon` items that land on dedicated empty-state pages.
- Rationale:
  - Makes the roadmap explicit in navigation without mixing unavailable products into the 3rd-party products catalog.
  - Keeps `Other products` focused on immediately explorable partner-led products.
- Touchpoints:
  - `components/dashboard/v2-sidebar.tsx`
  - `app/products/other-products/page.tsx`
  - `app/products/offer-engine-coming-soon/page.tsx`
  - `app/products/growthx-coming-soon/page.tsx`
  - `components/products/third-party-offers-content.tsx`

65. Area: V3 isolation refactor strategy
- Decision: Start V3 isolation by extracting version definitions and route ownership out of mixed rendering components before touching page-level UX modules.
- Rationale:
  - This is the lowest-risk seam for a behavior-preserving refactor.
  - It reduces duplication and creates a stable base for later V3-only extraction of route wrappers and domain content.
- Touchpoints:
  - `lib/navigation/navigation-model.ts`
  - `lib/navigation/version-routing.ts`
  - `components/dashboard/use-demo-settings.ts`
  - `components/dashboard/v2-sidebar.tsx`
  - `components/dashboard/bottom-nav.tsx`
  - `components/dashboard/v2-dashboard-layout.tsx`
  - `components/settlements/settlements-route-content.tsx`
  - `components/dashboard/workspace-shell.tsx`

66. Area: Workflow route ownership for V3 isolation
- Decision: Introduce dedicated route-content wrappers for workflow pages even when they still delegate to shared `HomeContent`.
- Rationale:
  - Keeps app route files thin.
  - Creates a stable boundary for future V3-only extraction without forcing a risky rewrite of shared page logic in one pass.
- Touchpoints:
  - `components/transactions/transactions-route-content.tsx`
  - `components/disputes/disputes-route-content.tsx`
  - `components/refunds/refunds-route-content.tsx`
  - `components/reports/reports-route-content.tsx`
  - `app/transactions/page.tsx`
  - `app/disputes/page.tsx`
  - `app/refunds/page.tsx`
  - `app/reports/page.tsx`

67. Area: V3-only branch runtime model
- Decision: Collapse this branch to a V3-only runtime model and remove in-app version switching.
- Rationale:
  - Future changes should be optimized for V3 speed, not cross-version compatibility.
  - Other versions remain available by switching branches rather than by carrying multi-version runtime logic in this branch.
- Touchpoints:
  - `lib/demo-settings.ts`
  - `lib/navigation/navigation-model.ts`
  - `components/dashboard/v2-dashboard-layout.tsx`
  - `components/dashboard/v2-sidebar.tsx`
  - `components/dashboard/bottom-nav.tsx`
  - `components/dashboard/demo-settings-dialog.tsx`
  - `components/dashboard/floating-demo-fab.tsx`

68. Area: V3-only codebase compaction
- Decision: Remove legacy non-V3 route shells and collapse product catalog code to V3-linked product surfaces only.
- Rationale:
  - Keeping deleted version-era code in-tree slows down future changes and creates false dependencies.
  - V3 now owns a smaller, clearer set of product routes and supporting dashboard primitives.
- Touchpoints:
  - `lib/products-data.ts`
  - `components/products/products-content.tsx`
  - `lib/global-search.ts`
  - `components/home/home-content.tsx`
  - `components/home/attention-strip.tsx`
  - `components/payments/contextual-insight.tsx`
  - `components/payments/failure-reasons.tsx`
  - `components/home/active-setup-card.tsx`
  - `lib/workspace-recipes.ts`
  - deleted:
    - `app/products/[slug]/page.tsx`
    - `components/products/product-detail-content.tsx`
    - `components/products/product-category.tsx`
    - `components/dashboard/dashboard-layout.tsx`
    - `components/dashboard/app-topbar.tsx`
    - `components/dashboard/secondary-rail.tsx`
    - `components/dashboard/sidebar.tsx`

69. Area: Users management IA and interaction model
- Decision: Treat `/account/users` as an operations surface with summary + pending approvals + role-filtered directory table, instead of a static profile list.
- Rationale:
  - Matches the same mental model used across V3 transaction/settlement/report pages.
  - Makes user onboarding controllable through an explicit approval step before access is granted.
  - Keeps role filtering in the table's top-left controls, aligned with existing table interaction patterns.
- Touchpoints:
  - `components/account/account-page-content.tsx`

70. Area: Account page editing interactions
- Decision: Standardize editable account screens around a page-header action that toggles read-only details and editable form fields.
- Rationale:
  - Keeps page interaction consistent across profile and account maintenance flows.
  - Reduces accidental edits by defaulting pages to view mode.
  - Aligns the primary page action with user intent: inspect first, edit when needed, then save.
- Touchpoints:
  - `components/account/account-page-content.tsx`

71. Area: Users management approval UX direction
- Decision: Move `/account/users` away from visual reference-card patterns and anchor it to the platform's operations design language (summary + tables + right-sheet workflows).
- Rationale:
  - Keeps account operations aligned with the same interaction model used in transactions, settlements, disputes, and reports.
  - Scales better as user volume grows (queue table + directory table) than card-based pending approval layouts.
  - Keeps approval behavior explicit with auditable review actions in a dedicated side-panel flow.
- Touchpoints:
  - `components/account/account-page-content.tsx`

72. Area: Users directory role filter density
- Decision: Keep users-directory role filters compact with `All`, top 3 available roles, and a `More` overflow menu for remaining roles.
- Rationale:
  - Reduces cognitive load in the table header while preserving full role filtering capability.
  - Prioritizes the most-used roles without hard-coding fixed role chips.
  - Avoids numeric badges in filter labels to keep scanning simple and uncluttered.
- Touchpoints:
  - `components/account/account-page-content.tsx`

73. Area: Users management operational controls
- Decision: Keep users-directory role filters inside table-header top-left controls, and model approvals as a checkbox-first action table with row and bulk menus.
- Rationale:
  - Aligns with the same table-first operations pattern used across V3.
  - Prevents duplicated filter surfaces and keeps interaction anchors where users expect them (within table header controls).
  - Supports high-volume approvals through bulk action workflows without introducing separate state surfaces.
- Touchpoints:
  - `components/account/account-page-content.tsx`
  - `components/ui/data-table.tsx`

74. Area: User role administration flow
- Decision: Move role administration off the main users page into a dedicated inner route with its own page header CTA and permissions-led create-role flow.
- Rationale:
  - Keeps `/account/users` focused on invitation and approval operations.
  - Prevents action overload on the primary users surface while preserving fast role access via dedicated navigation.
  - Enforces explicit permission selection at role creation, reducing under-specified role definitions.
- Touchpoints:
  - `components/account/account-page-content.tsx`
  - `components/account/manage-user-roles-content.tsx`
  - `app/account/users/roles/page.tsx`

75. Area: Permission list scalability in role creation
- Decision: Use searchable, grouped, collapsible permission sections in the create-role side panel instead of rendering a single long checkbox list.
- Rationale:
  - Keeps side-panel UX manageable when permission catalogs become very large.
  - Reduces scanning cost by combining group-level navigation and targeted search.
  - Preserves context through per-group selected counts without introducing visual clutter.
- Touchpoints:
  - `components/account/manage-user-roles-content.tsx`

76. Area: Component-first enforcement for account operations
- Decision: Standardize account operations pages on shared primitives only:
  - `DataTable` for all tabular/approval surfaces
  - `SectionSummaryStrip` (or equivalent shared summary primitive) for summary metrics
  - Avoid ad-hoc one-off table/summary markup in account routes.
- Rationale:
  - Ensures consistent interaction behavior, styling, and accessibility across account surfaces.
  - Reduces duplicate implementations and future maintenance overhead.
  - Aligns account pages with the same scalable table/summary system used in V3 operations pages.
- Touchpoints:
  - `components/account/account-page-content.tsx`
  - `components/account/manage-user-roles-content.tsx`

77. Area: In-store product IA for static UPI QR acceptance
- Decision: Add `UPI QR sticker` as a first-class product under `Products · In-store payment`, with a dedicated inner configuration page instead of embedding QR controls in device management.
- Rationale:
  - Separates static QR acceptance setup from POS device fleet operations.
  - Keeps product-specific configuration discoverable from the product card itself (`Configure QR`).
  - Supports multi-store mapping by making store/UPI linkage explicit and actionable from one page.
- Touchpoints:
  - `app/products/in-store-payments/page.tsx`
  - `app/products/in-store-payments/upi-qr-sticker/page.tsx`
  - `components/products/upi-qr-sticker-content.tsx`

78. Area: QR configuration interaction model
- Decision: Model QR setup as a center-preview configuration workflow:
  - store-linked QR selection
  - style/color customization
  - per-store transaction drill-through CTA
  - page-header operational CTAs (`Print QR`, `Order payment QR options`)
- Rationale:
  - Keeps the QR preview as the primary artifact in the center while preserving operational actions.
  - Scales to multiple stores/UPI IDs without creating a fragmented flow.
  - Reuses shared table/page primitives for consistency and easier future enhancements.
- Touchpoints:
  - `components/products/upi-qr-sticker-content.tsx`
  - `lib/global-search.ts`

79. Area: Product-card system consistency across product catalogs
- Decision: Standardize product catalog cards (Online payment, In-store payment, Other products) on one shared vertical card component with:
  - icon-led top section
  - top-right status/offer badge
  - title + subtext
  - two CTA slots with primary CTA rendered first and secondary CTA second
  - 4-card desktop row layout (`xl:grid-cols-4`)
- Rationale:
  - Creates a single visual and interaction grammar for all product catalog surfaces.
  - Reduces implementation drift between in-house and third-party product pages.
  - Makes CTA hierarchy explicit and predictable for merchant actions.
- Touchpoints:
  - `components/products/product-catalog-card.tsx`
  - `components/products/manage-product-list-content.tsx`
  - `components/products/third-party-offers-content.tsx`
  - `app/products/online-payments/page.tsx`
  - `app/products/in-store-payments/page.tsx`

80. Area: Product catalog layout density and header posture
- Decision:
  - Use 3 cards per row (desktop) for product catalogs to improve readability and action scanning.
  - Remove summary cards from product catalog pages (Online payment, In-store payment, Other products).
  - Keep these product pages as top-level surfaces with standard page headers and no back button.
- Rationale:
  - Reduces visual compression and improves card-level comprehension versus 4-up grids.
  - Removes redundant top summaries where each card already conveys status and actionability.
  - Aligns product pages with top-level navigation behavior and avoids unnecessary nested affordances.
- Touchpoints:
  - `components/products/manage-product-list-content.tsx`
  - `components/products/third-party-offers-content.tsx`
  - `app/products/online-payments/page.tsx`
  - `app/products/in-store-payments/page.tsx`
  - `app/products/other-products/page.tsx`

## Open Documentation TODOs

1. Add ADRs for each nav version transition milestone.
2. Add route ownership map by team/domain.
3. Add test coverage matrix per shared primitive (`DataTable`, `WorkspaceShell`, `OverviewAnalyticsCanvas`).
