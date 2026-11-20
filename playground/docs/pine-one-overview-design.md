---
title: Overview design document
description: Permitted business summary and task entry across web and app.
kind: Module design
date: 2026-10-05
topics: [in-store, online, overview, home]
source: docs/exports/omni-design-suite/Pine One Overview Design Document.docx
---

Updated: 5 October 2026

Parent: Pine One Omni Platform Design Strategy

Scope: Permitted business summary and task entry across web and app

Review status: Proposed module design with existing homepage decisions retained

Design owner, product owner and launch milestone: To be assigned

# Overview

- Overview should help a merchant understand the selected business and identify the next useful action.
- It can combine Online payments and In-store payments, while every operational destination retains channel-specific records.
- We propose prioritising actionable money blockers, collection and payout information, task entry, then relevant product discovery.
- This supports business clarity G1, reliable self-service G2 and useful engagement G3; product discovery also supports G4.

- Overview is not a compulsory step before every task.
- A manager closing the outlet can enter Reports directly; finance can open Transactions or Settlements.
- Combined summaries do not replace those workflows or external accounting.

# User and behaviour references

- P1 and P2 are working users for a business scan; P3 needs permitted payment verification, not an assumed settlement view.
- P4 may use Overview as an entry to T3 investigation.
- Apply B01, B03, B06, B10, B11, B14 and B17 from the canonical persona reference.

## Research implications

- R01 Mental Models and Prototype Walkthrough support totals-to-detail expectations alongside direct Reports entry.
- R02 Daily Workflow and R04 Behaviour and Day to Day Work support distinct collection and bank-matching tasks.
- B18 warns against treating a visible product card as understood: R01 misunderstood website Checkout and R02 did not know links or support were available.
- The reports do not establish P1 daily Overview use, combined-total comprehension or a preferred app/web hierarchy.

# Problem and motivation

- A merchant currently moves between separate platforms to assemble channel totals.
- Consolidation reduces that switching only when metric definitions, period and permitted scope are clear.
- An incomplete total presented as complete can create more uncertainty than separate figures.

- Existing homepage guidance distinguishes money-blocking action from routine information.
- It leads with settlements on web; the recorded mobile override leads with collection and places payout immediately below.
- Keep this difference visible for validation rather than describing either hierarchy as research-proven.

# Goals and success measures

| **Local goal** | **Proposed measure** | **Parent goal** |
| --- | --- | --- |
| Interpret the business picture correctly | Correct scope and money-stage answers in scenario tasks | G1 |
| Reach the relevant next task | Unassisted entry to the correct channel and filtered destination | G2 |
| Return for useful work | Merchants completing a core task again within four weeks | G3 |
| Understand a relevant product | Eligible users reaching informed activation and first use | G4 |

- Baselines, numerical targets and measurement owners are pending.
- Segment web/app, role and channel access.
- Guardrails are wrong-scope errors, missed actionable blockers and operational task completion when promotions appear.

# Requirements

- P0 means needed for a trustworthy initial experience; P1 means a proposed follow-on improvement.
- All priorities require review.

| **ID and user story** | **Design implication** | **Priority** |
| --- | --- | --- |
| OV1 I need to know which business and period I am viewing | Show business identity and summary scope | P0 |
| OV2 I need to know if money needs my action | Apply the existing blocker taxonomy and permitted destinations | P0 |
| OV3 I need collection and payout to mean different things | Label stages and time bases explicitly | P0 |
| OV4 I need a combined figure I can trust | Aggregate comparable permitted data and disclose incomplete scope | P0 |
| OV5 I need the summary to lead to the right records | Resolve an explicit channel without inventing a combined list | P0 |
| OV6 I need shortcuts to useful work | Gate actions by access and preserve destination context | P0 |
| OV7 I need to understand another product before proceeding | Explain benefit and a real activation or enquiry next step | P1 |

## Out of scope

1. Combined operational lists or automatic accounting reconciliation.
2. New KYC journeys; existing blocker entry may hand off to the current journey.
3. Personalised ranking or push notifications without a separate decision.

# Mental model and design principles

- **A summary describes a scope.**
  - A business total must not be mistaken for one outlet's money.
  - Online has no store construct.
  - The treatment of Online values after selecting an In-store store remains an explicit open decision under D5.

- **Attention implies something can be done.**
  - Preserve the homepage rule that only actionable money blockers enter its attention surface.
  - Account blockers precede item-level blockers; item-level ordering uses deadline, then age, rather than amount.
  - Routine failures can be shown in the snapshot without becoming blocker alerts.

- **A useful next step is more important than staying on Overview.**
  - Clear task links should shorten work; increased dwell time is not a success measure.

# Proposed solution and design

## User journey and decisions

**Journey**

1. Select business
2. Recognise permitted period and scope
3. Inspect blockers if present
4. Read collection and payout
5. Open a relevant task or product
6. See the destination's explicit context

- OV1–OV6 cover this path.

- Retain grouped blocker cards with count and amount where applicable.
- Their entry opens the matching action-pending list, not a randomly selected record.
- A singular bank-account blocker opens the authorised correction path.
- Only show actions the user can take; an escalation alternative needs its own permitted route.

- For a combined metric, do not silently open the default In-store list as though it explains the full amount.
- **Proposal:** name the destination channel, or offer a channel choice before entry.
- Final interaction remains open.
- A record-specific link can carry its known channel directly.
- Collection-window controls must not redefine a future payout's schedule.

## Shared states and recovery

- First use explains missing history; a genuine zero-activity period shows zero.
- Filtered empty states retain filters.
- Loading, stale values and one missing channel are labelled separately.
- If aggregation cannot be supported, show available channel information with an incomplete-state explanation, not a confirmed business total.
- Business switching resets filters under D4.

## App behaviour

- Keep collection and payout readable in the first view under the mobile override, with money blockers above when present.
- Recent-payment lookup and permitted shortcuts support immediate tasks.
- Touch-friendly deeper detail remains available.
- Offline accuracy and queued actions are not promised.

## Web behaviour and continuity

- Retain the existing settlement-first snapshot direction while testing the hierarchy conflict.
- Desktop can expose more context and analytics without using a different metric meaning.
- Filters, drill-downs and keyboard focus must make the destination predictable.
- Both platforms share IDs, statuses, access and freshness definitions; cross-device filter persistence is not established.

## Mockups and tradeoffs

- Existing references are docs/flows/merchant-homepage.md and components/home/home-content.tsx.
- Annotated approval frames are pending for dual-channel totals, restricted cashiers, cross-midnight periods, incomplete data and product discovery.
- Aggregation reduces arithmetic but increases scope risk; disclose scope and test interpretation before expanding it.

# Dependencies and validation

- Comparable metrics, reliable timestamps, permissions and real action destinations are prerequisites.
- **H1:** stage and scope labels improve correct interpretation.
- **H2:** explicit-channel drill-down reduces wrong-list entry.
- **H3:** operational-first discovery preserves task success while improving informed adoption.
- Test P2/P3/P4 and directly recruit P1, across single/dual-channel access and multi-store cases.
- Revisit the hierarchy if users miss their primary answer or cannot reach recurring work.

# Open questions

1. Product and data owners: what happens to Online values when a store is selected?
2. **Design and product:** which combined-summary drill-down makes the channel boundary clearest?
3. **Research:** is the web/app hierarchy difference useful for actual tasks?
4. **Data owners:** which totals can remain comparable when one source is delayed?

# Alternatives considered

- A channel-only Overview simplifies scope but loses the stated combined business answer.
- A combined operational destination conflicts with D2.
- Equal product and operational prominence increases exposure but may obscure immediate work; evaluate adoption alongside task completion.

# Appendix and references

- Parent: docs/design/pine-one-platform-design-strategy.md, G1–G4 and D2–D7, D10–D11.
- Canonical personas and research: docs/design/pine-one-user-personas-and-behaviours.md, P1–P4, B01, B03, B06, B10–B11, B14, B17–B18; R01, R02, R04 sections cited above.
- Discovery: docs/flows/pine-one-cross-platform-discovery.md, answers 69–90.
- Homepage decisions: docs/flows/merchant-homepage.md; mobile hierarchy: docs/design/mobile-home-reference-analysis.md.
- Decision history: 5 October 2026, proposed module framing; existing homepage rules retained, no new visual or release sign-off.
