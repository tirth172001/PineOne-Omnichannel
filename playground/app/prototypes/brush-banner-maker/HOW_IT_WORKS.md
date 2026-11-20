# Brush banner maker

## What It Does
Paints the banners at the top of the playground's pages with short impressionist brush strokes, in the manner of Monet's water and garden paintings: strokes follow a gentle flow, each made of thin bristle lines with dry, ragged ends, over a faint paper grain, in the playground's muted palette with patches of one or two accent colours. Copy the pattern into `lib/heroes.ts` and that page's banner is painted instead of pixelated.

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
- **Flow:** `water` (horizontal ripples, reflection bands, round lily-pad dabs), `meadow` (grass leaning up and right, denser lower down), `swirl` (circling the focus), `breeze` (a wandering current).
- **Strokes:** length, width, density and wobble (how far a stroke bends away from the flow).
- **Texture:** bristles per stroke (each bristle has its own opacity, thickness and length, so ends look dry), paper grain, and 1–3 layers (soft underpainting, main strokes, small highlights).
- **Colour:** muted ink in two neutrals (`--foreground`, `--muted-foreground`), accents in `--hero-lime` / `--hero-pine` (or both) gathered in patches near the focus by low-frequency noise, never scattered.
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
