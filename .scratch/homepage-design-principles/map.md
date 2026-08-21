# Map: Homepage Design Principles

Label: wayfinder:map

## Destination

A locked, **reusable** set of UX and visual design principles for this repo's prototype work — derived by auditing the *existing* design system rather than inventing from a blank page — applied concretely to design the merchant homepage's actual screens (needs-attention surface + business snapshot, per `docs/flows/merchant-homepage.md`).

Reaching the end of this map means:

1. Today's homepage UX problems are diagnosed (why the current `OverviewDetailCards` format falls short), mirroring a "Current Experience Problems" section.
2. The existing design system (`components/ui/*`, tokens) is audited against sound UX/visual rubrics — confirmed-compliant parts recorded as-is, real gaps identified.
3. UX and visual design principles are resolved from that diagnosis + gap report, written generally enough to be reused by future prototype efforts, not homepage-specific.
4. A concrete component-reuse policy and prototyping-process policy are locked (when an existing component "doesn't serve the purpose," how screen-design tickets run).
5. The needs-attention surface and the business snapshot (+ overall page composition) are prototyped under that locked ruleset.
6. Everything is synthesized into `docs/design/design-principles.md` (reusable principles) and `docs/flows/merchant-homepage-design.md` (homepage-specific diagnosis + application + prototype outcome), shaped like the reference doc in the Notes below, plus terse `docs/decisions/decision-log.md` entries.

## Notes

- Domain: merchant-facing payments dashboard (Pine One). This map picks up exactly where the "Merchant Homepage Experience" map left off — that map's Notes explicitly deferred "pixel-level visual/component design" to "a separate, later effort using `/mattpocock-skills:prototype`."
- Sibling maps: `.scratch/merchant-homepage/map.md` (business logic, destination reached — its decisions in `docs/flows/merchant-homepage.md` are the content this map designs for); `.scratch/on-hold-disputes-module/map.md` (precedent for `/mattpocock-skills:prototype` tickets — used 3 structurally different variants switchable via `?variant=`, one clear winner, losing variants dropped from the working tree).
- Existing design system to audit and reuse, not reinvent: `components/ui/*` (~45 shadcn-based primitives), `app/globals.css` + `styles/globals.css` (tokens), `docs/implementation/component-boundaries.md` (shared primitives: `PageHeader`, `SectionSummaryStrip`, `DataTable`, `WorkspaceShell`). Standing policy (user-stated): use existing components first; only deviate when they genuinely don't serve the purpose — ticket 04 turns this into a concrete, checkable rule.
- Skills to use: `color-system`, `typography-system`, `layout-system`, `component-patterns`, `platform-dashboard`, `motion-design`, `accessibility-audit`, `anti-slop-audit`, `design-evaluation` for the audit and principles work; `/mattpocock-skills:grilling` for every HITL ticket; `/mattpocock-skills:prototype` for the two screen-design tickets.
- Reference for the target output shape: `/Users/tirth/Downloads/AA Consent flow revamp - design document.md` (user-owned prior work) — its "Current Experience Problems" → "Mental model for solution" → "Proposed solution" structure, each principle traceable to a diagnosed problem, is the model `docs/flows/merchant-homepage-design.md` should follow.
- Ticket 02 (the audit) is AFK/research-shaped and runs as a background pass in parallel with ticket 01 — fire it once this map exists, don't wait on it before starting ticket 01.
- A first, pre-principles round of screen prototyping already happened and was rejected: `components/home/prototype-homepage-overview.tsx` (+ `prototype-homepage-variants.tsx`, `prototype-homepage-data.ts`, `prototype-customize-sheet.tsx`, `components/prototype/prototype-switcher.tsx`) — three structural variants ("Bento Priority," "Editorial Stack," "Spotlight"), still mounted live on `/` in place of `OverviewDetailCards`, uncommitted. The user rejected all three outright and started this map specifically to reach shared design understanding before attempting screens again. Tickets 05/06 do **not** treat these as a starting point to refine — they restart from the principles this map locks. Whatever concretely didn't work about them is a live input to ticket 01's diagnosis, not just inferred from code.
- When resolving a ticket: append the answer under the ticket's `## Answer` heading, set `Status: resolved`, write into the docs named in the ticket, append a terse decision-log entry, then append a context pointer to this map's Decisions-so-far.

## Decisions so far

- [Diagnose current homepage UX problems](issues/01-diagnose-current-homepage-ux.md) — Four problems: no visual differentiation between action-needed and informational cards; two already-abandoned unshipped affordances for this exact gap (dead "Customize cards" sheet, unused `attention-strip.tsx`); confirmed visual inconsistency per the audit (unused `Card` primitive, 10 arbitrary text sizes, no `tabular-nums`); a first ungrounded redesign attempt (3 rejected variants) reproduced the same inconsistency rather than fixing it. Recorded in `docs/flows/merchant-homepage-design.md` §1.
- [Audit existing design system](issues/02-audit-existing-design-system.md) — 2 of 5 rubrics confirmed compliant (color-system, layout-system); gaps in typography-system (no defined type scale, `home-content.tsx` uses 10 distinct text sizes, `tabular-nums` almost unused), component-patterns (`Card` primitive unused on the homepage in favor of inconsistent hand-rolled divs; decision-log entry 10's radius standardization covers only inputs/buttons/dropdowns/sheets/popovers, not elevation/card surfaces/the semantic-radius token layer it created), and platform-dashboard (shell primitives — `WorkspaceShell`, `PageHeader`, `DataTable`, `SectionSummaryStrip` — are solid per decision-log entries 15-18/53-54, but `home-content.tsx` doesn't draw on that same discipline). Also flags `styles/globals.css` as an orphaned, unimported duplicate token file. Full gap report in the ticket's `## Answer`.
- [Resolve UX & visual principles](issues/03-resolve-ux-visual-principles.md) — Seven principles grounded in merchant mental model (not implementation consistency, after an early draft was rejected on those grounds): urgency answered before anything else is read; quiet by default, alarm only when money's blocked; comparison only when a number is ambiguous alone; "normal for me" beats a percentage; numbers scanned not read; size means the same thing every time; familiarity is functional. Plus confirmed carryovers (vocabulary, color-system, layout-system). Recorded in `docs/design/design-principles.md` §1.
- [Component-reuse and process policy](issues/04-component-reuse-and-process-policy.md) — 3-part deviation test (missing visual state / wrong density / can't express the interaction; preference alone doesn't qualify); deviations documented inline, stay one-off until a second usage justifies a shared primitive. Screen tickets (05/06) build 3 structurally-different variants switchable via `?variant=`, reacted to live, losing variants dropped from the tree — on-hold-disputes precedent adopted as-is. Rejected first-round homepage prototype deleted; `home-content.tsx` reverted to `OverviewDetailCards`. Recorded in `docs/design/design-principles.md` §2.

## Not yet specified

- Whether the "Customize cards" panel's own visual design (trigger placement, sheet content beyond the per-card switch list) needs its own ticket, or is fully covered by ticket 06's page-composition question — depends on what ticket 04's policy and ticket 06's prototype surface; graduate into a ticket only if ticket 06 can't settle it inline.

## Out of scope

- **Retrofitting other existing pages/screens** (Transactions, Settlements, Disputes, Reports, Products) to whatever principles this map locks — those principles are written to be reusable by a *future* effort, but applying them elsewhere is not this map's destination.
- **Backend data wiring / real data integration** — carried over from the parent map; this remains a decision/prototype document, not a data-integration effort.
- **New shared primitives added speculatively** — ticket 04's component-reuse policy governs when a deviation is justified; nothing gets added to `components/ui/*` "just in case."
