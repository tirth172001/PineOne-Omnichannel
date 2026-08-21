Type: task
Status: resolved

## Question

Surfaced by a post-completion audit (2026-08-19): `framer-motion` is a project dependency and `app/globals.css` has hardcoded transition durations/easings (e.g. `transition: background-color 180ms ease;`, various `transition-colors` utility usages), but there's no documented duration/easing scale the way there's a documented color, typography, spacing, radius, and shadow scale.

Resolve:

- Grep `app/globals.css` and component files for actual duration/easing values in use (CSS `transition`, Tailwind `duration-*`/`ease-*` utilities, and any `framer-motion` `transition={{ ... }}` props) and catalog what's really there today.
- Add `components/foundations/motion.stories.tsx` documenting the real values found — same documentation-only approach as the existing foundations pages (document reality, flag inconsistency, don't invent a new canonical scale in a `task` ticket).
- If the catalog turns out to be too thin or too inconsistent to present as a coherent "scale" (e.g. just one or two ad-hoc values), say so plainly in the Answer rather than padding it — that's a legitimate resolution for this ticket.

## Answer

Catalog turned out richer and more coherent than expected — there's real, consistent motion language already in practice, just not centralized:

- **Framer Motion panel/overlay easing** — every `framer-motion` transition in the app (`panels.tsx`, `activity-timeline-sidepanel.tsx`, `workspace-shell.tsx`, `v2-dashboard-layout.tsx`, `transactions-platform-shell.tsx`) uses the identical easing curve `cubic-bezier(0.22, 1, 0.36, 1)` at durations clustering 0.2s–0.28s. This is a real de facto standard — it's just duplicated as a local literal in each file instead of a shared constant. `animated-number-text.tsx` also uses `framer-motion` but with no explicit duration/easing (relies on the library default spring).
- **Tailwind `duration-100`** — the dominant tier for Radix overlay open/close, shared identically across 7 primitives (dialog, alert-dialog, dropdown-menu, context-menu, menubar, popover, hover-card).
- **Tailwind `duration-200`** — the second real tier, for sidebar/layout expand-collapse (`sidebar.tsx`, `v2-sidebar.tsx`, `v2-dashboard-layout.tsx`, `floating-demo-fab.tsx`).
- **Four one-off values, no shared tier**: `duration-150` (`v2-product-rail.tsx`), `duration-250` (`bottom-nav.tsx`), `duration-300` (`navigation-menu.tsx`) — none match either real tier above with no stated reason; `duration-1000` (`input-otp.tsx` caret blink) is a deliberate slow blink, not an inconsistency. A fifth value, a raw CSS `transition: background-color 180ms ease;` in `app/globals.css:333`, sits entirely outside the Tailwind `duration-*` scale.
- Highcharts' own `animation: { duration: 250 }` config (`highcharts.tsx:76`) is a separate charting library's internal setting, not part of the UI motion system — noted but out of scope here.

Added `components/foundations/motion.stories.tsx` (`Foundations/Motion`) documenting all of the above, plus a `MotionSample` primitive in `foundation-primitives.tsx` — a live, hoverable bar that actually animates at the real duration/easing so the difference is felt, not just read. Verified live in Storybook (hover interaction confirmed working). Per the ticket's scope, this documents reality only — it doesn't extract the Framer Motion easing into a shared constant or introduce Tailwind theme-level duration tokens. Whether to do that consolidation is a design decision left open, not resolved here.
