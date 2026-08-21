Type: grilling
Status: resolved

## Question

Surfaced by the [Duplicate component audit](03-duplicate-component-audit.md) and sharpened with capability evidence from [Data display](08-stories-data-display.md): `components/ui/data-table.tsx` (1290 lines — search, column filters, sort, a "Customize" column-visibility/reorder/pin menu, responsive mobile-card layout) and `components/shared/transaction-style-table.tsx` (164 lines — columns + rows + pagination only) both solve "render tabular data," with `components/account/settings-slide-panel.tsx` using **both** in different sections.

Should `TransactionStyleTable` converge onto `DataTable` (so table behavior only needs fixing/extending in one place), or are they deliberately different tools that should both stay?

Resolve:

- Check what `TransactionStyleTable`'s 3 actual consumers (`settings-slide-panel.tsx`, `manage-user-roles-content.tsx`, `account-page-content.tsx`) render it for, and whether any of `DataTable`'s extra capability (search/filter/sort/column-customize/responsive-cards) would actually help those specific tables, or would be unwanted complexity for what's a simpler, denser list in each case.
- Check the reverse too: does `TransactionStyleTable` do anything `DataTable` can't (e.g. its `showSelection`/footer-row-count treatment, its fixed row-height styling) that would be lost or need re-adding if consumers moved over?
- If convergence wins: decide whether that means (a) deleting `TransactionStyleTable` and migrating its 3 consumers to `DataTable` directly, or (b) keeping `TransactionStyleTable` as a thin "simple mode" wrapper around `DataTable` (hiding search/filter/customize by default) so call sites don't change much.
- If "different tools" wins: no consolidation — but the map's [Duplicate component audit](03-duplicate-component-audit.md) finding should be marked accepted-as-intentional rather than left ambiguous, so nobody re-flags it later.

Output: either a completed migration (if converging) or an explicit "these are intentionally different, no action" call, recorded in this ticket's `## Answer`.

## Answer

**Converged onto `DataTable`; `TransactionStyleTable` deleted.** Investigated all 6 real call sites first: every one of them reimplemented its own bespoke search `<Input>` + `useState` + filter logic beside `TransactionStyleTable`, duplicating exactly what `DataTable`'s built-in `showSearch`/`searchPlaceholder` already provides — strong evidence for convergence, not "different tools."

**Migrated 3 files, 6 call sites:**
- `components/account/settings-slide-panel.tsx` — `RolesTable` and `UsersTable` (both inside the "Manage users & roles" settings module).
- `components/account/manage-user-roles-content.tsx` — the role-permissions table at `/account/users/roles`.
- `components/account/account-page-content.tsx` — "Approval queue" (pending users) and "Users directory" (managed users) on `/account/users`.

**Mechanical column mapping** applied everywhere: `key`→`id`, `render`→`cell`, `cellClassName`→`align` (for right-aligned action columns), `headerClassName`'s `min-w-[Npx]`→`width: N`. Table-level: `rows`→`data`, `rowKey`→`rowId`, `minWidthClassName`→`tableClassName` (DataTable's `Table` accepts a `tableClassName` merge, so the original min-width behavior on desktop is preserved).

**Search fidelity required care, not just renaming.** `DataTable`'s built-in search only matches text a column exposes via `accessorKey`/`getValue`/`getSearchValue` — most of these columns only had a `cell` render function (JSX, not raw text), so without extra work search would have silently matched nothing. Added `getSearchValue`/`accessorKey` to the columns that need to stay searchable, combining fields to match each original bespoke search's exact scope (e.g. `manage-user-roles-content.tsx`'s roleName column's `getSearchValue` folds in `scope` and `createdBy` too, since the original search matched `createdBy` even though it isn't a separate visible column).

**One real coupling required keeping bespoke search, deliberately not converged:** `account-page-content.tsx`'s "Pending users" table has a "select all" checkbox whose semantics depend on knowing exactly which rows are currently visible after search (`isAllPendingSelected` computed from `filteredPendingUsers`). Handing search over to `DataTable`'s internal state would have broken that — "select all while searching" would then select all pending users, not just the visible/filtered ones. Kept the external `pendingSearchQuery`/`filteredPendingUsers` state and passed `showSearch={false}` to `DataTable` for this one table only, preserving the exact original interaction. All other 5 call sites (no selection coupling) fully hand search over to `DataTable`.

**Verified live in the browser** across all 3 pages/panels: `/account/users` (Approval queue select-all + search tested — selecting all 3 checked all 3, searching "Rahul" correctly filtered Users directory to one match), `/account/users/roles` (search "Finance" correctly isolated Finance Ops), and the settings slide panel's "Manage users & roles" → Users tab (role/status filters + search) and Roles tab (search "Cashier" correctly isolated Store Manager/Store Cashier). No console/server errors. `tsc --noEmit` stayed at 29 (no new errors from the migration).

Deleted `components/shared/transaction-style-table.tsx` and its story; confirmed zero remaining references repo-wide.
