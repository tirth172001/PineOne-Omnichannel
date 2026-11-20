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
  - `cells`: Voronoi cell walls with a chloroplast dab in each cell;
  - `rings`: wobbly concentric growth rings around the focus;
  - `fronds`: wavy stems with leaflets angled off both sides;
  - `pollen`: round grains painted round and round;
  - `grana`: stacks of short discs linked by thin lamellae;
  - `xylem`: vertical vessel walls with diagonal spiral-thickening bands;
  - `mycelium`: noise-contour threads with finer branches;
  - `spiral`: golden-angle seeds and logarithmic spiral arms around the focus.
- **Strokes:** start on the structure and follow it in 14 steps, stopping when they leave it, so long strokes trace walls and veins. Structure size, stroke length (up to 200px), width, density and how far strokes wander off the structure.
- **Texture (impasto + dry brush):** each stroke is an opaque lump of paint, round where the brush lands, with raked bristle ridges, a lit edge and a shaded edge (light from the top left) and a soft cast shadow (**Relief** sets how raised it looks). After 50–70% of its length the brush runs dry: bristle-wide lines lift off one by one (feathered end) and break up more and more, like paint catching on paper grain (after the flat-brush behaviour in bizar.ro/experiments/brushes). Paper grain underneath; 1–3 layers.
- **Colour:** muted ink in two neutrals (`--foreground`, `--muted-foreground`). Accents in `--hero-lime` / `--hero-pine` (or both) only on the structure's highlights (pores, chloroplasts, stretches of major veins…) and only where a low-frequency patch allows, so they cluster instead of scattering.
- **Legibility:** the same blurred erase mask as pixel banners fades strokes behind the title.
- Deterministic: a seeded generator, so the same settings always paint the same banner. Redraws on resize and theme change.
- **Load … current banner** pulls the page's live brush pattern from `lib/heroes.ts` into the controls (the saved brush designs, `BRUSH_*`; pages now show nature patterns, see the Nature pattern maker).
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
