# Pine One app: What's new: Agents and Guide

## What It Does
The feature introduction for Agents and Guide on Overview: each one's mark, a line, and a carousel of real use cases, with a button to try it. Shown once; this link replays it. It deep-links into the Pine One mobile app's live web build at `/?whatsnew=1`.

## Architecture
```
/mobile (Expo Router) ──expo export -p web──► Vercel "pine-one-app" ──► https://pine-one-app.vercel.app/?whatsnew=1
                                                                ▲
playground /prototypes/pine-one-app-whats-new ──iframe (PhoneFrame)─────────────┘
```

## Frontend
- Full screen on phones, a 390×844 frame from `sm` up, with an Open full screen link.
- Source: src/components/whats-new.tsx, visuals in src/components/feature-visuals/.

## Key Dependencies
- `@/components/embeds/phone-frame`
- `metadata.json → external.url`

## Component Tree
```
page.tsx
└── PhoneFrame (iframe)
```

## Error Handling
- If the deployment is down, the frame shows the browser's error page.

## File Structure
```
pine-one-app-whats-new/
├── page.tsx
├── metadata.json
└── HOW_IT_WORKS.md
```

## Updating
Changes are made in `/mobile` (branch `mobile-app`). Redeploy `pine-one-app` (see `pine-one-mobile/HOW_IT_WORKS.md`), then run `npm run thumbnails -- pine-one-app-whats-new`.
