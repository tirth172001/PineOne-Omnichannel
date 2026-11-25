# Pine One app: Agents

## What It Does
Pine AI agents in the app: My agents with what's waiting on you, Discover agents with the agent of the week, each agent's page, and the credits balance top right. It deep-links into the Pine One mobile app's live web build at `/agents`.

## Architecture
```
/mobile (Expo Router) ──expo export -p web──► Vercel "pine-one-app" ──► https://pine-one-app.vercel.app/agents
                                                                ▲
playground /prototypes/pine-one-app-agents ──iframe (PhoneFrame)─────────────┘
```

## Frontend
- Full screen on phones, a 390×844 frame from `sm` up, with an Open full screen link.
- Source: src/app/agents/index.tsx and [agentId].tsx, components in src/components/agents/, data in src/data/agents.ts.

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
pine-one-app-agents/
├── page.tsx
├── metadata.json
└── HOW_IT_WORKS.md
```

## Updating
Changes are made in `/mobile` (branch `mobile-app`). Redeploy `pine-one-app` (see `pine-one-mobile/HOW_IT_WORKS.md`), then run `npm run thumbnails -- pine-one-app-agents`.
