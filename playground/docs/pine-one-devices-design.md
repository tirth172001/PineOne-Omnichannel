---
title: Devices design document
description: In-store terminal and soundbox identification and proposed device administration.
kind: Module design
date: 2026-10-05
topics: [in-store, devices, pos]
source: docs/exports/omni-design-suite/Pine One Devices Design Document.docx
---

Updated: 5 October 2026

Parent: Pine One Omni Platform Design Strategy

Scope: In-store terminal and soundbox identification and proposed device administration

Review status: Proposed module design

Design owner, product owner and launch milestone: To be assigned

# Overview

- Devices should help a merchant identify the physical device affected by a problem, understand its store and payment configuration and reach an appropriate service or administration action.
- The device's hardware identity, terminal identity, integration mode and account status are different facts.
- We propose keeping these distinctions clear before any change.
- This supports G1 business clarity and G2 reliable self-service.

- Devices belongs to In-store payments and does not use a shared Online/In-store selector.
- POS terminals and soundboxes are in the product intent; device-specific controls must reflect actual capability rather than applying terminal settings to every model.

# User and behaviour references

- P2 may investigate a local device; P3 may report a problem where permitted.
- P4/P5 can hold administration responsibility through T2 Configurator or T3 Investigator, but exact authority needs validation.
- Apply B01, B04, B09–B10, B14–B16 and B18.

## Research implications

- R03 Issues Raised and R04 Issues Reported describe integration failures and manual fallback.
- R05 User Management and Store Operations reports reactive servicing and unwanted EMI configuration.
- These support clear device context, configuration visibility and service entry.
- They do not prove that a dashboard mode switch fixes billing integration or that every manager should deactivate hardware.

# Problem and motivation

- A device may be physically present but mapped to an unexpected store or configured in the wrong mode.
- During service disruption, staff may manually enter amounts and later struggle to match the resulting records.
- Choosing the wrong terminal for a change can affect active collection.

- The terminal prototype has search, model/store identifiers, integrated/standalone mode changes, active/inactive actions and an audit log.
- Its local state and success messages are not proof that commands reached hardware.
- The production design must show requested versus confirmed states.

# Goals and success measures

| **Local goal** | **Proposed measure** | **Parent goal** |
| --- | --- | --- |
| Identify the correct device | Correct hardware/terminal selection in store scenarios | G1 |
| Understand current configuration | Correct mode and capability interpretation | G1, G2 |
| Complete a permitted change | Confirmed correct-device changes per accepted request | G2 |
| Obtain relevant servicing | Service requests with usable device context and resolution | G2 |

- Targets and baselines are pending.
- Guardrails include wrong-device changes, collection disruption, false confirmation and unauthorised controls.
- Measure identification separately from service resolution time.

# Requirements

- All priorities are proposed; P0 protects identification and safe action, P1 supports administration improvements.

| **ID and user story** | **Design implication** | **Priority** |
| --- | --- | --- |
| DV1 I need to find the physical device | Search supported IDs and show model and assigned store | P0 |
| DV2 I need mode and status distinguished | Separate integration mode, activation and supported health signals | P0 |
| DV3 I need to know which controls apply | Display model-specific capabilities and permission | P0 |
| DV4 I need the effect of a change explained | Review device identity, consequence and confirmation | P0 |
| DV5 I need an actual outcome | Separate requested, pending and confirmed configuration | P0 |
| DV6 I need service for this device | Carry permitted device/store context into support | P0 |
| DV7 I need change history | Show supported actor, time and outcome | P1 |
| DV8 I need acquisition or linking guidance | Explain approved add/order next steps | P1 |

## Out of scope

1. Guaranteed hardware health or remote troubleshooting without telemetry/integration.
2. Repairing billing software or promising automatic failover.
3. Device ordering, pricing and installation commitments beyond approved product flows.

# Mental model and design principles

- **The device in my hand needs a recognisable identity.**
  - Pair IDs with model and outlet context.
  - Explain which identifier a support agent needs rather than requiring users to know every internal ID.

- **Mode is not availability.**
  - Integrated/standalone describes how collection operates.
  - Active/inactive describes administrative status.
  - Neither alone proves online connectivity or a healthy printer/speaker.

- **A command is not a completed change.**
  - Keep controls pending until supported acknowledgement arrives.
  - If confirmation is unavailable, say so instead of displaying a successful change.

# Proposed solution and design

## User journey and decisions

**Journey**

1. Open Devices or a store's linked devices
2. Locate the model and IDs
3. Verify physical/store match
4. Inspect configuration
5. Choose a permitted action or service
6. Review impact
7. Receive confirmed outcome or recovery

- DV1–DV7 cover this path.

- **Proposal:** use device details as the context anchor for administrative and support tasks.
- Explain consequences before mode or status changes, including whether collection could be interrupted where operations confirms that effect.
- Preserve history and supported terminal links; do not rewrite the historical device context of past payments when assignments change.

- For a soundbox, show only supported association, settings and service actions.
- Terminal-only capabilities must not appear by inheritance.
- A merchant without configured In-store payments sees product benefits and a real enquiry/setup path, not a non-functional device list.

## States and recovery

- Distinguish no devices, filtered-empty, inactive, pending change, rejected change and unknown connectivity.
- An expired permission or assignment change triggers revalidation before execution.
- Preserve target identity on failure and offer contextual support.
- Do not encourage repeated commands while acknowledgement is uncertain.

## App behaviour

- **Proposal:** make local device lookup and service entry quick, with enough IDs to confirm the physical match.
- Scanning, diagnostics and remote control require separate capability decisions.
- High-impact controls can be web-only if product decides so, with a clear explanation rather than a hidden unfinished flow.

## Web behaviour and continuity

- Support fleet comparison, model/store filtering and authorised audit history.
- Bulk changes are not assumed.
- Both platforms show the same device identity, configuration meaning and access.
- Server-confirmed changes can be visible across devices; draft/session continuity is not promised.

## Mockups and tradeoffs

- **References:** components/offline-payments/pos-terminals-listing-content.tsx and device-audit-log-content.tsx; lib/terminal-devices-data.ts.
- Annotated frames are pending for terminal/soundbox differences, delayed acknowledgement and collection-impact confirmation.
- More controls can reduce support dependency but increase disruption risk; restrict them by capability and authority.

# Dependencies and validation

- Accurate device/store mapping, model capability data, remote acknowledgement, audit records and service integration are prerequisites.
- **H1:** model/store/ID context reduces wrong-device selection.
- **H2:** consequence review reduces unintended changes.
- **H3:** contextual service entry reduces repeated description while preserving access to human help.
- Test local operators and fleet administrators with similar models, moved devices and unknown status.
- Do not estimate downtime reduction from UI tests alone.

# Open questions

1. **Product/operations:** which terminal and soundbox actions are supported remotely?
2. **Engineering:** what acknowledgement, telemetry and stale-state guarantees exist?
3. **Product/security:** who may change mode, activation or product settings on each platform?
4. **Operations:** what servicing and acquisition status can be displayed reliably?

# Alternatives considered

- An ID-only list is compact but hard to match physically.
- Immediate switches feel fast but can imply an unconfirmed change.
- Support-only administration limits risk but keeps routine work dependent on contacts; review controlled self-service where acknowledgement exists.

# Appendix and references

- Parent: docs/design/pine-one-platform-design-strategy.md, G1–G2, D1, D5, D7 and D9–D10.
- Canonical reference: docs/design/pine-one-user-personas-and-behaviours.md, P2–P5, T2/T3, B01, B04, B09–B10, B14–B16, B18; R03–R05 sections cited above.
- Discovery: docs/flows/pine-one-cross-platform-discovery.md, answers 56, 83, 93 and 97.
- Related modules: Stores, Transactions and Help and Support.
- Decision history: 5 October 2026, proposed safe device-change model; prototype local success is not operational confirmation.
