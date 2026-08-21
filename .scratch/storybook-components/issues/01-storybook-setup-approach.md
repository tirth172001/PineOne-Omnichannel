Type: research
Status: resolved

## Question

How should Storybook actually be installed and configured against this repo's specific stack — Next.js 16.0.10, React 19.2.0, Tailwind CSS v4.1.9 (`@tailwindcss/postcss`), `tailwindcss-animate`, `next-themes`, and path-aliased imports (`@/components/...`, `@/lib/...`)?

Resolve, citing current official docs (Storybook's Next.js framework docs, Tailwind v4 integration docs):

- Which Storybook framework preset applies (`@storybook/nextjs` vs `@storybook/nextjs-vite` vs `@storybook/react-vite`) given Next 16 and React 19 — check current compatibility/support status, not assumptions from older Storybook/Next versions.
- How to wire Tailwind v4's CSS-first config (`@tailwindcss/postcss`, no `tailwind.config.js` in the old sense) into Storybook's preview build so components render with real project styles.
- How to make `next-themes`/this repo's `components/theme-provider.tsx` and CSS variable theme (light/dark) available in Storybook previews (a preview decorator, global CSS import, or toolbar addon for theme switching).
- How to resolve the `@/*` path alias inside Storybook (usually automatic via the Next.js preset, but confirm) and whether any of the ~60 `components/ui/*` files' existing peer imports (e.g. `embla-carousel-react`, `@phosphor-icons/react`, `lucide-react`, Radix primitives) need anything special.
- What addon set is worth including at setup time (e.g. `@storybook/addon-essentials`/its v9 equivalent for controls+docs, `@storybook/addon-a11y`) — keep this minimal, matching the "documentation-only" scope locked on the map.
- Confirm whether autodocs (TS-prop-extraction-driven docs pages) works out of the box with this preset/TS setup, since the destination requires every prop to be documented.

Output: a concrete install/config plan (packages to add, `.storybook/main.ts` and `.storybook/preview.ts` shape) that ticket 04 (install-and-scaffold) executes directly.

## Answer

Full findings with citations: [research/01-storybook-setup-approach.md](../research/01-storybook-setup-approach.md).

- **Framework preset: `@storybook/nextjs-vite`** — Storybook's own docs now recommend it for most Next.js projects (Webpack-based `@storybook/nextjs` is only for projects needing custom Webpack/Babel, which this repo doesn't). Next 16 compatibility confirmed via a Storybook maintainer response in a GitHub discussion (Storybook 10 + `vite-plugin-storybook-nextjs` ≥ 3.0.3). Current Storybook major is **10** (10.5.7).
- **Tailwind v4**: no special wiring — just `import '../app/globals.css'` in `.storybook/preview.ts`. Storybook's Vite builder runs the project's existing `postcss.config.mjs` (`@tailwindcss/postcss`) automatically for any imported CSS.
- **Theming**: install `@storybook/addon-themes`, use its `withThemeByClassName` decorator with `{ light: '', dark: 'dark' }` — matches this repo's `.dark`-class convention (`app/globals.css`'s `@custom-variant dark`) without needing to mount the real `next-themes` `ThemeProvider`.
- **Path aliases**: `@/*` resolves automatically from `tsconfig.json`'s `paths` — no `viteFinal` config needed.
- **Addons to install** (Storybook 9/10 folded controls/actions/viewport/backgrounds into core): `@storybook/addon-docs` (autodocs/props tables), `@storybook/addon-a11y`, `@storybook/addon-themes`.
- **Autodocs**: works out of the box via the default `react-docgen` for most components; CVA-variant-heavy files like `button.tsx` may render incomplete prop unions and need `typescript.reactDocgen: 'react-docgen-typescript'` in `main.ts` as a fallback — ticket 04 should try the default first.
- **Install plan**: `pnpm dlx storybook@latest init` (confirm it picks `@storybook/nextjs-vite` interactively), then `pnpm dlx storybook@latest add @storybook/addon-docs / @storybook/addon-a11y / @storybook/addon-themes`. Skeleton `.storybook/main.ts` and `.storybook/preview.ts` are in the research file, ready for ticket 04 to use directly.
- Two things ticket 04 should verify rather than assume: that Tailwind's PostCSS pipeline really does get picked up with zero extra Vite config, and whether the default `react-docgen` autodocs output is good enough for CVA components before reaching for `react-docgen-typescript`.
