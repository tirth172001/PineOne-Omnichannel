Type: grilling
Status: resolved

## Question

What are the standing conventions every story in this repo should follow, so ~60+ stories get written consistently rather than each one reinventing structure?

Resolve:

- **File location**: co-located `Component.stories.tsx` next to each source file (e.g. `components/ui/button.stories.tsx`), or a mirrored `stories/` tree? (Co-location is the common modern default and matches this repo not having a separate `tests/`-style split elsewhere — lean that way unless there's a reason not to.)
- **Sidebar taxonomy**: does Storybook's sidebar mirror the folder structure (`UI/Button`, `Shared/StatusPill`, `Brand/LogoMark`) or an atomic-design-style grouping (Atoms/Molecules/...)? Folder-mirroring is simpler and matches how the codebase already thinks about these components — lean that way unless there's a reason not to.
- **Docs depth**: rely on autodocs (TS prop types + JSDoc comments on props, if any exist) for the props table, or hand-write `argTypes` descriptions per component? Given ~60+ components, autodocs-first (only hand-annotate where TS types don't already say enough, e.g. a `variant: string` that's really a closed union rendered from a `cva()` config) is the pragmatic default.
- **Variant coverage**: for components with multiple meaningful states (e.g. `Button`'s variant × size, `Badge`'s variant, light/dark theme), are these separate named stories (`Primary`, `Destructive`, ...) or one story with Storybook Controls exposing the props live? Recommend: one primary story with full Controls (satisfies "figure out how it works" via live prop manipulation) plus a small number of named stories only for states that are hard to discover via controls alone (e.g. a loading/empty/error state).
- **Compound/composed components** (e.g. `Dialog`, `Sheet`, `Select`, `Tabs`, `Table` — built from multiple exported sub-parts): does each get one story showing a realistic composed example, or a story per sub-part? Recommend: one story per top-level composite showing a realistic usage, not one per sub-part — sub-parts aren't meaningfully used in isolation.
- **`components/shared/*` composites** (e.g. `SummaryCardGroup`, `TransactionStyleTable`, `ListingPageHeader`) often expect richer/domain-shaped props (rows, filters, etc.) — how much mock data lives alongside the story vs. reusing existing `lib/*-data.ts` fixtures? Recommend: prefer small inline mock data scoped to the story file over importing production `lib/*-data.ts` fixtures, to keep stories decoupled from feature data that may change.

Output: a written convention (short doc or a template story file) that every story-writing ticket from here on follows without re-litigating.

## Answer

All six sub-questions confirmed as recommended, 2026-08-19:

1. **File location**: co-located — `components/ui/button.tsx` + `components/ui/button.stories.tsx` side by side (same for `shared/` and `brand/`). No separate `stories/` tree.
2. **Sidebar taxonomy**: mirrors the folder structure exactly — `title: "UI/Button"`, `"Shared/StatusPill"`, `"Brand/LogoMark"`. No atomic-design tiers.
3. **Docs depth**: autodocs-first (`tags: ['autodocs']`, relying on `react-docgen`/`react-docgen-typescript` per [ticket 1](01-storybook-setup-approach.md)). Hand-write an `argTypes` description only when a prop's meaning genuinely isn't clear from its TS type/name alone.
4. **Variant coverage**: one primary story named `Default`, all props exposed via Controls. Named stories are added only for states Controls can't reach (e.g. a loading skeleton, an error state) — not for every variant/size combination.
5. **Compound components**: one story per top-level composite (e.g. `Dialog`, not `DialogTrigger`/`DialogContent` separately), showing one realistic assembled usage.
6. **`shared/*` composites with domain-shaped props**: small mock data inline in the story file, never importing production `lib/*-data.ts` fixtures.

**Reference template** (for a simple `cva()`-variant component like `Button`; ticket 4 should verify this compiles once Storybook is actually installed):

```tsx
// components/ui/button.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Button } from "./button"

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
    size: "default",
  },
}

// Only add named stories beyond `Default` for states Controls can't reach.
```

For a `components/shared/*` composite expecting domain-shaped props, the same shape applies but `args` carries small inline mock data (e.g. a 3-row mock array) instead of a single primitive prop set.
