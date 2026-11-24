---
title: Recon Run Limits Decisions
description: The selected run-usage indicator, the notice before a new run, and the combined upload-size decision.
kind: Module design
date: 2026-11-24
topics: [in-store, online, reconciliation, run limits, upload validation]
source: RECONCILIATION_TIERED_PLANS_SCOPE.md
---

[Open the RaaS Reconciliation prototype](/prototypes/raas-reconciliation)

## Run usage in the header

- Show runs used out of the monthly allowance with a progress bar. The indicator appears in the Reconciliation header from the first visit, including the empty state.
- The team chose the ratio with a progress bar after comparing it with a remaining-runs count and a plain ratio. A ratio continues to make sense after the allowance is used. Keeping it in the header leaves the dashboard KPIs focused on business activity.
- Keep the indicator visible in every state. Show the plan information tooltip when usage is near, at, or over the limit. The allowance resets monthly.

## Starting a new reconciliation

- Below the near-limit threshold, **New Reconciliation** opens the program picker directly. Near, at, or over the limit, it opens a notice first and opens the picker when the merchant chooses to continue.
- Near the limit, the notice explains the remaining included runs. At or over the limit, it explains the impact of continuing and directs merchants who need a higher allowance to their Pine business contact.
- The current prototype uses simulated plan and usage data. The near-limit state starts at 80% usage in the prototype.

## Combined upload size

The selected design uses a short toast when the combined upload exceeds 1.5 GB across billing, payment, and settlement files. The merchant can upload smaller files and retry.

## Open decisions

- Confirm whether the near-limit threshold applies uniformly across plans.
- Confirm whether usage is counted per program or across the merchant account.
- Decide when to check the combined upload size.
