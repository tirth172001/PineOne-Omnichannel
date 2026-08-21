Type: grilling
Status: resolved
Blocked by: 01, 02

## Question

Given ticket 01's diagnosis and ticket 02's audit gap report, what UX and visual design principles should govern this repo's prototype work going forward?

Context: per the reference AA consent doc's "Mental model for solution" section (`/Users/tirth/Downloads/AA Consent flow revamp - design document.md`), each principle should (a) trace back to a specific diagnosed problem or audit gap, not float free, and (b) be written generally enough to be reused by a future prototype effort, not phrased homepage-specifically. Only grill where ticket 02 found a real gap or ticket 01 found a real problem — anything already confirmed compliant is recorded as-is, not re-decided from scratch.

Resolve:

- For each gap/problem surfaced, what's the principle that closes it (mirroring the reference doc's pattern, e.g. its "Cognitive overload due to dense screens" problem → "One Step at a Time" principle)?
- Where audit gaps conflict with each other (e.g. a visual fix that would work against a UX fix), which takes precedence, and why?
- Final form: a numbered list of principles, each with a one-line rationale tied to its source problem/gap — matching the reference doc's "Mental model for solution" format.

Use `/mattpocock-skills:grilling` to resolve. Write the answer into `docs/design/design-principles.md` (new file, create on first resolution) — this doc is the reusable artifact, not homepage-scoped. Append a terse `docs/decisions/decision-log.md` entry.

## Answer

First two drafts were rejected during grilling for being implementation-consistency rules (tabular-nums, type scale, component reuse) dressed up as UX principles rather than actually describing the merchant's mental model. Redone grounded in merchant psychology, confirmed through live grilling (itself treated as evidence alongside ticket 01/02):

**Merchant profile:** small in-store/online merchant, checks the dashboard as a daily habit, not an analysis session. Anxious about cash flow first (payout uncertainty > transaction-status curiosity, per `merchant-homepage.md` §2.2). Already fluent in payment-gateway vocabulary through repeated daily use. Wants fast reassurance, unambiguous alarm only when warranted.

**Seven principles** (full text and sourcing in `docs/design/design-principles.md` §1):
1. "Is something wrong?" gets answered before anything else is read.
2. Quiet by default, alarm only when money's actually blocked.
3. A number only earns a comparison if it's ambiguous alone.
4. "Normal for me" beats a percentage.
5. Numbers are scanned, not read.
6. Size has to mean the same thing every time.
7. Familiarity is functional, not decorative.

Plus one confirmed-compliant note (vocabulary can stay industry-standard — this is a habitual-use dashboard, not a one-time flow, so the AA-doc-style plain-language pressure doesn't fully transfer) and two confirmed-compliant carryovers from the audit (color-system, layout-system — no new principle needed).

Dropped from earlier drafts: "ship it whole or not at all" (real problem, but an engineering/process discipline, not something the merchant's mind is doing) — moved to ticket 04 instead.

Recorded in `docs/design/design-principles.md` §1 and `docs/flows/merchant-homepage-design.md` §2.
