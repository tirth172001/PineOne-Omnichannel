---
title: Cross-platform experience discovery findings
description: Stakeholder discovery answers checked against the web and mobile prototypes: product model, information architecture and open decisions.
kind: Discovery findings
date: 2026-10-01
topics: [in-store, online, discovery, information architecture, cross-platform]
source: docs/exports/Pine One Cross Platform Experience Discovery Findings.docx
---

Cross platform product and UX discovery for web and mobile

**Pine One gives merchants one reliable place to understand and manage in-store and online payments across mobile and web.**

Updated: 1 October 2026

Status: Working discovery document

Platforms: Pine One web and Pine One mobile app

This document consolidates stakeholder inputs with evidence from the current prototypes. It establishes the cross-platform product model and records the decisions still required.

# 1. Purpose

- This document consolidates the product answers provided during discovery with evidence from the current web and mobile prototypes.
- It is an input to the eventual Pine One cross-platform UX design document; it is not yet the final design specification.

- The prototype is treated as evidence, not automatically as the final decision.
- Where the prototype and the stated product intent differ, both are recorded and a resolution is identified.

## Evidence labels

- **Confirmed:** explicitly stated during discovery and represented consistently in the prototype.
- **Intended:** explicitly stated during discovery but not yet represented consistently in the prototype.
- **Prototype:** behaviour found in the current implementation but not explicitly confirmed as the final product decision.
- **Open:** the prototype does not establish the answer, or sources conflict.

# 2. Working product definition

- Pine One gives merchants one reliable place to understand and manage in-store and online payments across mobile and web, without requiring them to understand Pine Labs' internal product boundaries.

It brings together:

- In-store payments collected through POS terminals, store QR products, and related devices.
- Online payments collected through checkout and payment links.
- Shared operational areas: Payments, Settlements, Refunds, Disputes, and Reports.
- Channel-specific product management: in-store devices and stores; online Checkout and Payment Links.
- Business administration: users, roles, permissions, account settings, and support.

## Customer promise

- Merchants should be able to get reliable information and easily manage their in-store and online payment operations and settlements.

## Business goals

- Increase engagement with Pine One.
- Replace separate in-store and online merchant touchpoints.
- Reduce the merchant's effort to understand performance across channels.
- Improve discovery and adoption of additional Pine Labs products and paid services.
- Reduce the operational and engineering cost of maintaining separate platforms.

## Non-goal

- Pine One should not become a cluttered super-app in which every Pine Labs capability competes equally for attention.
- Operational clarity must take priority over product promotion.

# 3. Scope

## In scope

- Authenticated experience for an already-onboarded merchant.
- Correctly mapped in-store and online merchant accounts.
- Business, channel, and store context.
- Overview, Payments, Settlements, Refunds, Disputes, and Reports.
- Devices, Stores, Payment Links, Checkout, Users and Roles, Account Settings, and Support.
- Differences and continuity between mobile and web.

## Out of scope for this document

- Business onboarding and KYC.
- Automatic matching of legacy in-store and online accounts.
- Incorrect or missing backend mappings.
- Migration correction and audit flows.
- Creation of new merchant IDs.

- Existing omnichannel merchants are few and will be manually mapped.
- New merchants will be mapped correctly by the backend from the start.

# 4. Product and account model

- User ├── Business A │ ├── In-store payments │ │ ├── Merchant ID(s) │ │ ├── Multiple stores │ │ └── POS terminals, soundboxes, and store QR products │ └── Online payments │ ├── Merchant ID │ ├── Checkout │ └── Payment links └── Business B └── The same user may switch to this business

- Existing merchant IDs are retained.
- Backend mapping associates the in-store and online merchant IDs with the same business.
- Online payments currently have no store construct; stores apply only to in-store payments.

# 5. Information architecture established by the prototype

## Shared operational modules

- Overview
- Payments
- Settlements
- Disputes
- Refunds
- Reports

- Overview supports an aggregate, all-channel view.
- Operational modules keep In-store payments and Online payments separate because their data, filters, states, and actions differ.

## Channel-specific modules

| **In-store payments** | **Online payments** |
| --- | --- |
| Terminal devices | Payment links |
| Stores | Checkout |
| Store QR products | Gateway and pay-mode configuration |

## Supporting modules

- Users and roles
- Account settings
- Support
- Product discovery

# 6. Consolidated discovery answers

## 1–15: Purpose and opportunity

- **1. Primary job:** help merchants manage in-store devices, payments collected through those devices, and online collection through Checkout and Payment Links.

- **2. Why now:** the existing Pine One app has usability problems and focuses only on in-store business.
  - Pine Labs wants a single touchpoint across business verticals, beginning with in-store and online payments.

- **3. New value:** merchants can see transactions and settlements from both verticals in one place, reduce manual calculation, create payment links, and manage online payments.

- **4. Desired change:** unification should feel natural rather than surprising.
  - Merchants should retain clarity even when previously separate information is brought together.

- **5. Meaning of One:** one platform for Pine Labs merchant businesses, starting with in-store and online payments.

- **6. Promise:** reliable information and easy management of in-store and online payments and settlements.

- **7. Non-goal:** a cluttered super-app with unclear primary actions.

- **8. Value by role:** cashiers and store managers need payment confirmation; managers and owners need a quick view of daily collection and overall performance.

- **9. Business outcomes:** engagement, cross-sell, paid-service adoption, and lower platform-maintenance costs.

- **10. Largest unproven assumption:** which tasks people actually perform, how frequently they perform them, and how they complete them today.

- **11. Current platforms:** Pine One app for in-store; Pine One web for in-store; Plural or Pine Online for online payments.

- **12. Current capability set:** payments, settlements, refunds, disputes, stores, users, Checkout, Payment Links, payment modes, value-added services, and reports.

- **13. Early role hypothesis:** store managers use the app for daily collections; administrators use web for reports and deeper administration.

- **14. Current fragmentation:** users go to one platform for online information and another for in-store information.

- **15. Access model:** roles and permissions are module- and channel-based.

## 16–34: Platform, identity, and migration

- **16.** The existing names are Pine One app, Pine One web, and Plural/Pine Online.
  - The new customer-facing terms are **In-store payments** and **Online payments**.

- **17.** Merchants are onboarded through business and KYC verification.
  - Existing users can invite people with a role; a person can also request access to a merchant and await administrator approval.
  - Detailed onboarding is out of scope here.

- **18.** Business/payment identity uses Merchant ID and Terminal ID.
  - Personal identity uses email and mobile number.

- **19.** In-store and online accounts are associated through backend migration.

- **20.** Existing omnichannel merchants are few, so ambiguous matches are not being designed as a customer-facing workflow.

- **21.** Uncertain account matches are out of scope for the initial experience.

- **22.** Existing omnichannel merchants will be mapped manually; future onboarding will create correct mappings by default.

- **23.** Matching evidence and onboarding rules will be handled in a separate onboarding session.

- **24.** Backend mapping already supports multiple merchant IDs.

- **25.** One user can be linked to, and switch between, multiple businesses.

- **26.** One merchant ID can have multiple stores.

- **27.** Online payments currently have one Merchant ID and no store construct.

- **28.** Channel-specific records should be presented in the correct In-store payments or Online payments context.

- **29.** Payments, Settlements, Refunds, Disputes, and Reports are shared modules with channel-specific views.
  - Overview includes combined information.
  - Devices, Payment Links, and Checkout are channel-specific.

- **30.** Incorrectly combined accounts are out of scope.

- **31.** Accounts that should be combined but remain separate are out of scope.

- **32.** Original merchant IDs remain available to identify records after mapping.

- **33.** Mapping audit history is out of scope.

- **34.** Use **Online payments** and **In-store payments** as customer-facing channel terms.

## 35–48: Business and channel context

- **35. Intended:** show the user businesses they can access and let them select one. **Prototype:** web puts Switch business in the profile menu; mobile puts Switch organisation in Account Settings rather than at entry.

- **36. Intended:** show Business name and Merchant ID. **Prototype gap:** web shows business name, role, stage, and description; mobile shows organisation name and store count.
  - Neither switcher currently shows Merchant ID.

- **37. Intended:** distinguish businesses using Merchant ID and an Online/In-store/Both badge. **Prototype gap:** no entitlement badge is present in either business switcher.

- **38. Intended:** the last business does not need to be remembered. **Prototype conflict:** web persists the selected business profile in local storage; mobile keeps the current organisation in memory for the session.

- **39. Intended:** switching business resets all filters. **Prototype conflict:** mobile switches to all stores but preserves the current channel; web profile switching persists the profile but individual page filters are component-local and generally reset after navigation/remount.

- **40.** Both prototypes show the current business as the selected entry inside the switcher.
  - Mobile also displays current channel/store scope persistently in page headers.

- **41.** A merchant with only In-store payments should not see a channel selector.
  - Online-payment products can be promoted as benefits or activation opportunities.

- **42.** A merchant with only Online payments should not see a channel selector.
  - In-store-payment products can be promoted where relevant.

- **43.** A merchant with both channels receives a channel selector inside shared modules.
  - The exact component is not part of the information-architecture decision.

- **44.** Unavailable products are not simply hidden in the prototype: product navigation, product catalogues, Get started states, and Explore products create discovery opportunities.

- **45.** The exact final labels and control treatment for channel selection remain open.

- **46.** Channel selection is a behaviour, not a commitment to a toggle component.
  - The current web uses page tabs; mobile uses a global header sheet.

- **47.** Overview can display combined data.
  - Payments, Settlements, Refunds, Disputes, and Reports use channel-specific views.

- **48.** Channel-specific product modules do not show the shared-module channel selector.

## 49–60: Why operational modules remain channel-specific

- **49.** Payments are not combined because the prototype models different concepts.
  - In-store is payment-first and includes store, terminal, POS, hardware, provider, receipt, RRN, and device context.
  - Online adds Order versus Payment views, order lifecycle, customer details, product details, gateway state, IMEI verification, and additional statuses such as Initiated, Cancelled, User cancelled, and Session expired.

- **50.** Settlements are not combined because channels have different cycles, settlement accounts, sources, eligibility, and controls.
  - In-store includes TID/store/acquirer context and On-Demand Settlement.
  - Online uses an online MID account and T+1/T+2-style configuration.

- **51.** In-store payments is the default channel for an omnichannel business.

- **52.** If channel state is not remembered, shared modules default to In-store payments.
  - An online-only business opens Online payments directly.

- **53.** The selected channel is communicated by the active channel view and, on mobile, by the persistent header scope text.

- **54. Intended:** channel selection should carry across shared modules. **Prototype:** mobile does this globally through `specificChannel`; web maintains channel locally per page and therefore does not consistently carry it across modules.

- **55.** The prototype changes fields, filters, summaries, and available actions by channel.
  - It does not rely only on row-level channel badges.

- **56.** In-store-specific payment information includes store, address, TID, POS ID, hardware ID/model, batch, provider/acquirer, branch, terminal receipt, and store QR/device context.

- **57.** Online-specific payment information includes Order/Payment view, Order ID, customer email/mobile/VPA, product details, gateway lifecycle, Checkout source, IMEI verification, and gateway-oriented statuses.

- **58.** Shared information includes Merchant ID, Transaction ID, amount, payment method, created/updated time, status, refund action, and activity history.

- **59.** Settlement differences represented in the prototype include settlement cycle, bank account, source, TID/store/acquirer fields, On-Demand Settlement availability, and channel-specific summaries.

- **60.** Combined information remains on Overview.
  - However, the prototype currently makes Overview cards interactive and links them to operational modules, normally opening the default In-store view.
  - This conflicts with the stated preference to keep combined metrics on Overview and needs a final decision.

## 61–68: Business selection and product activation

- **61.** For one accessible business, the prototype implies direct entry with no need to expose a switch action.
  - This is not explicitly implemented as a single-business scenario on both platforms.

- **62.** Deep-link-driven automatic business selection is not implemented.
  - The required behaviour should be: resolve the record's business, verify access, select it automatically, and open the target without forcing an intermediate choice.

- **63.** Multiple Merchant IDs are not represented in either business switcher.
  - The intended single-MID label will not scale; the switcher needs either a primary MID plus count, or a business identifier with Merchant IDs shown after selection.

- **64.** Large business lists are not handled.
  - Neither switcher currently provides search, recent businesses, favourites, or grouping.

- **65.** Similar business names are only weakly distinguished using stage, role, description, or store count.
  - Merchant ID and channel badges are needed for reliable disambiguation.

- **66.** The intended Online/In-store/Both badge represents configured payment channels.
  - The prototype currently derives access scope from role permissions in web scenarios, which is not equivalent to business product entitlement.

- **67.** Product discovery appears in Overview's Explore products area, web product navigation/catalogues, mobile More navigation, and product-specific not-configured states.

- **68.** Web products support Get started, Continue setup, Open configuration, and setup-progress states.
  - Mobile promotions currently open the module grid rather than a complete interest or activation flow.
  - This is a cross-platform parity gap.

## 69–80: Overview

- **69.** Overview is interactive in the prototype.
  - Alerts navigate to filtered operational areas; recent payments open details; Payments and Settlement cards open history; quick actions start tasks; product banners open discovery.

- **70.** Aggregate cards link to the relevant module, whose operational view remains channel-specific.
  - Alerts can carry a relevant status filter.
  - A fully combined underlying list is not required.

- **71.** The strongest cross-platform metrics are today's collected amount, payment count, failures, today's settled amount, amount remaining, next settlement, and money-blocking exceptions.

- **72.** Store managers receive in-store scope, permitted operational modules, and a store filter when they manage multiple stores.
  - They do not need an online selector when they lack online entitlement/access.

- **73.** The Store Cashier permission model supports transaction viewing and service requests but not settlement visibility.
  - The prototype's mobile shell does not yet enforce this gating, so the cashier Overview remains a specification rather than implemented behaviour.

- **74.** Overview does not show a permanent side-by-side channel contribution.
  - It uses All channels, In-store, and Online scope selection to recalculate the cards.

- **75.** The decision document distinguishes a new merchant with no historical transactions from an existing merchant with zero activity in the selected period.
  - The first receives an explanatory first-time state; the second sees legitimate zero values.

- **76.** Partial or delayed channel data is not comprehensively implemented.
  - One web scenario handles a bank holiday by explaining why settlement did not run rather than showing a misleading zero.

- **77.** The intended distinction is explicit language: no activity should show zero or a first-time state; unavailable data should state that information is delayed or unavailable and avoid presenting zero as fact.

- **78.** Default Overview period is Today.
  - The web analytics section currently defaults to Yesterday, creating a secondary inconsistency below the primary cards.

- **79.** Single-channel merchants see the same Overview structure scoped to their available channel, with no redundant channel control.
  - Online-only merchants have no store filter.

- **80.** Priority is: money-blocking issues when present; today's collection and payout certainty; quick operational actions and recent payments; product promotion last.

## 81–90: Mobile app

- **81.** The mobile app is designed for a daily, short cash-flow check and immediate operational tasks, especially confirming a payment or checking whether money will settle.

- **82.** Within the first few seconds, the merchant should understand whether money is blocked, how much was collected today, how many payments occurred or failed, how much settled, and what remains.

- **83.** Store-floor tasks represented in mobile include finding a payment, reviewing transaction status, checking settlement, starting a refund, managing devices/stores, and opening support.

- **84.** Prominent shortcuts are Find a payment, Create payment link, Refund a payment, Download a report, Payments, and Settlements.
  - Money-blocking alerts appear above them when relevant.

- **85.** Today's collection, recent payments, today's settlement, amount yet to settle, next settlement, and action-needed alerts are available without opening filters.

- **86.** Push-notification destinations are not implemented.
  - The Overview notification control is currently disabled.
  - The required pattern remains a deep link into the correct business, channel, and record.

- **87.** Poor-connectivity behaviour is not implemented.
  - The prototype has no clear offline cache, stale-data indicator, queued action model, or retry policy.

- **88.** Biometric, OTP, and step-up authentication decisions are not represented in the prototype.

- **89.** The prototype does not establish intentional mobile exclusions; it currently includes advanced Checkout settings, users/roles, reports, and device management.
  - A product decision is still needed about which high-risk, bulk, or configuration tasks should be web-first.

- **90.** Product recommendations sit below operational content, after a large visual break, under Explore products.
  - They do not occupy primary navigation slots on the Overview.

## 91–100: Web platform

- **91.** Web is designed for longer operational and administrative sessions: monitoring performance, searching records, investigating exceptions, reconciling settlements, exporting reports, and configuring products.

- **92.** Larger-screen work includes data tables, multi-column details, analytics, settlement breakdowns, report configuration, Checkout preview/configuration, users and roles, and device/store administration.

- **93.** Payments, Settlements, Refunds, Disputes, Reports, Stores, Devices, Users, and product configurations all support comparison across multiple records.

- **94.** Bulk-oriented flows include bulk refunds, bulk-upload history, downloads/email of filtered records, role/user administration, report scheduling, and other multi-record management.

- **95.** The prototype supports or exposes downloads for filtered Payments, Settlements, Refunds, Disputes, Reports, and Payment Links.
  - Some areas also support emailing filtered results.

- **96.** Reports can be generated, customised, and scheduled.
  - Delivery supports email and SFTP in the web implementation; mobile also exposes generation and scheduling, though the deeper web workflow is better suited to administration.

- **97.** Web-first configuration opportunities include gateway configuration, routing, Checkout branding/pay modes, webhooks, credentials, settlement preferences, products, stores/devices, and detailed account settings.

- **98.** Web provides the deepest users-and-roles model: invite/edit/deactivate users, custom roles, permission groups by channel, store assignment, pending approvals, and legacy-role migration.
  - Mobile implements many of these flows too, so final platform ownership remains open.

- **99.** Multi-store comparison is supported through store scoping on Overview, store management lists, analytics, and channel/store filtering.
  - The prototype does not yet provide a dedicated store-comparison dashboard.

- **100.** Web's value beyond a larger mobile screen is density and control: tables, simultaneous fields, advanced filters, bulk operations, downloads, scheduling, detailed configuration, and multi-record investigation.

# 7. Cross-platform capability model inferred from the prototype

| **Area** | **Mobile emphasis** | **Web emphasis** |
| --- | --- | --- |
| Overview | Immediate reassurance, alerts, recent activity, quick actions | Broader overview, analytics, customisation, comparison |
| Payments | Find and verify a recent payment | Search, filter, investigate, export, compare |
| Settlements | Check payout and what remains | Reconcile batches, deductions, accounts, and preferences |
| Refunds | Start or track an individual refund | Bulk refunds, history, filtering, export |
| Disputes | Respond to a time-sensitive case | Investigate cases and evidence in detail |
| Reports | Generate or access a routine report | Customise, schedule, deliver, and manage report history |
| Devices and stores | Store-floor status and direct actions | Fleet/store administration and comparison |
| Payment Links | Create, copy, duplicate, and share quickly | Manage, filter, download, and configure at scale |
| Checkout | Preview and modify settings | Detailed gateway, brand, pay-mode, and integration configuration |
| Users and roles | Lightweight access administration | Detailed roles, permissions, migration, and audit-oriented administration |
| Support | Ask for help in context and track a ticket | Manage cases and access detailed knowledge/history |

# 8. Decisions and conflicts requiring resolution

- **1. Where business selection occurs:** entry flow, persistent header, profile menu, or Account Settings.

- **2. What the business switcher displays:** current prototype does not implement Business name + Merchant ID + entitlement badge.

- **3. Remembered business:** stated intent says no; web prototype remembers it.

- **4. Reset semantics:** stated intent says switching business resets all filters; mobile currently preserves channel.

- **5. Channel persistence on web:** intended to carry between modules; currently page-local.

- **6. Overview drill-down:** stated intent says combined metrics stay on Overview; prototype links cards to default In-store operational views.

- **7. Entitlement versus permission:** configured business channels and a user's access scope are different concepts but are currently conflated in parts of the prototype.

- **8. Mobile permission enforcement:** role permissions exist, but the mobile shell currently exposes all modules.

- **9. Mobile activation flow:** product promotion exists, but Get started/Continue setup is substantially more complete on web.

- **10. Notifications, poor connectivity, and step-up authentication:** not designed in the current prototype.

- **11. Platform ownership:** mobile currently reproduces many complex web administration workflows, so the intended mobile-versus-web responsibility model is not yet fully expressed.

# 9. Recommended documentation set

- **1. Pine One Cross-Platform Experience** — product vision, entity model, common IA, channel rules, roles, terminology, and web/mobile responsibilities.

- **2. Overview and Business Health** — combined metrics, attention states, role gating, store/channel scope, and drill-down rules.

- **3. Payments** — In-store and Online views, fields, states, details, search, refund entry, and platform differences.

- **4. Settlements and Reconciliation** — channel cycles, batches, deductions, accounts, on-demand settlement, reports, and exception states.

- **5. Refunds and Disputes** — individual and bulk operations, approvals, evidence, deadlines, and recovery.

- **6. Products** — Devices, Stores, Payment Links, Checkout, payment modes, activation, and cross-sell.

- **7. Users, Roles, and Permissions** — channel permissions, store access, invitations, approvals, and platform ownership.

- **8. Reports** — catalogue, history, generation, customisation, scheduling, delivery, and mobile/web behaviour.

- **9. Support** — contextual entry, self-service, tickets, handoff, and resolution tracking.

- Each module document should contain shared business rules first, followed by explicit Web, Mobile, and Cross-platform continuity sections.
- Web and mobile should not have separate sources of product truth.
