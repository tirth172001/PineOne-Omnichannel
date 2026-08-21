Type: grilling
Status: resolved

Blocked by: 01, 02

## Question

Where and how does "download reports" surface on the homepage?

Context: Reports is a full sidebar tab today (`/reports` — predefined report cards, report table, schedule table per the V3 IA doc) and stays that way; this ticket only decides the homepage *touchpoint* into it. Depends on `01-needs-attention-taxonomy` and `02-business-snapshot-structure` because the touchpoint could land in either: a completed scheduled report might be an attention item (01), or a "recent reports" shortcut might be its own snapshot module or folded into an existing one (02). Resolve:

- Is the homepage touchpoint an attention item (e.g. "Your scheduled report is ready"), a standing snapshot module (e.g. "Recent reports" with quick download links), a simple quick-action button, or some combination?
- If it surfaces recently generated/scheduled reports, how many, and what happens when there are none yet?

Use `/mattpocock-skills:grilling` to resolve. Write the answer into `docs/flows/merchant-homepage.md` and a terse decision-log entry.

## Answer

**No homepage touchpoint** — no attention item, no snapshot module, no quick-action button. Reports remains reachable only through its existing top-level sidebar nav item.

Two rules converge on this independently:
- Ticket 01's attention-surface rule (money-blocking issues only, no exceptions) already disqualifies a "report ready" notification — a report is never money-blocking.
- Ticket 02's snapshot definition is business-health metrics (money in/out/outstanding); Reports is a utility action, not a metric, so it doesn't fit either.

Since Reports is already a persistent top-level sidebar item (per `docs/architecture/v3-information-architecture.md`), a homepage button would add a second path to the same destination without saving a click. Checked Stripe and Razorpay's dashboards — neither surfaces a "recent reports" widget on their homepage either; reports live behind dedicated nav in both.

Recorded in `docs/flows/merchant-homepage.md` §3 and `docs/decisions/decision-log.md` (entry 82, Overview and Analytics).
