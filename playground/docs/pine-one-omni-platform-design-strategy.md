---
title: Omni platform design strategy
description: Platform goals, design principles and decisions for unified login and merchant operations across web and app; parent of every module document.
kind: Design strategy
date: 2026-10-05
topics: [in-store, online, strategy, principles, login, platform]
source: docs/exports/omni-design-suite/Pine One Omni Platform Design Strategy.docx
---

Updated: 5 October 2026

Scope: Unified login, business selection and merchant operations across web and app

Review status: Proposed strategy for product and design alignment

Design owner, product owner and launch milestone: To be assigned

# Overview

- Pine One brings in-store and online payment operations into one merchant experience.
- One identity replaces separate portal credentials, and the person selects a linked business before entering its permitted workspace.
- We want an owner to understand the business without adding figures from separate platforms, a cashier to confirm a payment with confidence, and an administrator to investigate and reconcile records with enough detail to finish the task.

- The design direction is to organise Pine One around the merchant's business and the work they need to complete.
- Overview can answer questions across channels.
- Payments, Settlements, Refunds, Disputes and Reports retain channel-specific views where the information and available actions differ.
- Web and app share these rules while adapting the sequence, density and prominence of information to the task context.

- This document establishes platform goals, shared design principles and decisions.
- The Pine One User Personas and Behaviour Reference is the canonical source for role-based personas, task lenses and recurring behaviour hypotheses.
- Module documents cite those IDs and add only module-specific needs, journeys, states and measurable outcomes.
- Product and design reviewers should align on the shared rules and resolve the open questions before treating the proposal as a release specification.

## Project scope

- The first phase introduces a unified login and a net-new dashboard while the legacy portals continue during transition.
- It covers already-onboarded merchants, curated mapping for the small set of existing omnichannel businesses, business selection, Overview, shared operational modules, devices and stores, Payment Links, Checkout, access administration and contextual support.
- Business onboarding and KYC continue through the existing channel journeys in this phase.
- Existing merchant IDs remain in use.
- Online payments have no store construct; in-store merchants can have multiple stores.

## How to read the evidence

- **Stated direction** records the product intent supplied during discovery. **Prototype finding** records behaviour documented in the 1 October discovery review or an existing journey document. **Hypothesis** describes a user behaviour or expected benefit that needs research. **Proposal** is a design recommendation for review.
- Prototype behaviour alone does not confirm a merchant need or an approved product decision.

- The discovery review establishes platform fragmentation and the intended capability set.
- Five merchant reports now document matching workflows, reporting problems, access needs and prototype comprehension in specific contexts.
- Their stable R01–R05 references and evidence limits are maintained in the separate WIP persona document.
- Task frequencies, support volumes and usability baselines remain unmeasured; the reports do not establish unified-channel or app-versus-web preference.

# Persona and behaviour references

- The platform serves P1 Business owner or merchant administrator, P2 Store manager, P3 Cashier or frontline staff member, P4 Finance or operations administrator and P5 Access administrator.
- These roles and their evidence gaps are defined in the Pine One User Personas and Behaviour Reference.

- The platform strategy relies most heavily on B01 Establish context before interpreting data, B03 Scan for exceptions before investigating, B05 Keep operational records separated by channel, B06 Distinguish collection, refund and settlement stages, B10 Judge trust through status and freshness, B12 Choose platform according to task depth, B13 Re-establish business context each session and B14 Expect access to shape the workspace.
- Product discovery also refers to B11, and support refers to B15.

- The research adds B16 Match Pine One data with external evidence, B17 Close a trading period rather than a calendar date alone and B18 Find capabilities through familiar tasks and language.
- These affect reporting, time scope and navigation across modules.
- Cite the relevant P/B/R identifiers and source section from the canonical reference; retain shared workflow descriptions there.

- Single-channel, omnichannel, single-store, multi-store and multi-business are context dimensions rather than separate personas.
- Module documents should cite the relevant persona, task-lens and behaviour IDs instead of restating these general profiles.

# Problem and motivation

## Merchants must assemble a business picture themselves

- The current in-store and online experiences are separate.
- A merchant using both must visit different platforms and combine figures to understand overall performance.
- This is a stated problem; its frequency and time cost have not yet been measured.
- Unifying the entry point and relevant Overview information removes that platform-switching requirement, provided the totals use comparable definitions and clearly state their scope.

## A shared destination can still be difficult to understand

- Combining products introduces choices about business, channel and store.
- If a person cannot tell which context applies, they can interpret a correct number incorrectly.
- The discovery review records missing merchant IDs and channel badges in business switchers, different channel-persistence behaviour across web and app, and incomplete mobile permission gating.
- These are prototype findings that expose decisions the design must resolve.

## Separate identities create friction before the work begins

- Online users currently enter through email, password and mandatory two-factor authentication, while in-store users may use email, phone or username and are mapped differently to merchant IDs.
- A merchant working across both systems can maintain two credentials and two account models.
- The target experience resolves one person to one identity, then applies account membership, channel entitlement, role, store scope and permissions.
- This simplifies entry only if migration preserves legitimate access and incorrect account linking cannot expose another business.

## Payment success does not answer when money is available

- Users have different questions at different stages: whether a customer paid, what was collected and what reached the bank.
- P2/P4 and B06 have research support for those task boundaries (R01 Mental Models; R02 Daily Workflow; R04 Settlement Mechanism).
- We propose connecting the stages with evidence and explanations.
- Improved comprehension and reduced avoidable support contact remain outcomes to test in the Settlements module.

## Operational work continues outside Pine One

- B16 shows that merchant work may finish in Excel, bank reports or an accounting system.
- Unified channel information can reduce switching between Pine Labs products, but it does not remove external matching.
- Require complete exports with the same scope as the screen, supported matching references and predictable schemas (R01/R02 Pain Points; R05 Payment Reconciliation Challenges and EMI Reporting Issues).
- Report schedules and integration options need separate module scoping.

- B17 adds shift and trading-period scope to the platform context model.
- Date alone can misrepresent a close that crosses midnight.
- Transactions and Reports should carry explicit start/end times, timezone and applicable device/store scope into exports; Settlements must distinguish collection period from bank-credit period (R03 Action Items Captured; R04 Behaviour and Day to Day Work).

## More capabilities can obscure frequent tasks

- The business wants increased engagement, relevant product adoption and lower costs from maintaining one platform.
- Those goals depend on users completing useful work.
- Introducing paid services while someone is checking a failed payout can divert attention from their immediate need.
- Product discovery should be relevant, explain value and cost, and follow the operational information hierarchy.

# Goals and success measures

- We define engagement as repeated successful use for meaningful merchant tasks.
- Longer sessions, more clicks or repeated checking caused by uncertainty do not demonstrate improved usability.

| **Platform goal** | **User outcome** | **Proposed measure** |
| --- | --- | --- |
| G1 Business clarity | Correctly understands business, channel, store and period | Correct interpretation rate in scenario testing; wrong-scope errors |
| G2 Reliable self-service | Finds an answer or completes an action independently | Unassisted task success; task time; avoidable contacts per active merchant |
| G3 Useful engagement | Returns when a recurring operational need arises | Weekly merchants completing a defined core task; repeat completion over four weeks |
| G4 Relevant adoption | Understands and activates a useful product | Activation and first meaningful use among eligible exposed merchants |
| G5 Consistent platform | Can move between web and app without relearning meanings | Cross-platform task success; inconsistent-state defects; separate-platform dependency |

- Baselines and numerical targets are to be set after reviewing analytics and support data.
- Measure web and app separately, then segment by role, channel configuration and store count.
- Use successful task completion, comprehension and support resolution as guardrails for adoption experiments.
- Track platform-maintenance savings separately with engineering and operations; a UX change cannot establish that saving on its own.

# Requirements

- **Priorities below are proposed:** P0 means necessary for the unified experience; P1 means important to useful adoption and continuity.
- Final release sequencing remains a product decision.

| **ID and user story** | **Design implication** | **Priority** |
| --- | --- | --- |
| R1 As a linked user, I need to choose the right business | Business identity and current selection remain clear | P0 |
| R2 As an owner, I need an overall business picture | Overview supports comparable all-channel information | P0 |
| R3 As an operator, I need the right channel detail | Operational modules keep channel-specific records and actions | P0 |
| R4 As a single-channel merchant, I need direct access | Hide redundant channel selection | P0 |
| R5 As a staff member, I need my permitted working scope | Apply role, channel and store access consistently | P0 |
| R6 As a merchant, I need to distinguish zero from missing information | Show unavailable or delayed data explicitly | P0 |
| R7 As a returning user, I need predictable navigation context | Carry channel across shared modules; reset filters on business change | P0 |
| R8 As a user on either platform, I need familiar meanings | Share terminology, record identity and status definitions | P0 |
| R9 As a merchant, I need to judge a new product's value | Explain benefit, eligibility and charges before commitment | P1 |
| R10 As a user with an unresolved issue, I need relevant help | Carry record context into support and show what happens next | P1 |
| R11 As a returning user, I need one identity for my linked businesses | Resolve permitted account memberships before showing business data | P0 |
| R12 As an access administrator, I need to grant the right scope | Separate role permissions, channel entitlement and account or store scope | P0 |
| R13 As a reconciliation user, I need complete evidence outside the screen | Keep exports consistent with the displayed scope and expose supported matching keys; B16 | P0 proposed |
| R14 As a store operator, I need a trading period that matches our close | Define explicit time windows and timezone across Transactions and Reports; B17 | P1 proposed |
| R15 As a user, I need to discover the task I came to complete | Test report, support, product and access entry points without prompting; B18 | P1 proposed |

## Out of scope

1. Business onboarding and KYC. Phase one redirects these journeys to the existing channel systems.
2. Resolving missing, incorrect or ambiguous backend account mappings and migration audit flows.
3. Creating new merchant IDs or introducing stores for online payments.
4. Committing to unvalidated persona frequencies, conversion targets or support reductions.

# Proposed solution and design

## Behaviour led design principles

- **Business and scope precede interpretation, referring to B01 and B13.**
  - Keep business identity visible and make switching deliberate.
  - Use the business name, merchant ID context and configured-channel badge to distinguish similar businesses.
  - The treatment for a business with several merchant IDs needs review.

- **Access shapes the workspace, referring to B14.**
  - Login proves identity; membership determines which business and channel the person may enter.
  - After login, show the current linked business list and require a business selection for the session.
  - Do not reuse the last business silently across sessions.

- **Answers lead to evidence, referring to B03, B04 and B05.**
  - Use familiar operational areas across channels.
  - Keep combined information in Overview and allow channel-specific investigation within shared modules while preserving differences such as Online orders and In-store terminal context.

- **Recurring work has direct entry, referring to B03, B16 and B18.**
  - Overview supports a scan, while Reports, Transactions and Settlements remain easy to reach for users who begin there.
  - Do not require a summary detour to obtain a routine export.
  - Store matching and bank matching require distinct evidence paths.

- **Money stages remain distinct, referring to B06.**
  - Collection, refund, settlement and bank receipt must have distinct meanings.
  - Each module should explain the current state, the reason where known and the next available action.

- **Task depth informs platform emphasis, referring to B12.**
  - A brief app check should expose the amount, status and immediate action first.
  - Web can expose more evidence together when comparison is the task.
  - Important limitations and charges remain visible when they affect a decision.

- This platform split is a proposal.
- The merchant reports support detailed matching and export needs but seldom identify the device used for each task.
- Owner entry and mobile task boundaries require direct validation.

- **Investigation context remains predictable, referring to B07.**
  - Carry a selected channel between shared modules within a business.
  - Reset filters when the user changes business.
  - Always communicate the resulting scope.

- **Freshness and uncertainty remain visible, referring to B10.**
  - A loading state, stale value or missing channel must not look like a confirmed zero.
  - If only part of a combined total is available, describe the available scope and incomplete state.

- Report completeness and screen/export agreement are part of this principle.
- Investigate missing, duplicated or changing records rather than using interface changes alone to imply reliability (R01/R02 Pain Points; R04 Issues Reported; R05 Payment Reconciliation Challenges).

## High level user journey

**Journey**

1. Enter email or username and password
2. Complete email OTP when the identity has Online access
3. Select a linked business
4. Understand permitted business activity
5. Choose a task
6. Confirm channel and store scope where applicable
7. Inspect or act
8. Receive a clear outcome or next step

- For a cashier, the journey can go directly to finding a payment.
- An owner's short Overview visit remains a working scenario.
- A store manager may enter Reports directly for close; finance may open Transactions or Settlements for external matching (B03, B16; R01 Nightly Workflow; R02 Daily Workflow).
- Completing the intended task is the outcome, whether the visit is short or involves substantial reconciliation.

## Shared platform decisions

- **D1 Shared operational structure — stated direction.**
  - Overview, Payments, Settlements, Refunds, Disputes and Reports form the shared operating model.
  - Devices and stores belong to in-store payments; Checkout and Payment Links belong to online payments.
  - The final customer-facing naming of Payments versus Transactions requires alignment.

- **D2 Aggregate Overview with separate operational views — stated direction.**
  - Overview may combine channel data.
  - Operational lists do not combine channels.
  - A scope switcher remains visible at the top of web and app for users who can access both channels.
  - A user sees only the permitted parts of Overview; unavailable modules and controls are hidden.
  - Detail entry must preserve the selected channel rather than silently changing scope.

- **D3 Channel availability — stated direction.**
  - Show channel selection when the user can access both channels; omit it when only one channel is permitted.
  - A business may have both products while a particular user sees only one.
  - Product configuration and user entitlement remain separate facts.

- **D4 Business and channel persistence — stated direction.**
  - After credentials and any required OTP, show the current linked business list and require selection for the session.
  - Do not persist the selected business across sessions.
  - Within the selected business, default to In-store when both permitted channels are available and to the only available channel otherwise.
  - Carry the active channel across shared modules.
  - Business changes reset filters.

- **D5 Store scope — stated direction.**
  - Store filtering belongs to in-store data.
  - Online data has no store identifier.
  - In a combined Overview, the effect of selecting a store must be explicitly decided; online money must not appear attributed to that store without a supported association.

- **D6 Operational hierarchy — proposal grounded in existing decisions.**
  - Prioritise actionable issues blocking money, then the relevant collection and payout summary, followed by task entry and product discovery.
  - Existing homepage guidance puts settlement first on web and records a mobile override leading with collection.
  - This platform-specific hierarchy needs validation against the working personas.

- **D7 Product discovery — stated direction with proposed safeguards.**
  - Show benefits for products not configured for the business.
  - A promotion should lead to an understandable next step such as activation or requesting information.
  - Paid services show charges and expected benefit before confirmation.
  - A user's lack of permission must not be described as a product not being configured.

- **D8 Identity and authentication — stated direction.**
  - A central identity represents one person and can hold several account memberships.
  - Email or retained in-store username can identify the user.
  - Email OTP is required when the identity has Online access; an in-store-only identity does not receive that added step.
  - Sensitive financial and access changes may require step-up authentication, subject to security approval in the relevant module.

- **D9 Roles and permissions — stated direction.**
  - Authorisation combines account membership, channel entitlement, role permissions and applicable store scope.
  - Migration should preserve existing legitimate access.
  - New custom roles may combine Online and In-store permissions, but adding a channel does not grant it to every existing user by default.

- **D10 Connectivity and incomplete data — stated direction with an implementation dependency.**
  - When current data cannot load or synchronise, show a connectivity or freshness message and allow the user to try again later.
  - Do not present cached or partial values as complete current totals.
  - Offline actions are not promised.

- **D11 Research-informed task entry and reporting — proposal.**
  - Support direct operational entry, clear report/access/support labels, and export evidence with explicit time and location scope (B16–B18).
  - Existing D2 channel separation and D4 every-session business selection remain stated decisions; R01–R05 do not validate those interactions.
  - Product must confirm report scheduling, bulk access administration and API delivery scope before they become release commitments.

## Web and app behaviour

- These are proposed emphases, not a final feature-exclusion list.
- The product execution plan commits phase-one web flows but leaves the mobile transition strategy open.
- The app expectations below guide experience consistency; they do not by themselves commit every module to the first release.

| **Task context** | **App emphasis** | **Web emphasis** |
| --- | --- | --- |
| Check current business health | Brief scan of collection, payout and actionable issues | Summary with entry to investigation and analysis |
| Verify a payment | Search or recent activity; clear status and matching details | Search, filters and record comparison |
| Understand settlement | Amount, expected timing, reason and next step | Batch and payment breakdown, deductions and reconciliation |
| Create a payment link | Short creation flow and direct sharing | Management across links and export |
| Manage reports and access | Inspect or complete a routine task, subject to task research | Matching exports, stable schemas and administration across records; scheduling/bulk access scope pending |
| Close a store or shift | Period totals and exception access if supported | Time/device scopes, mode totals and matching exports; B16, B17 |
| Select a business | Touch-friendly list of linked businesses after login | Searchable list when account volume requires it; selection still occurs each session |

- Both platforms use the same record identifiers, financial definitions and access rules.
- Proposed deep links should resolve the correct business and channel after an access check.
- Cross-device synchronisation of drafts, filter state and unfinished tasks is not established; each module must state what continuity is actually supported.

## Pros and tradeoffs

- The shared task structure reduces dependence on knowing Pine Labs' separate business verticals.
- Channel-specific views preserve useful domain detail, but introduce a scope choice that needs clear defaults and persistent context.
- A concise app experience supports a quick check, but hiding too much can block investigation; test access to deeper detail before excluding it.

- Role-based relevance reduces clutter but depends on correct permissions.
- Product discovery can improve adoption, but must be evaluated against task completion and comprehension.
- Combined summaries are convenient but require compatible metric definitions and explicit handling of partial data.

## Dependencies

- The design depends on the central identity provider, curated account mapping, product configuration, role and store permissions, comparable metric definitions and reliable status data.
- Migration must operate safely while legacy portals remain available.
- Settlement explanations depend on actual reason and expected timing data.
- Contextual support depends on support systems accepting the relevant record identifiers.
- Each module must specify the fallback when a dependency is unavailable.

## Mockups and design review

- Use the web and mobile prototypes linked through the discovery record as existing design evidence.
- Final annotated frames should cover business selection, dual- and single-channel operation, role restrictions, aggregate Overview, store scoping, missing data and contextual product discovery.
- Frame links and final state annotations are pending; this strategy does not claim visual sign-off.

# Module documents and goal alignment

- Keep one parent strategy and one document per coherent module or journey.
- Each module records shared rules first, then app and web behaviour.
- Create a separate platform child document only when a journey is substantial enough to need independent review; link it back to the shared rules and record any proposed exception.

| **Module** | **Proposed local outcome** | **Platform link** |
| --- | --- | --- |
| Login and Identity | Enters once and selects the intended linked business without duplicate identity or account confusion | G1, G2, G5 |
| Overview | Correctly understands current business and next action | G1, G2, G3 |
| Payments | Confirms or investigates a payment with less effort | G1, G2, G3 |
| Settlements | Explains payout amount and timing; reduces avoidable support contact | G1, G2, G3 |
| Refunds | Completes an eligible refund and understands progress | G2, G3 |
| Disputes | Submits the required response within the available time | G2, G3 |
| Reports | Obtains complete matching evidence with consistent scope and format; B16, B17 | G1, G2 |
| Devices and Stores | Identifies the affected device or store and completes the right next step | G1, G2 |
| Payment Links and Checkout | Collects online payments and configures relevant capabilities | G2, G4 |
| Users and Roles | Grants appropriate access with fewer scope mistakes | G1, G2, G5 |
| Support | Reaches relevant help and understands case progress | G2, G5 |

- A local goal should have an explicit reasoning chain.
- **For Settlements:** unclear payout timing → repeated uncertainty and possible support contact → show expected timing, reason and next action upfront → test whether merchants can explain what happens next → measure avoidable contacts and comprehension.
- Ticket reduction must accompany successful resolution, not reduced access to help.

# Open questions and validation

1. Which documented tasks recur most often, on which platform, and who owns them? R01–R05 establish qualitative matching, reporting and support needs; owner entry, frequencies and app-versus-web preferences still need study.
2. How should a business with several mapped merchant IDs be named and distinguished in the post-login selector without exposing internal identifiers that do not help the user?
3. What should happen to Online data in a combined Overview when an in-store store filter is active? The current rule prevents Online money from being attributed to a store, but the resulting summary treatment still needs a decision.
4. Which tasks need the full web workflow, and which must be completed in the app? Bulk refunds, report scheduling, configuration and permission management remain pending platform decisions.
5. What freshness guarantees can each service support? The agreed user-facing fallback is to show a connectivity or freshness problem and ask the person to check later; cache duration and retry behaviour need engineering input.
6. Which task and support baselines can be measured before launch? The design owner and product manager own the baseline plan, and module targets will be added later.
7. Web homepage guidance currently leads with settlement, while the mobile hierarchy leads with collection. Is that difference intentional for the target tasks, or should both platforms use the same first business answer? This is the specific hierarchy conflict that requires validation.
8. Which legacy roles can be mapped without change, and which need a generated custom role to preserve the union of Online and In-store permissions?
9. What proof, review and rollback process is required before an Online and In-store entity can appear as one business?
10. Which report schemas and matching keys must remain stable for merchant accounting, and how will screen/export completeness be verified?
11. What trading-day and shift definitions apply across midnight, and how should payment/device/store filters combine?
12. Which support, report and administration entry points can each role find without prompting, and which labels need task-specific clarification?

- Use merchant interviews and observation to test task context, then moderated prototype tasks to test comprehension and completion.
- Include all three channel configurations, single- and multi-store businesses, restricted staff roles and people responsible for several businesses.
- Test the same task on web and app where practical.
- After release, compare equivalent cohorts and check whether gains reflect design changes, transaction volume, staffing or service reliability.

# Alternatives considered

- **Separate navigation by business vertical:** preserves existing structures but requires the user to understand channel boundaries before choosing a task.
  - The proposed shared task structure better supports one merchant destination.

- **One combined operational list:** offers a single search surface, but conflicts with the stated direction and the differing channel fields and actions.
  - Keep aggregation in Overview and revisit combined search only as a separate product decision.

- **Identical screens across web and app:** reduces visual variation but constrains both quick checking and detailed comparison.
  - Share meaning and business rules, then adapt the interaction to the task.

- **Give every product equal prominence:** increases exposure but risks burying routine operational work.
  - Use contextual discovery and measure downstream useful adoption.

- These alternatives are documented here for review; no comparative experiment has yet established their relative performance.

# Appendix and references

- Pine One Cross-Platform Experience Discovery Findings, 1 October 2026: docs/flows/pine-one-cross-platform-discovery.md. Retains the numbered discovery answers and prototype gaps.
- Merchant Homepage Experience: docs/flows/merchant-homepage.md. Existing homepage decisions, including the mobile hierarchy override.
- V3 Settlements Flow: docs/flows/settlements-v3.md. Existing summary, payout-mode and batch-detail behaviour.
- Unified Login and Identity for Omni Merchant Dashboard PRD, supplied 5 October 2026.
- Roles and Permissions on Omni, supplied 5 October 2026.
- Settlement on Omni Dashboard, supplied 5 October 2026.
- Refunds on Pine One Unified Dashboard, supplied 5 October 2026.
- Omni Channel Experience Product Strategy and Execution Plan, supplied 5 October 2026.
- Canonical personas, behaviours and research register: docs/design/pine-one-user-personas-and-behaviours.md, especially B03, B06, B10, B16–B18 and R01–R05. Original reports and evidence limits are maintained there.
- Companion modules: docs/design/pine-one-login-identity-design-document.md, docs/design/pine-one-roles-permissions-design-document.md, docs/design/pine-one-settlements-design-document.md and docs/design/pine-one-refunds-design-document.md.
- Companion authoring template: docs/design/pine-one-module-design-template.md.
- Design Document Template; Alexa Grocery Smart Basket; eSign end user experience; AA Consent flow revamp, supplied 5 October 2026. References for structure and rationale style only; their customer data and outcome targets do not apply to Pine One.
