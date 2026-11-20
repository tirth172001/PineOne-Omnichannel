# Hero banner maker

## What It Does
A tool for the banners at the top of the playground's pages (home, folders, docs). Tune a dithered pixel background (the Pine seal, rings, waves, grain or a slope) with muted ink and a few lime / seal-red accent sprinkles, see it behind the page title at desktop and phone width, then copy the pattern into `lib/heroes.ts`.

## Architecture
```
controls (useControls, localStorage) ──► toPattern() ──► HeroBanner ──► HeroCanvas
                                              │                          │
                                              │            renderCells() (pure, components/hero-banner/pattern.ts)
                                              │                          │
                                              ▼                 canvas: ink = --foreground tint,
                                        SnippetCard ──Copy──►   accents = --hero-lime / --hero-seal
                                   paste into lib/heroes.ts ──► home, folder and doc pages
```

## Frontend
- **Preview as** picks the page (title and where the snippet goes). **Load … current banner** pulls that page's pattern from `lib/heroes.ts` into the controls, so you start from what's live.
- Pattern: shape, dither (Bayer 8×8 ordered, hash noise, or halftone dots), pixel size, shape size, density, accent share and colour (lime, seal or both), focus (where the shape sits and accents gather), how clear the area behind the title stays, seed.
- The clear area follows the title's real box (measured), so long titles that wrap stay readable.
- Controls persist per browser (`playground:hero-banner-maker:controls`). Randomize and Reset come from the shared panel.
- Mobile: the panel is a bottom sheet; the phone-width preview shows from `sm` up only (on a phone the main preview already is phone width).
- Colours come from tokens read off the canvas (`--foreground`, `--hero-lime`, `--hero-seal`), and the canvas redraws on theme change and resize.

## Key Dependencies
- `@/components/hero-banner` (`HeroBanner`, `HeroCanvas`, `pattern.ts`, the seal path in `pine-logo.ts`)
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
