---
title: Settlements design document
description: In-store and online settlements on web and app.
kind: Module design
date: 2026-10-05
topics: [in-store, online, settlements, reconciliation]
source: docs/exports/omni-design-suite/Pine One Settlements Design Document.docx
---

Updated: 5 October 2026

Parent: Pine One Omni Platform Design Strategy

Scope: In-store and online settlements on web and app

Review status: Proposed module design

Design owner, product owner and launch milestone: To be assigned

# Overview

- We want merchants to understand how much money is due, when it is expected and what they should do if it does not arrive.
- The proposed Settlements experience puts these answers before detailed reconciliation information and provides a path to the payments, deductions and references that explain a payout.

- This module applies the platform goals of business clarity (G1), reliable self-service (G2) and useful engagement (G3).
- Its primary local goal is to reduce avoidable settlement-support contacts by improving understanding and resolution.
- We also want merchants to return to Pine One as a useful source of payout information.
- A reduction in repeated checking caused by uncertainty can be a positive result.

- The proposed app emphasis is a quick payout check and an immediate next step; web supports longer investigation and reconciliation.
- Research supports the matching task but does not yet establish platform preference.
- Both retain separate In-store payments and Online payments views.
- Combined channel information belongs in Overview; this module shows the selected channel's records and amounts.

# User and behaviour references

- P4 Finance or operations administrator is directly supported for bank matching and adopts T3 Investigator.
- P1 and permitted P2 payout checks remain working scenarios: R01 separates the manager's collection close from finance's bank check.
- Settlement visibility follows the user's permitted business, channel and applicable store scope; P3 Cashier is not assumed to have settlement access.

- The design refers to B03 Scan for exceptions before investigating, B04 Move from an answer to supporting evidence, B05 Keep operational records separated by channel, B06 Distinguish collection, refund and settlement stages, B07 Resume an interrupted investigation, B10 Judge trust through status and freshness, B12 Choose platform according to task depth and B15 Escalate with task context intact.

- The module-specific scenario is checking how much will reach the bank, when it is expected, which account will receive it and whether the user needs to act.
- B16 provides reported evidence for payout composition, matching references, charges and exports; B17 distinguishes collection period from payout date; B18 supports comprehensible charge labels.
- Expense planning, task frequency and the preferred first view remain hypotheses.

## Research implications

- Use P4/B04/B06/B16 and R01 Finance Mental Model, R02 Daily Workflow, R04 Settlement Mechanism and R05 Payment Reconciliation Challenges from the canonical reference.
- The solution must support matching an actual bank credit to included transactions and deductions, including split credits or separate acquirer routes where the data permits.
- External accounting remains part of the task.

- B10 and R01/R02 Pain Points, R04 Issues Reported and R05 Payment Reconciliation Challenges require treating export completeness and changing counts as data dependencies.
- R04 Prototype Review supports testing familiar charges copy, not claiming the current CTA is understood.
- The research does not measure ticket reduction, prove bank receipt from a dashboard status or validate a mobile/web split.

# Problem and motivation

## A status may not explain what the merchant should expect

- R01 and R02 report human escalation for missing or delayed credits, and R04/R05 document mismatches that require investigation (B10, B15, B16).
- These establish uncertainty and evidence problems in the supplied contexts.
- We do not yet have a breakdown of ticket reasons or contact rates; validate the proposed hierarchy with matching tasks and support cases before estimating impact.

## Collection and payout can be mistaken for the same amount

- A successful payment and a bank payout represent different stages.
- Batches, deductions and channel-specific settlement cycles can make the amounts differ.
- We propose making the relationship traceable within Settlements and exports so the user can match it to bank and accounting evidence (B06, B16).
- Completing that task may still require an external system.

## The current design provides useful detail but leaves hierarchy questions

- The V3 settlement document records today's payout, transaction count, completed batches, bank and settlement references, processing ETA, transaction-level deductions and a charge-confirmation panel for paid modes.
- It also places an on-demand eligibility banner above the summary and uses icon-only settlement-type labels in the table.
- These are documented prototype behaviours, not evidence that merchants understand them.

- The opportunity is to test whether payout certainty should lead, whether settlement types need visible text and whether the next step for a delay or hold is sufficiently clear.
- Actual payout speed depends on operational systems; information design alone cannot make money arrive sooner.

# Goals and success measures

| **Local goal** | **Proposed measurement** | **Parent goal** |
| --- | --- | --- |
| Reduce avoidable status and explanation contacts | Contacts tagged to those reasons per 1,000 merchants with a settlement due in the period | G2 |
| Improve payout comprehension | Percentage correctly identifying amount, expected timing and next action in a scenario | G1, G2 |
| Improve investigation | Successful reconciliation tasks and time to explain a discrepancy | G2 |
| Increase useful self-service | Merchants completing a settlement check or action and returning for a subsequent need | G3 |

- Record baseline and target separately for app, web and channel.
- Define contact categories with support before measuring; distinguish an information question from an actual payout failure.
- Compare equivalent periods and account for holidays, settlement volume and incidents.
- Numerical targets are pending baseline review.

- Guardrails are unresolved-issue rate, repeat contact for the same payout, access to support and comprehension of paid-service charges.
- Lower ticket counts with more unresolved payouts would not meet the goal.

# Requirements

- Priorities are proposed for review.

| **ID and user story** | **Comments** | **Priority** |
| --- | --- | --- |
| S1 I need to know what money to expect and when | Show supported amount, timing and destination with clear scope | P0 |
| S2 I need to know whether I must act | Distinguish waiting, delay, failure and an actionable hold | P0 |
| S3 I need to explain a difference in amount | Link payout to included payments and applicable deductions | P0 |
| S4 I need proof to match a bank record | Make settlement and bank references available when provided | P0 |
| S5 I need the right channel and store context | Inherit platform defaults, persistence and access rules | P0 |
| S6 I need help when the information cannot resolve my issue | Carry payout context into support | P0 |
| S7 I need to judge an early-payout offer | Show eligibility, charges and net payout before confirmation | P1 |
| S8 I need reconciliation evidence for further work | Provide correctly scoped history and export on web | P1 |
| S9 I need to understand and update the settlement destination | Show bank accounts per channel and the verification state of an authorised change request | P0 |
| S10 I need historical records from before Omni | Surface legacy history from each channel with its channel and source preserved | P1 |
| S11 I need to match each bank credit to its transaction set | Show supported payout groupings, acquirer/network context and matching keys; B16 | P0 proposed |
| S12 I need complete exports that agree with the screen | Preserve scope, totals and schema; expose generation failures or incomplete output; B10, B16 | P0 proposed |
| S13 I need to distinguish the collection window from payout date | Show explicit date/time basis and timezone; B17 | P1 proposed |

## Out of scope

1. Changing settlement-cycle contracts, pricing or operational payout guarantees.
2. Onboarding, KYC redesign and migration mapping correction.
3. Introducing paid payout modes for channels where eligibility is not supported.
4. Automatically retrying a payout, changing a bank account or taking a financial action without an explicitly designed and authorised flow.

# Mental model and design principles

- **A payment can succeed before its payout is due.**
  - Explain collection and settlement separately, with the applicable cycle or expected date.
  - Do not label a scheduled future payout as a failure.

- **A difference should have a traceable explanation.**
  - Show the amount expected to reach the bank, then let the user inspect the included payments and applicable deductions.
  - Use the actual data categories supplied by the settlement system rather than assuming every channel has the same breakdown.

- **An exception should explain whether to wait or act.**
  - Put the known reason and next step alongside the status.
  - When a reason or reliable date is unavailable, say so and provide a support path.
  - A generic error message cannot establish that retrying is safe.

- **A paid option is a separate choice.**
  - Resolve the payout question before presenting an early-settlement offer.
  - Explain charges, net amount, eligibility and whether the choice affects this payout or future payouts.
  - Avoid implying that purchasing a service fixes a failed standard payout.

# Proposed solution and design

## User journey

**Journey**

1. Open Settlements directly or from a contextual entry
2. Confirm business and channel
3. Understand expected payout and any exception
4. Inspect the relevant batch
5. Review breakdown or complete an available action
6. See a clear outcome or continue with support

- An entry from an all-channel Overview resolves to an explicit permitted channel and keeps that scope visible.
- For a user with both channels, the page-level switcher makes the resulting Online or In-store view clear.
- An aggregate Overview amount must not open as though it were one settleable batch.
- Direct entry to matching records and export remains available for recurring P4 work (B03, B16).

## Payout summary

- **Proposal:** show Settled and Yet to be settled for the selected channel, including amount and transaction count.
  - The Settled summary supports Today, Yesterday and seven-day periods and may show a payment-method split.
  - Show the configured cycle, destination account and next supported settlement timing.
  - A future payout has its own schedule and should not be presented as a historical total controlled by the reporting filter.

- **Rationale:** the user can answer the immediate cash-availability question before reading a table.
  - Exact metric definitions, cut-offs and treatment of multiple scheduled payouts require data-team alignment.
  - If a single reliable next amount cannot be calculated, show the available schedules separately or explain the limitation.

## Status explanation and recovery

- **Proposal:** pair each status with relevant timing, reason and next step.
  - Use language consistent with the actual lifecycle and avoid suggesting bank receipt when the system only confirms payout initiation.

| **Scenario** | **Information shown upfront** | **Next step** |
| --- | --- | --- |
| Scheduled or processing | Expected timing if supported and last update | View details; explain when follow-up is appropriate |
| Settled | Confirmed status meaning, amount and available bank reference | Match against bank record |
| Known calendar delay | The actual calendar reason and revised timing if known | Wait until the stated expectation or access help |
| On hold with user action | Known reason, affected amount and required action | Open the permitted corrective flow |
| Failed or unexplained delay | Known reason; whether an operational response is underway | Contact support or use an explicitly supported recovery action |
| Stale or unavailable data | Last known update and unavailable-state message | Refresh or seek help without treating data as zero |
| No records for the period | Clear zero-activity state with current scope | Adjust filters or inspect another period |
| Bank account change awaiting verification | Existing active account and Verification in progress message | Wait for verification; do not imply the new account is active |
| Report generation or download failure | Failure message that preserves the requested scope | Retry without rebuilding the request |

- The table is a proposed content model.
- Backend status mapping, timing guarantees and recovery ownership are open dependencies.
- A bank holiday explanation appears in the existing discovery findings; it should only be used when it is the actual cause.

## Details and reconciliation

- Keep net amount and status visible when opening a batch.
- Show Settlement or Batch ID, copyable UTR when available, destination bank account, initiated timestamp and settled date.
- Follow with gross amount, itemised channel-specific deductions and net amount.
- Deductions may include refunds, MDR, taxes, adjustments and loan recovery when the source provides them.
- In-store detail can include terminal, store and acquirer context; Online detail can include Merchant Order ID, ARN or RRN where supported.

- The settlement list includes Settlement ID, UTR, type, gross amount, deductions, net amount, settled date and status.
- Search supports Settlement ID and UTR.
- Shared filters include a date range of up to six months, status, settlement type and payment method.
- In-store adds acquiring bank, terminal and store.
- Online adds the supported order and reference fields.
- Downloads reuse the existing UTR listing and Merchant Payout Report formats rather than introducing a new combined format.

- **Research-informed proposal:** map each supported bank credit to its included transaction set rather than assuming one day produces one credit (S11; B16; R01).
  - Show charge breakdowns using labels tested against merchant language (B18; R04).
  - A UTR identifies the payout; do not assume it is also a universal transaction-to-billing key.
  - Confirm available transaction references for each provider and merchant accounting workflow.
  - R05's requested card format remains unresolved and must not become an approved display rule through this document.

- For S12, the export and screen must use the same channel, location, time basis and status scope.
- Include row count and relevant totals where meaningful, retain the requested scope on failure and avoid claiming a partial report is complete.
- Validate reused MPR and UTR formats against real matching artefacts; R05 shows that schema changes can break accounting ingestion.
- Report scheduling and API delivery remain separate product decisions.
- For S13, distinguish the originating collection window from initiation, settlement and bank-credit dates, including closes that cross midnight.

- On web, allow investigation across rows and filtered exports.
- On the app, begin with the relevant payout and reveal the breakdown as the user needs it.
- These platform differences change the presentation, not the meaning of amounts or the user's permissions.

## Contextual support

- **Proposal:** an unresolved payout can open help with business, channel and settlement reference already associated.
  - Explain the next support step and make an existing case discoverable where integration allows.
  - This reduces repeated description of the problem while preserving access to human help.

- Evaluate self-service through successful comprehension or resolution.
- Do not define success solely as someone leaving the screen without contacting support.

## Paid settlement services

- The module includes Same Day Settlement and On Demand Settlement as independently enabled channel services.
- Eligibility is evaluated per channel.
- Same Day Settlement is enabled once; On Demand Settlement is requested for a specific payout and currently uses an 8 PM cut-off and a minimum request amount of ₹1.
- Product and risk owners must confirm limits before release.

- Before confirmation, show the eligible amount, percentage fee, expected timing and whether the action is one-off or changes a continuing preference.
- The supplied requirement says the final deduction amount is available only after a settlement batch is created, so the design must state that limitation instead of presenting a false exact net amount.
- After submission, distinguish a request received from a completed payout.

## Settlement preferences and bank accounts

- Show settlement cycle, enabled value-added services and bank accounts separately for Online and In-store.
- Version one may list several accounts but does not promise full terminal-to-account mapping.
- An authorised update requires penny-drop and name-match verification and remains visibly pending until confirmed.
- A failed bank payout may link to this flow only when changing the account is a valid recovery action.

## App behaviour

- The first view prioritises a readable payout answer and an action-needed message where applicable.
- Batch details present one payout at a time, with deeper breakdowns available.
- Important explanations work through visible text and touch interaction.
- Poor-connectivity behaviour and confirmation recovery need design; cached values must never appear current without a freshness indicator.

## Web behaviour

- The first view combines channel switcher, cycle and account context, summary, prioritised action or information banner, and a scannable settlement list.
- Alerts may cover a known bank holiday, a failed payout or risk-held transactions.
- A value-added-service offer follows unresolved money issues in the hierarchy.
- A detail page lets users inspect a batch and return with filters preserved; changing business resets them.

## Continuity between platforms

- Both platforms identify the same payout using the same reference and status meaning.
- A supported deep link should open the correct business, channel and payout after checking access.
- Drafts and filters are not assumed to synchronise across devices.
- Final decisions about configuration or bulk-work exclusions belong in the platform ownership review.

## Mockups and states for review

- Attach annotated app and web frames for a normal scheduled payout, a settled payout, an actionable hold, a known delay, a discrepancy investigation, unavailable data and paid-service confirmation.
- Link each annotation to S1–S8 and the hypothesis it tests.
- Existing behaviour is described in docs/flows/settlements-v3.md; new solution frames and final interaction details remain to be designed.

## Pros and cons

- Upfront timing and explanation should reduce the effort needed for routine checks, but depend on data accuracy and freshness.
- Additional state-specific copy can help comprehension but needs maintained lifecycle definitions.
- Progressive detail supports the app's quick-check context, but must still allow investigation.
- Reducing promotion prominence may lower immediate offer exposure; assess useful service adoption alongside task completion.

## Dependencies

- Agree lifecycle meanings, expected-date calculation, holiday calendar, payment-to-batch associations, deduction categories and bank-reference availability with settlement operations and engineering.
- Initiated means the payout was sent to the bank, Settled means a UTR was generated, and Failed means the payout failed without a UTR only if the backend can support those definitions consistently.
- Online pending states depend on Sigma availability.
- The entire module currently uses one VIEW SETTLEMENT permission.
- Product must confirm value-added-service limits, negative-net handling and bank-account change ownership.

# Hypotheses and validation

- **H1:** showing supported amount, expected timing and explanation upfront will improve payout comprehension and reduce avoidable status contacts.
  - Test normal, delayed and held payouts before comparing production contact rates.

- **H2:** connecting a payout to payments and deductions will help finance users explain discrepancies with fewer steps.
  - Ask users to reconcile a realistic batch and record correctness as well as task time.

- **H3:** putting the operational answer before a paid offer will improve task focus without reducing informed adoption.
  - Test what users understand about standard payout and service charges before testing offer placement at scale.

- **H4:** carrying record context into support will reduce repeated explanation and repeat contact.
  - Review case handling and merchant resolution, not only entry-click counts.

- **H5:** complete exports with stable matching keys and credit-level composition will improve correct bank/accounting matches.
  - Test screen/export agreement, split credits, separate acquirer routes and accounting schema compatibility using anonymised merchant artefacts (B10, B16, B17; R01, R02, R04, R05).

- Recruit owners, permitted managers and finance users across supported channel and store configurations.
- Establish support reasons and task baselines, test the proposed states, then set numerical targets.
- Evaluate web and app independently and investigate channel differences before pooling results.

# Open questions

1. Which settlement reasons account for avoidable contacts today, and how reliably are they tagged?
2. What does each state prove about bank receipt, and which expected dates can we communicate reliably?
3. Which deductions, adjustments and terminal or acquirer details help users resolve real discrepancies?
4. How should a negative net settlement be displayed, and does it carry into the next cycle?
5. What prefunding and amount limits apply to Same Day and On Demand Settlement for each channel?
6. Which failure or hold states have a user action, and which require support or operations?
7. Which settlement tasks must be completed on mobile, and which can be handed to web with a clear explanation?
8. Can Sigma provide Online Initiated, Processing and Failed states, internal error reasons and expected-date data reliably?
9. Which references join transactions, each payout credit and merchant accounting records for each channel/acquirer, and which cannot be supplied?
10. How will export completeness and screen/report consistency be checked, including duplicate, missing and changing records?
11. Can reused report formats support the merchant's stable accounting schema, and what scheduling or API scope is approved?

# Alternatives considered

- **Table-first landing:** supports experienced reconciliation users but requires routine checkers to infer their answer from rows.
  - The proposed summary provides an entry for both needs.

- **Generic status plus Contact support:** is easier to implement but leaves explainable situations unresolved.
  - Use available reasons and actions, while retaining support when the answer is insufficient.

- **Promotion above payout information:** increases exposure but can distract from uncertainty about existing money.
  - The proposal moves the operational answer first; adoption impact needs evaluation.

# Appendix and references

- Parent strategy: docs/design/pine-one-platform-design-strategy.md, especially G1–G5 and D1–D11.
- Personas, behaviours and research: docs/design/pine-one-user-personas-and-behaviours.md, especially P4, T3, B03–B07, B10, B12, B15–B18; R01 Finance Mental Model and Pain Points; R02 Daily Workflow and Pain Points; R04 Settlement Mechanism, Issues Reported and Prototype Review; R05 Payment Reconciliation Challenges and EMI Reporting Issues. Original source details are in its research register.
- Discovery: docs/flows/pine-one-cross-platform-discovery.md, answers 49–60, 69–80 and 91–100.
- Existing settlement design behaviour: docs/flows/settlements-v3.md.
- Existing homepage hierarchy: docs/flows/merchant-homepage.md.
- Settlement on Omni Dashboard, supplied 5 October 2026. Source for functional requirements, filters, value-added services and edge cases.
- Support evidence, baseline dashboard and final annotated design links: To be added during module validation.
