Type: grilling
Status: resolved

## Question

Surfaced by [Duplicate component audit](03-duplicate-component-audit.md): this codebase has three independent empty-state implementations — `PanelEmpty` in `components/ui/panels.tsx` (icon + title + description, actually used by 4 feature files), a fuller unused shadcn-style `Empty`/`EmptyHeader`/`EmptyMedia`/`EmptyTitle`/`EmptyDescription` primitive in `components/ui/empty.tsx` (imported nowhere), and ad-hoc `emptyText` string rendering duplicated independently inside `components/ui/data-table.tsx` and `components/shared/transaction-style-table.tsx`.

Resolve:

- Which becomes canonical: keep `PanelEmpty` (already production-proven, simpler API) and delete the unused `Empty` primitive from `components/ui/empty.tsx`, or migrate `PanelEmpty`'s 4 consumers onto the richer `Empty` primitive (more composable — separate header/media/title/description slots — but currently unused and unproven in this app) and delete `PanelEmpty`?
- Should `data-table.tsx`'s and `transaction-style-table.tsx`'s inline `emptyText` rendering be replaced with the canonical component (so an empty table row looks like every other empty state), or is a plain text row a deliberately different, more compact treatment for tabular emptiness that should stay as-is?
- Once decided: perform the consolidation directly (delete the losing implementation, update its call sites) as part of resolving this ticket — matches the map's execution mode.

Output: one canonical empty-state component with the losing implementation(s) deleted and call sites updated, recorded in this ticket's `## Answer`.

## Answer

**`Empty`/`EmptyHeader`/`EmptyMedia`/`EmptyTitle`/`EmptyDescription`/`EmptyContent`** (`components/ui/empty.tsx`) is now canonical — `PanelEmpty` is deleted. Reason: `Empty` has an `EmptyContent` slot for an action button/secondary content that `PanelEmpty`'s fixed icon+title+description shape structurally couldn't support, and several call sites (empty listings, restricted access) are exactly where an action affordance is likely to be wanted later. The two tables' inline `emptyText` strings (`components/ui/data-table.tsx`, `components/shared/transaction-style-table.tsx`) were deliberately **left as-is** — different, narrower concern (a compact "no rows match" table row, not a full empty-panel state); forcing them onto `Empty` would be over-consolidation.

Migrated all 4 real call sites directly (composing `Empty` inline, not via a wrapper, matching shadcn's intended usage) and deleted `PanelEmpty` from `components/ui/panels.tsx`:
- `components/payments/payments-content.tsx` — "Select a transaction"
- `components/products/products-content.tsx` — "No products found" (search-empty) and "Select a product"
- `components/offline-payments/offline-payments-content.tsx` — "Select a device"/"Select a row"
- `components/account/account-page-content.tsx` — "Restricted access"

Verified: `tsc --noEmit` stayed at the pre-existing 34-error baseline (no new errors). Live-verified in the browser at `/products` — searching for a non-matching term now renders the new `Empty` composition (icon, "No products found", description) with no visual regression and no console/server errors.

**Two things noticed while migrating, out of scope for this ticket but worth flagging:**
- `components/products/products-content.tsx`'s "Select a product" empty state is dead code — `WorkspaceShell`'s right panel only renders when `showRightContext={Boolean(selectedProduct)}` is true, which is exactly when the empty-state branch (`!selectedProduct`) wouldn't show. Pre-existing bug, not introduced by this migration.
- `components/payments/payments-content.tsx` and `components/offline-payments/offline-payments-content.tsx` are both unused/dead — nothing in `app/` imports `PaymentsContent` or `OfflinePaymentsContent` (same situation as the already-deleted `manage-devices-content.tsx` from an earlier effort). Their `Empty` migration is still correct, just currently unreachable in the running app.
