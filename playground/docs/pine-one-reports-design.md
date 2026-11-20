---
title: Reports design document
description: Report discovery, generation, history and proposed delivery management on web and app.
kind: Module design
date: 2026-10-05
topics: [in-store, online, reports]
source: docs/exports/omni-design-suite/Pine One Reports Design Document.docx
---

Updated: 5 October 2026

Parent: Pine One Omni Platform Design Strategy

Scope: Report discovery, generation, history and proposed delivery management on web and app

Review status: Proposed module design

Design owner, product owner and launch milestone: To be assigned

# Overview

- Reports should give merchants complete, correctly scoped evidence they can use to close an outlet, match a bank credit or import into accounting.
- We propose making report purpose, scope and completion explicit, with predictable formats for recurring work.
- This supports G1 business clarity and G2 reliable self-service; successful recurring report use supports G3.

- Online and In-store reports remain separate.
- Prototype wording describing an all-channel transaction report conflicts with D2 and must not become an approved combined export through this document.
- Scheduling, custom columns and email/SFTP delivery are represented in the prototype but still need release and security approval.

# User and behaviour references

- P4 is primary for T3 investigation and T4 recurring multi-record work.
- P2 and permitted P3 may download local collection evidence.
- Apply B01, B03–B04, B06, B10, B14 and B16–B18.
- Do not require these users to pass through Overview before entering Reports.

## Research implications

- R01 Nightly Workflow and Pain Points support direct Reports entry, working MPR generation and duplicate-export concerns.
- R02 Daily Workflow and Pain Points require centre/day/charge data and screen/export agreement.
- R03 Action Items Captured requests shift, minute and device scope and reports download-discovery gaps.
- R04 closes around 1 AM and reports changing counts.
- R05 EMI Reporting Issues documents an SAP-compatible email schema that differs from dashboard output.
- These justify reliability and stable-schema requirements, not a commitment to replace SAP, NetSuite or Tally.

# Problem and motivation

- Generating a file is not enough when totals differ from the screen, records are missing or a schema cannot be imported.
- The merchant then returns to bank MPR or manual Excel matching.
- Repeated exports may also differ because data changed; the user needs the basis and generation time, not an unexplained newer file.

- The prototype contains report categories, history and schedules.
- Transaction reports expose a deeper filter/column flow than other report types.
- Do not describe all categories as equally customisable or operationally supported.

# Goals and success measures

| **Local goal** | **Proposed measure** | **Parent goal** |
| --- | --- | --- |
| Find the appropriate evidence | Correct report choice without prompting | G2 |
| Obtain a complete scoped file | Valid complete outputs per accepted generation request | G1, G2 |
| Match or import without reformatting | Successful artefact-led matching/import tasks and manual steps | G2 |
| Complete recurring delivery | Confirmed deliveries per due scheduled run if released | G2, G3 |

- Baselines, targets and owners are pending.
- Guardrails include wrong-business recipients, missing/duplicate rows, schema breakage and reports marked complete without retrievable files.
- Segment report type, channel and platform.

# Requirements

- Priorities are proposed; P0 protects usable evidence, P1 extends recurring administration.

| **ID and user story** | **Design implication** | **Priority** |
| --- | --- | --- |
| RP1 I need a report for a recognisable task | Explain purpose and available fields in the catalogue | P0 |
| RP2 I need the same scope as my investigation | Show channel, store/device, period and status basis | P0 |
| RP3 I need complete evidence | Detect generation failure and disclose data limitations | P0 |
| RP4 I need files compatible with accounting | Agree stable schemas and supported matching identifiers | P0 |
| RP5 I need to track a requested report | Separate queued, processing, completed and failed outcomes | P0 |
| RP6 I need close-period evidence | Review cross-midnight and minute-level windows with timezone | P0 proposed |
| RP7 I need recurring delivery | Review schedules, recipients and delivery results | P1 |
| RP8 I need permitted column choices | Explain constraints and preserve essential match fields | P1 |

## Out of scope

1. Combined channel exports, automatic bank matching or replacing accounting software.
2. API delivery and new specialised report categories without separate scoping.
3. Approving a requested card-number format; supported identifiers and masking need review.

# Mental model and design principles

- **A report is evidence of a defined population.**
  - Scope includes date/time basis, timezone, status, channel and permitted location.
  - Creation time is different from the period covered.

- **Completed means the promised file is available.**
  - A toast or scheduled run does not prove delivery.
  - Show generation and delivery separately; a file can be generated while sending fails.

- **Consistency supports trust.**
  - Screen/export totals should agree for equivalent populations and snapshots.
  - Explain late-arriving or corrected records instead of requiring merchants to infer the reason.

# Proposed solution and design

## User journey and decisions

**Journey**

1. Enter Reports directly or from a scoped module
2. Select a task/report
3. Review filters and available schema
4. Name/request generation
5. Inspect processing history
6. Download and match/import
7. Retry a failed request or configure an approved recurring schedule

- RP1–RP8 describe the relevant outcomes.

- **Proposal:** prefill a contextual report request with its source scope and let the user inspect it before generation.
- Essential match fields and definitions should remain available.
- Any custom schema must be distinguished from the stable format used for recurring ingestion.
- Do not silently change an established schema when adding new fields.

- History should identify report type, requested scope, creator where permitted, generation time and file status.
- Propose meaningful row counts and totals to aid completeness checks.
- Confirm snapshot behaviour with data owners.
- For schedules, preview frequency, timezone, period rule, format and destination before activation.
- Explain whether recipient or permission changes suspend future delivery.

## States and recovery

- Separate no history, no matching data, generation failure, expired file, delivery failure and restricted report access.
- Preserve requested scope on retry; do not claim a partial output is complete.
- Check an uncertain request's status before creating another job.
- Show late data or snapshot changes when supported.

## App behaviour

- **Proposal:** support finding a routine report, reviewing its scope and accessing generation history.
- File download/share must respect device and access constraints.
- Scheduling and SFTP management remain an explicit platform decision; a web handoff explains the boundary without pretending the configuration is saved.

## Web behaviour and continuity

- Support catalogue search, comparison of history, available column choices and approved schedule administration.
- Keyboard-accessible filters and validation are required.
- Both platforms share scope definitions, schemas and permissions.
- Cross-device drafts are not promised; a completed server-side job remains discoverable where authorised.

## Mockups and tradeoffs

- **References:** components/reports/reports-content.tsx, transaction-report-panel.tsx and schedule-report-panel.tsx; app/reports.
- Final frames are pending for incomplete generation, SAP schema selection, cross-midnight windows and failed delivery.
- Flexibility helps ad hoc work but can break recurring imports; distinguish stable and customised outputs.

# Dependencies and validation

- Report services, source completeness, schema ownership, authorised delivery and job status determine reliability.
- **H1:** task descriptions improve correct report selection.
- **H2:** explicit scope and completeness improve matching correctness.
- **H3:** stable recurring formats reduce reformatting.
- Validate anonymised merchant files against bank/accounting artefacts with P4 and local close tasks with P2/P3.
- Include same-day repeats, missing rows, split credits and failed scheduled delivery.
- Numerical claims require baseline data.

# Open questions

1. **Product/data:** which report types and customisation are approved for each channel?
2. **Data owners:** what snapshot, correction and completeness checks can be supported?
3. **Product/security:** which schedules, destinations and permission-change rules are in scope?
4. **Research/data:** which fields and schema versions must remain stable for each accounting task?

# Alternatives considered

- A generic export button hides purpose and scope.
- Fully free-form columns increase flexibility but threaten ingest compatibility.
- Email-only delivery supports some recurring work but omits self-serve history and failure recovery; evaluate alongside the explicit job model.

# Appendix and references

- Parent: docs/design/pine-one-platform-design-strategy.md, G1–G3, D2–D5 and D9–D11.
- Canonical reference: docs/design/pine-one-user-personas-and-behaviours.md, P2–P4, T3/T4, B01, B03–B04, B06, B10, B14, B16–B18; R01–R05 sections cited above.
- Discovery: docs/flows/pine-one-cross-platform-discovery.md, answers 95–96; V3 IA section 5.6.
- Related modules: Transactions and Settlements design documents.
- Decision history: 5 October 2026, proposed evidence and delivery requirements; combined-report prototype wording rejected under existing D2, scheduling release scope pending.
