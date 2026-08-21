Type: prototype
Blocked by: 08
Status: resolved

## Question

Design the "Face authentication" screen(s): a liveness check tied specifically to the signatory chosen in "Prototype: Authorised signatory" ("Are you [signatory name]? This must be done by the authorised signatory only"), prep instructions (lighting, remove glasses, blink), then a live camera capture with a step tracker (face detected → blink detected → verification complete).

Build in this repo using `/prototype`. Per "Architect the post-business-name sequence," this screen is an explicit exception to the standard input/preview split — it's a full-width camera experience, there's nothing to preview. Blocked by "Prototype: Authorised signatory" because the copy and identity check reference that person by name.

## Answer

No real `getUserMedia` access — the "camera feed" in all three variants is a simulated animated gradient with a face-guide oval, matching the prototype skill's "stub external dependencies" rule. Verified end-to-end in the browser (full click-through of every phase in all three), no console/server errors:

- **A — Prep cards + capture screen**: mirrors the user's reference closely — identity confirm ("Are you Seol Ali?") plus three illustrated prep-tip cards on one screen, then a separate capture screen with an auto-advancing step tracker (face detected → blink detected → complete).
- **B — Single cinematic stage**: no separate screens — one persistent camera stage throughout, with instructions/status cycling as overlaid text on the stage itself.
- **C — 3-screen wizard + checklist**: explicit "Step X of 3" flow with a persistent counter; prep tips are an active checklist the user must manually tick off before capture unlocks.

**Winner: Variant A** — closest to the user's own reference example, and the two-phase structure (confirm+prep, then capture) reads clearly without needing either B's implicit state-cycling or C's extra screen. Folded into `app/onboarding/face-authentication/` (renamed from the throwaway `prototype-face-authentication` path); the shared `_camera-stage.tsx` and `_mock.ts` came along since Variant A depends on them. This closes the "KYC" macro-section (tickets 08–09) and unblocks "Prototype: Review and sign" (once the remaining content tickets are also done).

Variants B and C were archived on the throwaway branch `prototype/ticket-09-face-authentication` and removed from `main`.
