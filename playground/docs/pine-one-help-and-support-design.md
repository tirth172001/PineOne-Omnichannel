---
title: Help and Support design document
description: Contextual help, knowledge discovery and support-case continuity across web and app.
kind: Module design
date: 2026-10-05
topics: [in-store, online, support, tickets]
source: docs/exports/omni-design-suite/Pine One Help and Support Design Document.docx
---

Updated: 5 October 2026

Parent: Pine One Omni Platform Design Strategy

Scope: Contextual help, knowledge discovery and support-case continuity across web and app

Review status: Proposed module design

Design owner, product owner and launch milestone: To be assigned

# Overview

- Help and Support should help a merchant resolve a problem or reach the right human assistance without repeatedly reconstructing business, payment or device context.
- We propose keeping task-specific help and case progress close to the problem, with a recognisable global support destination.
- This supports G2 reliable self-service and G5 consistent handoff.

- Reducing avoidable contacts is useful only when problems are resolved.
- The design must not hide assistance or treat leaving the screen as successful resolution.
- Ticket statuses and estimated timelines require support-system evidence rather than prototype promises.

# User and behaviour references

- P2/P3 may report local collection/device issues; P4 investigates payment, export and settlement problems.
- P1/P5 may need account or access assistance where permitted.
- T3 Investigator and T5 Delegate apply.
- Refer to B01, B04, B07, B10, B14–B16 and B18 rather than repeating profiles.

## Research implications

- R01 Pain Points and R02 Day-to-Day Workflow/Pain Points describe escalation through RM, operations and human contacts.
- R02 Prototype Walkthrough records lack of awareness of platform support.
- R05 User Management and Store Operations describes an operations dependency for staff changes.
- B15 therefore supports discoverable assistance and ownership continuity; the research does not prove a ticket interface replaces existing relationships or that automated chat resolves financial problems.

# Problem and motivation

- An unresolved payout, unavailable report or device failure can cause repeated explanation across people and systems.
- Self-service content may answer terminology questions but cannot fix every service failure.
- A case marked Resolved without the merchant understanding the outcome can conceal an unresolved issue.

- The prototype exposes knowledge topics, FAQs, training videos, a guided request flow, ticket history and detail/edit panels.
- Local sample tickets and calculated resolution estimates are not operational service commitments.

# Goals and success measures

| **Local goal** | **Proposed measure** | **Parent goal** |
| --- | --- | --- |
| Find relevant help | Unprompted correct help destination and task completion | G2 |
| Escalate with usable context | Cases with correct business/record details per accepted submission | G2, G5 |
| Understand case progress | Correct owner/status/next-step interpretation | G2 |
| Resolve without repeated explanation | Merchant-confirmed resolution and repeat-contact rate | G2, G5 |

- Baselines and targets are pending.
- Segment issue, role, platform and channel.
- Guardrails are unresolved issues, abandoned urgent requests, missed follow-up and exposed confidential information.
- Contact deflection is not a standalone outcome.

# Requirements

- Priorities are proposed; P0 covers accessible help and reliable escalation, P1 improves learning and history.

| **ID and user story** | **Design implication** | **Priority** |
| --- | --- | --- |
| HS1 I need help for the current problem | Provide contextual and recognisable global entry | P0 |
| HS2 I need relevant guidance | Match topic to supported issue without blocking human help | P0 |
| HS3 I need to report without repeating context | Prefill permitted business/channel/record details for review | P0 |
| HS4 I need proof the request was received | Confirm server acknowledgement and case ID | P0 |
| HS5 I need the next step and owner | Explain actual status, requested information and reliable timeline | P0 |
| HS6 I need to continue an existing issue | Find relevant cases and use supported follow-up paths | P0 |
| HS7 I need reusable learning | Provide searchable, current knowledge and videos | P1 |
| HS8 I need confirmation that the issue is resolved | Review resolution and supported reopen/follow-up options | P1 |

## Out of scope

1. Guaranteed resolution times, automatic refunds or accelerated bank payouts.
2. Replacing RM/operations relationships, autonomous AI troubleshooting or unrestricted customer-data sharing.
3. A new support staffing or severity policy defined solely by interface design.

# Mental model and design principles

- **Help starts with the merchant's problem.**
  - Use familiar task language for payout, payment lookup, reports and device servicing.
  - Explain unfamiliar service names rather than assuming merchants know support categories.

- **Submission creates a case, not a fix.**
  - Show acknowledgement, case identity and next step.
  - A pending submission is not an In progress service case until the system accepts it.

- **Ownership needs continuity.**
  - If work moves between teams, show the merchant what happens next where the service supports it.
  - A generic status pill cannot replace an accountable follow-up path.

# Proposed solution and design

## User journey and decisions

**Journey**

1. Open help from an affected record or global destination
2. Select/confirm issue
3. Inspect relevant guidance
4. Escalate if unresolved
5. Review safe context and attachments
6. Submit
7. Receive case ID
8. Track requests for information
9. Review resolution or follow up

- HS1–HS8 cover the path.

- **Proposal:** carry existing business, channel, store and supported record IDs into a contextual request, then let the merchant correct the issue description.
- Avoid requesting secrets, full card details or unrelated customer information.
- Use only authorised diagnostic data.
- An existing related case can be offered as a continuation, not silently merged or suppressed.

- Knowledge content should state its applicable product and current scope.
- Quick fixes must not invite an unsafe financial retry or assume the user can change protected settings.
- Allow escalation when guidance fails.
- Show a timeline only when support owns and can honour it; otherwise explain what is known without inventing an SLA.

## States and recovery

- Cover no cases, no search results, request validation, failed upload, unknown submission, unavailable support service, waiting for merchant, in progress and resolved.
- Check uncertain submissions before inviting a duplicate.
- Preserve safe context on retry.
- A connectivity failure must offer a supported alternative contact path if one exists; the exact fallback remains a support-owner decision.

## App behaviour

- **Proposal:** make in-context service reporting and case checks short, with touch-friendly attachments where supported.
- Camera capture, push alerts and offline requests require decisions.
- An urgent record should retain its identity through the help journey without promising action when disconnected.

## Web behaviour and continuity

- Support case/history search, detailed attachments and knowledge review alongside investigation.
- Keyboard focus must return to the source record after closing help.
- Both platforms share case identity, status and access rules.
- Server-side cases can be resumed where permitted; unfinished drafts and notification behaviour are not assumed to synchronise.

## Mockups and tradeoffs

- **References:** components/support/support-chat-content.tsx, support-tickets-listing-content.tsx and ticket-detail-panel.tsx; app/support.
- Final frames are pending for unknown submission, restricted records, delayed service and merchant follow-up.
- Guided help can reduce repetitive work but excessive steps can block urgent escalation; test completion and resolution together.

# Dependencies and validation

- Case-service acknowledgement, authorised context transfer, ownership, current knowledge and human escalation determine usability.
- **H1:** task labels improve support discovery.
- **H2:** reviewed context reduces repeated description.
- **H3:** clear next steps improve case-progress comprehension and reduce repeat contact without worsening resolution.
- Test the documented payout/report/device scenarios with P2/P3/P4 and support operators.
- Compare merchant-confirmed outcomes after release, not only submitted ticket counts.

# Open questions

1. **Support/product:** which contact channels, ownership and fallback paths are available?
2. **Engineering/security:** which record context and attachments can safely transfer?
3. **Support:** which timeline, severity and reopen rules are authoritative?
4. **Product:** which app notifications and cross-device case handoffs are in release scope?

# Alternatives considered

- Knowledge-only help can leave service failures unresolved.
- Human-contact-only help preserves relationships but repeats routine explanations.
- Mandatory guided chat may improve context but delay urgent escalation; retain a supported assistance route and test the balance.

# Appendix and references

- Parent: docs/design/pine-one-platform-design-strategy.md, G2/G5, D9–D11.
- Canonical reference: docs/design/pine-one-user-personas-and-behaviours.md, P1–P5, T3/T5, B01, B04, B07, B10, B14–B16, B18; R01 Pain Points, R02 Daily Workflow/Prototype Walkthrough, R05 User Management and Store Operations.
- Discovery: docs/flows/pine-one-cross-platform-discovery.md; V3 IA section 5.8.
- Related modules: Settlements, Reports, Devices, Disputes and Roles and Permissions.
- Decision history: 5 October 2026, proposed contextual support model; no SLA, staffing or automated-resolution commitment added.
