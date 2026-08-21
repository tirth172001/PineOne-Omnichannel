Type: grilling
Status: resolved

## Question

What event/state types qualify as "needs attention" on the merchant homepage, and how is severity/urgency conveyed?

Context: no attention surface exists today — the current homepage is four static snapshot cards only. This ticket defines the taxonomy from scratch. Resolve:

- Candidate attention-item sources across the domain: failed settlements, disputes nearing SLA breach, on-hold items awaiting merchant action, KYC/onboarding issues, a spike in failed transactions, scheduled reports ready for download (or does this belong to `03-reports-touchpoint` instead?), and anything else the domain suggests.
- Severity/urgency model: is there a single flat list, or tiers (e.g. urgent/action-needed vs. informational)? How is urgency visually/conceptually conveyed (not pixel-level — just the concept, e.g. "ordered by deadline" vs. "ordered by financial impact")?
- Action model: when a merchant clicks/taps an attention item, does it deep-link to the specific record (e.g. the exact dispute), or navigate to a filtered list view? Does this vary by item type, or is it a consistent rule?
- Volume handling: what happens when there are many attention items at once — cap + "view all," or show everything?

Use `/mattpocock-skills:grilling` to resolve. Write the answer into `docs/flows/merchant-homepage.md` and a terse decision-log entry.

## Answer

**Inclusion rule:** Only issues that block the merchant's money qualify. No exceptions — informational states (dispute/on-hold "in review", transaction failure spikes) are excluded entirely, not just deprioritized.

**Taxonomy (5 types, two tiers):**
- *Tier 1 — Account blockers* (gate all money movement): KYC incomplete (`kycProgress` in `account-onboarding-flow.tsx`), bank account/beneficiary issue (`business-bank` page in `account-page-content.tsx`).
- *Tier 2 — Item-level blocks*: disputes (`DisputeStatus === "Action pending"`, has real `dueDate`), on-hold items (`OnHoldStatus === "Action pending"`), settlements (`SettlementStatus === "Failed"` or `"On Hold"`).

**Ordering:** Tier 1 always above Tier 2. Within Tier 2, by deadline where one exists (disputes by `dueDate`), else by how-long-outstanding (settlements, on-hold) — never by amount.

**Display/action model:** Grouped by type, not per-record.
- Multi-instance types (disputes, on-hold, settlements) → one aggregate card per type (count + amount at risk); click navigates to that area's list, pre-filtered to the action-pending state.
- Singular account-state types (KYC, bank account) → one card each; click goes straight to the fix flow (resume KYC / `business-bank` settings tab).

**Volume handling:** Solved by construction — aggregation caps the surface at 5 cards max, no unbounded-list case.

Recorded in `docs/flows/merchant-homepage.md` (§1) and `docs/decisions/decision-log.md` (entry 22, Overview and Analytics).
