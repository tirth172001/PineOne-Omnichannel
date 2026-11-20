---
title: Payment Links design document
description: Online link creation, sharing and collection tracking across web and app.
kind: Module design
date: 2026-10-05
topics: [online, payment links]
source: docs/exports/omni-design-suite/Pine One Payment Links Design Document.docx
---

Updated: 5 October 2026

Parent: Pine One Omni Platform Design Strategy

Scope: Online link creation, sharing and collection tracking across web and app

Review status: Proposed module design

Design owner, product owner and launch milestone: To be assigned

# Overview

- Payment Links should help an authorised merchant request a payment without a website checkout and then understand whether the customer actually paid.
- We propose a short creation and sharing path, followed by traceable payment status and direct entry to the relevant Online payment.
- The module supports G2 reliable self-service, G3 useful recurring use and G4 relevant Online adoption.

- Payment Links is an Online product, not a mixed-channel collection list.
- It does not need the shared operational channel selector.
- A business without Online configured can see benefits and an approved activation/enquiry route, while a user without access must not see a false not-configured message.

# User and behaviour references

- P2 or a permitted T5 Delegate may create requests; P4 can investigate collection evidence.
- P1 activation responsibility is a working scenario rather than a validated universal task.
- Apply B02, B04, B06, B09–B12, B14 and B18.
- R02 describes CRM staff creating links; study those operators directly before adding a new primary persona.

## Research implications

- R02 Razorpay Workflow and Prototype Walkthrough describe link creation with patient/appointment details, limited awareness of Pine Labs links and conditional switching interest based on details and charges.
- R01 Prototype Walkthrough records a live link remaining Pending until Get Status.
- These support benefit-led discovery, reference capture and honest status freshness.
- They do not establish mandatory patient fields for all merchants, a universal contact requirement or willingness to migrate every link workflow.

# Problem and motivation

- Creating or sharing a link can be mistaken for receiving money.
- Staff may not know which customer request a payment belongs to, especially when amounts repeat.
- An expired or stale link can also create uncertainty for both merchant and customer.

- The prototype creation sheet asks for amount, description, customer contact, invoice and expiry and supports prefilling for duplication.
- Its seven-day expiry default and contact validation are prototype choices, not approved business rules.
- Duplication must not reuse historical payment success or silently resend a request.

# Goals and success measures

| **Local goal** | **Proposed measure** | **Parent goal** |
| --- | --- | --- |
| Create the intended request | Valid correct-amount links per authorised creation attempt | G2 |
| Share without scope mistakes | Correct recipient/link selection in tasks | G2 |
| Verify collection | Correct paid/pending/expired interpretation with matching payment | G1, G2 |
| Adopt useful Online collection | Activated eligible merchants completing a first successful link payment | G4 |

- Baseline and targets are pending.
- Guardrails include duplicate requests, wrong recipient, exposed customer details and treating stale status as successful collection.
- Separate link creation, sharing and paid conversion; each is a different event.

# Requirements

- Priorities are proposed; P0 covers a trustworthy request, P1 supports recurring management.

| **ID and user story** | **Design implication** | **Priority** |
| --- | --- | --- |
| PL1 I need to create a request for this business | Show Online business identity and authority | P0 |
| PL2 I need the right amount and reference | Validate supported amount, description and merchant reference | P0 |
| PL3 I need to understand expiry and rules | Show explicit expiry/timezone and applicable constraints | P0 |
| PL4 I need a confirmed link I can share | Confirm creation before exposing copy/share | P0 |
| PL5 I need the actual payment outcome | Distinguish link lifecycle from payment lifecycle and freshness | P0 |
| PL6 I need to locate or reuse a request | Search/filter and duplicate with a new reviewed request | P1 |
| PL7 I need relevant product information | Explain benefits, eligibility, charges and a real next step | P1 |
| PL8 I need to investigate a payment | Open the known Online record without losing identity | P0 |

## Out of scope

1. New business onboarding/KYC or automatic migration from another provider.
2. Universal customer/patient data requirements, recurring billing or partial-payment rules without approval.
3. Guaranteed sharing delivery or customer credit timing.

# Mental model and design principles

- **A link requests money.**
  - Creation and sharing are not payment success.
  - A Paid label needs confirmed collection data, not a clipboard event or a customer opening the URL.

- **A reference connects the request to real work.**
  - Explain what description/invoice metadata is for, and capture only approved information.
  - Sensitive patient details are not a generic default.

- **Reusing a form creates a new request.**
  - Duplication can save effort but must review amount, recipient and expiry, with no inherited payment history.

# Proposed solution and design

## User journey and decisions

**Journey**

1. Open Payment Links or a permitted quick action
2. Confirm business
3. Enter amount and supported reference/contact
4. Review expiry and applicable terms
5. Create
6. Receive confirmed URL
7. Copy/share
8. Track actual outcome
9. Open the payment or seek help

- PL1–PL5 and PL8 cover the path.

- **Proposal:** keep creation focused on essential fields, disclose optional metadata clearly and make confirmation carry the link ID, amount and expiry.
- If recipient delivery is part of the service, distinguish its acknowledgement from a manual share action.
- Copy confirmation requires clipboard success; native sharing completion does not imply the customer received or paid.

- Status should expose update time and a supported refresh/Get Status action where necessary.
- Explain expired requests without assuming renewal, cancellation or partial payment capabilities.
- Link management filters and exports remain Online-scoped.

## States and recovery

- Cover unconfigured product, no permission, invalid amount/contact, expired request, creation failure, unknown creation outcome, share failure and stale payment status.
- Check for an existing created request before retrying an uncertain submission.
- Preserve entered details securely within supported session behaviour; do not promise cross-device drafts.

## App behaviour

- **Proposal:** support short creation, review and native copy/share flows, then direct payment lookup.
- Long metadata/configuration tasks need platform review.
- Keep business identity visible throughout and never assume offline creation.

## Web behaviour and continuity

- Support searching multiple links, filtering, reviewing detail and permitted downloads/configuration.
- Keyboard validation should point to the field in error.
- Both platforms use the same link/payment IDs and expiry meaning.
- A supported link detail handoff verifies business access; drafts and recipient lists do not automatically synchronise.

## Mockups and tradeoffs

- **References:** components/payment-links/create-payment-link-sheet.tsx, payment-links-content.tsx and payment-links-listing-content.tsx; app/payment-links.
- Final frames are pending for stale status, duplicate creation, expired links and restricted access.
- More metadata can improve matching but burdens creation and may expose sensitive information; validate essential fields by task.

# Dependencies and validation

- Link creation acknowledgement, collection status, expiry rules, sharing services and permissions determine the outcome.
- **H1:** concise review reduces wrong-amount/recipient requests.
- **H2:** separate link/payment states improves collection verification.
- **H3:** task-led product explanation improves informed first use.
- Test actual creators including Apollo's CRM workflow, repeat amounts, duplicate forms and failed status refresh on both platforms.
- Measure paid conversion separately from usability success.

# Open questions

1. **Product:** which amount, contact, expiry, cancellation and partial-payment rules are approved?
2. **Research/privacy:** which merchant reference fields are essential and safe for each task?
3. **Engineering:** what status latency and Get Status capability can be supported?
4. **Product:** what activation/enquiry handoff and charges should discovery explain?

# Alternatives considered

- A minimal amount-only form is fast but can weaken matching.
- Making every customer field mandatory increases effort without universal evidence.
- Hiding unavailable products prevents discovery; explain benefits while keeping entitlement and authority distinct.

# Appendix and references

- Parent: docs/design/pine-one-platform-design-strategy.md, G1–G4, D1, D7 and D9–D10.
- Canonical reference: docs/design/pine-one-user-personas-and-behaviours.md, P1/P2/P4, T5, B02, B04, B06, B09–B12, B14, B18; R01 Prototype Walkthrough and R02 Razorpay Workflow.
- Discovery: docs/flows/pine-one-cross-platform-discovery.md, answers 48, 67–68 and 84.
- Related modules: Transactions, Online Payment Configuration and Help and Support.
- Decision history: 5 October 2026, proposed creation/status model; prototype defaults and field policy remain unapproved.
