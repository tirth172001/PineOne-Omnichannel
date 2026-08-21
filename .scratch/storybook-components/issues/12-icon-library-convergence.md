Type: grilling
Status: resolved

## Question

Surfaced by a post-completion audit (2026-08-19) of what's still missing from the Storybook foundation: this codebase has three icon packages installed in `package.json` — `lucide-react` (used in 89 files, the dominant set), `@phosphor-icons/react` (used in 20 files), and `@hugeicons/react` + `@hugeicons/core-free-icons` (used in 0 files — a dead dependency). There's no documented rule for which set a new page should reach for, and no `components/foundations/icons.stories.tsx` the way colors/typography/spacing/radius/shadows already have one.

Resolve:

- Which icon library becomes canonical for new work: `lucide-react` (already dominant by call-site count) or `@phosphor-icons/react` (used in a meaningful minority — check whether those 20 files cluster around a particular reason, e.g. an icon shape only Phosphor has)?
- What happens to the 20 existing Phosphor call sites — migrate to the canonical set now (in-scope, execution-mode map — see Notes), or leave them and document Phosphor as a deliberately-tolerated second set for a specific reason?
- Remove the unused `@hugeicons/react` / `@hugeicons/core-free-icons` dependencies from `package.json` (0 call sites — pure dead weight) unless a reason to keep them surfaces.
- Once the canonical set (and any migration) is settled, add `components/foundations/icons.stories.tsx` to the foundations section documenting the canonical library, sizing/stroke conventions in use, and how to reach for one in new components — mirroring how the existing foundations pages document real values rather than inventing new ones.

## Answer

**Canonical library: `@phosphor-icons/react`.** `lucide-react` is fully removed (it was the majority set by call-site count, but Phosphor was already the deliberate choice in every `components/ui/*` shadcn primitive — the part of the codebase closest to "shared foundation" — and the earlier lean toward lucide was reversed after a live grilling session). `@hugeicons/react` and `@hugeicons/core-free-icons` are also removed (confirmed 0 call sites, pure dead weight).

**Import convention, locked in:** always import the `Icon`-suffixed name (`CaretDownIcon`, never bare `CaretDown`). Phosphor exports both per icon; standardizing on the suffixed form was already the majority convention across the 20 pre-existing Phosphor call sites and avoids collisions between an icon import and an unrelated same-named identifier (a `Search` handler next to a `Search` icon, a `Home` route constant next to a `Home` icon, etc. — this exact collision class caused real bugs during migration, see Verification below).

**Weight:** left unset everywhere (defaults to `regular`), matching what the 20 pre-existing call sites already did and giving the closest visual match to lucide's stroke width. No `weight` props were added.

### Migration actually executed

Re-derived the file list from scratch (the ticket's own "89 files" / "20 files" counts came from a single-line grep and were not fully trusted) by parsing every `lucide-react` and `@phosphor-icons/react` import statement in full, including multi-line and `as`-aliased forms, plus every JSX/type usage site:

- **91 files** migrated off `lucide-react` onto `@phosphor-icons/react`: 89 under `components/`/`app/` (found by the initial scoped grep) + **2 more found only by a repo-wide re-grep that the ticket's original count missed**: `lib/navigation/navigation-model.ts` and `lib/products-data.ts` (the latter also had a `LucideIcon` type import, migrated to Phosphor's exported `Icon` type).
- **21 files** already on Phosphor normalized onto the `Icon`-suffix convention: 20 already used it; `app/login/page.tsx` had 3 bare imports (`CaretDown`, `Moon`, `Sun`) renamed to `CaretDownIcon`/`MoonIcon`/`SunIcon` plus their JSX call sites.
- `lib/navigation/navigation-model.ts` additionally had its own pre-existing bare Phosphor imports (`House`, `Bank`, `Globe as PhosphorGlobe`, `Gavel as PhosphorGavel`, `Link as PhosphorLink`, `QrCode as PhosphorQrCode`, `BookOpen as PhosphorBookOpen`, `ArrowsCounterClockwise`, `ArrowUUpLeft`, `CashRegister`, `Chats`, `DotsThree`, `FileMinus`, `MoneyWavy`) — normalized to `Icon` suffix and, since the file no longer imports `lucide-react`, the disambiguating `Phosphor*` local aliases (kept only to avoid colliding with a same-named lucide import) were dropped in favor of the plain `Icon`-suffixed name. This also **consolidated two icon-selection inconsistencies**: "Overview" nav items used lucide's `Home` in one place and Phosphor's `House` in another (both now `HouseIcon`); "Cross Border"/"Fintech APIs" used lucide's `Globe` while "Payment gateway" used Phosphor's own `Globe` (both now `GlobeIcon`) — previously these rendered visibly different glyphs for conceptually the same icon.
- 152 distinct lucide icon base-names mapped to Phosphor equivalents (full mapping verified against `node_modules/@phosphor-icons/react/dist/csr/*.d.ts`); 6 more names turned up only in the two `lib/` files not covered by the initial 152 (`Activity`, `Cloud`, `Fuel`, `Gift`, `GraduationCap`, `HeartPulse`) and were mapped the same way.
- `pnpm remove lucide-react @hugeicons/react @hugeicons/core-free-icons` — clean removal, `pnpm-lock.yaml` updated correctly, zero remaining references anywhere in `components/`, `app/`, `lib/`, or `package.json`.
- Added `components/foundations/icons.stories.tsx` (autodocs, real-source-import-only) documenting the canonical-library decision, the `Icon`-suffix convention, the default-weight rule, and a grid of all 133 icons actually imported somewhere in `components/`/`app/` today (excluding `.stories.tsx` files), grouped into 10 rough-purpose categories. Added a reusable `IconSwatch`/`IconGrid` pair to `components/foundations/foundation-primitives.tsx` (same pattern as the existing `ColorSwatch`/`RadiusSwatch`/etc.), rather than a one-off renderer local to the new story file.

### Non-exact substitutions (no 1:1 Phosphor equivalent — judgment calls)

| lucide name | Phosphor chosen | reason |
|---|---|---|
| `SeparatorHorizontal` | `MinusIcon` | Phosphor has no dedicated separator/rule glyph; a plain line is the closest visual stand-in. |
| `GripVertical` | `DotsSixVerticalIcon` | Closest Phosphor drag-handle glyph (six dots vs. lucide's six-dot grip). |
| `FileWarning`, `FileClock`, `FileChartColumn` | `FileTextIcon` | Phosphor has no warning-on-file / clock-on-file / chart-on-file composites; all three collapse onto the plain file glyph, losing the secondary-badge distinction lucide drew. Flagging as the one real loss-of-fidelity in this migration — worth a follow-up glyph search if that distinction turns out to matter visually. |
| `MonitorCheck`, `MonitorCog` | `MonitorIcon` | No checkmark-on-monitor or gear-on-monitor composite in Phosphor; both collapse to the plain monitor glyph. |
| `Clock3`, `Clock4` (+ `Clock`) | `ClockIcon` | Phosphor doesn't ship clock-face-position variants; all collapse to one clock glyph. |
| `PackageCheck` (+ `Package`) | `PackageIcon` | No checkmark-on-package composite in Phosphor. |
| `ReceiptIndianRupee`, `ReceiptText` (+ `Receipt`) | `ReceiptIcon` | No currency-marked or lined-text receipt variant in Phosphor. |
| `WalletCards` (+ `Wallet`) | `WalletIcon` | No "wallet with cards" composite in Phosphor. |
| `CircleDot` | `RecordIcon` | Closest filled-ring/"record" glyph to lucide's dot-in-circle. |
| `Move` | `ArrowsOutCardinalIcon` | Closest 4-direction-arrows glyph to lucide's move/pan icon. |
| `AudioLines` | `WaveformIcon` | Closest audio-visualization glyph. |
| `Fuel` | `GasPumpIcon` | Phosphor has no "Fuel" icon; gas pump is the standard equivalent. |
| `HeartPulse` | `HeartbeatIcon` | Same concept, different name in Phosphor's set. |
| `Braces` | `BracketsCurlyIcon` | Same glyph, Phosphor's naming convention differs ("Brackets" family, not "Braces"). |
| `PenLine` | `PencilLineIcon` | Closest pen-with-underline glyph; kept distinct from `Pencil` → `PencilSimpleIcon`. |
| `Webhook` | `WebhooksLogoIcon` | Phosphor's webhook glyph is named as a logo mark, not a generic "Webhook" — naming quirk, same concept. |

Everything else (the remaining ~135 names) mapped cleanly by meaning, largely following the exact hints already given when this ticket was scoped (`ChevronDown`→`CaretDownIcon`, `AlertTriangle`→`WarningIcon`, `X`→`XIcon`, `Search`→`MagnifyingGlassIcon`, `MoreVertical`→`DotsThreeVerticalIcon`, `LogOut`→`SignOutIcon`, `QrCode`→`QrCodeIcon`, `Gavel`→`GavelIcon`, `Wallet`→`WalletIcon`, `ShieldAlert`→`ShieldWarningIcon`, `MousePointer2`→`CursorIcon`, `ChevronsUpDown`→`CaretUpDownIcon`, `IndianRupee`/`BadgeIndianRupee`→`CurrencyInrIcon`).

### A real bug class this migration surfaced and fixed

The mechanical rename pass (word-boundary rename of every unaliased lucide identifier to its Phosphor equivalent, applied file-wide) initially also rewrote plain-English **string literals, JSX text content, comments, and object keys** that happened to share a word with a renamed icon — e.g. a filter chip labeled `"Download"` became `"DownloadIcon"`, a `<Button>` labeled `Copy` became `CopyIcon`, a placeholder `"Search by any ID"` became `"MagnifyingGlassIcon by any ID"`, a nav label `"Users management"` became `"UsersIcon management"`, an object key `Wallet:` became `WalletIcon:`. This was caught by systematic re-scanning (three escalating passes: quoted-string scan, then a broader identifier-context scan, then a line-range-aware scan that also caught bare single-word JSX text nodes) and hand-fixed at ~50 call sites across ~24 files, verified live in the running app (login theme toggle, dashboard sidebar, payments filter chips, account credentials "Copy" buttons, manage-users "Users" tab, configure-checkout "Wallet branding") with no remaining corrupted strings anywhere in `components/`, `app/`, or `lib/`.

### Verification

- `npx tsc --noEmit`: **29 errors, identical to the documented baseline** (same error set; the one cosmetic diff is `LucideProps`→`Icon` in a pre-existing `active-setup-card.tsx` type error, same underlying bug, not a new one).
- `pnpm run lint`: eslint is not installed in this environment (`sh: eslint: command not found`, and `eslint` is absent from both `node_modules/.bin` and `package.json` dependencies) — pre-existing environment gap, not introduced by this migration, not fixed here (out of scope).
- Grepped `components/`, `app/`, `lib/`, `package.json` for `lucide-react` and `hugeicons`: zero references outside the intentional mention inside `icons.stories.tsx`'s own documentation text.
- Verified live in the browser (Storybook `Foundations/Icons` story renders all 133 icons grouped correctly; the running app's login page, dashboard sidebar/topbar, payments listing, account settings panels all render correctly with no console errors beyond a pre-existing, unrelated Radix SSR-hydration-ID warning).

### Follow-up: full Phosphor set browser (2026-08-19)

Added a second story, `Foundations/Icons/Browse full set`, alongside the "in use today" grid above. It pulls every icon from the installed `@phosphor-icons/react` package at runtime (`Object.entries` over a `import * as PhosphorIcons` namespace import, filtered to the `Icon`-suffixed exports) rather than hand-listing them, so it stays accurate across package upgrades — 1530 icons currently. Includes a text search box (client-side substring filter via `React.useState`/`useMemo`).

One real bug caught during verification: the initial filter used `typeof value === "function"`, which matched zero icons — Phosphor's icon components are `React.forwardRef(...)` objects, not plain functions (`typeof === "object"`). Fixed to check `typeof value === "object"` instead; reloaded and confirmed all 1530 icons render with working search (spot-checked "rocket" → `Rocket`/`RocketLaunch`). `npx tsc --noEmit` still at the 29-error baseline.
