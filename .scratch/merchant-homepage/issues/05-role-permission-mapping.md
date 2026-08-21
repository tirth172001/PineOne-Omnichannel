Type: grilling
Status: resolved

Blocked by: 01, 02, 03

## Question

What is the specific rule set mapping merchant roles/permissions to homepage module visibility?

Context: `lib/role-permissions.ts` defines offline roles (Owner, Admin, Store Manager, User Admin, Store Cashier, Accountant, EMI World User) and online roles (Owner, Operations, Finance, Support), each with different permission keys across groups like "Transactions & Settlements", "Refunds", "Reports". Depends on `01`, `02`, and `03` because the full module list (attention items + snapshot modules + reports touchpoint) must be known before permissions can be mapped onto it. Resolve:

- For each homepage module (attention items by type, each snapshot module, the reports touchpoint), which permission key(s) gate its visibility?
- What does a merchant with a narrow role (e.g. Store Cashier: no Settlements/Reports permission, or Support: refunds + gateway view only) actually see on the homepage — confirm it degrades sensibly rather than showing empty/broken modules.
- Is there a minimum-viable homepage for a role with very few permissions, or could the homepage end up nearly empty for some roles? If so, what fills that gap?

Use `/mattpocock-skills:grilling` to resolve. Write the answer into `docs/flows/merchant-homepage.md` and a terse decision-log entry.

## Answer

**The Disputes gap:** the permission catalog has no key for Disputes — the legacy system never modeled it as its own group. Disputes-related content (snapshot module + disputes/on-hold Tier-2 attention cards) piggybacks on the Transactions permission (`offline:transactions` / `online:view_all_transactions`), since on-hold/dispute records always carry a `transactionId`.

**Module gating** (specific key, not shared group label, since e.g. Store Cashier holds `offline:transactions` but not `offline:settlements`):

| Module | Offline | Online |
|---|---|---|
| Transactions | `offline:transactions` | `online:view_all_transactions` |
| Settlements | `offline:settlements` | `online:view_settlement` |
| Refunds | any `Refunds`-group key | any `Refunds`-group key |
| Disputes | `offline:transactions` | `online:view_all_transactions` |

Channel-scoped: visible if either channel's key is present, hidden only if neither is. Tier-2 attention cards inherit their module's gate. Reports needs no mapping (no homepage touchpoint, per ticket 03).

**Tier-1 account blockers** (KYC, bank account) both gate on `offline:financial_details` / any `Payouts & Beneficiaries`-group key online — consistent with ticket 01's click-to-fix-flow model, which only makes sense for a role that can act on the result.

**Empty-state roles:** running the mapping against all 11 real roles shows User Admin, EMI World User (offline), and Finance (online) end up with zero visible cards, and Support (online) with just one (Refunds). Resolution: a plain empty-state message on the Overview page — "Nothing to show for your role — ask your Owner or Admin for access." No routing/landing-page changes; that's an IA-level decision beyond this map's destination.

Noted but not resolved here: `DEFAULT_ROLE_CATALOG`'s Accountant description says "processes refunds," but `OFFLINE_ROLE_PERMISSIONS.Accountant` grants no Refunds-group key — a pre-existing data inconsistency, not this ticket's fix.

Recorded in `docs/flows/merchant-homepage.md` §5 and `docs/decisions/decision-log.md` (entry 84, Overview and Analytics).
