---
title: Stores design document
description: In-store location context and proposed store administration across web and app.
kind: Module design
date: 2026-10-05
topics: [in-store, stores]
source: docs/exports/omni-design-suite/Pine One Stores Design Document.docx
---

Updated: 5 October 2026

Parent: Pine One Omni Platform Design Strategy

Scope: In-store location context and proposed store administration across web and app

Review status: Proposed module design

Design owner, product owner and launch milestone: To be assigned

# Overview

- Stores should help a merchant recognise an outlet, see the devices and staff associated with it and enter correctly scoped operational work.
- We propose treating the store as an In-store location within the selected business, not as another business or an invented Online entity.
- This supports G1 business clarity, G2 reliable self-service and G5 consistency.

- The prototype exposes linked device/user lists and store QR access.
- This document owns their context and navigation; Devices owns device commands, Roles and Permissions owns access changes, and Transactions/Reports own financial records.

# User and behaviour references

- P2 needs local operational context; P4 may compare or match evidence across outlets.
- P5 can manage store-scoped membership where permitted.
- Apply B01, B04, B08–B10, B14 and B16–B18.
- P3 visibility is limited to assigned locations and allowed tasks.

## Research implications

- R02 Store Cashier and Daily Workflow support centre-specific access and reconciliation.
- R02 Prototype Walkthrough reports finding store tasks through user management, which suggests testing location labels and navigation.
- R03 requests device and shift-level information.
- R05 User Management and Store Operations connects staff turnover with access administration.
- These support recognisable store context and linked work, not a validated universal store-comparison dashboard.

# Problem and motivation

- Similar location names, multiple merchant IDs and device movement can make the wrong outlet appear plausible.
- Store management can also be confused with user administration when the relationship between location, devices and staff is hidden.

- One merchant ID can have several In-store stores.
- Online has no store ID under the current model.
- A store detail must not imply that Online receipts belong to the outlet merely because the business offers both channels.

# Goals and success measures

| **Local goal** | **Proposed measure** | **Parent goal** |
| --- | --- | --- |
| Select the intended outlet | Correct location choice among similar names | G1 |
| Find linked work | Unassisted entry to device, user or local payment tasks | G2 |
| Maintain appropriate location access | Correct store-scope assignment in administration tests | G1, G5 |
| Obtain local matching evidence | Correct scoped Transactions/Reports entry | G2 |

- Baselines and targets are pending.
- Guardrails are wrong-store edits, financial attribution errors and unauthorised visibility.
- Store selection success does not prove the underlying device mapping is accurate.

# Requirements

- Priorities are proposed; P0 covers trustworthy context and P1 covers additional administration.

| **ID and user story** | **Design implication** | **Priority** |
| --- | --- | --- |
| ST1 I need to recognise an outlet | Show name, supported store/Merchant IDs and address context | P0 |
| ST2 I need only my permitted locations | Enforce business and store access in lists and details | P0 |
| ST3 I need to see linked devices and staff | Explain association separately from authority | P0 |
| ST4 I need local operational records | Enter Transactions/Reports with explicit In-store scope | P0 |
| ST5 I need to change an association safely | Hand off to the owning module with consequence review | P0 |
| ST6 I need the correct store QR | Show supported identity and permitted QR actions | P1 |
| ST7 I need to understand status and changes | Review active/inactive meaning and historical context | P1 |

## Out of scope

1. Creating Online stores or attributing Online payments to an outlet without a new model.
2. Store onboarding/KYC and new location approval journeys.
3. A new store-performance comparison dashboard or bulk reassignment commitment.

# Mental model and design principles

- **A location is where work happens.**
  - Use address and supported identifiers to disambiguate.
  - Preserve the common label Stores while testing whether explanatory wording such as outlet or centre improves recognition for specific merchants.

- **Association does not grant authority.**
  - Listing a cashier at a store does not mean they can administer it.
  - A device assigned to the store does not inherit every user's permissions.

- **Current mapping and historical evidence are different.**
  - Changes to a store or device association must not make past transactions appear to have occurred at a different place without an explicit source correction.

# Proposed solution and design

## User journey and decisions

**Journey**

1. Open Stores
2. Search and confirm outlet
3. Inspect details and linked devices/staff
4. Enter local records or a permitted administrative task
5. Review affected scope
6. Receive outcome
7. Return to the outlet context

- ST1–ST5 cover the core path.

- **Proposal:** make the store detail a relationship view rather than duplicating full payment and permission modules.
- Financial entry should name In-store payments and preserve the selected store where supported.
- Inviting or changing staff opens the access workflow with the store visible; it must not silently apply an all-store role.

- Expose store QR identity and its supported linkage before copy/download/use.
- Linking a device or QR requires authoritative association and permission checks.
- Store status changes need an approved consequence model: do not assume deactivation removes financial history, users and devices together.

## States and recovery

- Cover no permitted stores, filtered-empty, inactive location, missing association, removed access and failed changes.
- Explain an empty linked-device list separately from unavailable mapping data.
- Preserve target location on failure.
- When scope becomes invalid, stop the protected action and explain the changed access without exposing unrelated stores.

## App behaviour

- **Proposal:** prioritise finding the local outlet, recognising its IDs and opening device/support/payment tasks.
- Multi-store users should see current scope outside the selector.
- Complex reassignment or fleet comparison remains a platform decision, not an assumed app omission.

## Web behaviour and continuity

- Support store search, address/ID comparison and authorised linked-user/device administration.
- Keyboard navigation should support returning from a linked task.
- Share store identity and access rules with app; business changes reset filters.
- Cross-device state persistence and automatic store assignment are not established.

## Mockups and tradeoffs

- **References:** components/account/manage-stores-section.tsx, store-qr-panel.tsx and lib/stores-data.ts.
- Final frames are pending for similar names, centre terminology, missing mappings and restricted users.
- Relationship shortcuts improve findability but duplicated controls can diverge; keep execution in the owning module.

# Dependencies and validation

- Store identity, address, membership, device association and historical attribution must be accurate.
- **H1:** name/address/IDs improve correct-store selection.
- **H2:** relationship entry improves task findability.
- **H3:** explicit scoped access handoff reduces unintended all-store grants.
- Test managers, finance and actual access administrators with similar outlets, moved devices and restricted cashier cases.
- Include a business with Online payments to verify that no Online store attribution is inferred.

# Open questions

1. **Product/data:** what does store status change operationally and historically?
2. **Product:** which association and QR tasks are approved on each platform?
3. **Research:** which location terminology improves recognition without creating inconsistent labels?
4. **Data owners:** how are historical store mappings and current associations distinguished?

# Alternatives considered

- Treating each store as a business conflicts with the account model.
- Creating a synthetic Online store hides the actual channel distinction.
- A full financial dashboard per outlet may support comparison but needs separate scoping; begin with clear context and links to owned operational modules.

# Appendix and references

- Parent: docs/design/pine-one-platform-design-strategy.md, G1–G2/G5, D1–D5 and D9–D11.
- Canonical reference: docs/design/pine-one-user-personas-and-behaviours.md, P2–P5, B01, B04, B08–B10, B14, B16–B18; R02, R03, R05 sections cited above.
- Discovery: docs/flows/pine-one-cross-platform-discovery.md, answers 26–27, 56, 72 and 99.
- Related modules: Devices, Roles and Permissions, Transactions and Reports.
- Decision history: 5 October 2026, proposed store relationship view; no new Online store model or onboarding scope.
