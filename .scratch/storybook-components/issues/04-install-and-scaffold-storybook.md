Type: task
Status: resolved
Blocked by: 01, 02

## Question

Install Storybook per the setup plan from [Storybook setup approach](01-storybook-setup-approach.md) and get it running with the authoring conventions from [Story authoring conventions](02-story-authoring-conventions.md) applied to a first smoke-test story (e.g. `components/ui/button.tsx`), proving the whole pipeline works end to end before writing the remaining ~60+ stories:

- Add the chosen Storybook packages/scripts (`pnpm dlx storybook@latest init` or manual setup per ticket 01's plan).
- Configure `.storybook/main.ts` / `.storybook/preview.ts` per ticket 01 (framework preset, Tailwind v4 CSS wired in, theme provider decorator, `@/*` alias resolution, addon set).
- Write one real story (`components/ui/button.stories.tsx`) following ticket 02's conventions exactly, and confirm in the browser: the story renders with correct Tailwind styling, Controls let you change props live, autodocs shows a props table, and light/dark theme both render correctly.
- Add the `storybook`/`build-storybook` scripts to `package.json`.

Output: a working local Storybook instance with one verified story, and the confirmed pattern every subsequent story-writing ticket follows.

## Answer

Installed and verified end to end, 2026-08-19:

- Added devDependencies: `storybook`, `@storybook/nextjs-vite`, `@storybook/addon-docs`, `@storybook/addon-a11y`, `@storybook/addon-themes` (all `10.5.9`), plus `react-docgen-typescript` (see deviation below). Used `pnpm add -D -w` directly rather than the interactive `storybook init` wizard — the repo's `pnpm-workspace.yaml` declares a single-package workspace (`packages: ["."]`) so `-w` was required, and manual install/config was more predictable than a wizard in a non-interactive shell, especially since ticket 1's research already produced exact config skeletons.
- Created `.storybook/main.ts` (framework `@storybook/nextjs-vite`, stories glob `../components/**/*.stories.@(ts|tsx)`, the three addons).
- Created `.storybook/preview.ts` (imports `../app/globals.css`, `withThemeByClassName({ light: '', dark: 'dark' })` decorator, `a11y: { test: 'todo' }`).
- Added `storybook`/`build-storybook` scripts to `package.json`, and a `pine-one-storybook` entry (port 6006) to `.claude/launch.json` alongside the existing dev-server entry.
- Wrote `components/ui/button.stories.tsx` exactly per [ticket 2](02-story-authoring-conventions.md)'s template — one `Default` story, full Controls, `tags: ['autodocs']`.

**Verified live in the browser** (`pnpm run storybook`, port 6006): sidebar shows `UI > Button` (folder-mirrored taxonomy confirmed working), the story renders with correct Tailwind styling, the light/dark toolbar toggle actually restyles the canvas (confirmed via computed styles — `<html>` gets the `dark` class, background switches to the real oklch dark-mode token), Controls panel lets you edit props live, and the autodocs Docs page auto-generates a props table for all 4 props (`children`, `variant`, `size`, `asChild`) with correct types. No console/server errors. `npx tsc --noEmit` stayed at the pre-existing baseline of 34 errors — none introduced by the new Storybook files.

**One deviation from ticket 1's plan, per its own documented fallback**: the default `react-docgen` docgen left `variant`/`size` showing as bare `string`/`unset default` in the props table instead of their real `cva()` union values. Switched `typescript.reactDocgen` to `'react-docgen-typescript'` in `main.ts` (with a `propFilter` excluding `node_modules`-inherited props) exactly as ticket 1 flagged as the fallback — confirmed this fixes the props table (now shows the full `"default" | "outline" | "secondary" | "ghost" | "destructive" | "link"` union, correctly). Needed adding `react-docgen-typescript` as an explicit devDependency since it was only present transitively (unhoisted by pnpm).

**Known minor gap, not fixed here**: even with the corrected props table, the `variant`/`size` **Controls** widgets still render as free-text/JSON boxes rather than select dropdowns — Storybook's control-type auto-inference doesn't pick "select" for these particular unions (likely because the extracted type also includes `null | undefined`). Docs are complete and accurate; only the live-editing convenience is affected. Future story-writing tickets can add an explicit `argTypes: { variant: { control: 'select' } }` per component if this friction matters enough — left as a per-component judgment call rather than a standing rule, consistent with ticket 2's "hand-annotate only when needed" convention.
