Type: grilling
Status: resolved
Blocked by: 01

## Question

Beyond changing Mode (Standalone ↔ Integrated, already locked as live-wired and audit-logged), what else does the terminal device row's ⋮ Action menu support — and does the store-detail page's Devices tab share the exact same action set and columns as the top-level Terminal devices list, or does it diverge?

Context: the supplied mockups show the ⋮ trigger closed in every screenshot — its open contents were never specified. The store-detail Devices tab additionally shows a per-row Active/Inactive `Status` badge that the top-level list doesn't display (see ticket 01's Status-field question — this ticket covers the *behavior* once that field exists, ticket 01 covers whether it exists at all). Resolve:

- Does the Action menu offer anything beyond a Mode change — e.g. Deactivate/Reactivate a device (toggling the Active/Inactive status from ticket 01), "View details," "Remove device," or "Move to another store"?
- Is the action set identical on the top-level Terminal devices list and the store-scoped Devices tab, or does the store-scoped view (reached by drilling into one specific store) restrict some actions (e.g. no "Move to another store" since you're already inside one)?
- Does deactivating a device also get audit-logged, or does the Audit log stay scoped to Mode transitions only (matching its current column set: Previous mode / Final mode — no Previous/Final status columns in the design)?

## Answer

The Action menu has exactly two items: **"Change mode"** (Standalone ↔ Integrated — audit-logged, per ticket 01) and **"Deactivate device" / "Reactivate device"** (toggles the Status field from ticket 01, silent — not audit-logged). No "View details," "Remove device," or "Move to another store" — none have a designed destination (detail drawer, confirmation flow, store-picker), so adding them would mean designing new UI beyond the supplied mockups.

Both actions apply identically on the top-level Terminal devices list and the store-detail Devices tab — neither action is store-relative, so there's nothing to restrict in the scoped view.

Audit log stays scoped to Mode transitions only, matching its exact designed columns (Previous mode / Final mode). Deactivate/Reactivate leaves no audit trail for this effort — logging it would mean inventing new columns (Previous/Final status) not present in the mockup.

