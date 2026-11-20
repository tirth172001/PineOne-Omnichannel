---
title: Checkout design document
description: Merchant configuration and preview of Online checkout across web and app.
kind: Module design
date: 2026-10-05
topics: [online, checkout]
source: docs/exports/omni-design-suite/Pine One Checkout Design Document.docx
---

Updated: 5 October 2026

Parent: Pine One Omni Platform Design Strategy

Scope: Merchant configuration and preview of Online checkout across web and app

Review status: Proposed module design

Design owner, product owner and launch milestone: To be assigned

# Overview

- Checkout should help an authorised merchant understand the customer payment experience and change its supported appearance or options without accidentally disrupting collection.
- We propose separating preview, editable settings, product eligibility and confirmed live configuration.
- This supports G2 reliable self-service, G4 relevant product use and G5 consistency.

- This is the merchant configuration document, not a full design of the customer's checkout journey.
- Checkout belongs to Online payments and does not use the shared operational channel selector.
- Gateway, routing and integration administration are owned by Online Payment Configuration.

# User and behaviour references

- T2 Configurator is the primary task lens, held by an authorised P1/P4 operator or another designated administrator.
- No supplied study proves that the owner personally configures checkout.
- Apply B09–B12, B14 and B18.
- Customer-facing behaviour needs separate research rather than extrapolation from merchant interviews.

## Research implications

- R01 Prototype Walkthrough records misunderstanding of website Checkout.
- B18 therefore supports explaining the product through its task and showing what a merchant change affects.
- R02's link workflow is evidence for collecting remotely, not proof of website integration demand.
- R05's unwanted EMI configuration is a related warning about unclear product effects; it does not validate this Online configuration flow.

# Problem and motivation

- The merchant may confuse checkout styling with gateway activation or assume a preview reflects the live environment.
- A saved colour or visible payment-mode card does not prove the customer can use that method.
- Unclear activation and save states can cause either unnecessary support or unintended changes.

- The prototype exposes brand settings, device previews, pay-mode details and a Save details action.
- These are represented interactions; their live persistence and rollout semantics require confirmation.

# Goals and success measures

| **Local goal** | **Proposed measure** | **Parent goal** |
| --- | --- | --- |
| Understand the product | Correct checkout-versus-link/gateway explanation in tasks | G2, G4 |
| Make a safe configuration change | Intended settings saved and confirmed without unrelated changes | G2 |
| Distinguish preview from live | Correct environment and publication interpretation | G1, G5 |
| Use relevant options | Approved activation followed by meaningful usage | G4 |

- Baselines and targets are pending.
- Guardrails include payment disruption, unintended pay-mode changes and misunderstanding paid capabilities.
- Customer conversion is influenced by many factors; do not credit merchant-editor usability alone for changes in conversion.

# Requirements

- Priorities are proposed; P0 protects comprehension and safe save, P1 improves review and discovery.

| **ID and user story** | **Design implication** | **Priority** |
| --- | --- | --- |
| CK1 I need to understand what Checkout does | Explain customer payment experience and integration dependency | P0 |
| CK2 I need current settings distinguished from edits | Show saved state, unsaved changes and environment | P0 |
| CK3 I need to preview supported changes | Label preview limitations and device modes | P0 |
| CK4 I need to know which payment modes are usable | Separate entitlement, enablement and configuration | P0 |
| CK5 I need to save with confidence | Review affected settings and confirm actual persistence | P0 |
| CK6 I need to recover from a failed change | Retain appropriate edits and reload authoritative state | P0 |
| CK7 I need relevant activation information | Explain approved benefit, prerequisites and charges | P1 |

## Out of scope

1. End-customer checkout research and a guaranteed conversion uplift.
2. New gateway contracts, routing algorithms and credential policy.
3. Universal pay-mode support, production rollout or rollback commitments before approval.

# Mental model and design principles

- **A preview shows appearance, not payment readiness.**
  - Label its environment and limitations.
  - Do not imply a successful test transaction from a visual preview.

- **Configured, enabled and available are different.**
  - Explain why a mode is unavailable and what authorised next step applies.
  - Lack of user permission is not lack of business configuration.

- **Saving needs a defined effect.**
  - State whether a save changes live checkout, a draft or a configuration awaiting approval.
  - Do not imply a separate publish stage exists unless the service supports one.

# Proposed solution and design

## User journey and decisions

**Journey**

1. Open Checkout
2. Understand product/environment
3. Inspect saved configuration
4. Edit permitted settings
5. Preview supported appearance
6. Review effect
7. Save under the approved model
8. Receive confirmed outcome
9. Inspect authoritative configuration

- CK1–CK6 cover this path.

- **Proposal:** keep brand settings and payment options understandable as distinct groups.
- A payment-mode detail describes business eligibility and actual enablement, with a link to integration/configuration when necessary.
- Do not duplicate gateway credentials inside the visual editor.

- Show unsaved changes and an explicit leave/discard choice.
- Save feedback must reflect server confirmation and the agreed publication semantics.
- Re-read or version-check current settings before applying a stale edit where the service supports it; explain conflicting changes rather than silently overwriting them.

## States and recovery

- Cover not configured, read-only permission, invalid brand asset, unsupported setting, saving, failed save, concurrent change and unknown result.
- Preserve valid inputs where safe, identify affected fields and refresh saved state after uncertainty.
- If a live change cannot be confirmed, do not label the preview as live.

## App behaviour

- **Proposal:** support understanding and reviewing checkout on the app, with routine changes only if approved.
- Touch previews and long configuration forms must be tested.
- Any web-only editor task needs an explicit handoff and a clear statement about whether edits carry over.

## Web behaviour and continuity

- Support side-by-side configuration and preview, keyboard operation, visible dirty state and detailed settings review.
- App and web share setting meanings, permissions and authoritative saved values.
- Session drafts and cross-device synchronisation are not assumed.

## Mockups and tradeoffs

- **Reference:** components/checkout/checkout-content.tsx and checkout-color-picker.tsx; app/checkout.
- Final frames are pending for read-only access, failed save, environment confusion and concurrent edits.
- Immediate preview improves understanding but may falsely imply live readiness; label its scope and verify the actual save model.

# Dependencies and validation

- Product eligibility, settings persistence, asset validation, environment definitions and integration status affect usability.
- **H1:** task-led explanation improves Checkout comprehension.
- **H2:** explicit saved/edit state reduces unintended changes.
- **H3:** preview limitations reduce false readiness assumptions.
- Test actual configurators with an unconfigured Online business, read-only access and save failure.
- Obtain customer research separately before redesigning their payment flow.

# Open questions

1. **Product/engineering:** does Save apply live, draft or approval-pending configuration?
2. **Product:** which pay-mode and brand changes are permitted on each platform?
3. **Engineering:** how are conflicts, rollback and environment status represented?
4. **Research:** who actually configures Checkout, and what explanation do they need?

# Alternatives considered

- A visual-editor-only view hides readiness and effect.
- Merging gateway administration into Checkout increases context but can overload the editing task.
- A read-only app is safer but may block necessary routine work; validate the actual task boundary before committing it.

# Appendix and references

- Parent: docs/design/pine-one-platform-design-strategy.md, G2/G4/G5, D1, D7 and D9–D10.
- Canonical reference: docs/design/pine-one-user-personas-and-behaviours.md, P1/P4, T2, B09–B12, B14, B18; R01 Prototype Walkthrough and R05 User Management and Store Operations with the scope limits above.
- Discovery: docs/flows/pine-one-cross-platform-discovery.md, answers 48, 68, 89, 92 and 97.
- Related module: Online Payment Configuration.
- Decision history: 5 October 2026, proposed safe editor behaviour; live save and mobile ownership remain open.
