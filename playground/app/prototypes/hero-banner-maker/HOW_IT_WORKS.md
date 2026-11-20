# Hero banner maker

## What It Does
A tool for the banners at the top of the playground's pages (home, folders, docs). Every banner is a pattern spanning the whole card, never a single icon: the Pine Labs mark as rippling **echo** lines or **imprinted** in a field of plant cells; leaf microscopy (**stomata**, **veins**, **palisade** cells, **cells**); nature flows (**osmosis**, **flow**, sunlight **rays**, a sunflower **spiral**, **topo**, **drift**). Muted ink, one accent colour (Pine lime, or Pine green from the Pine Labs logo) on the pattern's highlight, and a soft gradient of that colour around the focus. See it behind the page title at desktop and phone width, then copy the pattern into `lib/heroes.ts`.

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
- Pattern: shape, dither (Bayer 8×8, hash noise, or halftone; only area patterns like rays are dithered, line patterns are drawn whole), pixel style (rounded, square, dot, diamond, plus, ring, dash, needle, mark), pixel size, pattern size (the repeat: cell, line spacing, mark size), density, accent (how much of the highlight shows), accent colour, accent gradient, focus (the gradient’s bright point; also the mark’s position, the spiral centre, the rays’ source, the membrane height), how clear the text area stays, seed.
- The Pine Labs mark is an exact polygon (`pine-logo.ts`, signed distance), so echoes and the imprint stay crisp at any size.
- Text stays legible: the canvas erases pixels behind the title through a blurred mask (a gradient to the plain card colour), following the title's measured box as it wraps.
- Controls persist per browser (`playground:hero-banner-maker:controls`). Randomize and Reset come from the shared panel.
- Mobile: the panel is a bottom sheet; the phone-width preview shows from `sm` up only (on a phone the main preview already is phone width).
- Colours come from tokens read off the canvas (`--foreground`, `--hero-lime`, `--hero-pine`), and the canvas redraws on theme change and resize.

## Key Dependencies
- `@/components/hero-banner` (`HeroBanner`, `HeroCanvas`, `pattern.ts`, the Pine Labs polygon and distance function in `pine-logo.ts`)
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
