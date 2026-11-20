---
title: Online Payment Configuration design document
description: Online gateway, payment-mode and integration configuration with product discovery.
kind: Module design
date: 2026-10-05
topics: [online, payment methods, configuration]
source: docs/exports/omni-design-suite/Pine One Online Payment Configuration Design Document.docx
---

Updated: 5 October 2026

Parent: Pine One Omni Platform Design Strategy

Scope: Online gateway, payment-mode and integration configuration with product discovery

Review status: Proposed module design with platform ownership pending

Design owner, product owner and launch milestone: To be assigned

# Overview

- Online Payment Configuration should help an authorised merchant understand what is enabled, what still needs setup and what effect a configuration change will have on collection.
- We propose a task-oriented configuration model with clear eligibility, environment, prerequisites and confirmed outcomes.
- It supports G2 reliable self-service, G4 relevant adoption and G5 consistency.

- This document groups gateway configuration, routing, webhooks and credentials because they share integration context and safety requirements.
- It does not create independent release commitments for every prototype setting.
- Checkout owns appearance/preview; Payment Links owns request creation; Settlements owns payout preferences.
- In-store paid capabilities stay with their owning product, not in this Online document.

# User and behaviour references

- T2 Configurator is primary, held by an authorised operator rather than assumed from a job title.
- P4/T3 may investigate an integration issue; P1 discovery and approval remain working scenarios.
- Apply B09–B12, B14–B15 and B18.
- Involve technical implementers as task stakeholders without inventing a validated merchant persona.

## Research implications

- R02 Razorpay Workflow supports clearer discovery of Online collection and explains that switching interest depends on metadata and charges.
- R01/R02 discovery observations support task descriptions, not validated gateway/routing usability.
- R05 Integration and Technical Requirements requests future API access; it is not approval for an API integration release or evidence that merchants understand credentials.
- Configuration research is still needed.

# Problem and motivation

- Product availability can be confused with permission, enablement or integration readiness.
- A merchant may see an enabled capability but still lack working credentials or a verified callback.
- Unexplained routing or paid-service labels can lead to changes without understanding their effect.

- The prototype exposes payment methods, gateway listing, configuration controls and links to credentials.
- Some save behaviour is simulated.
- Treat prototype parameters and success messages as examples, not approved operating policy or reliable activation.

# Goals and success measures

| **Local goal** | **Proposed measure** | **Parent goal** |
| --- | --- | --- |
| Understand readiness | Correct enabled/configured/usable interpretation | G2, G5 |
| Complete safe setup | Confirmed valid configuration per authorised attempt | G2 |
| Understand product value and cost | Correct benefit, prerequisite and charge explanation | G4 |
| Activate useful capabilities | Eligible activations followed by first meaningful use | G4 |

- Baselines and targets are pending.
- Guardrails include collection disruption, exposed secrets, unintended charges and false-ready states.
- Do not use switch clicks or prototype success-rate data as adoption outcomes.

# Requirements

- Priorities are proposed; P0 protects safe configuration, P1 supports optional adoption and advanced controls.

| **ID and user story** | **Design implication** | **Priority** |
| --- | --- | --- |
| OC1 I need to understand current readiness | Separate business entitlement, permission, setup and enablement | P0 |
| OC2 I need configuration for the right environment | Display business/MID and test/live scope where supported | P0 |
| OC3 I need consequences before changing collection | Review affected modes/gateways and approved charge terms | P0 |
| OC4 I need protected integration information | Restrict and mask sensitive credentials with approved actions | P0 |
| OC5 I need confirmed setup outcomes | Show validation, pending and authoritative saved status | P0 |
| OC6 I need help when a setup dependency fails | Retain safe context and route to relevant support | P0 |
| OC7 I need understandable routing and webhook controls | Explain supported rules and test/verification results | P1 |
| OC8 I need a useful product activation path | Provide benefit-led next steps, not dead-end promotions | P1 |

## Out of scope

1. New routing algorithms, guaranteed payment-success improvements or provider contracts.
2. Approving secret lifecycle, API availability or webhook retry semantics in a design document.
3. New KYC/onboarding, In-store configuration and automatic channel access grants.

# Mental model and design principles

- **Available does not mean ready.**
  - Use explicit setup progress and missing dependencies.
  - A newly configured Online product does not grant every user access under D9.

- **A financial capability has an effect and possibly a cost.**
  - Explain eligible scope, charges and whether the change is one-off or continuing before confirmation.
  - The final commercial terms come from product owners.

- **Integration status needs evidence.**
  - Saved input does not prove that a gateway or webhook works.
  - Only display a tested/verified result when its supporting service exists.

# Proposed solution and design

## User journey and decisions

**Journey**

1. Open Online product configuration
2. Confirm readiness and scope
3. Choose a supported task
4. Review requirements and effect
5. Enter protected configuration
6. Validate through available services
7. Save/activate
8. Inspect confirmed state or repair the failed dependency

- OC1–OC6 cover the core path.

- **Proposal:** group controls by the merchant's intended work, with explanations for gateway, pay-mode and integration dependencies.
- Show capability discovery after the primary configuration answer.
- A product that needs assistance should lead to a trackable enquiry or supported setup path rather than a nominal toggle.

- Credentials require clear environment and permission boundaries.
- Do not expose secrets in ordinary summaries, exports, URLs or support attachments.
- Reveal, copy, rotate and revoke behaviour need approved security rules and consequence review.
- Provide safe contextual diagnostics without assuming request payloads can be shared freely.

## States and recovery

- Cover unconfigured, setup incomplete, ready, disabled, read-only, invalid input, validation unavailable, failed save and conflicting changes.
- Distinguish a service outage from invalid credentials.
- Never claim validation passed when the test service is unavailable.
- After unknown results, retrieve authoritative state before retrying activation.

## App behaviour

- **Proposal:** show readiness and relevant help in the app.
- Sensitive credential actions, routing and webhook administration are candidates for web-first ownership, not agreed exclusions.
- If web is required, explain the task boundary and preserve a safe business/product link.

## Web behaviour and continuity

- Support detailed configuration, dependency review and approved verification/history.
- Keyboard operation and field-level validation must be available.
- App and web share readiness definitions and permissions; secrets and unfinished drafts are not automatically synchronised.

## Mockups and tradeoffs

- **References:** components/online-payments/online-payments-content.tsx, payment-gateway-listing-content.tsx; app/online-payments and app/settings.
- Annotated frames are pending for not-ready states, paid enablement, validation failure and secret actions.
- Grouping related controls improves context but can overwhelm non-technical merchants; use task-led entry and appropriate assistance.

# Dependencies and validation

- Entitlements, commercial terms, authoritative configuration, security-approved secret handling and verification services are prerequisites.
- **H1:** readiness stages improve correct setup interpretation.
- **H2:** effect review reduces unintended changes.
- **H3:** benefit-led setup improves informed activation without weakening core work.
- Test actual configurators and assisted setup operators, not owners by default.
- Include wrong environment, unavailable validation and interrupted activation.

# Open questions

1. **Product:** which gateways, routing, webhook and credential tasks are released now?
2. **Security/product:** which sensitive actions require step-up, approval or web-only access?
3. **Engineering:** what validation, versioning and recovery services actually exist?
4. **Commercial owners:** which eligibility and charges must be disclosed before activation?

# Alternatives considered

- One switch per product is simple but hides prerequisites and cost.
- A technical-control-first view suits experts but may impede discovery.
- Assisted-only setup reduces self-service risk but retains operational dependency; use self-service only where outcomes can be verified.

# Appendix and references

- Parent: docs/design/pine-one-platform-design-strategy.md, G2/G4/G5, D1 and D7–D10.
- Canonical reference: docs/design/pine-one-user-personas-and-behaviours.md, P1/P4, T2/T3, B09–B12, B14–B15, B18; R02 Razorpay Workflow, R05 Integration and Technical Requirements.
- Discovery: docs/flows/pine-one-cross-platform-discovery.md, answers 67–68, 89 and 97.
- Related modules: Checkout, Payment Links, Roles and Permissions, Help and Support.
- Decision history: 5 October 2026, proposed readiness/safety model; no routing, API or commercial release commitment added.
