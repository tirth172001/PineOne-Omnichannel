# Merchant Homepage Design (UX & Visual)

Last updated: 2026-08-04

Source: wayfinder map `.scratch/homepage-design-principles/map.md`

This is the design companion to `docs/flows/merchant-homepage.md` (which locks the homepage's business logic and content — needs-attention surface, business snapshot). This doc covers the current-experience diagnosis, the UX/visual principles derived from it, the component-reuse and prototyping-process policy, and the resulting screen designs — structured after the reference shape in the map's Notes (problems → principles → proposed solution).

## 1. Current Experience Problems

### 1.1 No differentiation between "needs action" and "just information"

Today's four cards (`components/home/overview-detail-cards.tsx`) are structurally identical regardless of urgency — "5 open disputes" and "2 pending transactions" render with the same visual weight as "30 successful." A merchant with a failed settlement blocking their payout sees it with no more visual priority than a routine stat. This is the gap `merchant-homepage.md` §1 already fixes at the content level (a dedicated needs-attention surface); this diagnosis names *why* that fix is necessary — there's currently no mechanism for urgency to read as urgency.

### 1.2 Promised affordances that were never shipped

`components/home/home-content.tsx` contains a fully-built but `hidden`-wrapped "Customize cards" sheet (`overviewSnapshotCards` / `overviewHiddenSnapshotCards`, ~line 2603) and a separate, entirely unused `components/home/attention-strip.tsx` component — an earlier, abandoned attempt at exactly the attention surface this effort is now designing. Dead code like this is a signal on its own: the gap was already recognized once and the fix stalled. Worth naming so it doesn't happen a third time.

### 1.3 Visual inconsistency, confirmed by the design-system audit

Every "card" on the homepage is a hand-rolled `<div>`, not the shared `Card` primitive — zero uses of `Card` in `home-content.tsx` or `overview-detail-cards.tsx` — so radius (`rounded-lg` ×26, `rounded-md` ×28, `rounded-2xl` ×1 for what is visually the same concept), border opacity, and padding all drift independently. Ten distinct text-size utilities appear on `home-content.tsx` alone, seven of them arbitrary pixel values, with no scale constraining which one gets reached for next. Currency figures (₹1,35,000, ₹65,000, ...) don't use `tabular-nums`, so digits visibly jitter next to each other on a payments dashboard where that specifically matters. None of this is a one-off mistake — it's the default outcome of building a page ad hoc against a token system instead of through it. Full findings: `.scratch/homepage-design-principles/issues/02-audit-existing-design-system.md`.

### 1.4 A first redesign attempt reproduced the same failure mode

Three prototype variants ("Bento Priority," "Editorial Stack," "Spotlight" — `components/home/prototype-homepage-variants.tsx`) were built to fix §1.1-1.3 but skipped straight to pixels without locking principles first. All three were rejected outright. That outcome is itself evidence: jumping to screens without a shared ruleset produces more ungrounded guesses, not a fix — confirming the audit-first, principles-before-pixels sequence this map now follows.

## 2. UX & Visual Design Principles

Recorded as the reusable artifact in `docs/design/design-principles.md` §1 (not homepage-scoped, per the map's Notes). Summary of the seven principles and the merchant mental model behind them:

The merchant this is grounded in checks the dashboard as a daily habit, not an analysis session — anxious about cash flow first, already fluent in payment-gateway vocabulary through repeated use, wanting fast reassurance and unambiguous alarm only when warranted.

1. "Is something wrong?" gets answered before anything else is read.
2. Quiet by default, alarm only when money's actually blocked.
3. A number only earns a comparison if it's ambiguous alone.
4. "Normal for me" beats a percentage.
5. Numbers are scanned, not read.
6. Size has to mean the same thing every time.
7. Familiarity is functional, not decorative.

Plus one confirmed note: vocabulary can stay industry-standard here (unlike a one-time flow) because repetition teaches it.

## 3. Component-Reuse and Prototyping-Process Policy

Recorded as the reusable artifact in `docs/design/design-principles.md` §2 (not homepage-scoped). Summary:

- Deviate from an existing component only when it's missing a required visual state, has the wrong information density, or structurally can't express the interaction — never on preference alone.
- A justified deviation is documented inline at its usage site; it stays a one-off unless a second real usage appears, at which point it's proposed as a shared primitive.
- Screens 05/06 below follow the on-hold-disputes precedent: 3 structurally-different variants switchable via `?variant=`, reacted to live, losing variants dropped from the working tree once a winner is picked.

As part of locking this policy, the rejected first-round prototype (`components/home/prototype-homepage-overview.tsx` and its variants/data/customize-sheet files, plus `components/prototype/prototype-switcher.tsx`) was deleted and `home-content.tsx` reverted to rendering `OverviewDetailCards` directly — tickets 05/06 restart from this policy, not from that rejected code.

## 4. Proposed Solution

*(pending tickets 05-06 — needs-attention surface and business snapshot + page composition prototypes)*
