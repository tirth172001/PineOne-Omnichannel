# Pine One app: Guide hands chargebacks to an agent

## What It Does
Guide offers the Chargeback Agent for your open chargebacks, with what it costs in credits and what you'll have left, then starts it. It deep-links into the Pine One mobile app's live web build at `/guide/chat?prompt=Help%20me%20handle%20my%20chargebacks`.

## Architecture
```
/mobile (Expo Router) ──expo export -p web──► Vercel "pine-one-app" ──► https://pine-one-app.vercel.app/guide/chat?prompt=Help%20me%20handle%20my%20chargebacks
                                                                ▲
playground /prototypes/pine-one-app-guide-agent-handoff ──iframe (PhoneFrame)─────────────┘
```

## Frontend
- Full screen on phones, a 390×844 frame from `sm` up, with an Open full screen link.
- Source: planReply in src/data/guide.ts (agent-credits card in src/components/guide/guide-cards.tsx).

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
pine-one-app-guide-agent-handoff/
├── page.tsx
├── metadata.json
└── HOW_IT_WORKS.md
```

## Updating
Changes are made in `/mobile` (branch `mobile-app`). Redeploy `pine-one-app` (see `pine-one-mobile/HOW_IT_WORKS.md`), then run `npm run thumbnails -- pine-one-app-guide-agent-handoff`.
