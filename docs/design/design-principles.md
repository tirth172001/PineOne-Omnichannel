# Design Principles (UX & Visual)

Last updated: 2026-08-04

Source: wayfinder map `.scratch/homepage-design-principles/map.md`

A reusable set of UX and visual design principles for this repo's prototype work — derived by diagnosing the current homepage experience and auditing the existing design system, then grilling out *why* each gap matters to the actual user, rather than inventing principles from a blank page. First applied to the merchant homepage (`docs/flows/merchant-homepage-design.md`); written generally enough to be reused by future prototype efforts.

## 1. UX Principles (Merchant Mental Model)

**The merchant this is grounded in:** a small in-store/online merchant checking the dashboard as a daily habit, not sitting down for analysis. Anxious about cash flow first — payout uncertainty outweighs transaction-status curiosity (`docs/flows/merchant-homepage.md` §2.2). Already fluent in payment-gateway vocabulary through repeated daily use, unlike a one-time flow's user. Wants fast reassurance, and unambiguous alarm only when it's actually warranted.

1. **"Is something wrong?" gets answered before anything else is read.** Resolved by position and visual register alone, in the first glance — not by reading text. *(Closes: no differentiation between action-needed and informational content on today's homepage.)*
2. **Quiet by default, alarm only when money's actually blocked.** The page's emotional register is asymmetric: normal/good states stay calm and unremarkable — no celebration needed — and only genuine money-blocking states earn visual urgency. Reassurance is the page's default job, not alarm.
3. **A number only earns a comparison if it's ambiguous alone.** A forward-looking payout amount or a dispute amount is self-evidently meaningful without a reference point. A same-day collected-revenue or refunded-amount figure isn't — the merchant can't tell if it's a good day or a bad one without something to compare it to.
4. **"Normal for me" beats a percentage.** Where a comparison is needed, it should read as "is this normal for me" — qualitative, pattern-based — not a raw period-over-period delta the merchant has to mentally interpret. (Grounds `docs/decisions/decision-log.md` entry 81's rate-only-delta call in merchant cognition, not just statistical noise at low volume.)
5. **Numbers are scanned, not read.** Consistent digit alignment (tabular figures) and predictable formatting let the merchant pattern-match a number's shape and magnitude instantly, instead of consciously parsing each digit — this is the visual execution of principles 3-4.
6. **Size has to mean the same thing every time.** Text size is an unconscious importance signal to the merchant. A consistent, limited type scale keeps that signal trustworthy; arbitrary per-screen sizing turns it into noise the merchant has to override by reading everything instead of scanning.
7. **Familiarity is functional, not decorative.** A returning merchant navigates by pattern-recognition — "a card-shaped surface = a business area's summary" — built through repeated exposure. Using the same shared surface/component everywhere is what lets that recognition work; visual drift across pages breaks it and forces conscious re-orientation.

**Confirmed, not a gap — recorded so it isn't re-litigated:** Vocabulary (Settlement, success rate, on hold, at risk) can stay industry-standard. Unlike a one-time consent/onboarding flow, this merchant returns daily — repetition teaches the vocabulary, so the simplification pressure that a one-time flow needs doesn't fully transfer here.

**Confirmed compliant in the existing system — reuse as-is, no new principle needed:**
- **Color system**: `app/globals.css`'s semantic token palette is real and consistently used.
- **Layout/spacing**: strictly on Tailwind's 4px scale already, consistently followed.

## 2. Component-Reuse and Prototyping-Process Policy

**Standing rule:** use existing components (`components/ui/*`, shared shell primitives) first. Deviate only when one of the following concretely applies — never on preference alone:

1. **Missing required visual state** — no prop/variant exists to express a state the content needs (e.g. an urgency/alarm register per principle 2), and adding one would mean forking the component.
2. **Wrong information density** — the component forces more or less structure than the content actually has.
3. **Structurally can't express the interaction** — no slot exists for the needed action (a click-through target, a count+amount pairing) without hacking children into a slot they weren't designed for.

"I'd prefer it look different" is explicitly **not** sufficient justification on its own — familiarity is functional (principle 7), not a preference to trade away.

**Before a deviation ships:**
- Document the rationale inline at the deviation's usage site (or the new component's file) — which of the three tests applied, referencing this section.
- Default to a one-off. Only propose it as a new shared `components/ui/*` primitive once a *second* real usage appears — never speculatively, per the map's "no new shared primitives added speculatively" scope boundary.
- Decider is whoever is driving the ticket that surfaces the deviation — no separate approval step, since this is a single-driver effort today.

**Prototyping process for screen-design tickets (05/06 and beyond):**
- **3 structurally-different variants** is the standard — not 3 spacing/color tweaks of one idea — following the on-hold-disputes precedent (`.scratch/on-hold-disputes-module/issues/01-design-on-hold-detail-page.md`: Receipt style / Reason forward / Timeline-driven, one clear winner). Flex down to 2 only when a screen is simple enough that a genuine third structural approach would be manufactured, not real — judged per screen.
- Variants are built at the real route/component location, switchable via `?variant=` (`PrototypeSwitcher` pattern), per `/mattpocock-skills:prototype`.
- The person reacting to the variants and picking a winner is the effort's driver, live in the prototyping session — not an async review.
- **Cleanup:** once a winner is picked, losing variants and the switcher are dropped from the working tree, not committed to a throwaway branch unless explicitly asked for.
