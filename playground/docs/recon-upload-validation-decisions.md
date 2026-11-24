---
title: Recon Upload Validation Decisions
description: When uploaded files are checked, how merchants recover from errors, and what must pass before reconciliation can proceed.
kind: Module design
date: 2026-11-24
topics: [in-store, online, reconciliation, upload validation, settlements]
source: RECONCILIATION_VALIDATION_5W1H.md
---

[Open the RaaS Reconciliation prototype](/prototypes/raas-reconciliation)

The turnaround-time baseline cited below is a provisional estimate.

## Who

- **Primary**: the merchant-side ops/finance person setting up or rerunning a reconciliation program, uploading data from Billing, Payment, and Settlement.
- **Secondary stakeholder**: the backend team — they requested this validation design specifically, to protect the match engine from malformed data.

## What

Per-source (and per-acquiring-bank, under Settlement) upload validation: a Run-validation trigger that checks a source's files immediately after upload, shows pass/fail with inline per-file errors, and gates progression (Field Mapping / Upload-and-run) on every source actually passing — not just being uploaded.

## When

During the data-source upload step — both in program creation (first-time setup) and on a rerun — before Field Mapping and before reconciliation actually runs. Triggered per source as soon as a merchant finishes uploading to it; can run concurrently across sources.

## Where

Pine One's Reconciliation module: the create-program wizard (`/reconciliation/new`) and the rerun upload drawer (launched from the program/recon pages).

## Why

1. The backend match engine can fail or behave unpredictably on malformed, corrupted, or incomplete files — validation has to happen before a run, not during one.
2. Discovering every error in one late, undifferentiated batch at Field Mapping is overwhelming and drives most of the 4–5 day baseline TAT.
3. Multi-bank Settlement setups need to be self-serve and unaided — flagged as the hardest, most realistic case, and the best test of whether this approach actually delivers the TAT goal.

## How

Validate → animated progress → either a clean pass (no further action, no button shown) or inline per-file errors plus an issue-count badge → fixing (re-uploading) re-arms validation → gating requires every source and every bank validated, or fetched via Pine (which skips validation entirely), before proceeding. Currently runs on **simulated** backend logic (first attempt always flags 2 demo issues, second attempt always succeeds) standing in for the real backend validation API. A populated source can't be deselected — files have to be removed first, preventing accidental data loss.
