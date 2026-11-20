---
title: Account Settings design document
description: Personal profile, business details, preferences, security entry and feedback.
kind: Module design
date: 2026-10-05
topics: [in-store, online, account settings, profile, preferences]
source: docs/exports/omni-design-suite/Pine One Account Settings Design Document.docx
---

Updated: 5 October 2026

Parent: Pine One Omni Platform Design Strategy

Scope: Personal profile, business details, preferences, security entry and feedback

Review status: Proposed module design

Design owner, product owner and launch milestone: To be assigned

# Overview

- Account Settings should let a user understand and manage the information that belongs to them while distinguishing it from the business they currently access.
- **Proposal:** We propose separating personal profile and preferences from permission-controlled business information and sensitive security actions.
- **Goals:** This supports G1 business clarity, G2 reliable self-service and G5 consistency.

**Ownership**
- Login and Identity owns authentication and business selection.
- Roles and Permissions owns staff access; Settlements owns bank-account changes.
- Settings can provide contextual entries to these modules without defining conflicting rules.
- Onboarding and KYC redesign remain out of scope.

# User and behaviour references

- Any permitted P1–P5 user may manage their own supported preferences.
- Business administration depends on authority, not the fact that Settings is available.
- T2 Configurator applies to high-impact changes.
- Refer to B01, B07, B09–B10, B13–B14 and B18.
- Preference and profile-edit behaviour has little direct research in the current set.

## Research implications

- R02 Prototype Walkthrough and R01 Prototype Task 7 support testing the findability of store/user tasks; they do not validate profile, password or language flows.
- R05 User Management and Store Operations supports access-change needs, which remain in the dedicated permissions document.
- Do not turn staff removal into identity deletion or treat a person's preferences as business-wide configuration.

# Problem and motivation

- A single identity can belong to several businesses.
- If a user cannot tell whether a change affects the person, current membership or whole business, a routine edit can create unintended consequences.
- Similar account-menu destinations can also hide the actual task.

**In the current prototype**
- The prototype exposes profile, business details, preferences, security and feedback.
- Its business switcher and persistence differ across platforms from the parent direction.
- D4 remains authoritative: select a linked business for each session; changing business resets filters.
- This module does not reintroduce cross-session business memory.

# Goals and success measures

| **Local goal** | **Proposed measure** | **Parent goal** |
| --- | --- | --- |
| Understand change scope | Correct personal-versus-business effect interpretation | G1 |
| Find the intended setting | Unprompted correct destination and task completion | G2 |
| Complete a valid edit | Confirmed appropriate changes per authorised attempt | G2 |
| Retain platform consistency | Correct understanding after app/web handoff | G5 |

- Baselines, targets and owners are pending.
- **Guardrails** include lockout, wrong-business edits, unintended preference propagation and exposed identity data.
- Feedback submission is not evidence that a support problem was resolved.

# Requirements

- Priorities are proposed; P0 protects context and safe editing, P1 covers additional preference/feedback work.

| **ID and user story** | **Design implication** | **Priority** |
| --- | --- | --- |
| AS1 I need personal and business information separated | Label scope and selected business clearly | P0 |
| AS2 I need to know what I can edit | Distinguish read-only, editable and verification-dependent fields | P0 |
| AS3 I need sensitive changes protected | Use approved identity verification and security rules | P0 |
| AS4 I need confirmed save outcomes | Show errors, pending verification and authoritative state | P0 |
| AS5 I need the right administration destination | Link access, bank and product tasks to their owning module | P0 |
| AS6 I need useful preferences | Define language/display scope and actual persistence | P1 |
| AS7 I need feedback distinguished from service requests | Explain submission and support entry separately | P1 |

## Out of scope

1. New KYC, legal business verification or identity-matching policy.
2. Redefining password/OTP, bank changes or staff access workflows.
3. Identity deletion, cross-device preference synchronisation or biometric access without approval.

# Mental model and design principles

- **My account is not the current business.**
  - A personal edit may affect one central identity; a business edit must be limited to the relevant business and authority.
  - Explain the effect at the point of change.
- **Editable does not mean immediately effective.**
  - Contact or business details may need verification.
  - Pending information must not appear as the confirmed identity or operational destination.
- **A setting needs an understandable home.**
  - Use task labels and links rather than duplicating user, store or financial controls in several sections.

# Proposed solution and design

## User journey and decisions

**Journey** (AS1–AS5 cover the path)
1. Open Account Settings
2. Identify personal or business task
3. Confirm scope and authority
4. Inspect current values
5. Edit a supported field
6. Review sensitive consequences if applicable
7. Save/verify
8. See effective or pending state

**Proposal**
- Separate profile, business details, preferences, security and feedback.
- Every business-specific edit carries the current business identity.
- Personal email/mobile changes should state their possible authentication effect only under the approved identity policy; do not assume a simple text replacement changes verified credentials.

**Preferences and sensitive actions**
- Preferences need an explicit persistence definition: personal, device-local or business-wide.
- For language, explain the actual translated surface and fallback rather than implying every document/message is translated.
- Sensitive actions link to the approved authentication flow and retain a safe return destination.

## States and recovery

- **Cover:** read-only fields, validation errors, verification pending, failed save, expired session and conflicting changes.
- Preserve safe edits when feasible, but do not persist passwords or verification secrets as drafts.
- Confirm effective values after uncertain submission.
- If business access is removed, stop protected edits and explain the access change.

## App behaviour

- **Proposal:** provide concise personal profile and preference tasks, with clear business context for permitted administration.
- A security or business task excluded from app must explain its approved web path.
- Mobile session recovery and biometric behaviour are not assumed.

## Web behaviour and continuity

- Support detailed settings review and keyboard-accessible editing.
- Both platforms share field meanings, verified/pending states and permission checks.
- Persistence follows the agreed preference scope; do not promise draft or setting synchronisation simply because screens look similar.

## Mockups and tradeoffs

- **References:** components/account/account-page-content.tsx and account-page-shell.tsx; app/account/profile, preferences and security.
- Final frames are pending for personal/business distinction, contact verification, read-only access and failed save.
- **Tradeoff:** Centralising settings helps discovery but can confuse scope; keep ownership boundaries visible.

# Dependencies and validation

- **Prerequisites:** Identity/profile services, business field authority, verification, preference storage and security policy are prerequisites.

**Hypotheses**
- H1: scope labels improve consequence comprehension.
- H2: task-led grouping improves findability.
- H3: explicit pending states reduce false completion assumptions.

**Testing**
- Test people linked to several businesses, restricted staff and actual administrators.
- Include switching business with unsaved edits and changing a preference on another device only if persistence is supported.

# Open questions

1. **Identity/product:** which profile fields can change and which require verification?
2. **Product:** which business fields are read-only, self-service or request-based?
3. **Engineering/design:** which preferences are personal, local or business-wide?
4. **Security/product:** which security actions and platform handoffs are approved?

# Alternatives considered

- **A single unscoped settings list** is compact but obscures effect.
- **Duplicating financial/access controls** avoids navigation but creates competing rules.
- **Separate platform-specific settings documents** may be useful later for substantial journeys; retain shared rules with explicit app/web differences for now.

# Appendix and references

- Parent: docs/design/pine-one-platform-design-strategy.md, G1–G2/G5, D4 and D8–D10.
- Canonical reference: docs/design/pine-one-user-personas-and-behaviours.md, P1–P5, T2, B01, B07, B09–B10, B13–B14, B18; R01/R02 discovery observations and R05 access needs with the limits above.
- Discovery: docs/flows/pine-one-cross-platform-discovery.md, answers 35–40, 97–98.
- Related modules: Login and Identity, Roles and Permissions, Settlements.
- Decision history: 5 October 2026, proposed settings boundaries; no identity, persistence or security policy changed.
