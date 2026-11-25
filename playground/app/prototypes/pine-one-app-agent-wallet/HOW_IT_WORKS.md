# Pine One app: Agent credits wallet

## What It Does
The credits agents run on: balance as a wallet card, Add credits packs, and a history of what each agent used and the credits added. Sample pricing (1 credit = ₹1). It deep-links into the Pine One mobile app's live web build at `/agents/wallet`.

## Architecture
```
/mobile (Expo Router) ──expo export -p web──► Vercel "pine-one-app" ──► https://pine-one-app.vercel.app/agents/wallet
                                                                ▲
playground /prototypes/pine-one-app-agent-wallet ──iframe (PhoneFrame)─────────────┘
```

## Frontend
- Full screen on phones, a 390×844 frame from `sm` up, with an Open full screen link.
- Source: src/app/agents/wallet.tsx, src/components/agents/wallet.tsx, data in src/data/wallet.ts.

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
pine-one-app-agent-wallet/
├── page.tsx
├── metadata.json
└── HOW_IT_WORKS.md
```

## Updating
Changes are made in `/mobile` (branch `mobile-app`). Redeploy `pine-one-app` (see `pine-one-mobile/HOW_IT_WORKS.md`), then run `npm run thumbnails -- pine-one-app-agent-wallet`.
