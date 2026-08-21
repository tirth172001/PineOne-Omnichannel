Type: prototype
Status: resolved

## Question

Today `app/onboarding/review-and-sign/_variant-b.tsx`'s success state (`signed === true`) is a dead end: a centered "You're all set — Kopi & Co Pte. Ltd. is signed and submitted. We'll activate your account shortly." message with no button, no CTA, no redirect (`_variant-b.tsx:19-33`). The destination for this map is "a working, prototyped new-user onboarding experience" ending somewhere real — this screen doesn't currently go anywhere.

Decide and prototype: what happens immediately after this success state for the new-business path? Is there a CTA the user clicks (e.g. "Go to dashboard"), does it auto-redirect after a beat, or does it stay static? If the account isn't instantly active (the copy already implies delayed activation — "we'll activate your account shortly"), what does the destination look like — does the user land on the existing dashboard in some "pending activation" state, a dedicated pending screen, or something else? This is the Singapore new-business equivalent of what [Design: Request access to existing merchant](11-design-request-access-existing-merchant.md) already resolved for the access-request path (which explicitly lands in "a pending-approval state," per this map's Destination) — check whether the same pending-state pattern should be reused here for consistency, or whether a freshly-submitted-and-signed business warrants different treatment than a pending access request.

## Answer

**Checked ticket 11's precedent first:** its "pending approval" state (`request-access-existing-merchant/_variant-c.tsx:150-166`) is also a dead end — an inline chat-bubble status message with no CTA or redirect either. So there was no existing "redirect into a stateful dashboard" pattern to reuse; both flows currently just show a terminal status message.

**Investigated whether to redirect into the real dashboard** (`app/page.tsx` → `TransactionsPlatformShell` → `HomeContent`, the app's actual root route) with a "your account is activating" banner. Findings: `/` is genuinely reachable and ungated — `TransactionsPlatformShell` has no auth check at all, unlike `v2-dashboard-layout.tsx` which does gate on `isDummyAuthenticated()`. But there's no existing reusable banner infrastructure to hang an activation message on: `components/dashboard/app-alert-strip.tsx` is unwired anywhere in the app, takes zero props, and renders a hardcoded, unrelated string ("3 action items need attention in operations today"). Building real "activation pending" dashboard infrastructure (props, a mount point, a state flag) is genuinely new scope beyond "what happens after sign" — noted as a natural follow-up, not built here.

**Resolution, kept contained to this ticket's own screen:** enhanced the existing success state in `review-and-sign/_variant-b.tsx` rather than inventing new dashboard plumbing —
- Kept the existing checkmark + "You're all set" message.
- Added a small inline note ("Activation usually takes a few minutes. You can explore your dashboard while you wait.") so the delay is explained rather than left as a dead-end claim.
- Added a real "Go to dashboard" button (`router.push("/")`) — verified in-browser: signs, lands on the enhanced success screen, clicking through actually navigates to the real root route (`window.location.pathname === "/"`), no console errors.

Deliberately did **not** touch `AppAlertStrip` or `TransactionsPlatformShell` — wiring a real activation-state banner into the production dashboard is a larger, separate piece of work with its own design questions (what triggers it, how long it shows, does it apply per-business or per-session) that wasn't asked for here and risks scope creep into files used across the whole app, not just onboarding.
