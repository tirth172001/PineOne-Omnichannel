# Card preview maker

## What It Does
Sets how every gallery card shows its prototype, so all cards share one composition: desktop apps in a centred frame and mobile apps in a phone frame, both inset from the top and bleeding off the bottom, with the same thin bezel and equally rounded top corners (no browser chrome or address bar), on a plain muted background. Cards always show the light screenshot, in both themes. Copy the style into `lib/preview.ts`; every card follows without recapturing.

## Architecture
```
scripts/capture.mjs ──► public/thumbnails/<slug>-light.png        (app screen only:
                                                                    desktop 1440×900 @0.5, mobile 390×844)
lib/preview.ts PREVIEW_STYLE ─┐
                             ├─► PreviewComposition (components/preview) ─► gallery Thumbnail
                              │
controls (useControls) ───────┴─► PreviewMaker (this page) ─► SnippetCard ─Copy─► lib/preview.ts
```

## Frontend
- The page (server) lists prototypes with screenshots: slug, title, folder, kind (`previewKind`: mobile for phone embeds or `surface: "mobile"`).
- Panel: which prototype to preview, then inset, desktop frame width, phone width and position, shadow. Persisted per browser; Randomize and Reset from the shared panel.
- Subject: the selected prototype large, then a desktop card and a mobile card exactly as the gallery shows them, then the snippet.
- Compositions are sized in % and container units (`cqw`), so they scale with the card. Screenshots are static light-theme images, never live apps.

## Key Dependencies
- `@/components/preview/preview-composition`, `@/lib/preview`, 
- `@/components/controls`

## Component Tree
```
page.tsx (server: samples)
└── PreviewMaker
    ├── ControlsLayout
    │   ├── select + ControlPanel
    │   ├── PreviewComposition (large)
    │   ├── SampleCard × 2 (desktop, mobile)
    │   └── SnippetCard
```

## Error Handling
- No screenshots at all: a one-line message pointing at `npm run thumbnails`.
- Stored controls are sanitised by the shared schema; clipboard failures leave the code selectable.

## File Structure
```
card-preview-maker/
├── page.tsx
├── preview-maker.tsx
├── sample-card.tsx
├── snippet-card.tsx
├── data.ts
├── metadata.json
└── HOW_IT_WORKS.md
```
