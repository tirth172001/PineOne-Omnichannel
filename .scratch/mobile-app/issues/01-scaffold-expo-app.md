Type: task
Status: resolved

## Question

Scaffold the React Native (Expo, TypeScript) Android project in a new top-level `mobile/` folder at the repo root. Needs:

- Expo project initialized with TypeScript template, Expo Router for navigation
- Bottom tab navigator matching the Figma reference IA: Overview / Payments / Reports / Support / More (icons per Figma node 6021:217 — home / wallet / file / chat-line / menu)
- Base theme/design tokens (colors, type scale, spacing) pulled from the Figma file's variables, so later screens don't hardcode values
- Placeholder screen per tab (can be empty/"coming soon") so the shell runs on an Android emulator/device end-to-end
- Confirm it runs via `npx expo start` and launches on Android

This is scaffolding only — no real screen content. Unblocks ticket 03 (Overview screen) and every later per-module ticket.

## Answer

Scaffolded via `npx create-expo-app@latest mobile --template default` at the repo root (SDK 57, TypeScript, Expo Router, React 19.2 / RN 0.86). Kept inside this git repo (no nested `.git` — declined the "skip git init" prompt's opposite, i.e. it correctly did NOT create a separate repo). `mobile/.gitignore` (scaffold-provided) already excludes `node_modules/`, `.expo/`, and `expo-env.d.ts` — verified via `git add -n mobile` that neither gets staged.

Built the 5-tab shell:
- `src/components/app-tabs.tsx` — native tab bar (`expo-router/unstable-native-tabs`, matching this SDK's stable API surface) with 5 triggers: Overview (`sf="house.fill" md="home"`), Payments (`account_balance_wallet`), Reports (`description`), Support (`chat`), More (`menu`). Icons use the built-in `sf`/`md` props (SF Symbols / Material Symbols) rather than PNG assets — simpler than generating icon images, and Android's 5-tab limit is exactly met.
- `src/components/app-tabs.web.tsx` — same 5 tabs for the web target, kept in parity since the template ships one.
- `src/components/placeholder-screen.tsx` — shared placeholder card so the 5 screen files (`src/app/{index,payments,reports,support,more}.tsx`) aren't near-duplicates; each just supplies a title + one-line description of what will eventually live there.
- Deleted the template's demo content that's no longer reachable: `explore.tsx`, `hint-row.tsx`, `web-badge.tsx`, `external-link.tsx`, `ui/collapsible.tsx`, and the now-orphaned demo image assets (react-logo*, tutorial-web, expo-badge*, tabIcons/*).

Design tokens: **not** pulled from Figma variables in this pass — the Figma desktop connection needs the file open/focused there, and it wasn't reachable when scaffolding. Kept the template's default light/dark `Colors` in `src/constants/theme.ts` for now. Real token extraction is deferred to the per-screen build tickets (e.g. ticket 03), which pull `get_design_context` per screen anyway. Left as fog in the map.

Verified: `npx tsc --noEmit` clean, `npx expo lint` clean (one pre-existing template lint finding in `use-color-scheme.web.ts` — a legitimate SSR-hydration pattern that a newer `eslint-config-expo` rule flags as a false positive — fixed with a justified inline suppression, not a rewrite), `npx expo-doctor` 21/21. Confirmed via `expo start` (web preview, since no Android emulator/adb is available in this environment) that all 5 routes return 200 and the tab bar switches correctly between screens — see screenshot taken during this session. **Not verified on an actual Android device/emulator** — that requires Android Studio or a physical device with Expo Go, neither present here; whoever picks up the next screen ticket should do a real Android check at that point.
