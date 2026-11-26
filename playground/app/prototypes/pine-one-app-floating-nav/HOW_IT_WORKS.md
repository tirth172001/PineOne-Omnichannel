# Pine One app: Floating bottom bar

## What It Does
A floating bottom bar after the Osmosis app, with Guide on its own always-lit orb beside it: Home, Agents, the swappable third slot (MPR) and More, which grows the bar in place to UPI and Support. GD Electronics has Guide and Agents. It opens the Pine One mobile app's live web build on GD Electronics (`?merchant=gd-electronics`).

Bar: Guide and Agents: Home, Agents, MPR (swappable), More (UPI, Support) + Guide orb.

## Architecture
```
/mobile (Expo Router) ──expo export -p web──► Vercel "pine-one-app" ──► https://pine-one-app.vercel.app/?merchant=gd-electronics
                                                                ▲
playground /prototypes/pine-one-app-floating-nav ──iframe (PhoneFrame)─────────────┘
```

## Frontend
- Full screen on phones, a 390×844 frame from `sm` up, with an Open full screen link.
- The rule: options are Home, Agents (if the merchant has it), MPR, UPI and Support. The bar holds 5 items, or 4 beside the Guide orb, More included; More appears only when the options don't fit. 16 from the sides and bottom, 12 to the orb, a white fade behind.
- Source: `floatingLayout()` in src/components/app-tabs.tsx; `FloatingNavigationBar` and `GuideOrb` in src/components/material3/navigation-bar.tsx; merchants in src/data/businesses.ts (`floatingNav`). Figma: PineOne - Omni-channel → New nav system → "Floating nav · merchant trial".

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
pine-one-app-floating-nav/
├── page.tsx
├── metadata.json
└── HOW_IT_WORKS.md
```

## Updating
Changes are made in `/mobile` (branch `mobile-app`). Redeploy `pine-one-app` (see `pine-one-mobile/HOW_IT_WORKS.md`), then run `npm run thumbnails -- pine-one-app-floating-nav`.
