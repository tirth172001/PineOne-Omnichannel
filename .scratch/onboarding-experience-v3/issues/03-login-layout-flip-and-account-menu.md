Type: prototype
Status: resolved

## Question

In `app/login/page.tsx`:

1. **Flip the split.** The `grid-cols-2` at line ~107-108 currently renders `<AuthVisualPanel />` first (left) and the credentials form second (right). Swap the order so the visual panel renders right and the form renders left — matching the split direction used everywhere else in onboarding (`OnboardingRailShell`'s input-left/preview-right convention).
2. **Add a three-dot account menu.** Immediately after the existing language switcher `DropdownMenu` (~line 133-144) in the top bar, add a `DotsThreeIcon` dropdown menu (matching the icon convention already used in `components/account/account-page-content.tsx` and elsewhere in this codebase). For now its only item is "Log out" — reuse the existing `SignOutIcon` + "Logout" copy convention from `components/account/account-route-content.tsx`, wired to clear the session (`lib/dummy-auth.ts`) and redirect appropriately. Structure the menu so more items can be appended later without rework, but don't build placeholders for items that haven't been specified — see the map's "Not yet specified" for what's still open about this menu's future scope.

The top bar's existing elements (logo, dark/light theme switcher, language switcher) stay as-is; only the three-dot menu is new.

## Answer

Both changes landed in `app/login/page.tsx`:

1. **Layout flip.** Reordered the grid's two children — the credentials `<section>` now renders first (left), `<AuthVisualPanel />` second (right). No change to either component's internals, just JSX order within the same `grid-cols-2`.
2. **Account menu.** Added a second `DropdownMenu` right after the language switcher's, sharing its icon-button sizing (`h-8 w-8`, same hover/focus treatment as the theme toggle) with a `DotsThreeIcon` trigger (`aria-label="Account menu"`). Its content reuses the language menu's exact popover styling (`w-44 rounded-[10px] border border-border bg-popover p-1 shadow-md`) for visual consistency, with a single `DropdownMenuItem`: `SignOutIcon` + "Logout" (matching `account-route-content.tsx`'s convention exactly), wired to `clearDummyAuthSession()` (`lib/dummy-auth.ts`) then `router.replace("/login")`. No separator or additional items — kept to what's specified; the `DropdownMenu`/`DropdownMenuContent`/`DropdownMenuItem` structure appends future items by adding siblings, no rework needed.

Verified live in the browser: form renders left, green `AuthVisualPanel` renders right; the three-dot menu opens showing "Logout" with the sign-out icon; clicking it clears the session and stays on `/login` without error. `npx tsc --noEmit` clean. Recorded in `docs/decisions/decision-log.md` entry 83.
