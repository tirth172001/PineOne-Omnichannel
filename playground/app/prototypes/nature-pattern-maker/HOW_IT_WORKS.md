# Nature pattern maker

## What It Does
Paints full-coverage page banners from nature, after the owner's references: Van Gogh-style impasto swirls, overlapping ginkgo leaves, plant cells under a microscope, soft silk, flowers and dry-brush etching. Colours are a soft natural palette built from one base colour. Copy the pattern into `lib/heroes.ts`; it becomes that page's banner.

## Architecture
```
controls (useControls) ──► toNature() (sanitizeNature) ──► HeroBanner ──► HeroCanvas ──► drawNature()
                                   │                                                       │
                                   │                         naturePalette(colour, harmony, dark?)  (nature.ts)
                                   │                         paintSwirl / Ginkgo / Cells / Silk / Bloom / Etching (nature-draw.ts)
                                   ├──► PaletteRow (the six tones + accents; curated base colours)
                                   └──► SnippetCard ──Copy──► lib/heroes.ts
```

## Frontend
- **Everything is brush strokes.** Each pattern is a field: for any point, the tone to paint, the brush direction, and which shape it belongs to (strokes stop at a shape's edge, so leaves, petals and cells stay crisp). `paintField` covers the banner in three layers of impasto dabs (broad underpainting, main strokes, small highlights); each dab is tapered, carries a streak of a neighbouring tone, a lit ridge and a shaded edge.
  - `swirl`: strokes follow several vortices, lighter towards bright cores where cream accents gather.
  - `ginkgo`: rows of fan leaves; strokes radiate from each stem (the veins), the rim is painted along the edge, the middle notch in deep tone.
  - `cells`: rows of cells; strokes run along the thick row walls and thin cell walls, softly across the pale insides, and round each chloroplast (crowding the walls).
  - `silk`: long strokes along the folds; light and deep bands from a soft noise across them; sheen accents on the ridges.
  - `bloom`: overlapping flowers; strokes radiate along each petal, deeper between petals, a dotted centre; some flowers in the accent.
  - `etching`: dark and pale bands that wrap round vortices (contours of a stream function), brushed along the bands; inverted in dark mode.
- **Colour:** the base colour's hue with its chroma capped low (soft, natural); six tones dark to light, deeper in dark mode. Accents: `mono`, `cream` (warm highlights) or `blush` (cream + soft pink). Curated bases: sage, moss, leaf, sky, slate, lilac, clay, bark.
- **Size, density, texture, focus, seed.** Behind the title, `natureGlow` fades the painting with one smooth elliptical radial gradient in the banner's own colour (palest tone in light mode, deepest in dark): nearly solid behind the words, easing out with a smoothstep to nothing well past the text, so the pattern fades gradually into the title and shows fully elsewhere.
- Preview at column width and phone width (from `sm`); controls persist per browser; Randomize and Reset from the shared panel.

## Key Dependencies
- `@/components/hero-banner` (`nature.ts`, `nature-draw.ts`, `HeroBanner`, `HeroCanvas`)
- `@/components/controls`, `next-themes`

## Component Tree
```
page.tsx
└── NatureMaker
    └── ControlsLayout
        ├── ControlPanel
        ├── HeroBanner (column width)
        ├── PaletteRow
        ├── HeroBanner (343px, sm+)
        └── SnippetCard
```

## Error Handling
- Stored or pasted values go through `sanitizeNature`; an invalid colour falls back to sage.
- Palette swatches render after mount (they depend on the theme).

## File Structure
```
nature-pattern-maker/
├── page.tsx
├── nature-maker.tsx
├── palette-row.tsx
├── snippet-card.tsx
├── data.ts
├── metadata.json
└── HOW_IT_WORKS.md
```
