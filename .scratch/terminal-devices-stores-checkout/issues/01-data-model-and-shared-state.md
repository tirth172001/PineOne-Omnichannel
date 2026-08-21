Type: grilling
Status: resolved

## Question

What's the exact shape and location of the new shared data layer, and how does live state (the audit log) actually propagate across three separate routes/panels that all need to see the same device data?

Context: locked while naming the destination — Store is a first-class entity, devices/users reference it by id, and the device Action menu's Mode change must append a live row to the Audit log (mirroring `MigrationAuditRow` / `MIGRATION_AUDIT_SEED` in `lib/omni-migration.ts`). Resolve:

- **File layout**: new data modules (e.g. `lib/stores-data.ts`, `lib/terminal-devices-data.ts`, an audit log seed/type) — one file per concern or combined? Where do lookups like `findStoreById` live, matching the `findTransactionById` / `on-hold-disputes-data.ts` convention already used elsewhere in this repo?
- **Field shapes and id formats**, matching the mockups exactly: Store (`Store ID: STR-...`, `Merchant ID: MER-...`, name, address, status, createdOn, and how "Terminals linked"/"Users invited" are computed — live count vs. stored number), Device (`Hardware model ID` + `HRD-...`, `POS-...`, installation date/time, `Mode: "Standalone" | "Integrated"`, and whether a device also needs a separate Active/Inactive `Status` field — the store-detail Devices table in the designs shows one but the top-level Terminal devices list doesn't; decide whether to add it to both for consistency or intentionally omit it top-level).
- **Cross-route live state mechanism**: Terminal devices list, its Audit log sub-page, and Manage stores' store-detail Devices tab all need to reflect the same device Mode/audit data without a backend. Existing mock-data files in this repo are static arrays read fresh per component — is that still fine here (each page re-derives from the same static seed, audit log just also gets a static seed with no true cross-page live sync), or does "wired live" require an actual shared mutable store (e.g. a small module-level singleton with subscriber callbacks, or React Context provided at a shared layout) so a Mode change made on the Terminal devices list is visible if you then open Audit log or a store's detail Devices tab in the same session?
- **Audit log route**: what URL (e.g. `/offline-payments/manage-devices/audit-log`), and does it stay under the existing `TransactionsPlatformShell`/nav structure like the list page does?

## Answer

**File layout:** `lib/terminal-devices-data.ts` bundles `TerminalDeviceRow` + the new `DeviceAuditRow` (same precedent as `on-hold-disputes-data.ts` bundling on-hold + disputes) — includes `findDeviceById` and a `recordModeChange(deviceId, nextMode, changedBy)` mutator that updates the device row and pushes an audit row in one call. Stores get their own `lib/stores-data.ts` with `StoreRecord` + `findStoreById`. "Terminals linked" and "Users invited" are **computed live** (counted from `terminal-devices-data.ts` / `role-permissions.ts` by `storeId`), not stored as static numbers, so the "Add new device" stub can't drift the counts out of sync.

**Field shapes / ids:** Devices keep the existing stacked "model name + `HRD-...`" convention, plus `POS-...`. Stores use prefixed, truncated, copy-icon ids everywhere (`STR-...`, `MER-...`) — the mockups' store-detail header showed a plain unprefixed id (`Store ID: 42673486`) inconsistent with the list view's prefixed format; standardized on the prefixed format for both, not treated as an intentional second format. Devices get an Active/Inactive `Status` field in the data model (needed for ticket 02's deactivate action either way), but it's rendered only on the store-detail Devices tab, matching the mockups exactly — the top-level Terminal devices list stays as designed, no Status column.

**Cross-route mechanism:** A plain module-scoped mutable array in `terminal-devices-data.ts` (no React Context/`useSyncExternalStore`). Every surface that reads device/audit data does so on a fresh mount (full route change between Terminal devices ↔ Audit log; the settings panel remounts its content when switching modules), so read-on-mount is sufficient — accepted gap: two already-mounted trees open simultaneously (e.g. a second tab) won't live-sync without a reload, matching this repo's existing no-backend precedent elsewhere.

**Audit log route:** `/offline-payments/manage-devices/audit-log`, staying under the existing `TransactionsPlatformShell` nav/layout, with its "Back" link returning to the Terminal devices list.

