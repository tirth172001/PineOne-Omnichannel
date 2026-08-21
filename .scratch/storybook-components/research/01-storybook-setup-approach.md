Type: research
Status: resolved

## Question

How should Storybook be installed and configured against this repo's stack — Next.js 16.0.10, React 19.2.0, Tailwind CSS v4.1.9 (CSS-first, `@tailwindcss/postcss`), `tailwindcss-animate`/`tw-animate-css`, `next-themes`, and `@/*` path aliases?

## Repo grounding (checked before researching docs)

- `package.json`: `next@16.0.10`, `react@19.2.0`, `react-dom@19.2.0`, `tailwindcss@^4.1.9`, `@tailwindcss/postcss@^4.1.9`, `postcss@^8.5`, `tailwindcss-animate@^1.0.7`, `tw-animate-css@1.3.3`, `next-themes@^0.4.6`, `typescript@^5`, `packageManager: pnpm@9.0.0`. No `storybook` packages present yet — this is a fresh install.
- `postcss.config.mjs`: only plugin is `'@tailwindcss/postcss': {}` — confirms Tailwind v4's CSS-first PostCSS pipeline, no `tailwind.config.js`.
- `app/globals.css`: `@import 'tailwindcss'; @import 'tw-animate-css'; @import 'shadcn/tailwind.css';`, a `@custom-variant dark (&:is(.dark *));` rule, all design tokens defined as CSS custom properties in `:root`/`.dark` (oklch colors), and a `@theme inline { ... }` block mapping those vars into Tailwind's theme. Dark mode is driven purely by a `.dark` class on an ancestor (compatible with `next-themes`'s `attribute="class"` mode).
- `components/theme-provider.tsx`: a thin wrapper re-exporting `next-themes`'s `ThemeProvider` — confirms class-based theme switching is the mechanism to replicate in Storybook.
- `components/ui/button.tsx`: uses `class-variance-authority` (`cva`) for variants, `radix-ui`'s `Slot`, and imports `cn` from `@/lib/utils` — confirms the `@/*` alias must resolve inside Storybook, and that props are typed via `VariantProps<typeof buttonVariants> & React.ComponentProps<"button">` (relevant to autodocs prop-table extraction).
- `tsconfig.json`: `"paths": { "@/*": ["./*"] }`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`.
- `next.config.mjs`: minimal, `images.unoptimized`, `typescript.ignoreBuildErrors` — no custom Webpack/Babel config that would force the Webpack-based Storybook framework.
- No `.storybook/` directory exists yet.

## 1. Which framework preset — `@storybook/nextjs` vs `@storybook/nextjs-vite` vs `@storybook/react-vite`

Storybook's own Next.js framework docs state the Vite-based framework is now the default recommendation: *"We recommend using `@storybook/nextjs-vite` for most Next.js projects"*, reserving the Webpack-based `@storybook/nextjs` only for projects with "custom Webpack configurations that are incompatible with Vite" or "custom Babel configurations that require Webpack" (https://storybook.js.org/docs/get-started/frameworks/nextjs). This repo's `next.config.mjs` has no custom Webpack/Babel config, so nothing forces the Webpack path.

Both framework doc pages list a minimum of **Next.js ≥ 14.1** (https://storybook.js.org/docs/get-started/frameworks/nextjs-vite, https://storybook.js.org/docs/get-started/frameworks/nextjs) — Next 16.0.10 satisfies that floor, but the docs pages themselves don't call out Next 16 by name.

Next-16-specific confirmation comes from Storybook's own GitHub discussion, where a maintainer/bot response confirms *"Storybook 10 and recent plugin updates"* enable Next.js 16 compatibility, citing source in `storybookjs/storybook` (https://github.com/storybookjs/storybook/discussions/33752, "Does `@storybook/nextjs-vite` support Nextjs 16?"). The thread also documents a real gotcha: a Windows module-resolution error ("request for 'react-remove-scroll' is not in cache") that turned out to be a **Node version** issue, resolved by upgrading Node, and a requirement that `vite-plugin-storybook-nextjs` be **≥ 3.0.3**. This repo's `node -v` is `v26.0.0`, well above that floor, and Storybook 10's own migration guide requires **Node 20.19+ or 22.12+** (https://storybook.js.org/docs/releases/migration-guide) — also satisfied.

The current Storybook major, per npm, is **Storybook 10** (10.5.7 as of 2026-08-19, with 10.6.0-alpha in progress) (https://www.npmjs.com/package/storybook?activeTab=versions). Storybook 10 pins all `@storybook/*` packages to the same major/minor by design, so `storybook`, `@storybook/nextjs-vite`, `@storybook/addon-docs`, `@storybook/addon-a11y`, and `@storybook/addon-themes` should all be installed at the same `^10.x` version.

**Verdict: use `@storybook/nextjs-vite`** (not `@storybook/react-vite`, which is the plain-Vite framework with no Next.js-specific handling — no need since this is a real Next.js app; and not `@storybook/nextjs`, the Webpack builder, since nothing in this repo needs Webpack/Babel).

## 2. Wiring Tailwind v4's CSS-first setup into Storybook's preview build

Storybook's official Tailwind CSS recipe (https://storybook.js.org/recipes/tailwindcss) instructs: for Vite- and Next.js-based frameworks, no separate PostCSS addon is needed (`@storybook/addon-styling-webpack` is explicitly called out as **Webpack-only** — projects "with Vite, Next.js, Create React App, or Angular can skip this step"). The only required step is importing the project's Tailwind entry stylesheet directly into `.storybook/preview.ts` (the doc's example: `import '../src/tailwind.css'`), since Storybook's Vite-based builder already runs the project's configured PostCSS pipeline (i.e. `postcss.config.mjs`'s `@tailwindcss/postcss` plugin) for any imported CSS file. The recipe doc doesn't call out Tailwind v4's `@import 'tailwindcss'` syntax explicitly, but the mechanism is unaffected — Storybook doesn't parse the CSS, it just runs it through the same PostCSS/Vite pipeline as the app.

For this repo concretely: `.storybook/preview.ts` should `import '../app/globals.css'` (the file that contains `@import 'tailwindcss'; @import 'tw-animate-css'; @import 'shadcn/tailwind.css';`, the `@theme inline` token mapping, and the `:root`/`.dark` CSS variables). Because `@storybook/nextjs-vite` builds with Vite and Vite already resolves `postcss.config.mjs` from the project root the same way `next build`/`next dev` does, no separate `@tailwindcss/vite` plugin wiring is needed — the existing `@tailwindcss/postcss` PostCSS plugin is picked up automatically by Vite's CSS pipeline. (This is standard Vite behavior — Vite auto-loads root `postcss.config.*` — not something the Storybook Tailwind recipe states explicitly, so treat it as an inference to verify once `.storybook` exists, per ticket 04.)

## 3. Making `next-themes`/CSS-variable light-dark theming available in previews

The dedicated `@storybook/addon-themes` package is Storybook's official mechanism for this. Its `withThemeByClassName` decorator "takes your theme class names to apply to your parent element to enable your theme(s)" (per the addon's own API docs, https://github.com/storybookjs/storybook/blob/next/code/addons/themes/docs/api.md, and corroborated by Storybook's blog post introducing it, https://storybook.js.org/blog/styling-addon-configure-styles-and-themes-in-storybook/). Because this repo's dark mode is driven by a `.dark` class on an ancestor element (confirmed in `app/globals.css`'s `@custom-variant dark (&:is(.dark *));` and mirrored by `next-themes`'s `attribute="class"` convention), `withThemeByClassName` is the exact-fit decorator — it applies `dark`/`""` (or `light`) classes to the preview root, which is functionally equivalent to what `next-themes` does at runtime, without needing to mount the actual `next-themes` `ThemeProvider` (which relies on `localStorage`/`window` and a flash-prevention script that doesn't apply inside the Storybook iframe). This addon must be installed separately — Storybook's Tailwind recipe shows it added via `npx storybook@latest add @storybook/addon-themes` and configured in `.storybook/preview.ts` with a `themes: { light: '', dark: 'dark' }`-style map plus `defaultTheme`, which also auto-adds a toolbar theme switcher (https://storybook.js.org/recipes/tailwindcss).

## 4. Path alias (`@/*`) resolution in the chosen framework

Per `@storybook/nextjs-vite`'s own framework doc: *"Storybook handles most Typescript configurations, but this framework adds additional support for Next.js's support for Absolute Imports and Module path aliases"* and confirms `baseUrl`/`paths` from `tsconfig.json` are read automatically, with **no manual `viteFinal` alias config required** (https://storybook.js.org/docs/get-started/frameworks/nextjs-vite). This repo's `tsconfig.json` already declares `"paths": { "@/*": ["./*"] }`, which is exactly the shape the framework auto-detects, so `@/lib/utils`, `@/components/ui/button`, etc. should resolve without touching `.storybook/main.ts`'s `viteFinal`. `main.ts` remains the place to extend the Vite config only if something beyond alias resolution is needed later (the framework "automatically extends your project's Vite configuration by default").

Peer libraries used across `components/ui/*` — `embla-carousel-react`, `@phosphor-icons/react`, `lucide-react`, and the various `@radix-ui/react-*`/`radix-ui` packages — are plain ESM/CJS React component libraries with no Next.js-specific runtime hooks (no `next/image`, `next/link`, `next/navigation` usage was found in `button.tsx`; other files should be spot-checked in ticket 04 for any that do use Next.js primitives, since those need Storybook's Next.js-specific mocks, which `@storybook/nextjs-vite` provides out of the box per its framework doc). No special Storybook config is expected for these peers beyond normal dependency installation.

## 5. Addon set for a documentation-only setup

Storybook 9 removed `@storybook/addon-essentials` as an installable package and folded its contents into core: the migration guide states *"The `@storybook/addon-essentials` package has been removed. The viewport, controls, interactions and actions addons have been moved from their respective packages...to Storybook core"* (Storybook 9 migration notes, referenced from https://storybook.js.org/docs/releases/migration-guide and the essentials overview at https://storybook.js.org/docs/essentials, which confirms Essentials is "zero-config" and enabled by default). This means **controls, actions, viewport, backgrounds, toolbars/globals, highlight, and measure/outline require no separate install** in Storybook 10 — they ship with `storybook` core.

What still needs explicit installation for a documentation-only, controls+autodocs+a11y setup:
- **`@storybook/addon-docs`** — provides the Docs tab/autodocs page generation; not bundled in core, confirmed by the autodocs guide's statement that autodocs "depends on `@storybook/addon-docs` being registered" (https://storybook.js.org/docs/writing-docs/autodocs). `@storybook/blocks` no longer exists as a separate package as of Storybook 9 — its exports moved to `@storybook/addon-docs/blocks`.
- **`@storybook/addon-a11y`** — accessibility panel/testing; official install command is `npx storybook add @storybook/addon-a11y` (https://storybook.js.org/docs/writing-tests/accessibility-testing), not bundled by default.
- **`@storybook/addon-themes`** — only needed because this repo requires light/dark theme switching per question 3; not part of "essentials" but is the current-generation, still-maintained package for this purpose (per the Tailwind recipe and the addon's own docs above).

So the minimal, current-generation addon list for this repo's documentation-only scope is: `@storybook/addon-docs`, `@storybook/addon-a11y`, `@storybook/addon-themes` — plus whatever `@storybook/nextjs-vite` itself pulls in as a peer (it depends on `@storybook/react-vite`/`@storybook/react` internally).

## 6. Does autodocs work out of the box with this preset and a standard `tsconfig.json`

Mostly yes, with one nuance worth calling out. Storybook's `typescript.reactDocgen` main-config option defaults to `'react-docgen'` (not `'react-docgen-typescript'`) whenever `@storybook/react` is installed, which it is transitively via `@storybook/nextjs-vite` (https://storybook.js.org/docs/api/main-config/main-config-typescript). `'react-docgen'` requires **no extra config** and will generate a props table for standard React components — this covers the majority of `components/ui/*` prop signatures like `React.ComponentProps<"button">`. Autodocs itself is enabled purely via tags: per the autodocs guide, *"If a CSF file contains at least one story tagged with `autodocs`, then a documentation page will be generated"* — done by adding `tags: ['autodocs']` to `.storybook/preview.ts` (project-wide) or per-component meta (https://storybook.js.org/docs/writing-docs/autodocs). This requires `@storybook/addon-docs` to be registered (see §5), but no further config beyond that + the tag.

The nuance: `react-docgen` (the default) is generally weaker than `react-docgen-typescript` at extracting prop types through generics, unions, and re-exported types — which is exactly the shape `components/ui/button.tsx` uses (`VariantProps<typeof buttonVariants> & React.ComponentProps<"button"> & { asChild?: boolean }`, a `cva`-driven variant map). If the props table renders incomplete/generic types for CVA-driven components, the fix documented by Storybook is to set `typescript.reactDocgen: 'react-docgen-typescript'` in `.storybook/main.ts`, which the same docs page states requires its own `reactDocgenTypescriptOptions` block (e.g. `propFilter` to exclude inherited HTML/node_modules props, `shouldExtractLiteralValuesFromEnum`) — i.e. this mode is available but is the one path that needs explicit, non-default config (https://storybook.js.org/docs/api/main-config/main-config-typescript). Ticket 04 should try the `react-docgen` default first and only add `reactDocgenTypescriptOptions` if the CVA variant/size unions don't render cleanly in the generated docs.

## Recommended setup plan

### Install command

```bash
pnpm dlx storybook@latest init
```
(Storybook's CLI auto-detects Next.js + Vite-ability and should select `@storybook/nextjs-vite`; confirm the choice interactively rather than accepting defaults blindly, since the CLI's Next-16 detection is new territory per the GitHub discussion above.) Then add the doc-only addons explicitly:

```bash
pnpm dlx storybook@latest add @storybook/addon-docs
pnpm dlx storybook@latest add @storybook/addon-a11y
pnpm dlx storybook@latest add @storybook/addon-themes
```

Packages that should end up in `devDependencies`, all pinned to the same `^10.x` line: `storybook`, `@storybook/nextjs-vite`, `@storybook/addon-docs`, `@storybook/addon-a11y`, `@storybook/addon-themes`.

### `.storybook/main.ts` (skeleton)

```ts
import type { StorybookConfig } from '@storybook/nextjs-vite'

const config: StorybookConfig = {
  framework: '@storybook/nextjs-vite',
  stories: ['../components/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
  ],
  // typescript: { reactDocgen: 'react-docgen' } // default; switch to
  // 'react-docgen-typescript' + reactDocgenTypescriptOptions only if CVA
  // variant/size prop unions don't render correctly in autodocs.
  // No viteFinal/alias config expected — @/* resolves from tsconfig.json paths.
}

export default config
```

### `.storybook/preview.ts` (skeleton)

```ts
import type { Preview } from '@storybook/nextjs-vite'
import { withThemeByClassName } from '@storybook/addon-themes'
import '../app/globals.css' // pulls in @tailwindcss/postcss pipeline, tw-animate-css, shadcn tokens, :root/.dark vars

const preview: Preview = {
  tags: ['autodocs'], // project-wide autodocs
  decorators: [
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
    }),
  ],
  parameters: {
    a11y: { test: 'todo' }, // or 'error' once the a11y baseline is clean
  },
}

export default preview
```

### Addon list to install

- `@storybook/addon-docs` (autodocs/props tables — not bundled in core as of v9/v10)
- `@storybook/addon-a11y` (accessibility panel — not bundled)
- `@storybook/addon-themes` (light/dark switching via `withThemeByClassName`, matching this repo's `.dark`-class + `next-themes` convention — not bundled)
- Controls, actions, viewport, backgrounds, toolbars/globals are already in Storybook core as of v9/v10 — no separate install.

Ticket 04 should verify: (a) that `@tailwindcss/postcss` is picked up automatically by the Vite builder without extra `viteFinal` wiring, since this was inferred rather than found stated verbatim in Storybook's Tailwind recipe; (b) whether `react-docgen`'s default output is good enough for the CVA-variant components, falling back to `react-docgen-typescript` only if needed.
