Type: grilling
Status: resolved

## Question

What's actually wrong with today's homepage UX — mirroring the AA consent doc's "Current Experience Problems" section structure (grouped by theme) applied to `components/home/home-content.tsx` and `components/home/overview-detail-cards.tsx`.

Context: `docs/flows/merchant-homepage.md` already locked the *content* replacing today's cards (needs-attention surface + four-module snapshot), but never diagnosed *why* the current `OverviewDetailCards` static-card format falls short — the closest existing rationale is decision-log entry 81's one-line "wrong content per §2.4," which isn't a diagnosis. This ticket produces that diagnosis, which grounds ticket 03's principles the same way the reference AA doc's principles trace back to its own diagnosis section.

Resolve:

- What specifically is wrong with today's homepage as experienced by a merchant: information hierarchy (is anything buried or over-prominent), cognitive load (static cards with no attention/urgency differentiation), visual design (is current card styling generic or inconsistent with the rest of the app), missed context (the dead `OverviewSnapshotChartCard` / `overviewSnapshotCards` "Customize cards" sheet in `home-content.tsx` ~2756-2950 implies an affordance that was never actually shipped).
- Format: this is a prototype/demo repo with no real analytics — should the diagnosis be a heuristic walkthrough grounded in known UX principles and the same domain reasoning already used in `merchant-homepage.md` (e.g. entry 81's "payout uncertainty is the sharper anxiety"), rather than invented usage metrics?
- Output: a "Current Experience Problems" section, grouped by theme, each problem traceable to a concrete file/line or existing decision-log entry where possible — not vague generalities.

Use `/mattpocock-skills:grilling` to resolve. Write the answer into `docs/flows/merchant-homepage-design.md` (new file, create on first resolution) as its opening section.

## Answer

Four problems, confirmed against the live code and the design-system audit (ticket 02):

1. **No differentiation between "needs action" and "just information"** — today's four cards (`overview-detail-cards.tsx`) render a failed settlement with the same visual weight as a routine "successful" stat. Names *why* `merchant-homepage.md` §1's dedicated attention surface is necessary, not just what it contains.
2. **Two promised affordances already exist, unshipped** — a `hidden`-wrapped "Customize cards" sheet and an entirely unused `attention-strip.tsx` in `home-content.tsx` are an earlier, abandoned attempt at this same gap.
3. **Visual inconsistency, confirmed by the audit** — `Card` primitive unused on the homepage (hand-rolled divs with drifting radius/opacity/padding instead), 10 arbitrary text sizes on one page, no `tabular-nums` on currency figures.
4. **A first ungrounded redesign attempt reproduced the same failure mode** — the three rejected prototype variants (Bento Priority / Editorial Stack / Spotlight) skipped principles and landed on more inconsistency, not less, confirming the audit-first sequence this map now follows.

Recorded in `docs/flows/merchant-homepage-design.md` §1.
