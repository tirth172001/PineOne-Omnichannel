# Brush banner maker

## What It Does
Paints the banners at the top of the playground's pages with long impressionist brush strokes (in the manner of Monet) that trace plant micro-structures as seen under a microscope: leaf veins, cell walls, stomata, xylem vessels, palisade cells, fungal threads and a sunflower spiral. Each stroke is a bundle of bristle lines that runs dry along its length, over a faint paper grain, in the playground's muted palette with clusters of lime / Pine green on the structure's highlights. Every page uses one (since Nov 20); copy a new one into `lib/heroes.ts`.

## Architecture
```
controls (useControls, localStorage) ──► toBrush() (sanitizeBrush) ──► HeroBanner ──► HeroCanvas
                                               │                                         │
                                               │                     isBrush(p)? drawBrush : drawPixels
                                               │                                         │
                                               ▼                 brushStrokes() (pure, components/hero-banner/brush.ts)
                                         SnippetCard ──Copy──► lib/heroes.ts (HOME_HERO / FOLDER_HEROES[...])
```

## Frontend
- **Plant structure** (each a scalar field whose lines the strokes follow; `along()` in `brush.ts` measures distance to a line with the field's slope, so lines keep their width, and gives the direction along it):
  - `veins`: large warped Voronoi walls (major veins) over a fine mesh (minor veins);
  - `cells`: Voronoi cell walls with a chloroplast dab in each cell;
  - `stomata`: wavy (jigsaw) cell walls with oval pores in some cells;
  - `xylem`: vertical vessel walls with diagonal spiral-thickening bands;
  - `palisade`: outlines of staggered tall rounded cells;
  - `mycelium`: noise-contour threads with finer branches;
  - `spiral`: golden-angle seeds and logarithmic spiral arms around the focus.
- **Strokes:** start on the structure and follow it in 14 steps, stopping when they leave it, so long strokes trace walls and veins. Structure size, stroke length (up to 200px), width, density and how far strokes wander off the structure.
- **Texture:** bristles per stroke; each bristle has its own opacity, thickness and length, curves smoothly, and fades over its second half as the paint runs dry. Paper grain; 1–3 layers (soft underpainting following the structure's direction, the structure, small highlights).
- **Colour:** muted ink in two neutrals (`--foreground`, `--muted-foreground`). Accents in `--hero-lime` / `--hero-pine` (or both) only on the structure's highlights (pores, chloroplasts, stretches of major veins…) and only where a low-frequency patch allows, so they cluster instead of scattering.
- **Legibility:** the same blurred erase mask as pixel banners fades strokes behind the title.
- Deterministic: a seeded generator, so the same settings always paint the same banner. Redraws on resize and theme change.
- **Load … current banner** pulls the page's live brush pattern from `lib/heroes.ts` into the controls (every page uses brush strokes since Nov 20).
- Preview at the page column width and at phone width (from `sm`); controls persist per browser; Randomize and Reset from the shared panel.

## Key Dependencies
- `@/components/hero-banner` (`brush.ts`, `brush-draw.ts`, `HeroBanner`, `HeroCanvas`)
- `@/components/controls`

## Component Tree
```
page.tsx
└── BrushMaker
    └── ControlsLayout
        ├── ControlPanel
        ├── HeroBanner (column width)
        ├── HeroBanner (343px, sm+)
        └── SnippetCard
```

## Error Handling
- Stored or pasted values go through `sanitizeBrush` (unknown values fall back to defaults, numbers clamped).
- Clipboard failures leave the snippet selectable.

## File Structure
```
brush-banner-maker/
├── page.tsx
├── brush-maker.tsx
├── snippet-card.tsx
├── data.ts
├── metadata.json
└── HOW_IT_WORKS.md
```
