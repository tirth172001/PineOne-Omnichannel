---
title: Refunds design document
description: Online and In-store refund visibility, initiation, approval and configuration.
kind: Module design
date: 2026-10-05
topics: [in-store, online, refunds]
source: docs/exports/omni-design-suite/Pine One Refunds Design Document.docx
---

Updated: 5 October 2026

Parent: Pine One Omni Platform Design Strategy

Scope: Online and In-store refund visibility, initiation, approval and configuration

Review status: Proposed module design

Design owner, product owner and launch milestone: To be assigned

# Overview

- Pine One should let an authorised merchant find a successful payment, understand the amount still eligible for reversal, initiate the appropriate refund and track its progress.
- Online and In-store refunds share this journey but retain channel-specific payment methods, references and operational rules.

- This module supports reliable self-service (G2), useful engagement (G3) and platform consistency (G5).
- The local goals are to reduce avoidable refund-support work, prevent invalid or duplicate refund requests and make pending approvals or processing states understandable.

- Phase one product planning defines the complete web workflow.
- App coverage beyond routine viewing and a single-refund journey remains a platform decision and is labelled as a proposal here.

# User and behaviour references

- P2 Store manager or another permitted T5 Delegate may initiate a single refund only where the merchant grants that capability.
- P1 Business owner or merchant administrator and P4 Finance or operations administrator may adopt T1 Approver or T2 Configurator when explicitly permitted.
- T4 Bulk operator is a proposed refund responsibility, not an established practice in the current merchant research.

- The design refers to B04 Move from an answer to supporting evidence, B05 Keep operational records separated by channel, B06 Distinguish collection, refund and settlement stages, B07 Resume an interrupted investigation, B09 Seek consequences before a high-impact action, B10 Judge trust through status and freshness and B12 Choose platform according to task depth.

- Refund-specific needs remain in this document: the requester must see original payment, refundable amount and approval requirement; the approver needs requester and consequence context; the bulk operator needs row outcomes and duplicate-safe retry; the configurator needs channel-specific policy scope.

## Research implications

- Use P5/B08/B14 and R04 Issues Reported from the canonical reference: Connplex wants admin-only initiation while managers retain operational access.
- R03 Issues Raised describes a manual refund chain and full-refund practice; partial refunds are a potential need.
- R02 Refund Workflow describes external bank refunds, not Pine One usage.
- R01 has inconsistent refund notes and did not test refund tasks.
- These findings support testing authority and external-workflow transition without claiming demand for every refund mode or role assignment.

- B06 and B16 require honest visibility limits: the platform must not count an external bank refund as a known Pine One refund without supported data.
- Refund initiator, approver, configurator and bulk roles must be validated with the actual operators; being a manager or finance user alone does not grant authority.

# Problem and motivation

- Refund capability is distributed across payment detail, channel-specific systems, permissions and settlement effects.
- A user may not know whether a payment method is supported, whether the 180-day window has expired, how earlier partial refunds reduce the remaining amount or why a request is waiting.

- The design should connect the refund to its original payment or Online order, show the applicable rule before entry, and preserve channel scope.
- A refund is deducted from merchant settlement according to backend rules; the interface should explain the state without promising a customer credit time that Pine Labs has not committed.

# Goals and success measures

| **Local goal** | **Proposed measurement** | **Parent goal** |
| --- | --- | --- |
| Complete an eligible refund correctly | Valid refund completion and input error rate | G2 |
| Understand status and approval | Correct status and next-step interpretation | G2, G3 |
| Resolve bulk outcomes | Successful job submission and failed-row recovery | G2 |
| Configure access safely | Permission and policy assignment accuracy | G5 |
| Reduce avoidable refund contacts | Refund contacts per 1,000 requests, segmented by reason | G2 |

- Set baselines separately for channel, single and bulk requests, approval configuration and platform.
- Guardrails include duplicate requests, excess refunds, unauthorised actions and unresolved customer cases.

# Requirements

| **ID and user story** | **Design implication** | **Priority** |
| --- | --- | --- |
| F1 I need to see refunds for my permitted channel | Show a channel-specific summary, list and details | P0 |
| F2 I need to find the original payment or order | Search and link refund records to their source | P0 |
| F3 I need to know how much remains refundable | Calculate full and partial refund availability across earlier refunds | P0 |
| F4 I need to initiate one refund | Support payment-level entry and Online order selection | P0 |
| F5 I need to approve a request when policy requires it | Show pending work and decision context to authorised approvers | P0 |
| F6 I need to submit and inspect a bulk job | Validate upload, log requester and show row outcomes | P1 |
| F7 I need to export refund records | Download a correctly scoped refund report | P1 |
| F8 I need to manage refund policy | Configure channel, payment method, refund type and approval mode | P1 |
| F9 I need actions limited by permission | Enforce view, initiate, bulk, approve and settings permissions | P0 |

## Out of scope

1. Refund wallet or refund-credit top-up.
2. Refund via payout for requests beyond the normal expiry window; the supplied plan keeps it on the Online Admin Dashboard in phase one.
3. A new committed customer credit turnaround time.
4. In-store void execution on the dashboard. Void remains a pre-settlement POS-device capability unless separately scoped.
5. Force refund or prefunding behaviour until product rules are confirmed.

# Mental models and design principles

- **A refund belongs to a successful payment.**
  - Keep the original amount, payment identifier, channel and remaining refundable amount visible throughout the journey.

- **Refundable amount decreases.**
  - Full and partial refunds can coexist only while the sum does not exceed the original payment amount.
  - Show previous refunds before the person enters another amount.

- **Approval and processing are different.**
  - A request can wait for merchant approval before Pine Labs processes it.
  - Use separate labels and next steps rather than one ambiguous Pending state.

- **The customer receives money through the original source.**
  - Current capability supports reversal to source.
  - Do not introduce payout or wallet choices in the primary phase-one flow.

- **Bulk work has row-level outcomes.**
  - A file can complete with a mix of successful and failed requests.
  - Preserve the response file and explain what can be corrected and resubmitted.

# Proposed solution and design

## Channel and scope

- Show Online and In-store as separate views within Refunds.
- Hide the switcher when the user can access only one channel.
- Online supports UPI, cards, net banking and wallet subject to merchant configuration.
- In-store supports UPI and cards.
- The interface must use backend eligibility rather than this document as a static source of truth.

## Refund list and summary

- Show processed and pending summaries for Today, seven days and one month where definitions are agreed.
- The list includes Refund ID, source Transaction or Payment ID, refund amount, original amount, processing status, approval status and available RRN.
- Search and filters should help a user find a customer case without combining channel-specific records.

- The detail page shows refund fields and the relevant original transaction or order fields.
- It also shows earlier refunds against the source, requester, approver where applicable and status history supported by the service.

## Single refund journey

- Start from Refunds, Payment Detail or, for Online, an Order.
- Confirm channel and source → check payment method, age and remaining amount → select full or partial refund → enter amount and reason fields required by the channel → show whether approval is required → review destination and amount → submit → show approval or processing outcome.

- When an Online order contains several payments, the user selects one or more eligible payment IDs.
- The design must prevent the sum of requests from exceeding the refundable amount for each payment.

## Approval

- Refund settings support no approval, approval by a user with permission or OTP-based approval.
- The supplied requirements also mention amount-threshold approval, but the settings list later says only one configured approval method.
- Treat threshold behaviour as unresolved until product reconciles the two statements.

- An approver sees the requester, source payment or order, original and requested amount, previous refunds, channel and any configured threshold.
- Approval permission is independent from initiation permission.
- Home and Refunds may surface pending work, but the alert should open the exact permitted queue.

## Bulk refunds

- An authorised user uploads a CSV or spreadsheet containing Transaction ID and Refund Amount.
- Validate file structure before submission and show row-level errors where possible.
- The bulk history shows file name, uploader, upload time, total requests, successful and failed counts, processing status and downloadable response file.

- The system logs who submitted the job.
- Retry guidance must prevent successful rows from being repeated when failed rows are corrected.

## Refund settings and permissions

- Settings are channel-specific and cover enable or disable, full or partial refund support, eligible payment methods and one approved approval mode.
- Permissions include View Refunds, View Bulk Refunds, Initiate Refund, Initiate Bulk Refund, Approve Refunds and Manage Refund Settings.

- Changing a setting should explain who and which future requests it affects.
- It should not rewrite the status of refunds already submitted unless the backend rule explicitly does so.

- Distinguish business/channel refund availability from an individual's initiation permission.
- Use the Connplex scenario to verify that restricting a manager leaves the authorised admin able to initiate (R04; B14).
- Display supported actor and history details for unexpected refund states; if attribution cannot be established, provide contextual support rather than asserting who initiated the refund.

## External refund visibility

- **Proposal:** explain that this list covers refunds processed through supported Pine One services.
  - A zero-record state does not prove that the merchant made no bank-to-bank or other external refunds.
  - Linking an external refund to its original payment is outside the current scope unless a supported data source and workflow are separately approved (B06, B16; R02 Refund Workflow).
  - Test this wording with merchants moving from manual refund handling.

## App behaviour

- The proposed app experience prioritises finding a payment, seeing remaining refundable amount, initiating one refund and checking status.
- Approval can be included if the security and permission model supports it.
- Bulk upload, detailed configuration and wide-table investigation should not be assumed for app until the platform boundary is decided.

## Web behaviour

- Web supports the full list, filters, report download, Order-based Online selection, approval queue, bulk upload and history, and refund configuration.
- Returning from details should preserve the channel and relevant filters; changing business resets them.

## States and recovery

| **State** | **User-facing treatment** |
| --- | --- |
| Unsupported method | Explain that this payment method cannot be refunded through this channel |
| Expired refund window | State that the standard 180-day window has passed and avoid offering the phase-one payout workaround |
| Amount exceeds remaining refundable value | Show original, previously refunded and remaining amount before correction |
| Approval required | Confirm submission and identify that an authorised approver must act |
| Refund processing | Show current state without promising an unsupported credit date |
| Bulk file has invalid rows | Preserve valid parsing results and provide row-level corrections |
| Partial bulk completion | Separate successful and failed counts and provide a response file |
| Data unavailable | Show a retryable error and do not present missing requests as zero |

# Dependencies and tradeoffs

- The module depends on payment eligibility, remaining-refundable calculations, approval service, permission enforcement, bulk processing, report generation and settlement deduction data.
- Full self-service configuration reduces support work but increases the risk of disabling a needed capability or granting refund authority too broadly.
- Strong consequence summaries and audit data are therefore part of the experience.

# Hypotheses and validation

- **H1:** showing remaining refundable amount and earlier refunds before entry will reduce invalid amount attempts.

- **H2:** separating approval status from processing status will improve next-step comprehension for requesters and approvers.

- **H3:** row-level validation and response files will reduce repeated bulk submissions and support contacts.

- **H4:** a permission model aligned to refund duties will let owners delegate work without granting full refund administration.

- H1–H3 remain untested for the refund workflows in the supplied research.
- H4 has a reported authority need at Connplex, while the proposed interaction still needs validation.
- Include an admin-only initiation scenario, a manager without initiation rights, an unexpected refund state and a merchant using external bank refunds.
- Ask who requests, approves and executes before assigning a role.
- Test full/partial and bulk journeys with appropriate operators; do not infer their frequency from the feature requirements.

- Test single full and partial refunds, repeated partial refunds, an Online order with several payments, threshold or permission approval, an expired request and a partially failed bulk file.
- Include Online, In-store, single-channel and omnichannel businesses.

# Open questions

1. Is amount-threshold approval a separate mode, or a condition within approval by a permitted user?
2. What is the final Online approval requirement from SG, and does it differ from In-store?
3. Which status definitions and failure reasons can both channel services expose?
4. How are up to three user-defined fields used in Online refunds, and when should they appear?
5. What are the final wallet refund rules?
6. Which single-refund and approval actions are required in app for phase one?
7. How do permission changes affect in-flight approvals and active sessions?
8. Who actually requests, approves and executes refunds at each merchant, and what evidence do they require when transitioning from manual handling?
9. What actor/history data can explain unexpected refund states, and how should incomplete attribution be escalated?

# Alternatives considered

- **One broad Refunds permission:** is simpler but cannot separate visibility, initiation, bulk work, approval and policy administration.

- **One combined channel list:** creates a single table but obscures different fields, eligibility and actions.
  - Keep the common module and separate channel records.

- **Refund via payout as a fallback:** extends the expiry window but changes the destination and verification model.
  - Keep it outside phase one as stated in the source requirements.

# Appendix and references

- Parent strategy: docs/design/pine-one-platform-design-strategy.md.
- Personas, behaviours and research: docs/design/pine-one-user-personas-and-behaviours.md, especially P1, P2, P4, P5, T1, T2, T4, T5, B04–B10, B12, B14 and B16; R02 Refund Workflow, R03 Issues Raised and R04 Issues Reported. R01 refund notes are inconsistent and no refund task was tested. Original source details and limits are in the research register.
- Roles and Permissions module: docs/design/pine-one-roles-permissions-design-document.md.
- Refunds on Pine One Unified Dashboard, supplied 5 October 2026.
- Omni Channel Experience Product Strategy and Execution Plan, supplied 5 October 2026.
