# Paint texture maker

## What It Does
Sets how the oil paint looks in every brush-stroke banner, after the owner's paint references (thick glossy paint with ridges, a raised lip where the brush lands, lighter streaks where it thins, and a dry end that breaks into specks with canvas showing through). Copy the texture into `lib/paint-texture.ts`; every brush banner follows.

## Architecture
```
controls (useControls) ──► toTexture() (sanitizeTexture) ──┬─► SampleStroke ×2 ──► paintStroke()  (components/hero-banner/brush-draw.ts)
                                                           ├─► HeroBanner texture={…} ──► HeroCanvas ──► drawBrush(…, texture)
                                                           └─► SnippetCard ──Copy──► lib/paint-texture.ts (PAINT_TEXTURE, the default for every banner)
```

## Frontend
- Two large sample strokes on the banner background: a wide straight drag and a curved sweep that lands on the right. Sample colour: ink, lime or Pine green.
- The home banner below, painted with the same texture.
- Controls: colour streaks, lighter where thin, wet gloss, groove depth, raised lip, runs dry early, paint specks, canvas flecks. Persisted per browser; Randomize and Reset from the shared panel.
- `paintStroke` layers each stroke: cast shadow → opaque body with a round blob where the brush lands → streaks of denser/thinner paint (lighter towards the end) → grooves and glints of white gloss on the half facing the light → lip and lit/shaded rims → dry end (bristle streaks lifting off one by one and breaking up), paint specks, and bare-canvas flecks in the banner's own background colour.
- Paint colours are opaque `color-mix` mixes into the banner background; light and shadow are white/black at low opacity (lighting, not palette).

## Key Dependencies
- `@/components/hero-banner` (`brush-draw.ts`, `texture.ts`, `HeroBanner`), `@/lib/paint-texture`, `@/lib/heroes`
- `@/components/controls`

## Component Tree
```
page.tsx
└── TextureMaker
    └── ControlsLayout
        ├── ControlPanel
        ├── SampleStroke (straight) + SampleStroke (sweep)
        ├── HeroBanner (home pattern, live texture)
        └── SnippetCard
```

## Error Handling
- Stored or pasted values go through `sanitizeTexture` (clamped 0–1, missing keys from the default).
- Browsers whose canvas can't parse `color-mix` get plain colours at low opacity.

## File Structure
```
paint-texture-maker/
├── page.tsx
├── texture-maker.tsx
├── sample-strokes.tsx
├── snippet-card.tsx
├── data.ts
├── metadata.json
└── HOW_IT_WORKS.md
```
