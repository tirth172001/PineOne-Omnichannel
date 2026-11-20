# Hero banner maker

## What It Does
A tool for the banners at the top of the playground's pages (home, folders, docs). Tune a dithered pixel background (the Pine Labs outlined mark in a pixel cloud, topographic contours, dashed orbits, a seven-petal bloom, drifting streaks, or the older rings, waves, grain and slope) in muted ink, with one accent colour (Pine lime, or Pine green from the Pine Labs logo) tracing short runs of the shape's edge and a soft gradient of that colour around the focus, see it behind the page title at desktop and phone width, then copy the pattern into `lib/heroes.ts`.

## Architecture
```
controls (useControls, localStorage) ──► toPattern() ──► HeroBanner ──► HeroCanvas
                                              │                          │
                                              │            renderCells() (pure, components/hero-banner/pattern.ts)
                                              │                          │
                                              ▼                 canvas: ink = --foreground tint,
                                        SnippetCard ──Copy──►   accents = --hero-lime / --hero-pine
                                   paste into lib/heroes.ts ──► home, folder and doc pages
```

## Frontend
- **Preview as** picks the page (title and where the snippet goes). **Load … current banner** pulls that page's pattern from `lib/heroes.ts` into the controls, so you start from what's live.
- Pattern: shape, dither (Bayer 8×8 ordered, hash noise, or halftone), pixel style (rounded, square, dot, diamond, plus, ring, dash, needle, and mark: a tiny Pine Labs corner; ink pixels shrink slightly where the tone is light; line pixels read best from size 8), pixel size, shape size, density, accent on edge (how much of the logo outline, or a contour of other shapes, is traced; low-frequency noise picks which stretches, so accents come in runs, never confetti) its colour, accent gradient (how far muted pixels blend toward the accent near the focus), position, how clear the area behind the title stays, seed.
- Line patterns (logo outline, topo, orbits, bloom, drift) are drawn whole; area patterns are dithered.
- The clear area follows the title's real box (measured), so long titles that wrap stay readable.
- Controls persist per browser (`playground:hero-banner-maker:controls`). Randomize and Reset come from the shared panel.
- Mobile: the panel is a bottom sheet; the phone-width preview shows from `sm` up only (on a phone the main preview already is phone width).
- Colours come from tokens read off the canvas (`--foreground`, `--hero-lime`, `--hero-pine`), and the canvas redraws on theme change and resize.

## Key Dependencies
- `@/components/hero-banner` (`HeroBanner`, `HeroCanvas`, `pattern.ts`, the Pine Labs outline path in `pine-logo.ts`)
- `@/lib/heroes` (each page's pattern)
- `@/components/controls`

## Component Tree
```
page.tsx
└── HeroMaker
    ├── ControlsLayout
    │   ├── ControlPanel + Load current banner
    │   ├── HeroBanner (column width)
    │   ├── HeroBanner (343px, sm+)
    │   └── SnippetCard
```

## Error Handling
- Stored or pasted values go through `sanitizePattern` (unknown values fall back to defaults, numbers clamped).
- Clipboard failures are ignored; the snippet is `select-all` so it can be copied by hand.
- If the canvas can't get a 2D context, the banner shows just its muted background and title.

## File Structure
```
hero-banner-maker/
├── page.tsx
├── hero-maker.tsx
├── snippet-card.tsx
├── data.ts          # controls schema, pages, snippet formatting
├── metadata.json
└── HOW_IT_WORKS.md
```
