# Map: Terminal devices, Manage stores & Configure checkout

Label: wayfinder:map

## Destination

A live, wired module replacing today's Terminal devices page and adding two new Account settings modules, matching the designs supplied 2026-08-19:

1. **Terminal devices** (`/offline-payments/manage-devices`, nav label unchanged): replaces `PosTerminalsListingContent` in place — new columns (Hardware model ID, POS ID, Installation date, Store name, Mode, Action), a live-wired Action menu that can change a device's Mode, and a new **Audit log** sub-page (Back-link pattern) that records every mode change (Hardware model ID, Changed by, Store name, Previous mode, Final mode, Date).
2. **Manage stores** (new `SettingsModule`, `settings-slide-panel.tsx`): list of stores (Created on, Store name, Store ID, Merchant ID, Status, Terminals linked, Users invited) → store detail view (Devices / Users tabs), following the existing in-panel "Back" drill-down pattern already used by Migration review (no new route — nested state within the settings panel).
3. **Configure checkout** (new `SettingsModule`): two tabs, Customisation (checkout branding, wallet branding, express checkout preferences, live mobile/desktop preview) and Paymodes (static status cards per payment method), merchant-wide singleton — one config for the whole business, not per-store.
4. A new first-class `stores` data layer: devices and (extended) role-permission user records reference a store by id, replacing today's derive-from-device-rows approach.
5. Dead code removed: `components/offline-payments/manage-devices-content.tsx` (`ManageDevicesContent`, unimported).

Reaching the end of this map means: the data model and remaining behavioral questions below are decided, and the module is built straight through to match the designs — this map does not hand off to a separate build effort (see Notes).

## Notes

- Domain: merchant-facing payments dashboard (Pine One), in-store/terminal side. This module sits under the `TransactionsPlatformShell` nav ("Terminal devices") and the Account settings slide panel (`components/account/settings-slide-panel.tsx`).
- **Decisions-then-build-straight-through**: unlike `merchant-homepage` (decisions-only, handed to a separate visual-design effort), this map's tickets settle only the handful of things the supplied designs don't answer. Once every ticket below is resolved, add a "Ready to build" checklist to this map (see `.scratch/on-hold-disputes-module/map.md` for the precedent shape) and implement directly — no separate build effort.
- Designs were shared as five screenshots in chat on 2026-08-19 (not saved as files in-repo): (1) Terminal devices list, (2) Audit log, (3) Manage stores list, (4) store detail (Devices tab active, Users tab present), (5) Configure checkout — Customisation tab with live preview, and Paymodes tab (debit/credit/UPI/EMI/net banking/wallets cards).
- Standing decisions locked while naming this destination (grilled 2026-08-19, not re-litigated by tickets):
  - **One map**, not split — stores/devices are the same underlying data, and Configure checkout is small enough to bundle rather than run as its own process.
  - Terminal devices is **replaced in place**: same nav label and href (`/offline-payments/manage-devices`), old `PosTerminalsListingContent` content swapped out, dead `manage-devices-content.tsx` deleted. No new parallel route.
  - **Store is a first-class entity** (own dataset, own ids), not derived from the device table — a store can exist with zero devices (mockup has an "Add new store" button and a store detail page reachable independent of any device).
  - **Configure checkout is a merchant-wide singleton**, not per-store — reached from the top-level Account settings sidebar (same level as Credentials/Webhooks), not from inside a store's detail page.
  - The device Action menu **is wired live**: changing Mode (Standalone ↔ Integrated) actually appends a row to the Audit log. A static-only audit table would make the page pointless to open. Mirrors the existing `MigrationAuditRow` / `MIGRATION_AUDIT_SEED` pattern in `lib/omni-migration.ts` (used today inside the Users settings module).
  - **"Add new device" and "Add new store" are stubs** — one-click mock-row inserts, matching the existing (dead) `ManageDevicesContent.handleAddDevice` convention. No real form design was supplied.
  - Store detail's **Users tab extends the existing role-permissions system** (`lib/role-permissions.ts`) with a `storeId` field on user/role records, rather than forking a second, disconnected user list. Real roles already exist for this (Store Manager, Store Cashier, etc.).
  - Three low-stakes items default to **stubs**, not built out: "View & edit store QR" (no real QR generation), Paymodes "View details"/"Edit details" links (non-functional), and the existing dead "Manage stores & users" button on the Terminal devices page is wired to navigate into Account settings → Manage stores (it was clearly always meant to do this).
- Existing patterns to reuse, not reinvent:
  - `components/offline-payments/pos-terminals-listing-content.tsx` (the page actually live today, built on the shared `TransactionStyleListingPage` primitive used by Transactions/Settlements/Refunds/Reports) — new Terminal devices content should follow the same primitive, not a bespoke layout.
  - `settings-slide-panel.tsx`'s in-panel drill-down pattern (`ChevronLeft` + heading + `onBack`, e.g. `MigrationAuditSection`'s "Migration review" sub-view at line ~1266) — the store detail view nests the same way, no new route.
  - `SETTINGS_NAV_ITEMS` / `SettingsModule` union (currently `"personal-details" | "users" | "credentials" | "webhooks"`) — add `"manage-stores"` and `"configure-checkout"`.
  - `lib/omni-migration.ts`'s `MigrationAuditRow` / `MIGRATION_AUDIT_SEED` shape — closest existing precedent for the new terminal-device audit log.
- Use `/mattpocock-skills:grilling` for every ticket on this map — no prototype tickets needed, since visual design is already fully specified by the supplied screenshots.
- When resolving a ticket: append the answer under the ticket's `## Answer` heading and a context pointer to this map's Decisions so far. No separate flow doc needed (unlike `merchant-homepage`) — the tickets themselves are the record, since building happens directly off them.

## Decisions so far

- [Data model and shared state](issues/01-data-model-and-shared-state.md) — `lib/terminal-devices-data.ts` bundles device rows + audit rows (with `recordModeChange()`); `lib/stores-data.ts` holds stores, computing "Terminals linked"/"Users invited" live rather than storing static counts. Store ids standardized to the prefixed `STR-.../MER-...` format everywhere. Devices get an Active/Inactive `Status` field in the model but it renders only on the store-detail Devices tab, not the top-level list. Cross-route sync uses a plain module-scoped mutable array (no Context/external-store), since every reading surface remounts fresh. Audit log lives at `/offline-payments/manage-devices/audit-log` under the existing shell.
- [Configure checkout behavior](issues/03-configure-checkout-behavior.md) — Local component state only, "Save details" is a toast-only stub (nothing else reads checkout config). Dark mode toggle, primary-color swatch, and the two "Show ..." express-checkout toggles are wired live against the preview panel; wallet name input, the two "Allow users to edit ..." toggles, and both logo uploads stay decorative/static.
- [Device action menu scope](issues/02-device-action-menu-scope.md) — Exactly two actions: "Change mode" (audit-logged) and "Deactivate/Reactivate device" (silent, no audit trail). Identical action set on the top-level list and the store-detail Devices tab — no store-relative restrictions. No "View details"/"Remove device"/"Move to another store" — none have a designed destination.

## Not yet specified

- Whether Manage stores / Configure checkout need permission-gating (e.g. the existing `adminOnly` flag on `SETTINGS_NAV_ITEMS`, currently only set on "Users") — not addressed by the designs; revisit once the modules exist and can be checked against the rest of the app's role-scoping.

## Ready to build (frontier clear)

All three tickets are resolved, and the module has been built straight through (2026-08-19):

- [x] Added `storeId?: string` to the user roster's `RosterEntry` type — during the build, discovered per-user records actually live as `RosterEntry`/`INITIAL_ROSTER` inside `settings-slide-panel.tsx`, not in `lib/role-permissions.ts` (which only holds role *templates*). Extracted that roster type/data + generation logic into a new `lib/user-roster-data.ts` (depends only on `lib/role-permissions.ts`) so `lib/stores-data.ts` could read live counts without a circular or backwards (lib → component) dependency. `settings-slide-panel.tsx` now imports from it instead of defining locally.
- [x] Added `lib/store-identity.ts` (id/name/address/merchantId only) as a small dependency-free shared base so `lib/stores-data.ts` and `lib/terminal-devices-data.ts` could each reference the same ten stores without importing each other.
- [x] Created `lib/terminal-devices-data.ts`: `TerminalDeviceRow` (incl. Active/Inactive `Status`), `DeviceAuditRow`, seed data (first 10 rows match the mockup 1:1, 14 more generated), `findDeviceById`, `recordModeChange()`, `toggleDeviceStatus()` — plain module-scoped mutable arrays.
- [x] Created `lib/stores-data.ts`: `StoreRecord` (prefixed `STR-.../MER-...` ids), 10 seeded stores, `findStoreByStoreId`, live-computed `terminalsLinkedCount`/`usersInvitedForStore`.
- [x] Replaced `components/offline-payments/pos-terminals-listing-content.tsx` to match the new Terminal devices design, still on `TransactionStyleListingPage`. One deviation from the original checklist: the supplied mockup's header only has "Audit log" + "Add new device" — no "Manage stores & users" button — so that old dead button was dropped rather than wired, matching the actual screenshots over the earlier plan text. Manage stores remains reachable via Account settings.
- [x] Deleted dead `components/offline-payments/manage-devices-content.tsx`.
- [x] Added `app/offline-payments/manage-devices/audit-log/page.tsx` + `components/offline-payments/device-audit-log-content.tsx`. Verified live end-to-end: changing a device's Mode on Terminal devices and then client-navigating to Audit log shows the new row (Hardware model ID, Changed by, Store name, Previous → Final mode, Date/Time) — confirms ticket 01's module-scoped-array mechanism works as designed. (A hard browser reload between the two, rather than in-app navigation, does reset the in-memory state — the accepted gap from ticket 01.)
- [x] Extended `SettingsModule` with `"manage-stores"` / `"configure-checkout"`, added `SETTINGS_NAV_ITEMS` entries. Also relabeled "Users" → "Manage users & roles" to match the supplied sidebar screenshots exactly (cosmetic, no scope change). Left both new modules ungated (no `adminOnly`) since that's still open in Not yet specified below.
- [x] Built `components/account/manage-stores-section.tsx`: list view (search, Status filter, "Add new store" stub) + store-detail sub-view (in-panel "Back", Devices/Users tabs, "View & edit store QR" and "Add" stubs). Verified the Devices tab reflects live Mode changes made from the top-level Terminal devices page, and the Users tab correctly filters `INITIAL_ROSTER` by `storeId`.
- [x] Built `components/account/configure-checkout-section.tsx`: Customisation tab (branding forms + live preview matching ticket 03's live/decorative split — verified Dark mode and primary color actually restyle the preview) and Paymodes tab (six static status cards matching the mockup, incl. "You are not eligible" / "Payment mode disabled by PineLabs" states).
- [x] Made `TransactionStyleListingPage`'s `summaryCards` prop optional (skips rendering when empty) — the new Terminal devices/Audit log designs have no summary-card row, unlike every prior user of that shared primitive.

Verified via the browser: all screens render correctly, no new TypeScript errors (`tsc --noEmit` baseline unchanged at 34 pre-existing, unrelated errors), and the cross-route audit wiring works via real client-side navigation.

## Out of scope

- Real QR code generation/editing for "View & edit store QR" — stub only, locked while naming the destination.
- Real "Add new device" / "Add new store" forms — stub only, locked while naming the destination.
- Paymodes "View details" / "Edit details" flows on Configure checkout — stub only, locked while naming the destination.
- Per-store checkout configuration — ruled out in favor of a merchant-wide singleton, locked while naming the destination.
- Real backend persistence / data wiring — matches this repo's standing precedent for a prototype/demo app (see `merchant-homepage` map's Out of scope).
