---
title: Transactions design document
description: Payment verification and investigation across Online and In-store web and app views.
kind: Module design
date: 2026-10-05
topics: [in-store, online, transactions, payments]
source: docs/exports/omni-design-suite/Pine One Transactions Design Document.docx
---

Updated: 5 October 2026

Parent: Pine One Omni Platform Design Strategy

Scope: Payment verification and investigation across Online and In-store web and app views

Review status: Proposed module design

Design owner, product owner and launch milestone: To be assigned

# Overview

- Transactions should help a merchant answer whether a particular payment succeeded, find the evidence for it and investigate mismatches without losing context.
- We retain separate Online payments and In-store payments views.
- Online can distinguish an order from its payment attempts; In-store exposes outlet and terminal context.
- This supports G1 business clarity, G2 reliable self-service and G3 useful engagement.

- Transactions is the current prototype name.
- The parent strategy leaves Payments versus Transactions as a naming decision.
- This document describes the merchant task without treating that label as approved.

# User and behaviour references

- P2 and P3 verify local payments; P4 adopts T3 Investigator for matching.
- A role does not automatically grant refund or broad-store access.
- Apply B01–B07, B10, B14 and B16–B18 from the central reference rather than repeating profiles.

## Research implications

- R02 Store Cashier and Daily Workflow support centre-scoped checking and external matching.
- R03 Issues Raised and Action Items Captured report manual fallback, wrong payment-mode entry and shift/device filtering needs.
- R04 Issues Reported describes changing counts; R05 Payment Reconciliation Challenges needs transaction-level references.
- R01 Nightly Workflow supports totals-to-bill matching.
- These establish verification and evidence needs, not a timed benchmark, preferred search sequence or validated channel selector.

# Problem and motivation

- A frontline user may need to match a payment while a customer waits.
- Similar amounts and repeated attempts can make the latest row insufficient evidence.
- Finance later needs the same event's relationship to billing and payout records.
- A successful collection status must not imply settlement or prove that an external bank refund is recorded.

- **Prototype channel fields differ:** In-store includes store, terminal and receipt context; Online includes Order/Payment views, customer and gateway lifecycle information.
- A mixed list would obscure those distinctions and contradict D2.

# Goals and success measures

| **Local goal** | **Proposed measure** | **Parent goal** |
| --- | --- | --- |
| Verify the correct event | Correct payment/status identification in timed scenarios | G1, G2 |
| Investigate a mismatch | Successful matching and manual steps per test case | G2 |
| Complete close-period lookup | Agreement between scoped totals and export evidence | G1, G2 |
| Return for operational work | Repeat successful verification or investigation within four weeks | G3 |

- Establish baseline and targets through observation and analytics.
- Separate verification from finance investigations.
- Guardrails include wrong-payment selection, duplicate collection prompts, wrong-scope exports and interpreting stale data as current.

# Requirements

- P0 priorities protect the core verification task; P1 priorities support deeper investigation.
- Priorities are proposed.

| **ID and user story** | **Design implication** | **Priority** |
| --- | --- | --- |
| TX1 I need the correct business and channel | Inherit D2–D5 and role/store scope | P0 |
| TX2 I need to locate a payment | Support available references, amount/time and contextual filters | P0 |
| TX3 I need to know what the status proves | Explain collection outcome, update time and next step | P0 |
| TX4 I need an order distinguished from its attempts | Keep Online order and payment identities visible | P0 |
| TX5 I need evidence for the selected event | Preserve original IDs, history and supported receipt access | P0 |
| TX6 I need shift and device matching | Review explicit time windows, timezone and mode/device totals | P1 |
| TX7 I need a matching export | Use Reports scope and completeness rules | P1 |
| TX8 I need an appropriate refund entry | Hand off an eligible record with explicit permission | P0 |

## Out of scope

1. Executing POS collection, fixing billing integration or automatically reconciling accounting.
2. Combined channel lists and unapproved full-card data displays.
3. Refund execution and payout configuration; companion documents own those flows.

# Mental model and design principles

- **A payment attempt is not an order total.**
  - An order can have multiple attempts.
  - The UI must not invite adding attempt values as though every attempt collected money.

- **Status needs evidence and freshness.**
  - Match identity, amount and time before concluding that the customer paid.
  - Pending is not success; missing data is not failure.
  - A dashboard status alone cannot establish bank receipt.

- **A close is a period, not always a date.**
  - A 1 AM outlet close can cross midnight.
  - Keep the start/end basis and timezone visible in totals and exports, subject to supported filtering.

# Proposed solution and design

## User journey and decisions

**Journey**

1. Open Transactions directly or from a known record
2. Confirm scope
3. Search/filter
4. Distinguish candidates
5. Inspect outcome and supporting identifiers
6. Open permitted receipt/history or linked refund/support
7. Return to the same investigation context

- Map lookup to TX1–TX5 and follow-on work to TX7–TX8.

- **Proposal:** give recent events and direct search a short path without requiring Overview.
- Summary counts can open their corresponding filtered list when the count and list share definitions.
- Preserve channel and filters on return; business change resets them.
- Do not fabricate a corrected payment mode where a POS entry was wrong; show supported source values and an investigation route.

- Keep payment status, original identity, amount, timestamps and source context ahead of optional customer/product detail.
- Retrieve billing match keys only when available.
- R05's card-format request remains a masking and data-availability decision, not a display requirement.

## States and recovery

- Distinguish no activity from no search results and unavailable data.
- Explain an Online order with no successful attempt.
- Show source update time when records can arrive late.
- A refresh failure preserves lookup context.
- An unavailable historical receipt provides a specific evidence/support path, not a fabricated slip.
- Recheck eligibility when entering a refund.

## App behaviour

- **Proposal:** prioritise recent lookup, clear status and sufficient matching fields for one event.
- Filters may open a sheet but scope remains visible outside it.
- Preserve an interrupted search within the session where supported; cross-device draft persistence is not assumed.

## Web behaviour and continuity

- Use tables for comparison, channel-specific filters, history and scoped export entry.
- Keyboard navigation must support search, row opening and return.
- App and web use identical record/status meanings and access rules.
- A supported deep link resolves the record's business and channel after access verification; Online customer data remains restricted.

## Mockups and tradeoffs

- **Prototype references:** components/transactions/transactions-content.tsx and transaction-detail-content.tsx; app/transactions and app/transactions/[transactionId].
- Annotated frames remain pending for repeated amounts, multiple attempts, cross-midnight close, delayed data and unavailable slips.
- A compact first view improves scanning but must retain enough evidence to avoid false matches.

# Dependencies and validation

- Searchable identifiers, source timing, receipt retrieval, permission enforcement and consistent report data determine task success.
- **H1:** contextual references reduce wrong-event matches.
- **H2:** clear order/attempt separation improves Online interpretation.
- **H3:** explicit shift scopes reduce close-period mismatches.
- Test P2/P3 with duplicate amounts and manual-fallback cases; test P4 against anonymised bills and exports.
- Validate both channels without treating prototype sample statuses as authoritative payment-mode support.

# Open questions

1. **Product:** should the customer-facing module be Payments or Transactions?
2. **Data owners:** which identifiers, update guarantees and historical receipts are actually available by channel?
3. **Product/research:** which minute, shift and device filters belong in the first release?
4. **Operations:** how should users investigate source corrections or changing counts?

# Alternatives considered

- Amount-only lookup is quick but ambiguous.
- A full-field first view supports finance but burdens frontline scanning.
- Combined lists conflict with D2; retain shared task structure and channel-specific detail.

# Appendix and references

- Parent: docs/design/pine-one-platform-design-strategy.md, G1–G3, D1–D5, D9–D11.
- Canonical reference: docs/design/pine-one-user-personas-and-behaviours.md, P2–P4, T3, B01–B07, B10, B14, B16–B18; R01–R05 sections cited above.
- Discovery: docs/flows/pine-one-cross-platform-discovery.md, answers 49, 55–58, 83–85 and 91–100.
- Related modules: Refunds, Settlements and Reports design documents.
- Decision history: 5 October 2026, proposed lookup and close-period requirements; channel separation retained, filter release scope pending.
