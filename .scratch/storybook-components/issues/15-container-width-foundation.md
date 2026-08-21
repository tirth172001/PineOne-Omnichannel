Type: task
Status: resolved

## Question

Surfaced by a post-completion audit (2026-08-19): page/panel layouts use a wide, ungoverned spread of `max-w-*` values — both Tailwind's named scale (`max-w-sm`, `max-w-md`, `max-w-lg`, `max-w-xl`, `max-w-2xl`, `max-w-4xl`, `max-w-full`) and one-off arbitrary values (`max-w-[1440px]`, `max-w-[1360px]`, `max-w-[92...]`, `max-w-[560px]`, `max-w-[460px]`, `max-w-[420px]`, `max-w-[calc...]`), with no documented convention for which width a given layout context (page shell, modal, side panel, form) should use.

Resolve:

- Grep every `max-w-*` usage across `components/` and `app/`, and group occurrences by the layout context they're used in (full-page shell, dialog/sheet content, form/panel, card), noting which values repeat vs. which are one-offs.
- Add `components/foundations/containers.stories.tsx` documenting the real widths in use today, grouped by context — same documentation-only approach as the rest of the foundations section.
- Flag, but do not resolve, whether the one-off arbitrary values should later collapse onto the named Tailwind scale — leave that as a line in the map's Not yet specified section rather than deciding it here.

## Answer

Grepped every `max-w-*` usage across `components/` and `app/` (94 call sites) and grouped by layout context, as asked:

- **Full-page shells** — no shared value except one real cluster at **1440px (4 files)**. Every other page shell (1700, 1512, 1360×3, 1280, 1120, 1100, 1080, plus Tailwind's `5xl`/1024px) is its own one-off arbitrary width.
- **Article/form-width content** — Tailwind's named scale gets real reuse: `4xl`/896px (6 files), `3xl`/768px (4), `2xl`/672px (3), `xl`/576px (6), `lg`/512px (3). But two arbitrary values, 560px (×3) and 520px (×2), sit unexplained in the gap between `lg` and `xl` instead of using either.
- **Dialog/sheet/panel content** — the messiest bucket. Radix/shadcn's own defaults are the real standard here (`sm`/384px, 10 call sites; `md`/448px, 4 call sites), but a parallel set of arbitrary pixel values clusters near them without ever reusing the token: 460px (×5, near `md`), 464px (one file, 4px off the 460 cluster for no apparent reason), 430px, 420px (×3, includes `toast.tsx`), 390px, 380px, and 320px used as an arbitrary value in 2 files that duplicates `max-w-xs`'s own value (320px) with different syntax.
- **Chat bubble width** — the one bucket that's already internally coherent: `max-w-[92%]` as a percentage cap, used identically across 8 call sites (`account-onboarding-flow.tsx` + `support-request-chat-panel.tsx` ×7). Doesn't show up as a pixel value anywhere else since it's intentionally proportional, not fixed.
- **Fluid/viewport-relative escapes** — `max-w-full`, `max-w-max` (content-hugging), `max-w-[calc(100%-2rem)]` / `max-w-[calc(100vw-2rem)]` (viewport-safe margins). Each serves a distinct, legitimate purpose — not inconsistency, just a different category from the fixed-width buckets above.

Added `components/foundations/containers.stories.tsx` (`Foundations/Container Widths`) documenting all of the above with a live `ContainerWidthBar` primitive (proportional bar per value, file references listed underneath). Verified live in Storybook, renders cleanly with no console/server errors. Per the ticket's scope, this documents reality only — whether the one-off arbitrary values should later collapse onto the named Tailwind scale is left open in the map's Not yet specified section, not decided here.
