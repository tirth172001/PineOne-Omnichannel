# Prototype Playground: rules for agents

This folder (`playground/`) is a personal prototype playground: one Next.js app holding many small, self-contained prototypes. The owner asks for new prototypes from a coding agent, often from a phone. Read this whole file before you change anything. The rules are non-negotiable unless the owner explicitly says otherwise for a specific task.

All commands below run from `playground/`, not the repo root. The repo root is a different app (Pine One Omni web), and `mobile/` is the Expo app.

## How the app works

| Piece | Where |
|---|---|
| Home: folders + one search across all of them | `app/page.tsx`, `components/library/` (pure logic in `search.ts`) |
| Folders (the list, order and names) | `lib/folders.ts` (mirror the ids in `scripts/registry.mjs`), pages at `app/folders/[folder]/` |
| Research docs | `docs/*.md` (Markdown + front matter), read by `lib/docs.ts`, listed with search + tags by `components/library/docs-browser.tsx`, shown at `app/docs/[slug]/` with contents and cross-reference hover cards (`lib/references.ts`). Guide and index: `docs/README.md` |
| Page hero banners | `components/hero-banner/` (`HeroBanner`: dithered pixel background on a canvas, title centred; pure generator in `pattern.ts`). Each page's pattern lives in `lib/heroes.ts`; design new ones in the **Hero banner maker** prototype and paste the copied object there. Owner feedback (Nov 20): patterns span the whole banner (never a single icon in a corner), calm and sparse, from nature (leaf microscopy, osmosis, flows) or the Pine Labs mark used as echoes/imprint (no Pine One seal, no leaf icons); one accent colour (`--hero-lime` or `--hero-pine`) on the pattern's highlight plus a soft gradient, never confetti; text sits on a faded, plain area. |
| Page width | `lib/page-width.ts`: one column for home, folders and docs (the doc page's rail + article width); banners span it exactly. |
| Inner-page header | `components/page-header.tsx`: back + breadcrumbs in the content column; once scrolled, only a floating Back pill stays. Pass `width` to match the page's column. |
| Prototypes | `app/prototypes/<slug>/` (one folder each) |
| Collaborator guide (humans) | `README.md` |
| Unknown-slug 404 | `app/prototypes/[slug]/page.tsx` |
| Public route | `app/p/[slug]/page.tsx`: only `"public": true` prototypes, everything else 404 |
| Password gate (production only) | `proxy.ts` (Next 16's name for middleware), `app/login/`, `app/api/auth/route.ts`, env `PLAYGROUND_PASSWORD` |
| Registry | `scripts/registry.mjs` writes `lib/prototype-registry.generated.ts` (gitignored) from every `metadata.json`. It runs automatically before `dev`, `build`, `lint` and `typecheck`, and in watch mode during `npm run dev`. Read it through `lib/prototypes.ts`. Never edit the generated file. |
| Control panels | `components/controls/` (schema → panel, persistence, Reset, Randomize) |
| Embeds of separately deployed apps | `components/embeds/` (`PhoneFrame`, `ExternalApp`) |
| Storage helpers | `lib/storage.ts` |
| Thumbnails / OG capture | `scripts/capture.mjs` → `public/thumbnails/`, `public/og/` |

This is **Next.js 16** with React 19, Tailwind v4 and shadcn/ui (radix-nova, every component installed in `components/ui/`). APIs differ from older versions: `params`/`searchParams` are Promises, middleware is `proxy.ts`, and there are global `PageProps<"/route">` / `LayoutProps` types. When unsure, read `node_modules/next/dist/docs/` first.

## Research first

Before making a design or product judgement (what merchants need, which steps to keep, naming, what to show first), check `docs/` for research that covers it. Read `docs/README.md` → "For agents", scan its Index, read what's relevant and cite it. If research contradicts the request, say so; if nothing covers it, say that rather than inventing findings. This applies to work on the web portal and mobile app too, not just prototypes.

## Creating a new prototype (start to pull request)

1. **Branch.** `git switch -c proto/<slug>` from `main`. Never work on `main`.
2. **Folder.** Create `app/prototypes/<slug>/` (kebab-case; it becomes the URL). Lay it out as described under "Self-contained and decomposed" below.
3. **Required files:** `page.tsx`, `metadata.json`, `HOW_IT_WORKS.md` (details below). The registry script fails loudly if any is missing or the metadata is invalid.
4. **Build it** following "Rules for every prototype".
5. **Check it** at 375px and at desktop width, in light and dark (screenshots via Playwright are fine).
6. **Thumbnails.** `npm run thumbnails -- <slug>`, then open both PNGs and look at them.
7. **Verify.** `npm run check` (lint + typecheck + production build). All must pass.
8. **Ship.** Commit, push, `gh pr create`. Then find the preview URL (`gh pr checks` / `gh pr view --comments`, where the Vercel bot posts it) and end your reply with the link to `/prototypes/<slug>` on the preview, so the owner can open it from their phone.

Do **not** build a "new prototype" button, a create API, or any in-app authoring. Prototypes are only ever created by an agent, this way.

`page.tsx` is a default export that takes **no props**. It is rendered both at `/prototypes/<slug>` and, if public, at `/p/<slug>`. Put `"use client"` in a child component, not necessarily in the page.

## Bringing in an existing project

When someone asks to add a project they already built (a repo, a folder, a zip or a deployed URL), pick the **first** path that fits. Tell the owner which path you chose and why.

**A. Link or embed the deployment (default; any stack).** Use this when the project is already deployed and is a full app: multi-page, its own backend, a different framework (Vue, Svelte, Flutter web, Expo…), or bigger than a prototype.
1. Check that it can be framed: `curl -sI <url> | grep -iE "x-frame-options|frame-ancestors"`. Any `DENY`/`SAMEORIGIN`/restrictive `frame-ancestors` means it can't be framed, so use `"embed": "none"`.
2. Create `app/prototypes/<slug>/` with `metadata.json` that includes `"external": { "url": "<url>", "embed": "phone" | "none" }`. Use `phone` for mobile-first apps (renders `PhoneFrame`) and `none` for desktop apps (renders `ExternalApp`, a page with an Open button). Copy `pine-one-mobile/` or `pine-one-web/`.
3. Write `HOW_IT_WORKS.md`: where the source lives, where it's deployed, and who owns it.
4. Capture thumbnails. With `none`, the script screenshots the external URL directly.
5. **One app, several flows?** Give each distinct flow its own prototype with a deep link (`<app>-<flow>` slugs, shared tag), as with `osmosis-*`. Confirm each route really renders on its own first. Some routes just redirect (Osmosis `/pine-ai` → `/`).
6. **Mock sign-in in the way?** Add `external.note` (one line telling people how to get in) and `external.seedLocalStorage` (the keys the app's mock auth reads) so thumbnails show the real screen. Read the app's auth code to find the key. Never seed real credentials or tokens.

The source stays where it is, so updates to their deployment show up automatically.

**B. Port it in (small React projects).** Use this when it's a single-screen or few-screen React/Next.js prototype with no server it can't live without, and the owner wants it to *live* in the playground.
1. Get the source into a scratch directory outside the repo (`git clone <repo> /tmp/import-<slug>`, or unzip there). Treat it as input. Don't run its install scripts or build tools from inside the playground.
2. Create `app/prototypes/<slug>/` and move the code in, restructured to the rules: thin `page.tsx`, `types.ts`, `data.ts`, pure logic files, one file per component.
3. Swap its UI for `components/ui` + tokens: remove hardcoded colours, its own CSS frameworks and global styles. Install any runtime dependencies it really needs **in `playground/`** with exact versions from its lockfile.
4. Several pages → nested routes under `app/prototypes/<slug>/<page>/`, or in-component state if they're steps of one flow. Its API routes → `app/api/<slug>/…`. Its env vars → tell the owner which ones to add in Vercel. Never commit their values.
5. Make it pass everything in "Rules for every prototype" (mobile, light/dark, storage, controls), then capture thumbnails and run `npm run check`.
6. In `HOW_IT_WORKS.md`, note where it came from (repo URL and commit).

**C. Static build (non-React, no server).** Use this for a plain HTML/JS, Vite, or exported static site with no deployment.
1. Build it with its base path set to `/embeds/<slug>/` (Vite: `base`; others: their equivalent), so asset URLs resolve.
2. Copy the build output to `public/embeds/<slug>/`. It stays behind the password gate.
3. Create the prototype folder with a `page.tsx` that renders it in an `<iframe src="/embeds/<slug>/index.html">` filling the page (or `PhoneFrame` for mobile layouts).
4. Note in `HOW_IT_WORKS.md` how to rebuild it, since the build is a snapshot.

Whichever path: all the normal rules apply. That means metadata (`createdAt` = today, not the original project's date), private by default, thumbnails, `npm run check`, and a PR with the preview link.

## Making a version or experiment

A variant is a **new prototype** that points at the one it varies. Never edit the original to try an idea; the point is to compare them.

**Variant of a playground prototype**
1. `git switch -c exp/<slug>-<idea>`.
2. Copy the folder: `cp -R app/prototypes/<slug> app/prototypes/<slug>-<idea>`. Name it after the idea (`-swipe`, `-one-step`, `-v2` only if there's no better word).
3. In the copy's `metadata.json`:
   - `"variantOf": "<slug>"`;
   - the same `surface` and `group`;
   - a title that says what's different;
   - fresh `createdAt` and `updatedAt`.
   The registry fails if `variantOf` doesn't match an existing slug.
4. Rename the storage namespace (`data.ts` / `useControls("<new-slug>", …)`) so the two don't share saved settings.
5. Change only what the idea needs. Put the hypothesis (what's different and why) at the top of its `HOW_IT_WORKS.md`.
6. Thumbnails, `npm run check`, PR, preview link. The card shows "Variant of <original>".

**Variant of the web portal or mobile app.** Build it in that project, following "Make a version or experiment" in the repo root `AGENTS.md`:
- Web: a parallel route.
- Mobile: a switch in `mobile/src/constants/experiments.ts`.

Deploy a **preview**, then add an `external` entry here with `variantOf` set to the entry it varies (e.g. `pine-one-mobile`, `pine-one-web-kyc`) and `url` set to the preview URL.

**Deciding:** when the owner picks a winner, either merge it into the original (bump `updatedAt`, recapture thumbnails) or keep the variant. Don't delete the loser unless asked. The gallery shows everything (there is no hidden state, Nov 20); `"hidden": true` is only a record that it lost. Say so in its title or description if it would confuse people.

## Rules for every prototype

### Metadata
Every prototype has `metadata.json`:
```json
{
  "title": "My Prototype",
  "description": "What it does",
  "tags": ["tag1"],
  "folder": "pine-one",
  "createdAt": "YYYY-MM-DD",
  "updatedAt": "ISO timestamp",
  "hidden": false,
  "public": false
}
```
- **`folder` (required)** puts the card in a home-page folder: `design-system`, `pine-one` (web), `pine-one-app`, `pine-omni` (Osmosis web), `pine-omni-app`, `agents` (AI agents, web or app), `onboarding`. The home page shows only folders; people open one to see its prototypes. A new folder needs an entry in `lib/folders.ts` and in `FOLDERS` in `scripts/registry.mjs`.
- `"surface": "web" | "mobile"` and `"group": "<name>"` are labels (shown on the prototype page); folders list their cards in one grid, newest first, with no sub-headings. Titles shouldn't repeat the folder or surface ("Payments", not "Osmosis web: Payments").
- Optional `"variantOf": "<slug>"` marks a version or experiment of another prototype (see "Making a version or experiment").
- Tags are search-only (there are no filter chips). Add one only when it's a word people would search for that isn't already in the title or description.
- Bump `updatedAt` (full ISO timestamp) on **every** edit, so the gallery stays sorted and thumbnail caches refresh.
- Optional `"external": { "url": "...", "embed": "phone" | "none" }` is for prototypes that are separately deployed apps (see `pine-one-mobile`, `pine-one-web`). With `"embed": "none"` the card opens the URL in a new tab directly (↗ icon), so put anything people need to know (e.g. how to sign in) in the description; the thumbnail script captures the external URL directly. `phone` entries open their playground page with the app in a phone frame.

### Privacy
- Every prototype is **private by default** (`"public": false`).
- Set `"public": true` only when the owner explicitly asks for **that specific** prototype to be public. Never as a side effect.
- When a prototype becomes public, **always** create its og:image and og:video: `npm run thumbnails -- <slug>` does both for public prototypes and writes `public/og/<slug>.png` plus `.mp4` (or `.webm` if ffmpeg isn't installed; mp4 previews in more places). Check the image and video, then commit them. `/p/<slug>` wires them into the metadata automatically.
- Unknown or private slugs on `/p/` must 404, never redirect to login. Don't change that.

### Documentation
Every prototype has `HOW_IT_WORKS.md`, kept current on every change, with these sections:
- **What It Does**: 1–2 sentences
- **Architecture**: ASCII data-flow diagram
- **Frontend / API**: bullets on state, shortcuts, responsive behaviour, request/response
- **AI Usage** (if any model is called): model ID, why that model, how it's called, key parameters, system prompt summary, user prompt shape
- **Key Dependencies**, **Component Tree**, **Error Handling**, **File Structure**

### Self-contained and decomposed
- A prototype lives entirely in its own folder and never imports from another prototype. Shared things go in `components/`, `hooks/` or `lib/`, and only if they're genuinely generic.
- Never write one giant file. Keep `page.tsx` thin (~60 lines max) and split out:
  - `types.ts`: shared types
  - `data.ts`: mock data, constants, config, control schemas
  - pure logic files (`search.ts`, `utils.ts`, `simulation.ts`): no React, testable alone
  - one file per meaningful UI component, named descriptively

### Design system
- Always use the shared components in `components/ui/` and the design tokens: `bg-background`, `text-foreground`, `bg-card`, `bg-muted`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`, `border-border`, `ring-ring`, `text-destructive`, etc.
- Never hardcode colours: no `bg-black`, `text-white`, hex values or inline colour styles in UI. The only exception is user data such as a colour picked in a control panel and drawn on a canvas.
- **Read the component source in `components/ui/` before using a prop.** This shadcn style (radix-nova) differs from the public docs. For example, `Button` sizes are `default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg`, and `default` is only 32px tall, so add `className="h-11"` for touch targets.

### Clean and minimal by default
- Start with a single centred column: `mx-auto w-full max-w-2xl px-4`. No sidebars, split panels or tab-heavy layouts unless asked.
- Build only what was asked for. No extra dashboards, charts, stats or views.
- Fewer elements is better; every element must justify itself. Use plain `Badge variant="outline"` over colourful ones. No decorative icons.
- Write minimal interface copy. Cut captions that restate labels and hints nobody needs.

### Control panels
- Anything with tunable parameters (speed, colour, size, count…) gets a control panel, not scattered inputs.
- Use `components/controls`:
  ```tsx
  // data.ts
  export const controlsSchema = defineControls({
    speed: { type: "slider", label: "Speed", min: 0.1, max: 3, step: 0.1, default: 1 },
    mode:  { type: "select", label: "Mode", options: ["a", "b"], default: "a" },
    color: { type: "color", label: "Colour", default: "#7c9cff" },
    glow:  { type: "toggle", label: "Glow", default: true },
  });
  // component
  const controls = useControls("<slug>", controlsSchema);   // persisted, typed values
  <ControlsLayout panel={<ControlPanel controls={controls} />}>{subject}</ControlsLayout>
  ```
  Randomize and Reset come for free and must stay. `ControlsLayout` puts the panel in a side column from `lg` and a bottom sheet below that. Never let a panel cover the subject on desktop.
- Need a control type that doesn't exist? Add it to `components/controls/schema.ts` and `control-panel.tsx`, including its `randomValues` and `sanitize` cases.

### Mobile first
- Everything must work at ~375px wide. Check it.
- Tap targets are at least 44×44px (`h-11`, `size-11`).
- Icon-only buttons on mobile, with labels from `sm:` up (`<span className="hidden sm:inline">`). Icon-only buttons need an `aria-label`.
- No hover-only interactions. Every hover state needs a visible touch equivalent (`active:` or a tap).
- Code blocks wrap (`whitespace-pre-wrap break-words`). No horizontal scrolling anywhere.
- Modals and lightboxes need visible prev/next buttons or swipe on mobile, not just keyboard shortcuts.
- Respect safe areas for fixed bottom UI: `bottom-[max(1rem,env(safe-area-inset-bottom))]`.

### Light and dark mode
- Design dark-first (dark is the default theme); light must also work, which it will if you only use tokens.
- Never hardcode a `dark` class on a page or element. The theme is global (`next-themes`, toggle in the header).
- Use `useTheme().resolvedTheme` only when **behaviour** must change by theme (canvas/WebGL drawing, blend modes, chart libraries), not for colours that tokens can handle. For canvases, prefer a transparent canvas with the `bg-background` class, and fade trails with `globalCompositeOperation = "destination-out"` instead of painting a hardcoded background colour.

### Motion
- Rows or sections the user adds or removes animate their height open and closed. Nothing pops in and makes the page jump (use `grid-rows-[0fr]→[1fr]` transitions, the shadcn `Collapsible`/`Accordion`, or a measured height).
- Use smooth deceleration curves (`ease-out`, `cubic-bezier(0.32,0.72,0,1)`), never bouncy overshoot. Keep it short: 150–300ms for UI.
- Respect `prefers-reduced-motion`: Tailwind `motion-safe:`/`motion-reduce:` variants, or `useReducedMotion()` from `@/hooks/use-reduced-motion` for JS animation.
- Verify animations actually run: check computed `transition`/`animation` mid-flight with Playwright. Animation utility classes silently do nothing if their CSS isn't loaded (`tw-animate-css` is imported in `app/globals.css`; keep it).

### AI-backed prototypes
- Call models server-side from a route handler in `app/api/<slug>/…/route.ts`. Never expose keys to the client, and never use the `NEXT_PUBLIC_` prefix for secrets.
- API routes are behind the password gate in production automatically (401 without the cookie).
- If a model generates UI or layout, put explicit layout constraints in the system prompt (max columns, no wide tables, mobile width). Defensive CSS is a backup, not the fix.
- Parse JSON from model output defensively: extract the first `{…}` block, `JSON.parse` in try/catch, and validate the shape.
- Always wrap route handlers in try/catch and return proper status codes (400 bad input, 401/403 auth, 502 upstream model failure, 500 otherwise) with a short `{ error }` message.
- Document it all in the **AI Usage** section of `HOW_IT_WORKS.md`.

### Storage
- Use `lib/storage.ts` (`readStored`, `writeStored`, `clearStored`). It wraps every `localStorage` call in try/catch and namespaces keys as `playground:<namespace>:<name>`. Use the prototype slug as the namespace.
- Load on mount (in an effect), never during render or server render, so hydration matches.
- Validate what you load (see `sanitize` in `components/controls/schema.ts`). Old data must never crash a prototype.

### Thumbnails
- Gallery cards show **static** light and dark PNGs swapped with CSS. Never put a live iframe or a running prototype in a card; it crashes mobile browsers as the gallery grows.
- A new prototype, or any visual change → `npm run thumbnails -- <slug>` in the **same commit**.
- A global style change (globals.css, `components/ui`, layouts) → `npm run thumbnails` to regenerate all of them.
- Other modes: `npm run thumbnails -- a b` (several), `-- --missing` (only those without thumbnails), `-- --skip-build` (reuse the current build), `-- --og <slug>` (force OG capture).
- **Open and look at the captured images before committing.** A stale or broken thumbnail is worse than none. A missing thumbnail just shows a "No preview yet" tile; it never breaks the build.

## Workflow rules

- Work on a branch, push, and open a pull request when done. The PR triggers the build check and a preview deployment.
- End every task by posting the preview link (to the prototype itself, not just the site root) so the owner can open it straight from their phone.
- Before finishing, run `npm run check` (lint, type-check, production build). Don't hand over red checks; if something can't pass, say so plainly.
- Install new dependencies **in `playground/`** (`npm i <pkg>`), never at the repo root.
- When something goes wrong and gets fixed, add the lesson to **Lessons learned** below in the same PR. This file should grow over time.

## Suggested libraries (add when a prototype needs them)

| Need | Use |
|---|---|
| 3D / WebGL | three.js, React Three Fiber |
| Physics | Rapier, Matter.js |
| Charts | Recharts (shadcn `chart` is installed), or plain SVG for sparklines |
| Maps | MapLibre GL |
| Text layout / typography effects | `@chenglou/pretext` |
| Audio / synths | Web Audio API, Tone.js |
| AI | Anthropic SDK (or the provider's SDK), server-side only |
| Generated UI from JSON | json-render or similar |
| Browser automation | Playwright (already installed: thumbnails, visual checks, demo videos) |
| Native app wrapper | Capacitor, if a prototype graduates to the App Store |

## Environment

- `PLAYGROUND_PASSWORD`: required in production. Without it nobody can sign in (the login API returns 500 explaining why). Locally (`npm run dev`) the gate is off.
- Hosting: a Vercel project with **Root Directory = `playground`**. Preview deployments per PR come from the Git integration.

## Lessons learned

- **shadcn CLI import bug (Nov 2026).** `shadcn add` rewrote `@/lib/utils` imports to `"cn"`, installed an unrelated npm package called `cn`, and turned `lib/utils.ts` into a self re-export. After adding components, run `grep -rn 'from "cn"' components` and make sure `lib/utils.ts` defines `cn` with `clsx` + `tailwind-merge`.
- **Font variable loop.** shadcn wrote `--font-sans: var(--font-sans)` in `globals.css`, so the site fell back to a serif font. It must point at the loaded font's variable, now `--font-allo` (Allo, self-hosted in `app/fonts/allo/`, since Nov 20; Geist Mono stays for code). If text looks serif in a screenshot, check this first.
- **Cache Components is off** (`next.config.ts`). With it on, `dynamicParams` is rejected and `generateStaticParams` can't return `[]`. Don't turn it on casually.
- **Turbopack root is pinned** to `playground/` because the repo has other lockfiles. Don't remove `turbopack.root`.
- **Desktop apps need a wide capture.** External desktop apps are captured at 1440px; at 1280px the Pine One web app cropped its right edge.
- **External apps with a client-side mock login** redirect every deep link to their login screen in a fresh browser, so thumbnails all looked the same. `external.seedLocalStorage` fixes the captures, and `external.note` tells people to sign in once.
- **Phone-frame iframes get their own storage.** Browsers partition third-party storage, so an app embedded with `"embed": "phone"` doesn't see a sign-in made in its own tab. People sign in once inside the frame. The thumbnail script seeds `seedLocalStorage` inside the iframe too.
- **Separate web portals from mobile apps with `folder`, `surface` and `group`**, not title prefixes or `web`/`mobile` tags. (Nov 20: the All / Web / Mobile switch and tag chips were replaced by folders.)
- **Theme-dependent attributes wait for mount.** The theme toggle's `aria-label` read the saved theme during render, so light-mode visitors got a hydration warning ("1 Issue" in dev). Anything derived from `useTheme()` (labels included, not just icons) renders only after mount.
- **New CSS variables need a dev restart.** Tokens added to `globals.css` (e.g. `--folder-*`) came through empty until `next dev` was restarted with a clean `.next`.
- **OG URLs must be absolute.** Next resolves `og:image` against `metadataBase` but not `og:video`, so the video URL is built with `SITE_URL` in `app/p/[slug]/page.tsx`.
