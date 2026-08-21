Type: prototype
Blocked by: 01
Status: resolved

## Question

Design the "Verification method" and "confirm fetched details" screens: a card-select between Singpass (instant) and manual ACRA document upload, followed by a confirm screen showing the business details that came back from whichever method was used.

Build in this repo using `/prototype`, following the sequence, shell, and interaction standard decided in "Architect the post-business-name sequence" (card selection, right-panel document preview that shimmers to signal verification). Cover the happy path for both methods; error states (Singpass failure, unreadable ACRA doc) can stay loose — tracked as fog on the map.

## Answer

Built three structurally different variants (`?variant=A/B/C`), verified in the browser (all three click through cleanly, no console errors):

- **A — Document builds live**: stacked method cards, right panel is a full "Business Profile" document with skeleton rows, a shimmer sweep during verification, then real values + a "Verified" badge.
- **B — Per-field checklist + boarding pass**: side-by-side compact cards, left checklist ticks fields one at a time, right panel mirrors it as a boarding-pass stub with rows lighting up in sync.
- **C — Single-screen + verification log**: no separate confirm screen — a segmented Singpass/Upload-ACRA control with the sub-form inline, right panel is a terminal-style log (brand lime-on-black) that prints each step, then fades in the assembled document.

**Winner: Variant A.** Folded into `app/onboarding/business-verification/` (renamed from the throwaway `prototype-business-verification` path) as the working build of this step — not yet linked from production navigation, pending tickets 03–10 and an eventual integration step. `_shell.tsx` (the persistent rail) is written to be reused by every subsequent ticket in this sequence, not just this one.

Variants B and C, and the variant switcher, were removed from `main` and archived on the throwaway branch `prototype/ticket-02-business-verification` (commit `52008ab`) per the `/prototype` skill's capture step.

