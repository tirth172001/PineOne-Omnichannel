Type: prototype
Status: resolved
Blocked by: 01

## Question

Build the first real screen in the new RN app: the Overview/Home tab, using the Figma reference as the starting point (node 6021:217, file https://www.figma.com/design/yho7fEuaRxxJXCkR1dIRHY/PineOne---Omni-channel).

Note from charting: node 6021:217's bottom nav highlights the **Payments** tab, not Overview — double-check in Figma whether this is genuinely the Overview screen (mislabeled by the user) or whether it's the Payments screen and a separate Overview frame exists. Pull the correct node via `get_design_context` before building, per the `figma-design-to-code` skill.

This is the concrete artifact to react to for visual/interaction fidelity before the same pattern is repeated across every other module.

## Answer

Confirmed via `get_design_context` that node 6021:217 is the **Payments/Settlements** screen (Transactions/Settlements/Refunds tab bar, "Payments" highlighted in bottom nav) — reassigned as the reference for ticket 04, not this one. Checked the Figma file's page list (`get_metadata` with no nodeId) for a dedicated mobile Overview frame; the "Overview - phase 2" page only has web-scale (1000–4000px) sections, no compact Android frame yet.

Per direction from the user, built Overview from scratch instead of blocking on a missing Figma frame — using 6021:217 for **visual language** (rounded-2xl card style, header layout, spacing, real theme colors converted from the web app's OKLCH tokens) and porting **real content** from `components/home/business-health-card.tsx` and `components/home/attention-strip.tsx` rather than inventing copy or numbers.

New shared components (reusable by tickets 04–08, not Overview-only):
- `src/components/app-header.tsx` — business switcher + notifications + avatar row
- `src/components/search-bar.tsx` — search entry point in the header (per ticket 02: no dedicated Search tab)
- `src/components/stat-card.tsx` — rounded stat card (label/amount/trend/link), matches the Figma card language
- `src/components/attention-banner.tsx` — dismissible banner, ported from `attention-strip.tsx`'s real copy

Theme: extended `src/constants/theme.ts` with `card`, `border`, `primary`, `success`, `destructive`, `warning` — converted from the web app's actual OKLCH values in `app/globals.css` (not invented), so PineOne's real brand palette (a dark green primary, not the blue seen in one Figma info-chip) carries over. This resolves part of the "design token extraction" fog noted in ticket 01 — colors are now real; type scale/spacing are still the template defaults.

Explicitly **not** ported in this pass (scope-trimmed, not forgotten): the Highcharts-based mini charts on each business-health card (no charting library decision made yet — new fog item), and the Figma reference's exact store-logo/avatar images (used simple initial-circle placeholders instead of pulling the ~7-day-expiring Figma asset URLs, since committing real brand imagery wasn't the point of this pass).

Verified: `tsc`/`expo lint`/`expo-doctor` all clean. Confirmed via web-preview screenshot (dark mode, matching system preference) that the header, search bar, dismissible banner, and all three stat cards render with correct data, colors, and trend directions. Not verified on an Android device/emulator (none available in this environment).

## Revision (user feedback: light theme didn't match the reference)

Root cause: this environment's browser reports `prefers-color-scheme: dark` (verified via `window.matchMedia`), and `app.json` had `userInterfaceStyle: "automatic"` — so the app was correctly following system dark mode, but every screenshot I'd taken (and my own QA) was in dark, while the Figma reference is a light-mode design. Not a theme-value bug, but I only ever visually verified one mode and it was the wrong one for comparison.

Fixed:
- `app.json`: `userInterfaceStyle` → `"light"` (was `"automatic"`) — locks native builds to light mode until dark mode is an explicit, designed decision, not an accidental side effect of `automatic`. Dark mode support is now a fog item (see map), not silently half-supported.
- Re-derived **all** color tokens in `theme.ts` from the exact OKLCH math in `app/globals.css` (previously only primary/success/destructive/warning/border were converted; text/background/backgroundElement/card were still template placeholders). `background` and `card` are both pure white in light mode by design (confirmed from the source CSS) — cards were relying on a hairline border for separation that doesn't exist in the reference.
- Added `CardShadow` (shared shadow constant) to `theme.ts` and applied it to `StatCard`/`AttentionBanner` in place of the hairline border — matches the reference's borderless, shadow-separated card pattern.
- `app-header.tsx`: avatar was a circle (`borderRadius: 24`); Figma uses a rounded square (8px radius) for both the store icon and avatar. Fixed to match.
- `app-tabs.tsx`: bottom-tab active-icon pill was a generic gray (`backgroundElement`); Figma uses a fixed lime accent (`rgb(217,249,157)` / `#d9f99d`) regardless of theme. Hardcoded to the real value instead of deriving it from theme colors.

Not re-verified on-device (still no Android emulator/adb here) — confirmed the avatar-shape fix via a zoomed screenshot; the light-mode color fix can only be confirmed on the user's own phone (`userInterfaceStyle` is a native-only config, ignored by the web preview, which will keep following the browser's OS setting regardless).

## Revision 2 (user feedback: no bottom tab bar, no header on their phone)

Root cause, found by checking Expo docs directly: `expo-router/unstable-native-tabs` (used in `app-tabs.tsx` since ticket 01) renders through a native module that **Expo Go does not bundle** — it's new/"unstable" and requires a custom dev client (`npx expo run:android` or an EAS dev build) per Expo's own Expo-Go-limitations guidance. On the user's real device via Expo Go, that whole native-tabs subtree — the tab bar *and* everything nested under it, including the Overview screen's header — silently failed to mount. My own testing never caught this because web preview uses a completely separate implementation (`app-tabs.web.tsx`) that never touches that native module.

Fixed by replacing `NativeTabs` with the same JS-only primitives (`expo-router/ui`'s `Tabs`/`TabList`/`TabTrigger`/`TabSlot`) already used on web — no native module, works identically in Expo Go, a dev client, or web. Deleted `app-tabs.web.tsx` since one implementation now covers both platforms. Rebuilt the tab bar UI from scratch to match the Figma nav bar: icon + label per tab, lime pill (`#d9f99d`) behind the active icon, bottom-anchored with safe-area padding.

Hit one bug while rewriting: `expo-router/ui`'s `Tabs` discovers screens by statically walking the JSX children passed to it at the `<Tabs>` call site — it can't see `TabTrigger` elements produced inside a separately-invoked component's own render (I'd first written the tab items' `.map()` inside a nested `BottomTabBar` component, which threw "Couldn't find any screens for the navigator"). Fixed by authoring the `TabTrigger` elements directly in `AppTabs`'s JSX and passing them through as `children`.

Verified via `tsc`/`expo lint`/`expo-doctor` (all clean) and confirmed via direct URL navigation in the web preview that tab switching, the active-icon pill, and route content all work correctly. **Still needs confirmation on the user's actual phone** — this exact class of bug (works on web, breaks on real Expo Go) is precisely what web-preview testing can't catch, so this needs a real device check before trusting it, not just my say-so.

## Revision 3 (user feedback: light mode still not applying, font should be Inter Display)

Two separate real bugs, not one:

1. **`userInterfaceStyle: "light"` (Revision 1's fix) does nothing under Expo Go.** That app.json setting only takes effect in a compiled native build (`expo prebuild`/`expo run:android`/EAS) — Expo Go is a generic pre-built shell that can't apply per-project native manifest config. Since the user previews via Expo Go (no dev-client tooling in this environment), the setting was silently a no-op. Fixed with the JS-runtime equivalent: `Appearance.setColorScheme('light')` in `_layout.tsx`, which actually works under Expo Go since it's pure JS. Hit a follow-on crash — `react-native-web` doesn't implement `setColorScheme` — guarded it and made `use-color-scheme.web.ts` unconditionally return `'light'` too, so both platforms are consistently locked to light until dark mode is a deliberate, designed decision (tracked as fog on the map).
2. **Font wasn't Inter at all.** The template's default `Fonts.sans` resolved to generic system fonts (`system-ui`/`normal`) — never actually wired to Inter. Installed `@expo-google-fonts/inter` (400/500/600/700), loaded via `useFonts` in `_layout.tsx`, and rewrote `ThemedText`'s styles to use explicit `fontFamily` per weight instead of numeric `fontWeight` (these are discrete static font files, not a variable font — `fontWeight` would just trigger synthetic bolding). Note: this is Google Fonts' standard "Inter" (text optical size), not literally "Inter Display" (Figma's exact family name) — that headline-optical-size cut isn't published as an npm/Google-Fonts package; pulling raw font files from elsewhere would need explicit sign-off first since it's a file download from an external source. Flagging this as a known, disclosed substitution rather than silently treating it as identical.

Verified via `tsc`/`expo lint`/`expo-doctor` (clean) and a zoomed screenshot showing correct light-mode colors (green trend/link text, white shadowed cards) and visibly Inter letterforms. This is the first revision in this thread confirmed against an actual rendered screenshot in the *correct* mode, not just code review — still recommend the user do a final on-device check since Expo Go has already surfaced two prior gaps that web-preview testing couldn't.

## Revision 4 (user feedback: bottom tabs should be responsive to device height)

`app-tabs.tsx`'s bottom bar was entirely fixed-pixel (56×32 icon pill, 11px label, fixed padding) regardless of screen size. Added `useTabBarMetrics()` — three size tiers keyed off `useWindowDimensions().height` (compact `<700`, regular `700–899`, large `≥900`), each with its own icon size, pill dimensions, label size, and padding, so a small phone (e.g. iPhone SE) gets a more compact bar and a tall phone/small tablet gets a more comfortable one, rather than one fixed size fighting every screen.

Verified via `tsc`/`expo lint`/`expo-doctor` (clean) and by querying the rendered DOM directly: at this environment's actual window height (1026px, "large" tier), all 5 icon pills measured exactly 64×36 with an 18px radius — matching the large-tier values precisely, confirming the mechanism is wired through correctly. Could not visually confirm the compact tier — the available browser-resize tooling here doesn't actually shrink the tab's viewport height (it appears fixed to the display's actual resolution regardless of the requested size) — but the breakpoint logic is a plain height comparison, same mechanism just a different threshold, so this is a reasonably safe generalization. Worth a real check across a couple of different physical device sizes if any are available.

## Revision 5 (user direction: adopt Material 3 as the component system, theme on top)

Architectural decision, recorded on the map's Notes: **react-native-paper (Material 3)** is now the component library for the whole app, not just this screen.

- `src/constants/paper-theme.ts`: generates a full MD3 tonal color scheme from PineOne's real brand primary (`#365314`, same seed as `theme.ts`) using `@material/material-color-utilities` — Google's own algorithm, producing all ~30 correctly-contrasted MD3 color roles rather than hand-picking them. Fonts wired per MD3 typescale role (15 roles) to one of the four Inter weights already loaded, matching Figma's real weight usage (Bold for display/headline, SemiBold for titles, Medium for body/labels, Regular for the smallest text).
- `_layout.tsx`: wrapped in `PaperProvider`, and react-navigation's own theme (`ThemeProvider`) now derives its colors from the same Paper theme instead of the unrelated default, so there's one source of truth, not two competing ones.
- Replaced hand-rolled components with Paper's real ones: `app-header.tsx` → `Appbar.Header` + `Avatar.Text`; `search-bar.tsx` → `Searchbar`; `attention-banner.tsx` → `Banner` (MD3's banner spec uses text actions — Dismiss + the CTA — rather than a corner close icon, which is a deliberate, correct deviation from the earlier design, not a miss); `stat-card.tsx` → `Card`/`Card.Actions`/`Button`; `placeholder-screen.tsx` → `Card`/`Text`.
- **Replaced the hand-rolled, height-responsive bottom tab bar with Paper's `BottomNavigation.Bar`.** This also meant dropping `expo-router/ui`'s `Tabs`/`TabList`/`TabTrigger` (no longer needed) in favor of driving navigation directly from expo-router's `usePathname()`/`router.navigate()`, since `BottomNavigation.Bar` is a controlled, presentation-only component. The custom responsive-height tiers from Revision 4 are gone — Material 3 owns tab bar sizing per its own spec now, which is the whole point of adopting it; a custom-height override would fight the system being adopted rather than use it.
- Deleted the old custom theme system entirely once nothing referenced it: `themed-text.tsx`, `themed-view.tsx`, `hooks/use-theme.ts`, `hooks/use-color-scheme.ts`/`.web.ts`, and trimmed `theme.ts` down to just `Fonts` (still needed by `paper-theme.ts`). One theme system now, not two.
- Fixed a latent bug surfaced while touching this: the bottom tab bar has always been a normal flex sibling (not an overlay), so the `BottomTabInset` bottom-padding added to every scrollable screen was pure dead space, never actually needed to avoid content being hidden behind the bar. Removed it from `index.tsx` and `placeholder-screen.tsx`.

Verified via `tsc`/`expo lint`/`expo-doctor` (all clean) and screenshots: Material 3 elevation/surface-tint is visibly present on cards (a subtle warm tint derived from the brand seed, correct MD3 behavior), the Banner renders with proper text actions, the Searchbar and Appbar look native-Material, and tab navigation + the active-tab indicator (now MD3's own `secondaryContainer` role, not a hardcoded color) all work correctly. Not yet verified on an actual Android device.

## Revision 6 (user reference: a dedicated app Figma file — flat grey/white, not shadow elevation)

User pointed to a different, more authoritative Figma file specifically for the mobile app (`📱 Pine one App`, not the Omni-channel file used until now) and asked for its background/card treatment: pulled `get_screenshot`/`get_design_context` on node 63:11572 and confirmed precisely — the page background is a plain neutral grey (`--base/accent, #f5f5f5`), cards are plain white (`--base/card, white`) with **no shadow at all**; separation is pure color contrast, not elevation. Header and bottom nav stay white against that grey body.

This is genuine, spec-correct Material 3 (elevation via `surfaceContainer` tonal roles is exactly this pattern) — my Revision 5 pass had left Paper's default `elevated` Card mode active, which layers a tonal-tint + shadow overlay on top of `surface`, producing the warm tint the user was implicitly moving away from here.

Fixed in `paper-theme.ts`: overrode the generated tonal `background` (which leans warm) with a plain neutral grey, and `surface` with pure white — both hardcoded rather than left to the generator, since Figma calls for flat neutral values here, not hue-derived ones. Set `elevation={0}` on every `Card` usage (`stat-card.tsx`, `placeholder-screen.tsx`) so Paper doesn't layer its tonal/shadow overlay on top. Explicitly set the bottom nav's background to `theme.colors.surface` too (white), since its default elevation tint would otherwise pick up a faint tonal cast. Screen containers (`index.tsx`, `placeholder-screen.tsx`) now explicitly paint `theme.colors.background` — Paper doesn't do this automatically for a plain `View`/`ScrollView`, so without it the grey wouldn't show at all.

Verified via `tsc`/`expo lint`/`expo-doctor` (clean) and a zoomed screenshot confirming flat white cards with no visible shadow against the grey body, matching the new reference closely. Not yet verified on an actual Android device.

## Revision 7 (user direction: match web's card layout exactly; use real Inter Display)

**Card layout**: rebuilt `stat-card.tsx` to match `components/home/business-health-card.tsx`'s actual structure precisely, not just its rough spirit — a bordered header block (border-bottom, uppercase muted label, its own padding) separate from a content block (number, trend/caption, then an inline text link at the bottom-left), rather than one undivided content region with the link in a separate `Card.Actions` footer bar as I'd built before. Verified via screenshot — divider line, spacing, and link placement now match the web card.

**Inter Display font**: confirmed there's still no npm package for it (checked `@fontsource/inter-display` and `@fontsource-variable/inter-display` — both 404). The only real source is the official `rsms/inter` GitHub release (v4.1, 32.1MB zip containing the whole type family). Asked the user for go-ahead before downloading an external file, per policy — waiting on that before wiring in the real Inter Display weights (currently still using standard Google-Fonts "Inter" as the disclosed substitute from Revision 3).
