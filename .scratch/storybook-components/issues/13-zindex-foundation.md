Type: task
Status: resolved

## Question

Surfaced by a post-completion audit (2026-08-19): the app mixes arbitrary z-index values (`z-[100]`, `z-[220]`, `z-[70]`) with Tailwind's default scale (`z-0`, `z-10`, `z-20`, `z-40`, `z-50`) across overlay-type components (drawers, sidebars, dialogs, sheets), with nothing documented — unlike the dual radius system, which the existing `components/foundations/radius.stories.tsx` documents faithfully as-is (flagging the inconsistency rather than inventing a fix).

Resolve, following that same documentation-only precedent:

- Grep every `z-*`/`z-[...]` usage across `components/` and `app/`, and note which component/layer each value belongs to (e.g. sticky table header vs. dialog overlay vs. toast).
- Add `components/foundations/zindex.stories.tsx` (plus any shared render primitive in `foundation-primitives.tsx` needed) documenting the actual stacking values in use today, grouped by layer, the same way colors are grouped by base/brand/status/chart/sidebar.
- Flag, but do not resolve, whether the arbitrary values (`z-[100]`, `z-[220]`, `z-[70]`) should later be rationalized into a named scale — leave that as a line in the map's Not yet specified section rather than deciding it here, since it's a design decision this task-type ticket isn't meant to make.

## Answer

Grepped every `z-*`/`z-[n]` usage across `components/` and `app/` (no matches in `app/`, all in `components/`) and grouped by the role each value actually plays, not just its numeric value:

- **`z-0` / `z-1`** — decorative/purely-local, no overlay intent: `calendar.tsx` background dots, `navigation-menu.tsx` indicator arrow.
- **`z-10`** — local elevation within a component (sticky headers/columns, focus rings, carets, drag handles). By far the largest tier — 15 files, ~20 occurrences.
- **`z-20`** — nested local elevation, one step above z-10 siblings: `sidebar.tsx`, `v2-product-rail.tsx`.
- **`z-40`** — page-level chrome (sticky headers/backdrops below any overlay): `activity-timeline-sidepanel.tsx`, `v2-topbar.tsx`, `v2-dashboard-layout.tsx`, `workspace-shell.tsx`, `account-onboarding-flow.tsx`.
- **`z-50`** — global overlay tier, inherited as-is from Radix's own default on every shadcn primitive (dialog, alert-dialog, sheet, drawer, popover, hover-card, tooltip, menubar, context-menu, dropdown-menu, select, navigation-menu) plus a few app-level overlays (`activity-timeline-sidepanel.tsx`, `bottom-nav.tsx`, `v2-topbar.tsx`, `floating-demo-fab.tsx`). This is a real, coherent tier — not arbitrary — since it's Radix's baked-in default.
- **Three arbitrary escapes above z-50, independent of each other:**
  - `z-[70]` (`account-onboarding-flow.tsx:773`) — one-off, no stated reason.
  - `z-[100]` (`toast.tsx:19`) — has an obvious rationale (toasts must outrank dialogs/sheets), the one arbitrary value that's clearly deliberate.
  - `z-[220]` (`v2-product-rail.tsx:63`) — the highest value in the codebase by a wide margin (2x+ the next highest), with no comment or naming explaining why.

Added `components/foundations/zindex.stories.tsx` (`Foundations/Z-Index`) documenting all of the above grouped by tier, plus a `ZIndexTier` render primitive in `foundation-primitives.tsx`. Per the ticket's scope, this documents reality only — it does not introduce a named token scale or touch any of the actual z-index values in the app. The open question of whether to rationalize the three arbitrary values (and the z-10 tier's sheer size) into a real scale is left in the map's Not yet specified section.
