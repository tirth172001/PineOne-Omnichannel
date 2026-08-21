Type: prototype
Status: resolved

## Question

Two screens run a "shimmer while we read/verify, then reveal the result" sequence, and both currently only model the success path:

- `app/onboarding/business-verification/_variant-a.tsx` — Singpass lookup or ACRA document upload always resolves to `step === "confirm"` after 1500ms (`startVerification`, ~line 38-42). There's no path for "Singpass couldn't find this UEN" or "we couldn't read your document."
- `app/onboarding/banking-details/_variant-a.tsx` — statement upload always resolves to `step === "confirm"` after 1400ms (`onFileSelected`, ~line 26-30). No path for "couldn't extract your account details from this statement."

Both share the same mechanic (a `verifying` flag driving the shimmer sweep on the persistent preview from [Architect the persistent cross-step preview panel](15-architect-persistent-preview-panel.md), then a settle to a revealed/confirmed state) — decide the failure pattern once and apply it to both, rather than designing two independent ones.

Decide and prototype: what does a failure state look like on the input side (retry button, switch-method suggestion for business-verification specifically, re-upload prompt for banking-details) and on the shared preview (does the shimmer stop and show an error badge in place of "Verifying…", does it revert to "Awaiting verification," something else)? Is there a retry limit or escape hatch (e.g. "having trouble? upload manually instead" / "contact support")?

## Answer

**Trigger mechanism (prototype-only, called out explicitly):** since there's no real backend, both screens deterministically fail on the *first* attempt and succeed on every attempt after — implemented via a local `attempts` counter, not randomness. This guarantees the failure design is reachable on every single run-through of the flow (important for something meant to be reviewed), rather than being probabilistic and possibly never shown in a demo. A real integration would replace this with the actual API/extraction result.

**Preview behavior:** the shimmer stops and is replaced by a destructive-styled **"Verification failed"** badge in the persistent preview's header (not a revert to "Awaiting verification" — that would look identical to the initial state and lose the fact that something was attempted and failed). `business-verification`'s document fields stay as skeletons (nothing was actually verified); `banking-details` shows a dedicated "Couldn't extract details" row in place of the awaiting/reading states. Both wired through new fields on the shared profile store: `verification.failed: boolean` and `banking.step` gaining a `"failed"` member.

**Input-side pattern (same shape on both screens):**
- A destructive icon + specific title/description (`"We couldn't verify via Singpass"` / `"We couldn't read your document"` for business-verification; `"Couldn't read your statement"` for banking-details) — not a generic "Something went wrong."
- A primary **"Try again"** button that retries the *same* path (re-runs Singpass, or reopens the file picker for a fresh upload).
- **business-verification only:** a secondary switch-method button ("Upload your ACRA document instead" / "Verify via Singpass instead") — banking-details has no alternate method, so this doesn't apply there.
- **Escape hatch, no retry limit:** a small "Still stuck? Contact support" text link on both, shown alongside the retry options rather than gating them — chose not to lock the user out after N attempts, since that risks abandoning onboarding entirely over a possibly-transient failure.

Folded into `business-verification/_variant-a.tsx`, `banking-details/_variant-a.tsx`, and `onboarding-preview.tsx` (header + `DocumentBody`/`BankingBody`), plus the new fields on `onboarding-profile.ts`. Verified end-to-end in-browser: Singpass click → failure UI shown, preview badge red, skeletons unrevealed → "Try again" → succeeds, "4 details confirmed" restored. Banking: dispatched a synthetic file-select event (no real OS file picker available to this testing tool) → failure UI shown, preview shows "Couldn't extract details" → "Try again" + re-upload → succeeds, real bank fields shown in both input and preview. No console errors at any point; `tsc --noEmit` clean.

This closes the map — every ticket (01–18) is now resolved.
