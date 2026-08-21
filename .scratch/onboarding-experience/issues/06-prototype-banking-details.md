Type: prototype
Blocked by: 01
Status: resolved

## Question

Design the "Banking details" screen: bank statement upload (past 3 months), not manual account-number entry.

Build in this repo using `/prototype`, following the shell and interaction standard from "Architect the post-business-name sequence." Cover the happy path; verification failure/rejection states can stay loose — tracked as fog on the map.

## Answer

Built three variants (verified in the browser with simulated file uploads driving the extraction flows, no console/server errors):

- **A — Document + shimmer extraction**: single upload dropzone, "reading statement…" shimmer, then extracted fields (bank, account holder, masked account number) settle into the running Business Profile document — mirrors ticket 02's verify pattern.
- **B — Bank picker + passbook card**: pick your bank first (card-select grid of SG banks), then upload for that bank specifically. Preview is a single bank-branded passbook card.
- **C — Drag-drop hero + receipt strip**: one large drag-and-drop zone as the whole screen, extraction inline beneath it. Preview is a torn-edge receipt strip with redacted lines revealing one by one.

**Winner: Variant A** — continues the running document metaphor from tickets 02–05. Folded into `app/onboarding/banking-details/` (renamed from the throwaway `prototype-banking-details` path). This is the first screen of the "Business details" macro-section.

Variants B and C were archived on the throwaway branch `prototype/ticket-06-banking-details` and removed from `main`.
