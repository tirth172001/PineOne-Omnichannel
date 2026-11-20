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
- **Pattern:**
  - `swirl`: three layers of short impasto dabs (tapered, a streak of a neighbouring tone, a lit ridge and a shaded edge) following a field of vortices; one vortex at the focus, some with bright cores.
  - `ginkgo`: rows of fan leaves opening upwards, each row overlapping the stems of the row above; radial gradient, fine veins, the middle notch, a soft shadow.
  - `cells`: rows of cells with thick, slightly blurred walls between rows, thin slanted walls between cells, a pale wash, and chloroplasts crowding the walls (some sharp with a rim and glint, some soft and out of focus).
  - `silk`: soft bands built from layered translucent strokes (no canvas filters, so it works in every browser), fine ripples and a few sheen lines.
  - `bloom`: overlapping flowers, two rings of petals with a gradient and veins, a dotted centre.
  - `etching`: dry-brush marks along a vortex field, denser where a noise field is darker, over a woven texture.
- **Colour:** the base colour's hue with its chroma capped low (soft, natural); six tones dark to light, deeper in dark mode. Accents: `mono`, `cream` (warm highlights) or `blush` (cream + soft pink). Curated bases: sage, moss, leaf, sky, slate, lilac, clay, bark.
- **Size, density, texture, focus, seed;** the title area fades to the card background (shared with the other banner kinds).
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
