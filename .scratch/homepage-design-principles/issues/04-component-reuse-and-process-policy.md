Type: grilling
Blocked by: 03
Status: resolved

## Question

What's the concrete threshold for "an existing component doesn't serve the purpose" (and can be deviated from), and how will the screen-design tickets (05, 06) actually run?

Context: the user's standing instruction is "use existing components first, deviate only when they don't serve the purpose" — this ticket turns that into an operational, checkable rule rather than a vague preference.

Resolve:

- Concrete test for "doesn't serve the purpose": e.g. the component is missing a required visual state, the wrong information density for the content, or structurally can't express the needed interaction — vs. cases that don't qualify (e.g. "I'd prefer it look different" is not sufficient justification on its own).
- When a deviation is justified, what's required before it ships: document the rationale (referencing this policy), and does it get proposed as a new shared primitive vs. a one-off — who decides which?
- Prototyping process for tickets 05/06: how many variants get built per screen — is the on-hold-disputes precedent (3 structurally different variants, switchable via `?variant=`, one clear winner) the standard, or does it flex per screen complexity? Who reacts to the variants? Does `/mattpocock-skills:prototype`'s cleanup step (drop losing variants, don't commit to a branch unless asked) apply here too?

Use `/mattpocock-skills:grilling` to resolve. Write the answer into `docs/design/design-principles.md` as its closing "Component-reuse and process policy" section. Append a terse `docs/decisions/decision-log.md` entry.

## Answer

**Deviation threshold (3-part test, none sufficient alone as preference):** missing required visual state, wrong information density, or structurally can't express the needed interaction. "I'd prefer it look different" doesn't qualify.

**Before a deviation ships:** rationale documented inline at the usage site, citing which test applied and referencing the policy. Defaults to one-off; only proposed as a new shared `components/ui/*` primitive once a second real usage appears (never speculatively). Decider is whoever's driving the ticket — no separate approval step for this single-driver effort.

**Prototyping process for 05/06:** 3 structurally-different variants is the standard (on-hold-disputes precedent: Receipt style / Reason forward / Timeline-driven, one winner), flexing to 2 only when a genuine third structural approach would be manufactured — judged per screen. Built at the real route, switchable via `?variant=`. The driver reacts live and picks the winner. Losing variants + `PrototypeSwitcher` dropped from the working tree once decided, not committed unless asked.

**Immediate action taken:** deleted the rejected first-round prototype (`components/home/prototype-homepage-overview.tsx`, `prototype-homepage-variants.tsx`, `prototype-homepage-data.ts`, `prototype-customize-sheet.tsx`, `components/prototype/prototype-switcher.tsx`) and reverted `home-content.tsx` to render `OverviewDetailCards` directly — tickets 05/06 restart from this policy, not from that rejected code.

Written into `docs/design/design-principles.md` §2 and `docs/flows/merchant-homepage-design.md` §3. Decision-log entry 88.
