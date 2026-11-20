---
title: User personas and behaviour reference
description: Canonical personas (P), task lenses (T), behaviour hypotheses (B) and merchant research sources (R) that the module documents cite.
kind: Persona reference
date: 2026-10-05
topics: [in-store, online, personas, behaviour, merchant research]
source: docs/exports/omni-design-suite/Pine One User Personas and Behaviour Reference.docx
---

Updated: 5 October 2026

Scope: Shared user roles, task contexts, mental models and behavioural hypotheses across Pine One web and app

Review status: Work in progress research reference

Research owner, design owner and next review date: To be assigned

# Purpose and use

- This document is the canonical reference for Pine One personas and recurring user behaviours.
- Platform and module documents should cite the persona and behaviour IDs defined here instead of repeating general descriptions.
- They should add local detail only when a module changes the person's goal, risk, information need or behaviour.

- The current personas combine working role models with evidence from five merchant visit reports.
- Store-level matching and finance-level reconciliation have direct support in the supplied research; owner behaviour and some access-administration assumptions still need direct study.
- These are not yet validated research clusters.
- Use the R01–R05 source IDs below alongside persona and behaviour IDs to distinguish reported workflows, prototype observations and design interpretations.

- Use a persona to answer who holds the responsibility and what constraints shape the task.
- Use a behaviour to answer how that person approaches the task.
- A person can move between behaviours, and more than one persona can exhibit the same behaviour.
- Channel configuration, business count, store scope and permission are attributes of the context rather than separate personas.

# Evidence status

| **Label** | **Meaning** | **How it may be used** |
| --- | --- | --- |
| Stated need | Product direction or requirement supplied by the team | May define scope, subject to final product approval |
| Prototype finding | Participant action or comprehension documented during a prototype task | Supports that task in that session; does not establish routine adoption |
| Working hypothesis | Inference about goals, habits or mental models | Must be tested before it supports a release claim |
| Research finding | Workflow reported in a merchant visit or action observed during a session | State whether reported or observed and cite participants, method and source |

- Evidence is strongest for collection matching, reconciliation, reporting reliability and support dependence.
- The reports are qualitative summaries with uneven participant and method detail.
- They establish needs in these merchant contexts, not population frequencies or measured usability improvements.
- Recommendations and action plans inside the reports remain proposals unless implementation or testing is separately documented.

# Merchant research evidence register

- The five reports were supplied for this update on 5 October 2026.
- That is the document incorporation date, not the visit date.
- R identifiers are stable references; the exact source filenames are listed in the appendix.

## R01 SourBerry

- **Source and method:** Merchant visit insights, interview workflow reconstruction and task-based prototype walkthrough.
  - Interview date is May 5; year is not supplied.
  - The walkthrough is explicitly described with the Store Manager; bank reconciliation is documented for the Assistant Finance Manager, but their direct participation in each task is not established.
  - Source sections: Team Structure, Personas, Mental Models, Day-to-Day Workflow, Prototype Walkthrough and Pain Points.

- **Context and findings:** One active outlet with further floors planned.
  - The Store Manager also acts as Cashier and matches successful card and UPI totals against bills at night, moving to bill-level matching when totals differ.
  - Finance checks bank credits the following morning, including split payouts and separate Amex routing.
  - The manager normally enters Reports directly.
  - During the prototype review, list reading and filters were understood; clickable summary counts were expected.
  - A live payment-link replay stayed Pending until Get Status was pressed.
  - Same-day duplicate exports and missing MPR generation were reported.

- **Reference mapping:** P2, P3, P4; T3; B01–B04, B06, B10–B12, B15–B18.
  - Store and finance responsibilities overlap in some work but retain different evidence and sign-off boundaries.

## R02 Apollo Ayurvaid

- **Source and method:** Interview with Sanjay, Account Executive and Reconciliation Lead, plus task-based prototype walkthrough.
  - Interview date is April 28; year is not supplied.
  - Cashier, CRM and senior finance responsibilities are described through Sanjay rather than separately documented interviews.
  - Source sections: Team Structure, Personas, Sanjay's Mental Model, Day-to-Day Workflow, Vocabulary, Prototype Walkthrough, Pain Points and Razorpay Workflow.

- **Context and findings:** Thirteen centres.
  - Sanjay uses Pine Labs, Razorpay, NetSuite and a bank statement to match daily collections and settlements by centre.
  - NetSuite is the accounting source of truth.
  - Store cashiers have centre-specific transaction access and send collection reports.
  - CRM staff create Razorpay links with patient and appointment details.
  - Senior finance staff review NetSuite instead of Pine Labs.
  - Sanjay did not know Pine Labs offered payment links or platform support, and considered switching links if detail capture and charges met the need.
  - Exports reportedly differ from on-screen totals.

- **Reference mapping:** P3, P4; T3, T5; B01–B04, B06, B08, B10–B12, B14–B18.
  - Senior finance oversight is evidence for an indirect information consumer, not proof of P1 dashboard usage.

## R03 California Burrito

- **Source and method:** Merchant conversation summary and issue/action log; participant roles and visit date are not supplied.
  - Some figures are explicitly anecdotal or estimated.
  - Source sections: Key Takeaways, Issues Raised and Action Items Captured.

- **Context and findings:** Report lists 140 stores and 120 POS devices.
  - Staff fall back to manual amount entry when integration is slow or unreliable.
  - Incorrect payment-mode selection causes matching problems.
  - Shift and minute-level filtering, payment-mode totals and device-level data are requested.
  - Managers are reported to be unaware of direct report downloads.
  - Refund handling involves operations and bank confirmation.
  - Partial refunds are a potential need rather than established practice.
  - Interest in AI is reported but no AI workflow was tested.

- **Reference mapping:** P2, P3, P4; T3; B01–B04, B10, B16–B18.
  - Manual work during peak service increases the need for clear mode, amount and device context.

## R04 Connplex cinema

- **Source and method:** Merchant visit notes with accountants Umang and Kuldip, workflow descriptions and prototype review.
  - Visit date and task protocol are not supplied.
  - Store-manager workflows are described rather than separately documented interviews.
  - Source sections: Settlement Mechanism, Behaviour and Day to Day Work, Issues Reported and Omni Channel Prototype Review.

- **Context and findings:** Forty-one locations and 490 devices.
  - Store close is usually around 1 AM; finance compares collections with the next-morning HDFC MPR and enters matched values into Tally.
  - Integration problems cause manual collection, with PhonePe QR as backup at some locations.
  - Transaction counts reportedly change between close and the next day.
  - Merchants wanted refund initiation restricted to admins; removing refunds also removed admin access.
  - Old charge slips are unavailable when later disputes require proof.
  - Prototype navigation and settlement summaries were understood; charges and ODS copy needed explanation.

- **Reference mapping:** P2, P3, P4, P5; T3; B01–B04, B06, B08, B10, B11, B14, B16–B18.
  - The report's card-acceptance terminology needs clarification before it defines payment-mode requirements.

## R05 Lifestyle Group

- **Source and method:** Customer visit report and action tables; named research team is supplied, but merchant participant roles, visit date and task protocol are absent.
  - Source sections: Payment Reconciliation Challenges, EMI Reporting Issues, User Management and Store Operations, Integration and Technical Requirements and Pine One Action Items.

- **Context and findings:** Group includes Max, Home Centre and Baby shop; report lists 5,800 devices.
  - SAP reconciliation has moved to transaction-level matching, using approval codes for cards and RRN for UPI.
  - Bank MPR is used when portal data is insufficient.
  - Dashboard and email EMI schemas differ, while SAP accepts the email schema.
  - Turnover creates frequent access changes that depend on an operations contact; bulk administration is requested.
  - Unwanted EMI configuration and reactive device servicing cause store problems.
  - API access is requested for a future phase.

- **Reference mapping:** P2, P4, P5; T2, T3, T4; B04, B06, B08–B10, B14–B16, B18.
  - The requested card-number format is a research need, not an approved display rule; confirm supported matching identifiers and masking separately.

## Interpretation limits and unresolved source details

- P1 has little direct evidence in this set.
- P2 and P4 have distinct tasks at SourBerry; P3 can also perform local reporting at Apollo, and P2 can act as Cashier at SourBerry.
- P5 is supported by reported access needs at Connplex and Lifestyle, but role-creation usability has not been tested.
- CRM link creation at Apollo should be studied directly before introducing another primary persona.

- SourBerry notes contain inconsistent refund descriptions and different RM names.
- Use the consistent support-channel finding without selecting a contact name or asserting a refund flow.
- Apollo's same-day settlement expectation and next-day afternoon receipt are documented separately as expectation and reported experience.
- Source figures, suspected cash misuse and repeated delay anecdotes have not been independently audited.
- Avoid converting them into prevalence, loss estimates or cross-merchant incident counts.

- Most research concerns In-store operations; Apollo's Online workflow uses another provider and SourBerry uses Pay by SMS.
- The set does not validate unified Pine One channel switching, combined Overview totals, every-session business selection or mobile/web parity.

# Shared context dimensions

- The following dimensions change a user's experience without creating a new persona.

| **Dimension** | **Values in current scope** | **Design significance** |
| --- | --- | --- |
| Business relationship | One business or several linked businesses | Changes selection effort and the risk of reading the wrong business |
| Product configuration | In-store, Online or both | Determines which products exist for the business |
| User entitlement | In-store, Online or both | Determines which configured products the person may access |
| Store scope | One store, several stores or all permitted stores | Applies only to In-store data |
| Platform | App or web | Changes task setting, information density and interaction pattern |
| Task state | Routine check, exception, investigation, action or administration | Changes the information and control needed first |

- Product configuration and user entitlement are separate.
- A business may use both channels while a particular user can access only one.
- Online payments have no store construct.

# Primary personas

## P1 Business owner or merchant administrator

- **Responsibility:** Understand business performance, confirm that money is moving correctly, manage important exceptions and control access or product configuration.

- **Core questions:** How is the business doing?
  - Has expected money been collected and settled?
  - Does anything require action?
  - Which business, channel or store am I viewing?
  - What will change if I enable a service or grant access?

- **Likely task settings:** A quick app check during the day, a broader web review, or an exception triggered by a missing payout, customer issue or staff request.

- **Working mental model:** Payments, refunds and settlements are connected stages of business money.
  - The owner expects a business-level answer first and supporting detail when something looks wrong.
  - A configured product and an employee's permission to use it are different decisions.

- **Constraints and risks:** Owners may oversee several businesses and can make high-consequence financial or access changes.
  - An incorrect business, channel or store scope can make a correct number misleading.
  - Promotional content can distract when an existing money issue is unresolved.

- **Design implications:** Keep business and scope visible.
  - Lead with exceptions and decision-relevant summaries.
  - Explain consequences, charges and verification requirements before commitment.
  - Preserve a path from a summary to the records that support it.

- **Evidence needed:** Frequency of app and web use; decisions made from Overview; common exception types; terminology used for collection and payout; division of work between owner and staff.

- **Research grounding:** Direct owner/admin use remains a hypothesis.
  - Apollo senior finance staff consume NetSuite reports prepared by P4 rather than using Pine Labs themselves (R02, Personas and Monthly Workflow).
  - California Burrito reports CEO interest in AI, but does not document an owner task or test (R03, Key Takeaways).
  - Study direct versus delegated oversight before assuming every senior decision-maker needs the same Overview.

## P2 Store manager

- **Responsibility:** Monitor a store or assigned stores, confirm payments, understand daily collection and respond to operational issues.

- **Core questions:** Was this payment received?
  - What has this store collected today?
  - Is a device or payment issue blocking the store?
  - Do I need to involve the owner or support?

- **Likely task settings:** Service-time checks and a substantial shift or trading-day close.
  - SourBerry's manager downloads reports to Excel at night; Connplex describes store close around 1 AM.
  - Phone-versus-web allocation remains to be studied directly (R01, Day-to-Day Workflow; R04, Behaviour and Day to Day Work).

- **Working mental model:** Work starts with the outlet, shift or trading day and payment-mode totals.
  - At SourBerry, the manager matches successful collections to bills, then investigates individual slips only if totals differ; bank verification belongs to finance.
  - California Burrito requests shift and device scopes.
  - Store operations also need recent activity during service (R01, Mental Models; R03, Action Items Captured).

- **Constraints and risks:** Attention is divided, the store may have intermittent connectivity and the manager may have access to only part of the business.
  - A total without clear store scope can lead to the wrong operational conclusion.

- **Design implications:** Put current store, time period and payment status near the answer.
  - Support recent activity and direct search.
  - Keep restricted business or administrative information out of the experience rather than presenting it as zero.

- **Evidence needed:** Device and platform used by task; frequency of store switching; common payment-confirmation path; escalation behaviour; information required for an end-of-day check.

- **Research grounding:** P2 and P3 overlap at SourBerry.
  - Reports can be the routine entry point rather than Overview (R01, Personas and Nightly Workflow).
  - Support payment-mode totals, successful-only scopes, precise trading windows and a path into mismatches (B03, B04, B16, B17).
  - California Burrito also reports download discoverability gaps (R03, Issues Raised); making the report available does not establish that staff know how to use it.

## P3 Cashier or frontline staff member

- **Responsibility:** Confirm a customer's payment and complete the immediate service interaction within assigned access.

- **Core questions:** Did this payment succeed?
  - Is this the right amount and transaction?
  - Should I ask the customer to try again or wait?

- **Likely task settings:** Time-sensitive payment collection and verification while a customer is present.
  - Peak-service integration failures can force manual amount entry.
  - App use is reported in California Burrito's account/device issue, but the verification platform is not consistently recorded across studies (R02, Store Cashier; R03, Issues Raised; R04, Issues Reported).

- **Working mental model:** A transaction has one authoritative outcome that determines whether the customer interaction can continue.
  - Settlement and broader business performance are separate from this decision.

- **Constraints and risks:** The cost of ambiguity is a delayed handover, a duplicate attempt or an incorrect payment decision.
  - The person may not have access to settlements, reports, refunds or administration.

- **Design implications:** Make the matching transaction, amount, time and status easy to verify.
  - Distinguish successful, pending and failed states in words, not colour alone.
  - Provide the next safe action without exposing unrelated modules.

- **Evidence needed:** Search cues used in practice; tolerance for pending states; duplicate-payment scenarios; connectivity conditions; whether a store manager performs this work instead.

- **Research grounding:** Apollo cashiers have centre-scoped access, check payment receipt and also report collections.
  - SourBerry order takers collect using terminals and pass bills/slips to the manager without using the dashboard.
  - California Burrito reports wrong payment-mode selection, while Connplex describes manual fallback under integration delay (R01, Order Takers; R02, Store Cashier; R03/R04, Issues Reported).
  - Dashboard participation and reporting responsibility therefore vary.
  - Clear payment mode and amount checks are design implications; no guardrail solution has yet been tested.

## P4 Finance or operations administrator

- **Responsibility:** Reconcile payments and payouts, explain deductions, investigate exceptions, process operational work and produce reports.

- **Core questions:** Which records produced this amount?
  - What changed the gross value?
  - What can be matched to the bank or another system?
  - Which rows failed, and what can be retried safely?

- **Likely task settings:** Focused web sessions across date ranges and many records.
  - App use is more likely to inspect a specific item or monitor status than to complete bulk work.

- **Working mental model:** Collection, settlement and bank receipt must match billing or accounting records.
  - Apollo uses NetSuite; Connplex uses Tally; Lifestyle uses SAP; SourBerry splits bill matching from bank-credit verification.
  - A bank credit can contain a specific transaction set and can be split by network or payout.
  - Pine One is one evidence source within that workflow (R01/R02, Mental Models; R04, Behaviour and Day to Day Work; R05, Payment Reconciliation Challenges).
  - Refund-file and approval-queue expectations remain working assumptions.

- **Constraints and risks:** The work may be interrupted and resumed.
  - Wide datasets, several identifiers and channel-specific fields increase cognitive load.
  - An incorrect retry can duplicate a financial action.

- **Design implications:** Support filters, readable tables, stable identifiers, record detail, export and preserved investigation context.
  - Separate channel records when their fields or rules differ.
  - Show row-level outcomes and safe retry guidance for bulk work.

- **Evidence needed:** Reconciliation artefacts and external systems; preferred identifiers; sequence of investigation; common deduction questions; required reports; bulk file volume and failure handling.

- **Research grounding:** Export completeness, matching identifiers and charge breakdowns recur across R01, R02, R04 and R05.
  - Lifestyle needs a stable schema usable by SAP and requests API access; SourBerry needs transactions grouped by actual payout; Apollo needs centre/day/charge detail.
  - These are distinct levels of finance work within P4.
  - Sanjay has no approval authority, so finance membership must not imply T1 permissions (R02, Personas).
  - Old charge slips also matter for later dispute evidence at Connplex (R04, Issues Reported).

## P5 Access administrator

- **Responsibility:** Invite people, assign roles and scope, review access and change it when responsibilities change.

- **Core questions:** Who can access this business?
  - What work does this role allow?
  - Does it apply to Online, In-store or both?
  - Which stores are included?
  - Who gains or loses access if I save?

- **Likely task settings:** Deliberate administration, primarily on web.
  - A routine invitation may be considered for app, but complex role construction remains an open platform decision.

- **Working mental model:** Access is usually understood through a job role such as cashier, manager, accountant or administrator.
  - Channel and store scope refine where that role applies.

- **Constraints and risks:** Legacy Online and In-store permissions differ.
  - A migration or role change can remove required access or grant excessive access.
  - The administrator should not need to learn two legacy permission architectures.

- **Design implications:** Start with recognisable work, disclose included permissions and summarise effective access before saving.
  - Separate business membership, channel entitlement, role permissions and store scope.
  - Protect sensitive changes and retain an audit trail.

- **Evidence needed:** Who administers access in different merchant sizes; commonly assigned roles; frequency of custom roles; errors in current role assignment; acceptable mobile boundary.

- **Research grounding:** Connplex wants managers to see transactions while only admins initiate refunds; its reported configuration change removed admin capability too.
  - Lifestyle relies on a contact for frequent staff changes and requests bulk addition/deletion (R04, Issues Reported; R05, User Management and Store Operations).
  - These support capability-specific access and efficient staff replacement.
  - SourBerry's manager found user management after difficulty locating the profile entry (R01, Prototype Task 7).
  - P5 remains a responsibility that may belong to P1 or P4, not a separately validated job cluster.

# Situational task lenses

- Task lenses describe temporary responsibilities rather than new personas.
- Module documents may reference a lens alongside a persona.

| **ID** | **Task lens** | **Usually adopted by** | **Distinct need** |
| --- | --- | --- | --- |
| T1 Approver | Reviews a refund, access or financial request | P1, P4 or P5 | Decision context, requester, consequence and audit evidence |
| T2 Configurator | Changes policy, product or financial settings | P1 or P5 | Current state, affected scope, verification and rollback expectation |
| T3 Investigator | Explains an amount, state or exception | P1, P2 or P4 | Summary-to-evidence path with stable scope and references |
| T4 Bulk operator | Submits or reviews a multi-record job | P4 | File validation, row outcomes and duplicate-safe retry |
| T5 Delegate | Performs a narrow assigned task | P2, P3 or P4 | Direct access to permitted work without administrative clutter |

- **Research scope:** T3 is supported by matching workflows in R01–R05; T5 by Apollo's centre access.
  - R05 supports demand for bulk user administration under T4, but does not establish bulk refund behaviour.
  - R03 describes a refund escalation chain without enough detail to validate T1.
  - T2 has reported configuration problems in R05; the configuration interaction remains untested.

# Shared behaviour catalogue

## B01 Establish context before interpreting data

- Users need to recognise the current business, channel, store and time period before a number is meaningful.
- The risk increases for people linked to several businesses or stores.
- Show scope at entry and near information that could otherwise be misread.

- **Status:** Stated need with working behavioural rationale.

- **Validate through:** Scope interpretation tasks and wrong-scope errors.

- **Research evidence:** Apollo reconciles by centre and day; Connplex maps transactions and settlements by location.
  - California Burrito requests shift and device-level scopes (R02, Mental Model; R04, Behaviour and Day to Day Work; R03, Action Items Captured).
  - These support location/time/device context.
  - Multi-business selection and channel-tab comprehension remain untested.

## B02 Verify a specific event under time pressure

- Frontline users often look for one payment or recent event while another person is waiting.
- They rely on amount, time, reference and clear status to decide what happens next.

- **Status:** Working hypothesis.

- **Validate through:** Contextual inquiry and timed payment-verification scenarios.

- **Research evidence:** Apollo describes cashiers checking receipt; SourBerry describes amount/time matching from slips.
  - Peak-service delays and manual fallback are reported at California Burrito and Connplex (R02, Store Cashier; R01, Nightly Workflow; R03/R04, Issues Reported).
  - This supports urgency and event matching as reported needs; no timed verification benchmark or preferred app search sequence is established.

## B03 Scan for exceptions before investigating

- Some users start with totals and investigate only when they differ from expectation.
- Others begin directly in Reports or Transactions as part of a daily matching routine.
- Offer summary-to-detail paths alongside direct access to recurring work.

- **Status:** Reported matching pattern and prototype expectation; owner health-check behaviour remains a hypothesis.

- **Validate through:** Diary study, landing-page comprehension and path analysis.

- **Research evidence:** SourBerry's manager compares totals before bill-level work, goes straight to Reports in routine use and expects prototype failure counts to open the matching list.
  - Apollo starts with yesterday's Transactions and Settlements (R01, Mental Models, Nightly Workflow and Prototype Task 1; R02, Daily Workflow).
  - Overview comprehension does not prove Overview is the preferred entry point.

## B04 Move from an answer to supporting evidence

- Users first need the amount, status, timing or decision.
- When it does not match expectation, they move to payments, deductions, history, references or requester context.
- The product should preserve scope along this path.

- **Status:** Reported workflow across merchant contexts; preservation of scope is a design implication.

- **Validate through:** Settlement, refund and approval investigation tasks.

- **Research evidence:** SourBerry needs each bank sub-credit connected to its transaction set; Apollo matches collections, charges and bank credits; Connplex compares MPR totals then investigates differences.
  - Lifestyle uses transaction-level SAP matching (R01, Finance Mental Model and Pain Points; R02, Daily Workflow; R04, Behaviour and Day to Day Work; R05, Payment Reconciliation Challenges).
  - Connplex also needs historical charge slips for later disputes.
  - Preserve evidence access beyond the routine close; exact retention and entitlement rules need separate definition.

## B05 Keep operational records separated by channel

- Users can understand an overall business summary, but Online and In-store operational records have different identifiers, fields and actions.
- Users need an explicit channel view rather than a mixed list that hides these differences.

- **Status:** Stated product direction.

- **Validate through:** Channel-switching comprehension and record-finding tasks.

- **Research evidence:** Apollo consolidates Pine Labs and Razorpay data in Excel, while applying different provider settlement timelines.
  - SourBerry keeps aggregator dashboards outside its Pine Labs matching scope (R02, Razorpay Workflow; R01, Cross-Product Notes).
  - This supports provider/channel distinction and selective consolidation.
  - It does not validate the proposed channel tabs or prove merchants universally prefer separated lists.

## B06 Distinguish collection, refund and settlement stages

- A successful payment does not mean the same amount is immediately available in the bank.
- Refunds and deductions can change a payout.
- Users need each stage named and connected without treating it as one balance.

- **Status:** Reported role and money-stage distinction; proposed presentation remains to be tested.

- **Validate through:** Amount and lifecycle interpretation scenarios.

- **Research evidence:** SourBerry hands the outlet close to finance for next-morning bank verification and tracks Amex separately.
  - Apollo distinguishes collected amount, bank charges and bank credit, and keeps manual bank refunds in NetSuite outside Pine Labs.
  - Connplex settles directly through HDFC (R01, Team Structure and Mental Models; R02, Daily and Refund Workflows; R04, Settlement Mechanism).
  - Do not infer the bank-credit amount from collection alone or present an external refund as a known Pine One event.

## B07 Resume an interrupted investigation

- Administrative work can span several records and may be interrupted.
- Users benefit when filters, record identity and the path back to a scoped list remain predictable.
- A business change should reset incompatible filters.

- **Status:** Working hypothesis.

- **Validate through:** Return-to-task studies and navigation analytics.

- **Research evidence:** Multi-record matching is described in R01–R05, but interruption/resumption behaviour and filter persistence were not directly studied.
  - Retain this as a hypothesis.

## B08 Delegate work through recognisable roles

- Owners and access administrators tend to grant work by responsibility before thinking in individual permissions.
- They still need to inspect effective permissions and scope before saving.

- **Status:** Working hypothesis grounded in supplied role models.

- **Validate through:** Role-assignment exercises and access-review interviews.

- **Research evidence:** Apollo distinguishes centre-scoped cashier access from central reconciliation and senior NetSuite review.
  - Connplex wants admin-only refund initiation while managers retain operational access; Lifestyle requests self-service and bulk staff changes (R02, Personas; R04, Issues Reported; R05, User Management and Store Operations).
  - Delegated responsibilities are reported, but preference for role labels over individual permissions still requires testing.

## B09 Seek consequences before a high-impact action

- Before a refund, permission change, bank-account update or paid service is confirmed, users need to understand the amount, destination, affected scope, charges and verification step.
- Confirmation alone is insufficient when the consequence is unclear.

- **Status:** Design requirement and working behavioural hypothesis.

- **Validate through:** Comprehension and error testing for each action type.

- **Research evidence:** Connplex's refund restriction affected admin access too; Lifestyle reports unintended EMI transactions from unwanted configuration.
  - California Burrito describes manual refund escalation (R04, Issues Reported; R05, Store Operations; R03, Issues Raised).
  - These establish reported consequences of configuration and authority mistakes.
  - They do not validate a confirmation design or demonstrate how users inspect consequences before acting.

## B10 Judge trust through status and freshness

- Users need to distinguish zero activity from unavailable, stale or partially loaded data.
- They also need status labels to reflect what the backend actually proves rather than a reassuring interpretation.

- **Status:** Reported reliability problems, with a directly observed status-refresh case.

- **Validate through:** Unavailable-data, delayed-data and lifecycle-state scenarios.

- **Research evidence:** SourBerry's live link test remained Pending until Get Status; same-day duplicate exports were reported.
  - Apollo's exported total reportedly differs from the screen.
  - Connplex reports transaction counts changing overnight; Lifestyle reports approved transactions missing from the portal but present in settlement reports (R01, Prototype Task 8 and Pain Points; R02, Settlement Download; R04, Issues Reported; R05, Payment Reconciliation Challenges).
  - Match screen, export and evidence scopes, disclose data currency and support status resolution.
  - Investigation must establish causes before attributing a mismatch to payment loss.

## B11 Consider another product after the primary task

- Single-channel merchants may be open to another Pine Labs product when its benefit and eligibility are relevant.
- An offer competes with the current operational task, especially during an unresolved money issue.

- **Status:** Business goal and working behavioural hypothesis.

- **Validate through:** Task comprehension, qualified interest and first meaningful use rather than impression or click volume alone.

- **Research evidence:** Apollo did not know Pine Labs offered links and expressed conditional interest if patient-detail capture and charges fit.
  - SourBerry misunderstood website-checkout terminology; Connplex noticed ODS but needed clearer copy (R02, Prototype Tasks 2/3 and Payment Link Comparison; R01, Prototype Task 2; R04, Prototype Review).
  - Need-led explanation and usable naming are supported.
  - The best offer timing, conversion impact and willingness to pay remain untested; viewing a banner is not adoption.

## B12 Choose platform according to task depth

- The app is likely to support quick checks, a specific record and routine action.
- Web is likely to support comparison, configuration, reporting and bulk work.
- The same status, identifier and scope should retain the same meaning on both.

- **Status:** Working platform hypothesis; phase-one product planning currently commits the complete web flow.

- **Validate through:** Task inventory, platform usage and cross-platform continuity studies.

- **Research evidence:** Excel matching, downloaded bank statements and SAP/Tally/NetSuite workflows support export and integration needs for P4.
  - California Burrito reports app account-linking problems, but most notes do not identify the device used for each task (R01/R02, Daily Workflows; R03, Issues Raised; R04, Behaviour and Day to Day Work; R05, Integration Requirements).
  - This set does not establish an app-versus-web preference or task parity.
  - Keep the matrix below provisional.

## B13 Re-establish business context each session

- After authentication, users select from their linked businesses instead of silently reopening the last business.
- This makes the financial-data boundary explicit, especially for multi-business users.

- **Status:** Stated platform decision.

- **Validate through:** Login completion, intended-business selection and repeated-session usability.

- **Research evidence:** None of R01–R05 tests every-session business selection.
  - This remains a product decision with unvalidated usability rationale.

## B14 Expect access to shape the workspace

- Users expect Pine One to contain the work assigned to them.
- A hidden module should mean that it is outside their access, not that the business has zero activity.
- Product configuration and personal permission require different explanations.

- **Status:** Stated platform decision with working mental model.

- **Validate through:** Restricted-user comprehension and access-change scenarios.

- **Research evidence:** Apollo's cashier access is limited to a centre.
  - Connplex's request separates refund authority from manager transaction access; Lifestyle reports staff-turnover administration needs (R02, Store Cashier; R04, Issues Reported; R05, User Management).
  - Capability and location scope have research support; hidden-module comprehension and product-versus-permission explanations remain to be tested.

## B15 Escalate with task context intact

- When self-service cannot resolve an issue, users should not need to reconstruct the business, channel, record and problem for support.
- The product can carry this context while keeping human support available.

- **Status:** Reported reliance on human contacts; contextual platform escalation is a design hypothesis.

- **Validate through:** Support case quality, repeated explanation and resolution outcomes.

- **Research evidence:** SourBerry uses phone/message contact and has not used platform support; Apollo calls or WhatsApps its Pine Labs contact and did not discover support in the prototype task.
  - Lifestyle depends on an operations contact for staff changes (R01, Personas and Pain Points; R02, Prototype Task 8 and Support Pain Point; R05, User Management).
  - Make support discoverable from the problem and show continuity of ownership.
  - A ticket interface alone has not been shown to replace these relationships.

## B16 Match Pine One data with external evidence

- Users complete reconciliation across billing software, bank reports and Pine One, often in Excel or accounting systems.
- They need complete records, consistent formats and matching references.
- The authoritative source depends on the task: bills for the outlet close, bank credits for receipt, accounting systems for final reporting.

- **Status:** Reported workflow and reporting needs across R01–R05.

- **Research evidence:** SourBerry wants common identifiers and working payout reports; Apollo specifies centre/day/charge columns and patient identity; Lifestyle needs SAP-compatible report formats and uses approval code/RRN matching.
  - Connplex compares HDFC MPR with collections and enters values in Tally.
  - California Burrito reports POS-versus-settlement matching gaps.

- **Design implications:** Align downloaded data with the displayed scope, expose supported match keys and explain payout composition and deductions.
  - Support predictable report schemas and scheduling where relevant.
  - API access, exact masked-card formats and automated matching remain module decisions requiring feasibility and validation.

- **Validate through:** Artefact-led matching tasks with real anonymised exports, bank advice and accounting schemas.
  - Measure unmatched records, manual steps and completion without assuming the dashboard replaces the accounting system.

## B17 Close a trading period rather than a calendar date alone

- Store teams organise matching around their operating period.
- A cinema close around 1 AM crosses midnight; a restaurant night or a staff shift may require a custom start/end window.
- Payment-mode totals and device scope help explain that period.

- **Status:** Reported operating patterns and explicit filtering requests.

- **Research evidence:** SourBerry closes at night and matches card/UPI totals; Connplex closes around 1 AM; California Burrito requests minute-level shift filters and device views (R01, Nightly Workflow; R04, Behaviour and Day to Day Work; R03, Action Items Captured).

- **Design implications:** Keep date, time window and timezone explicit in summaries and exports.
  - Let module design define how a trading day maps to transactions and settlements; receipt on the next morning must not silently change the collection period.

- **Validate through:** Cross-midnight and shift-close tasks, comparing screen totals and exports with the merchant's operating-period evidence.

## B18 Find capabilities through familiar tasks and language

- Feature availability does not guarantee discovery.
- Merchants look for work such as downloading a report, managing a centre, collecting by link or understanding charges.
- Product group names, icons and unexplained service labels can obstruct that path.

- **Status:** Prototype observations in R01, R02 and R04, plus reported discovery gaps in R03 and R05.

- **Research evidence:** SourBerry initially searched the side panel for user management and misunderstood website checkout.
  - Apollo searched user management for store tasks and did not know links or support were available.
  - Connplex needed clearer charges and ODS copy.
  - California Burrito managers were reported unaware of direct downloads.
  - Apollo and SourBerry describe reconciliation as matching; Apollo calls locations centres.

- **Design implications:** Explain unfamiliar capabilities through merchant tasks and benefits, make report/access/support entry points recognisable and use comprehensible labels for charges and locations.
  - Preserve terminology consistency while testing whether contextual descriptions improve task completion.

- **Validate through:** Unprompted findability tasks, label comprehension and task completion with relevant merchant roles.
  - Retest prototype placeholder text before treating a failure as evidence against the final label.

# Platform behaviour matrix

| **Task pattern** | **App expectation** | **Web expectation** | **Primary references** |
| --- | --- | --- | --- |
| Business health check | Brief summary and actionable exception | Summary with entry to deeper analysis | P1, P2; B01, B03, B12 |
| Payment verification | Recent activity or direct search with clear outcome | Search, filters and record comparison | P2, P3; B02, B10, B12 |
| Settlement check | Amount, expected timing, reason and next step | Batch breakdown, deductions and reconciliation | P1, P4; B04, B06, B12, B16 |
| Refund action | One eligible payment, amount and outcome | Full list, approval, bulk work and configuration | P1, P4; T1, T4; B09, B12 |
| Access administration | Routine inspection or invitation if approved | Role comparison, custom roles and audit work | P5; B08, B09, B12 |
| Product discovery | Benefit-led entry after the primary answer | Eligibility, comparison and activation detail | P1; B11 |
| Store or shift close | Period totals and exception inspection if supported | Precise time/device filters, mode totals and matching exports | P2, P3; B04, B16, B17 |
| Find an unfamiliar capability | Task-based entry and clear benefit description | Recognisable navigation and searchable task language | P2, P4, P5; B18 |

- The matrix is a research hypothesis, not a final feature allocation.
- Each module must define its release boundary separately.

# Research plan

## What this research changes

- P2 now includes substantial closing and export work, with direct report entry at SourBerry.
- P3 may hold local reporting responsibilities and may operate only a terminal, depending on the merchant.
- P4 has evidence-backed accounting and bank-matching needs, including stable schemas for enterprise use.
- P1's direct platform use and P5's preferred role-construction model remain insufficiently studied.
- Retain the stable persona IDs while testing those boundaries.

- The reports support B03, B04, B06, B10, B15 and new B16–B18 in specific merchant contexts.
- Other IDs retain mixed or hypothesis status as stated locally.
- Future module documents should cite the narrow claim and its source, for example: P4, B16, R05 EMI Reporting Issues for stable accounting exports; P2, B17, R03 Action Items Captured for shift filters.
- Keep the module's proposed intervention and success measure separate from the research finding.

## Priority questions

1. Which responsibilities are consistently held by owners, managers, cashiers, finance users and access administrators, and where do they overlap?
2. Which tasks occur on app, web or both, and what causes a person to change platform?
3. Which identifiers and scope cues prevent mistakes across businesses, channels and stores?
4. How do merchants describe payment success, collection, refund, settlement and bank receipt in their own words?
5. Which exceptions lead to investigation or support, and what evidence lets the user resolve them?
6. Which permissions and role summaries let an administrator predict effective access accurately?
7. When does product discovery feel relevant, and when does it interfere with an operational task?
8. Which matching keys, payout groupings and export schemas are needed by each role, and what is a completed match in their accounting system?
9. How are shifts and trading days defined across midnight, devices and payment modes?
10. Which capabilities remain undiscovered without prompting, and do revised labels improve findability in the real task?

## Suggested participants

- Recruit across single-channel and omnichannel businesses, one-store and multi-store businesses, and single-business and multi-business users.
- Include people who perform frontline payment checks, settlement reconciliation, refunds, access administration and owner-level review.
- Record the person's actual responsibility and permissions rather than assigning a persona from job title alone.

## Suggested methods

- Begin with role and task interviews supported by recent real examples.
- Follow with contextual inquiry for store payment checks and artefact review for finance reconciliation.
- Use scenario-based usability testing for scope interpretation, login and business selection, payment verification, settlement investigation, refund approval and role assignment.
- Add analytics and support-ticket analysis after event definitions and reason tagging are reliable.

## Evidence to capture

- For each study, record participant responsibilities, business and channel configuration, store scope, platform used, task trigger, desired outcome, information consulted, decision made, points of uncertainty, recovery or escalation and whether the behaviour supports or contradicts an existing ID.

# Maintenance rules

1. Keep P, T and B identifiers stable. Retire an entry instead of reusing its ID for another meaning.
2. Add module-specific behaviour only when the shared catalogue does not explain it. Propose a new shared ID when the pattern appears across modules.
3. Link every validated claim to a dated study, participant set, method and evidence location.
4. Separate role from configuration. Do not create personas such as Online merchant, multi-store merchant or app user solely from a system attribute.
5. Review references when a persona or behaviour changes. A change to a shared entry may affect several module decisions.
6. Keep behavioural hypotheses distinct from release requirements. Product can approve a feature before research validates the assumed behaviour.

# Open questions

1. Should access administration remain a responsibility shared by P1, P4 and P5, or does direct research support a distinct persona? Connplex and Lifestyle establish the need, but not the operator model.
2. Where does store collection matching hand off to finance bank verification, and when does the same person do both? SourBerry supports a split; owner-versus-manager boundaries still need study.
3. Who performs refunds in-store and Online, and when are requester and approver different people?
4. Which finance and operations tasks must be available on app in phase one?
5. What proportion of users belong to several businesses, and how similar are their business names and merchant identifiers?
6. Which behaviour IDs are observed frequently enough to become primary design drivers?
7. Does Apollo's CRM payment-link creator fit an existing persona/task lens, or require a distinct model after direct study?
8. Can we confirm visit years, missing participant roles and source inconsistencies before treating the findings as a dated research baseline?

# Appendix and references

- Pine One Omni Platform Design Strategy.
- Pine One Login and Identity Design Document.
- Pine One Roles and Permissions Design Document.
- Pine One Settlements Design Document.
- Pine One Refunds Design Document.
- Pine One cross-platform discovery review, updated 1 October 2026.
- Unified Login and Identity for Omni Merchant Dashboard PRD, supplied 5 October 2026.
- Omni Channel Experience Product Strategy and Execution Plan, supplied 5 October 2026.
- R01: Merchant visit insights- SourBerry (Restaurant - F&B outlet).md. Original source: /Users/tirth/Downloads/Merchant visit insights- SourBerry (Restaurant - F&B outlet).md. Interview May 5, year not supplied; incorporated 5 October 2026.
- R02: Merchant Visit Insights- Apollo Ayurvaid's Payment Systems and Reconciliation Challenges.md. Original source: /Users/tirth/Downloads/Merchant Visit Insights- Apollo Ayurvaid's Payment Systems and Reconciliation Challenges.md. Interview April 28, year not supplied; incorporated 5 October 2026.
- R03: California Burrito – Merchant Conversation Summary, Issues, and Action Plan.md. Original source: /Users/tirth/Downloads/California Burrito – Merchant Conversation Summary, Issues, and Action Plan.md. Visit date not supplied; incorporated 5 October 2026.
- R04: Connplex cinema - Merchant visit insights.md. Original source: /Users/tirth/Downloads/Connplex cinema - Merchant visit insights.md. Visit date not supplied; incorporated 5 October 2026.
- R05: Lifestyle Group — Customer Visit Report.md. Original source: /Users/tirth/Downloads/Lifestyle Group — Customer Visit Report.md. Visit date not supplied; incorporated 5 October 2026.
- Further research interviews, analytics, support records and validated persona artefacts: To be added.
