# Merchant Homepage Experience

Last updated: 2026-08-04

Source: wayfinder map `.scratch/merchant-homepage/map.md`

This doc is a **decision document**, not a visual spec — it locks the conceptual structure of the merchant homepage (Overview). Pixel-level layout is a separate, later effort using `/mattpocock-skills:prototype`, once every decision here is settled.

The homepage is built around two concepts:

- **Needs-attention surface**: what merchants should quickly understand and act on.
- **Business snapshot**: a glanceable view of the business that lets merchants quickly decide where to dive deeper.

## 1. Needs-Attention Surface

### 1.1 Inclusion Rule

Only issues that **block the merchant's money** qualify for the attention surface. No exceptions — informational states (e.g. a dispute or on-hold item that's merely "in review," or a transaction failure-rate spike) are excluded entirely, not just deprioritized. A merchant should never see a homepage alert for something they can't act on or that isn't holding funds.

### 1.2 Taxonomy

Five item types, in two tiers:

**Tier 1 — Account blockers** (gate all money movement across the merchant's account):

| Type | Source | Real status field |
|---|---|---|
| KYC incomplete | Account onboarding | `kycProgress` (`components/onboarding/account-onboarding-flow.tsx`) |
| Bank account / beneficiary issue | Payout settings | `business-bank` page in `components/account/account-page-content.tsx` (`primaryPayoutAccount`, `secondaryAccount`) |

**Tier 2 — Item-level blocks** (a specific payout or claim is held):

| Type | Source | Real status field |
|---|---|---|
| Disputes needing response | `components/on-hold-disputes/on-hold-disputes-data.ts` | `DisputeStatus === "Action pending"` (has a real `dueDate`) |
| On-hold items needing action | `components/on-hold-disputes/on-hold-disputes-data.ts` | `OnHoldStatus === "Action pending"` |
| Failed / on-hold settlements | `components/settlements/v3-settlements-content.tsx` | `SettlementStatus === "Failed"` or `"On Hold"` |

### 1.3 Ordering

- Tier 1 always ranks above Tier 2 — account blockers gate everything else, so they're surfaced first regardless of deadline or amount.
- Within Tier 2, order by **deadline** where one exists (disputes, by `dueDate`), then by **how long-outstanding** for types without a deadline field (settlements, on-hold items).
- Explicitly **not** ordered by financial amount — a small dispute due tomorrow outranks a large one due in two weeks.

### 1.4 Display and Action Model

Items are **grouped by type**, never shown as a per-record list on the homepage:

- **Multi-instance types** (disputes, on-hold items, failed/on-hold settlements): one aggregate card per type, showing **count + total amount at risk** (e.g. "3 disputes need your response, ₹75,000 at risk"). Clicking navigates to that area's list, **pre-filtered** to the action-pending state — never to an individual record from the homepage.
- **Singular account-state types** (KYC, bank account): there's inherently only one instance per merchant, so no aggregation applies. Each shows as its own card; clicking goes straight to the fix flow — resume KYC (onboarding flow) or the `business-bank` settings tab.

### 1.5 Volume Handling

Solved by construction: aggregation by type caps the attention surface at 5 cards maximum (one per taxonomy type), regardless of how many individual disputes/on-hold items/failed settlements exist underneath. There is no "view all" overflow case to design for — a type with zero action-pending items simply doesn't render a card.

## 2. Business Snapshot

### 2.1 Modules

Four fixed modules, matching the areas that already have list pages today: **Settlements, Transactions, Refunds, Disputes**. No separate on-hold module — on-hold state is folded into the Disputes card here, and already gets dedicated visibility on the attention surface (§1) when an on-hold item is action-pending. A dedicated on-hold module would duplicate that signal without adding new information.

### 2.2 Priority Order

Fixed for every merchant, role, and channel — no personalization:

**Settlements → Transactions → Refunds → Disputes**

Settlements leads because "will I actually get paid, how much, and when" is the sharper day-to-day anxiety for a small merchant than "did today's sale go through" — Transactions, while higher-frequency, is answered the moment a sale completes; Settlements stays open until payout lands. Refunds and Disputes trail as lower-frequency, exception-driven areas.

### 2.3 Time Range

One shared control for the whole snapshot (not per-module): **Today / This Week / This Month**, default **Today** — matching a small merchant's daily check-in habit. This replaces the existing unused `overviewDateRange` state (`last-7-days`/`last-30-days`/`last-90-days`), which reads as analytics-tool granularity rather than a homepage glance.

The Settlements card's headline content (next payout) is exempt from the range control — it's inherently forward-looking, not a historical rollup.

### 2.4 Card Content

Research grounding: across Stripe, Razorpay, Adyen, and Paytm merchant dashboards, the homepage snapshot is consistently a set of lightweight KPI cards (headline number ± a trend delta), never full charts — charts/trend analysis live on a separate analytics destination. Razorpay in particular splits "Financial Overview" into a few cards with % change vs. the previous period, and keeps alerts (our §1) separate from the snapshot metrics, matching the split already locked in this doc.

For a small merchant specifically, a raw week-over-week % delta is noisy at low transaction volume, so trend deltas are used only where they stay meaningful (rate-based metrics), not on every card:

| Module | Headline content | Trend delta? |
|---|---|---|
| Settlements | Next payout amount + date; last payout amount | No — forward-looking, not range-based |
| Transactions | Total collected (amount) + success rate | Yes, on success rate only (a rate, not a raw count, so stays meaningful at low volume) |
| Refunds | Total refunded amount | No |
| Disputes | Count + amount at risk | No — passive awareness only; actionable disputes already surface via §1 |

No charts on any homepage card.

### 2.5 Structural Verdict: Fresh, Not Revived

This is a new, lighter card design — it replaces `OverviewDetailCards`'s current static-stat format (wrong content per §2.4) and does **not** revive the hidden `OverviewSnapshotChartCard` set (`components/home/home-content.tsx`, ~2756-2910) — those are chart-heavy, which §2.4 rules out for the homepage. The fate of that now-fully-dead chart-card code (repurpose into a separate analytics destination vs. delete) is out of scope for this decision — see map's "Not yet specified." The "Customize cards" show/hide sheet is also out of scope here — see ticket 06 (Customization and Empty States).

## 3. Reports Touchpoint

**No homepage touchpoint.** No attention item, no snapshot module, no quick-action button.

Two reasons converge on this:
- **Ticket 01's rule already excludes it as an attention item.** The attention surface is money-blocking issues only, no exceptions — a generated or ready report never blocks a merchant's money, so it can't qualify regardless of how "urgent" it might feel.
- **It doesn't fit the snapshot's definition either.** The business-snapshot modules (§2) all measure business *health* — money in, money out, what's outstanding. Reports is a utility action ("give me this data as a file"), not a health metric — there's nothing to glance at, only something to trigger.
- **Reports is already a persistent top-level sidebar item** (per `docs/architecture/v3-information-architecture.md`), so it's already one click away from the homepage — same as from anywhere else in the app. A homepage quick-action button would be a second path to the same destination, not a click saved.

Cross-platform check: neither Stripe's nor Razorpay's dashboard homepage surfaces a "recent reports" or "download report" widget — reports live behind their own dedicated nav section in both, reinforcing that this isn't a pattern the domain calls for.

## 4. Channel Representation

### 4.1 Aggregation, Not a Toggle

Every business-snapshot module (Settlements, Transactions, Refunds, Disputes) shows a single **aggregate number summed across both channels** for an `"In-store and Online"` merchant — not a per-channel toggle or side-by-side split. One consistent rule across all four modules, no per-module exceptions.

This was a deliberate departure from the precedent set by the on-hold-disputes list, the transactions list, the settlements list, and the refunds list — every one of those already has its own in-store/online tab toggle (`mode`/`channel` state, consistently `"in-store" | "online"`). The homepage doesn't need to reinvent that: clicking through from a snapshot card lands on that module's own list page, which opens on its **default in-store tab** — the bifurcation a merchant wants is one click away on the page built for it, not duplicated on the homepage. A toggle on the homepage itself would also work against ticket 02's "lightweight KPI card" verdict by doubling the interaction surface for a page meant to be a glance, not a workspace.

Same rule for the needs-attention surface (§1): aggregate counts and amounts-at-risk are summed across channels, and clicking through defaults to the in-store tab on the destination list page.

### 4.2 Scope Disambiguation

`AccessScope` (`lib/role-permissions.ts`) is **not** "what channels this business operates" — it's "what channels this role's permission keys cover" (`computeAccessScope` checks for `offline:`/`online:`-prefixed keys). A role like Store Manager only ever holds `offline:` keys, so it always computes to `"In-store"`, even when the merchant's business also runs online. There's no way to distinguish "this business is genuinely in-store only" from "this role just can't see online" — both produce the same single-channel scope, and the UI doesn't need to tell them apart.

That ambiguity is a real risk: a single-channel-scoped user seeing an unlabeled aggregate ("Total collected: ₹50,000") could reasonably mistake it for the whole business's number, when the true combined figure is higher — a false sense that revenue dropped or funds are missing.

**Resolution:** whenever a merchant's `AccessScope !== "In-store and Online"`, the Business Snapshot section (and the needs-attention surface) each show the existing `AccessScopeBadge` component (`components/account/settings-slide-panel.tsx:562`, today only used in Settings' team/role tables) next to their section heading — persistent, not dismissible. For `"In-store and Online"` scope, no badge — the aggregate is genuinely the whole picture, nothing to disambiguate. Card content itself stays channel-agnostic (no per-card relabeling); the badge is the single, consistent disambiguation point.

## 5. Role → Permission Mapping

### 5.1 The Disputes Gap

The permission catalog (`lib/role-permissions.ts`) has **no permission key for Disputes** — every key was "transcribed directly from the legacy permission table" (per the file's own header comment), and the legacy system never modeled Disputes as its own group (the groups are Transactions & Settlements, Refunds, Reports, Gateway Management, Routing Logic, Merchant Settings, User & Role Management, Payment Links, Payouts & Beneficiaries, IMEI, Partner Management, Credentials — no Disputes).

**Resolution:** Disputes-related homepage content (the Disputes snapshot module and the disputes/on-hold Tier-2 attention cards from §1) piggybacks on the **Transactions** permission — `offline:transactions` / `online:view_all_transactions` — rather than inventing a new key the legacy table never had. Every on-hold/dispute record already carries a `transactionId`, so this is a natural extension rather than an arbitrary choice.

### 5.2 Module Gating

`"Transactions & Settlements"` is a shared **permission group label**, but the underlying keys are granular (`offline:transactions` vs. `offline:settlements`) — a role can hold one without the other (e.g. Store Cashier has Transactions but not Settlements). So each snapshot module gates on its **specific key**, not the shared group name:

| Homepage module | Offline gate | Online gate |
|---|---|---|
| Transactions | `offline:transactions` | `online:view_all_transactions` |
| Settlements | `offline:settlements` | `online:view_settlement` |
| Refunds | any `Refunds`-group key | any `Refunds`-group key |
| Disputes (+ on-hold) | `offline:transactions` (piggyback, §5.1) | `online:view_all_transactions` |

Tier-2 attention cards (§1.2) inherit the same gate as their corresponding module — a Settlements attention card requires the Settlements gate, a disputes/on-hold attention card requires the Transactions gate.

**Channel scoping:** for an `"In-store and Online"` merchant, a module is visible if **either** channel's key is present (so the §4 aggregate number still makes sense to show); it's hidden only if **neither** channel grants it.

Reports has no homepage touchpoint at all (§3), so it needs no permission mapping here.

### 5.3 Tier-1 Account Blockers

KYC incomplete and bank account/beneficiary issue (§1.2, Tier 1) are account-wide, not channel-specific, and per §1.4 clicking one goes straight to a fix flow — which only makes sense for a role that can actually act on it. Both gate the same way: `offline:financial_details` / any `Payouts & Beneficiaries`-group key online. Online's group today is only held by Online Owner (Operations/Finance/Support don't have it, even Finance — an existing legacy-permission quirk this decision maps onto rather than corrects).

### 5.4 Empty-State Roles

Running this mapping against all 11 real roles surfaces genuine near-empty and fully-empty cases, not just a hypothetical:

- **User Admin** (offline) and **EMI World User** (offline) — zero snapshot cards, zero attention cards.
- **Finance** (online) — also completely empty (its actual keys are Update Gateway Configuration + Generate Reports — nothing transaction/settlement/refund-shaped, despite the role name).
- **Support** (online) — down to a single card (Refunds only).

**Resolution:** a plain empty-state message on the Overview page itself — "Nothing to show for your role — ask your Owner or Admin for access." No landing-page or routing changes for these roles; that would be an IA-level decision beyond this map's destination (a decision doc for the homepage's *content*), and out of scope here.

*Implementation note, not a decision:* the `DEFAULT_ROLE_CATALOG` description for Accountant says "processes refunds," but `OFFLINE_ROLE_PERMISSIONS.Accountant` grants no `Refunds`-group key — a pre-existing inconsistency in the permission data, not something this ticket resolves (fixing legacy role definitions is a separate, larger effort).

## 6. Customization and Empty States

### 6.1 Customization Scope

**Snapshot modules — show/hide only, no reorder.** Revives the dead "Customize cards" sheet's exact shape (`home-content.tsx:2912-2950`): a right-side panel (matching the app's established customization pattern, decision-log entry 21) with a per-card `Switch`, visible/hidden only. Its card list needs updating to match §2's new fixed set — drop `transaction-state-flow`, which isn't part of the redesigned snapshot. No reorder control: §2.2 already fixed the priority order (Settlements → Transactions → Refunds → Disputes) for a stated reason (payout certainty is the sharper day-to-day anxiety), so letting merchants reorder it would undermine that decision.

**Attention items — no customization at all.** Always fully shown, no show/hide entry in the customize sheet. Unlike a snapshot KPI card, hiding "you have a bank account issue" or "3 disputes need your response" is a real-money risk, not a preference.

### 6.2 Empty States

**Attention surface, nothing pending.** Per §1.5, an individual type with zero action-pending items already doesn't render its card. When **all five types** are zero, the section shows a positive **"All caught up"** state rather than disappearing — a vanishing section could read as broken or missing, while a deliberate all-clear message actively reassures the merchant the system checked. Text-only, matching the app's existing lightweight empty-state convention (no illustration) seen in `transactions-content.tsx` ("No results found.", "No transactions found.").

**Business snapshot, brand-new merchant.** Distinguishes two cases:
- **Zero transactions across the merchant's entire history** (not just the selected range): shows a distinct first-time state instead of four zeroed cards — e.g. "Your business snapshot will appear here once you start taking payments." Four "₹0" cards would read as broken rather than "you haven't started yet."
- **Existing merchant, quiet Today/Week/Month range**: shows the real zero values as-is — "₹0 collected today" is legitimate information for a returning merchant, not an empty state to paper over.
