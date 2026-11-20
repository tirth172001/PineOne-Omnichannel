---
title: Disputes design document
description: Channel-specific case review and response across web and app.
kind: Module design
date: 2026-10-05
topics: [in-store, online, disputes, chargebacks]
source: docs/exports/omni-design-suite/Pine One Disputes Design Document.docx
---

Updated: 5 October 2026

Parent: Pine One Omni Platform Design Strategy

Scope: Channel-specific case review and response across web and app

Review status: Proposed module design with operational rules requiring confirmation

Design owner, product owner and launch milestone: To be assigned

# Overview

- Disputes should help an authorised merchant understand a case, identify its response deadline, provide the relevant evidence and know whether their response was received.
- We propose organising the experience around the case's next required action rather than its amount alone.
- Online and In-store remain separate views.
- The module supports G2 reliable self-service and G3 useful engagement; explicit scope also supports G1.

- Accept, defend, partial defence and evidence correction are prototype capabilities.
- Their availability, financial consequences and eligibility must come from approved operations rules, not sample records.

# User and behaviour references

- P4 adopts T3 Investigator and may prepare evidence.
- P1 or another explicitly authorised operator may decide a response; that responsibility is not validated as a universal owner task.
- Apply B01, B04, B07, B09–B10, B14–B16.
- Keep approval and refund responsibilities separate from dispute response authority.

## Research implications

- R04 Issues Reported documents missing old charge slips when disputes arise later.
- B04/B16 therefore require durable access to supported historical proof.
- R01/R02 support human escalation in financial investigations, not a tested dispute workflow.
- No supplied report validates partial defence, required document sets or response-role assignment.

# Problem and motivation

- The original payment may be easy to find at close but hard to prove weeks later.
- An unclear deadline or a rejected attachment can leave the merchant unaware that further action is needed.
- A submitted response is not a won case; conflating these outcomes creates false reassurance.

- The prototype exposes Action pending, Reviewing and Closed, including documents rejected and Won/Lost treatments.
- It accepts evidence filenames in the interface.
- This is design evidence, not proof of persistent upload, operational delivery or retention.

# Goals and success measures

| **Local goal** | **Proposed measure** | **Parent goal** |
| --- | --- | --- |
| Recognise a required response | Correct deadline and next-action interpretation | G1, G2 |
| Submit an eligible response | Confirmed submissions before deadline per actionable case | G2 |
| Correct rejected evidence | Successful correction without repeating unaffected work | G2 |
| Understand ongoing review | Correct submission-versus-outcome interpretation | G2, G3 |

- Baselines and targets are pending.
- Measure deadline misses, attachment failures and response completeness, segmented by channel and platform.
- Winning a case depends on evidence and external review, so win rate alone is not a usability measure.

# Requirements

- Priorities are proposed; P0 protects timely, valid response and P1 improves investigation.

| **ID and user story** | **Design implication** | **Priority** |
| --- | --- | --- |
| DP1 I need to find cases that require my action | Separate actionable cases from review and closed history | P0 |
| DP2 I need the real response deadline | Show date, time basis and consequences from operations | P0 |
| DP3 I need to understand the original payment and reason | Preserve channel, identifiers and case context | P0 |
| DP4 I need to choose an eligible response | Explain accept, defend and supported partial amounts | P0 |
| DP5 I need the correct evidence | Use case-specific requirements and supported historical proof | P0 |
| DP6 I need to know the submission was received | Confirm server acknowledgement and reference | P0 |
| DP7 I need to fix an evidence issue | Explain the affected file and supported resubmission path | P0 |
| DP8 I need case history and support | Preserve response versions and contextual escalation | P1 |

## Out of scope

1. Universal evidence rules, payment-mode eligibility or guaranteed dispute outcomes.
2. Automated evidence generation, new retention commitments or bulk responses.
3. A response deadline extension unless operations explicitly supports it.

# Mental model and design principles

- **An action deadline is different from a review timeline.**
  - Tell users whether they must act or wait.
  - Only actionable money-blocking cases qualify for the existing Overview attention surface; review-only cases remain visible here without an urgent action claim.

- **Uploading is not submitting.**
  - A selected filename, completed transfer and acknowledged case response are separate milestones.
  - Show the actual completion point.

- **Accepting and defending have consequences.**
  - Explain the approved effect and amount before confirmation.
  - Partial defence must show what happens to the remaining amount; keep it unavailable until that rule is defined.

# Proposed solution and design

## User journey and decisions

**Journey**

1. Open the channel's actionable list or a permitted case link
2. Inspect reason, original payment, deadline and amount
3. Retrieve proof
4. Choose response
5. Upload required evidence
6. Review consequences
7. Submit
8. Receive acknowledgement
9. Track review or correct a rejection

- DP1–DP8 cover this path.

- **Proposal:** deadline and next action lead the case detail; evidence and source identifiers follow.
- Use required/optional labels based on the actual case rather than requiring every prototype document slot.
- Keep a clear response review before irreversible acceptance or submission.
- Historical slips must come from a supported source; if unavailable, explain the evidence gap and escalation path.

## States and recovery

- Cover actionable, reviewing and closed cases; rejected evidence; transfer failure; unknown submission outcome; expired deadline; and restricted access.
- On timeout, check for an existing acknowledged response before inviting resubmission.
- Preserve unaffected evidence only where secure draft storage is supported.
- Do not promise draft recovery after closing the session without implementation.

## App behaviour

- **Proposal:** make urgent case review, deadline reading and permitted response possible with touch-friendly evidence inspection.
- Camera/document capture, mobile file limits and draft storage require decisions.
- If a response is web-only, explain the boundary and retain a safe case handoff without implying the deadline pauses.

## Web behaviour and continuity

- Support comparing cases, retrieving historical records and reviewing attachments alongside the response.
- Keyboard focus and validation must lead to the affected evidence field.
- App and web share deadlines, response permissions and outcome meanings.
- A supported case link rechecks business/channel access; no cross-device draft synchronisation is assumed.

## Mockups and tradeoffs

- **References:** components/disputes/dispute-detail-content.tsx, dispute-evidence-panel.tsx and accept-dispute-dialog.tsx; app/disputes/[id].
- Annotated approval frames are pending for expired deadlines, partial defence, rejected proof and unknown submission.
- Guided evidence can reduce omissions but over-prescriptive requirements may prevent a valid response; operations must own case-specific rules.

# Dependencies and validation

- The case service must supply authoritative deadlines, eligible actions, financial consequences, upload validation, acknowledgement and status history.
- **H1:** action-led detail improves deadline recognition.
- **H2:** a review step reduces wrong-response choices.
- **H3:** targeted evidence correction improves resubmission completion.
- Test actual evidence operators and authorised decision-makers with historical-slip gaps and interrupted uploads.
- Use anonymised artefacts; no comparative result is claimed yet.

# Open questions

1. **Operations/product:** which responses and payment modes are supported per channel?
2. **Operations:** what happens to the remainder of a partial defence and to an expired case?
3. **Data/security:** what evidence retention, access and upload constraints are approved?
4. **Product:** which response tasks must work in the app at launch?

# Alternatives considered

- An amount-ranked list can hide an imminent small case.
- A universal attachment checklist is simple but may demand irrelevant files.
- A status-only detail omits the actionable decision; retain deadline and next step with supporting history.

# Appendix and references

- Parent: docs/design/pine-one-platform-design-strategy.md, G1–G3, D2–D5, D9–D10.
- Canonical reference: docs/design/pine-one-user-personas-and-behaviours.md, P1/P4, T3, B01, B04, B07, B09–B10, B14–B16; R04 Issues Reported.
- Discovery: docs/flows/pine-one-cross-platform-discovery.md, answers 47, 91–100; V3 IA section 5.4.
- Attention rules: docs/flows/merchant-homepage.md, section 1.
- Decision history: 5 October 2026, proposed case-response design; prototype options remain subject to operations approval.
