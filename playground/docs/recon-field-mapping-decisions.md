---
title: Recon Field Mapping Decisions
description: Mapping states, manual corrections, and how the wizard surfaces unresolved fields across banks.
kind: Module design
date: 2026-11-24
topics: [in-store, online, reconciliation, field mapping, settlements]
source: RECONCILIATION_FIELD_MAPPING_SCOPE.md
---

[Open the RaaS Reconciliation prototype](/prototypes/raas-reconciliation)

This document records the design decisions behind the field mapping changes. See [Recon Upload Validation Decisions](/docs/recon-upload-validation-decisions) for what happens before field mapping.

## Context

Step 3 of the "New Program" wizard ("Review Field Mapping") shows a table where an LLM auto-maps each standard reconciliation field (Store, Transaction Date, etc.) to a column name in each uploaded source (Billing, Pine/Payment, and one or more banks' Settlement reports). A human then reviews and can correct, clear, or accept each mapping.

**The five LLM/human cases, as given:**

| Case | LLM | Human | Copy | UI |
|---|---|---|---|---|
| 1 | Identified correctly | No intervention | — | — (default) |
| 2 | Identified incorrectly | Corrected by human | — | — (default) |
| 3 | Identified something | Human removed the selection | "No selection" | Slightly different color |
| 4 | Identified nothing | Human selects the correct mapping | "No selection, Nothing found" (transient, until resolved) | Red, resolves to default once filled |
| 5 | Identified nothing | Human accepted the no-selection | "No selection" | Slightly different color |

Clarified during design: case 4's "different color" is *only* the red "nothing found" state before it's resolved — once a human fills it in, it reverts fully to the default look, with no persistent "this was originally LLM-blank" marker. Cases 1 and 2 are visually identical (a human correction isn't distinguished from the LLM getting it right) — only the *final value* matters, not how it got there.

So in practice there are only three real UI states per cell, not five: **default** (filled, cases 1/2/4-resolved), **unresolved** ("No match found," cases 4/5's starting point), and **deliberately empty** ("No selection," cases 3/5's resolution).

---

## What was built

### 1. Interactive per-cell dropdowns — shipped to the real wizard

The real table (`components/reconciliation/new-program/field-mapping.tsx`) previously used `SelectLook`, a static, non-interactive styled `div` — it displayed a value but couldn't be clicked or changed. Replaced with a real `Select` (Base UI) per cell, with three visual states:

- **Default**: plain filled trigger, no special styling.
- **No match found** (`value === null`): the trigger itself goes fully red — border, icon (`CircleAlert`), text, chevron — and reads "No match found," plus a persistent soft destructive-tinted ring (`shadow-[0_0_0_3px_rgba(220,38,38,0.2)]`), matching the Figma reference exactly (`dYWWUudBoyKZibEvxb65SC`, node 2935-44912). No separate caption line below it — the warning lives inside the control itself.
- **No selection** (a human explicitly picked the "No selection" option, sentinel value `"none"`): `bg-primary-foreground` + `border-ring`, italic muted text — a resolved, intentional state, not a warning. Matches node 2935-97207.

**Underlying data**: `lib/reconciliation-data.ts`'s `BILLING_VALS`/`PINE_VALS` now allow `null` entries — two fields (Billing's "Transaction Time," Pine's "TID") seed as unmapped, so "No match found" is actually reachable when going through the real wizard, not just a code path that never fires. Per-cell edits are tracked in `lib/reconciliation-store.tsx`'s new `mappingValues: Record<string, (string | null)[]>` (keyed by column — "billing," "pine," or a bank id / "bankmpr" when Pine-fetched), reset on `resetProgram`.

Verified end-to-end by actually driving through the real wizard (upload → validate twice → Start Field Mapping → loader → table → resolve a "No match found" cell), not just the sandbox.

### 2. Loader and banner copy — shipped to the real wizard

- Loader label changed from generic "Loading Field Mapping" to "Our system is mapping the fields across Billing, Payments and Banks" (`components/reconciliation/new-program/field-mapping-loader.tsx`).
- The step's description text ("We automatically mapped the columns...") was a plain muted line under the title, easy to skip. Promoted into an actual `ExplainerBanner` (`app/reconciliation/new/page.tsx`): a subtle left-to-right tint gradient (not a flat colored block), a bare `ShieldAlert` icon (no circle/badge behind it), `text-primary` copy — matches the Figma reference (`dYWWUudBoyKZibEvxb65SC`, node 2935-41850). `Step`'s `desc` prop is now optional so Step 3 can drop its inline description in favor of the banner.
- **Copy differs by stage**: future tense ("We will automatically map...") while the loader is running — nothing's been mapped yet — then past tense ("We automatically mapped...") once the table actually renders.

### 3. Cross-bank issues-aware banner — shipped to the real wizard

First built and iterated in `app/reconciliation/field-mapping-lab/page.tsx`, then promoted into `app/reconciliation/new/page.tsx` (the `ExplainerBanner` from point 2 was renamed `MappingBanner` and extended — same loader-stage copy, new issue-aware behavior once the table is ready). The problem: with more than one bank configured, switching the Settlement Report column to one bank hides whatever's unresolved in any other bank entirely — there was no way to know a different bank needed attention without manually clicking through every configured one.

The banner now does that counting, with three states:

- **Loader stage**: same plain future-tense disclaimer as above, regardless of issue count (nothing's been mapped yet).
- **Table stage, zero issues anywhere** (across Billing, Pine, *and every configured bank*, not just the active one): green, `ShieldCheck` icon, "No issues found."
- **Table stage, at least one unresolved cell** — **kept deliberately simple**:
  - **One bank configured**: a plain total, no breakdown — "N fields need review." There's nothing hidden to disambiguate, so naming locations would be noise.
  - **More than one bank configured**: one pill per bank, each a clickable button that jumps the bank switcher straight to it. The *first* configured bank's pill absorbs Billing + Pine Labs' counts too (those columns are visible regardless of which bank is active, so they're never actually "hidden" — only a second-or-later bank's column can be). Each further bank's pill reports only its own count. E.g., with Billing(1) + Pine(1) + HDFC(0) + Axis(1): "HDFC · 2" + "Axis Bank · 1" = 3 total.
  - Pills are rounded-full badges with a small count badge inside (`bg-destructive/10`), not inline underlined text — more scannable, matches the "make it more visual" feedback.

**Fixed along the way**: the bank switcher's trigger had no fixed width, so switching from "HDFC" to "Axis Bank" visibly resized the whole Settlement Report column (longer name → wider header → wider column). Fixed with a fixed `w-[124px]` trigger and a truncating label — column width is now identical regardless of which bank's name is showing (confirmed via direct measurement: 373.6px before and after).

A demo-only "Bank count" toggle (1 vs 2) in the sandbox lets both the plain-total and per-bank-pill paths be tested without editing code.

**Real-wizard wiring** (`MappingBanner` in `app/reconciliation/new/page.tsx`):
- "Configured banks" = `rec.bankBlocks.map(b => b.bank)` (manually-uploaded banks) — when `rec.pineLocked.bankmpr` (settlement fetched via Pine instead), there's no bank switcher at all, so its count just folds into the plain total alongside Billing/Pine.
- Verified end-to-end in the real wizard: with one bank (HDFC) configured, the banner shows a plain "2 fields need review." Adding a second bank (Axis) via the real "Acquiring banks" picker immediately switches it to pill mode — "HDFC · 2" (Axis shows no pill, since `BANK_VALS` has no seeded `null` the way `BILLING_VALS`/`PINE_VALS` do, so it genuinely has zero unresolved cells of its own — correct behavior, not a gap in the demo).
- The column-width fix (fixed `w-[124px]` trigger, truncating label) was also carried over to the real `BankSelect` in `components/reconciliation/new-program/field-mapping.tsx` at the same time, so switching banks there no longer resizes the Settlement Report column either.

---

## Open questions

- Should "Confirm mapping" be blocked while any cell is still "No match found" (an unresolved red cell)? Not currently gated — a merchant can confirm mapping with unresolved cells still present.
- `BANK_VALS` (hdfc/icici/axis) has no seeded `null` entries the way `BILLING_VALS`/`PINE_VALS` does — so a second configured bank can only ever show its own pill count if a real merchant's auto-mapper genuinely misses something there. Worth seeding one for parity with the other two sources if this needs to be demoed end-to-end again, but not done here since it wasn't asked for this round.
