Type: prototype
Blocked by: 01
Status: resolved

## Question

Design the "Store verification" screen: a Google Maps link to the physical store, and a storefront photo upload (must show the business name), with an escape hatch for "I don't have this yet."

Build in this repo using `/prototype`, following the shell and interaction standard from "Architect the post-business-name sequence." The right-panel preview should be meaningful to this data — e.g. a map preview as the link is entered, the photo appearing in a storefront card as it's uploaded.

## Answer

Built three variants (verified in the browser with real file-upload previews via `URL.createObjectURL`, all interactive, no console/server errors):

- **A — Document continues building**: same document as tickets 02/03, prior fields collapsed into an expandable summary, plus a live map-link row and a real uploaded-photo preview. The escape checkbox ("I don't have a storefront photo yet") hides the upload zone and shows "Pending — add this later" in the document.
- **B — Integrated place-listing card**: photo-first entry, "Skip — I'll add this later" as a lightweight text link. Preview is one cohesive Google-Maps-style place card (photo + name + placeholder rating + map chip) rather than separate artifacts.
- **C — Split entry + composite preview**: two-column input (map link | photo side by side); no persistent checkbox — clicking Continue without a photo surfaces an inline warning prompt ("No storefront photo yet? → Continue without it"). Preview is a stacked composite (map on top, photo below).

**Winner: Variant A** — continues the running document metaphor from tickets 02 and 03. Folded into `app/onboarding/store-verification/` (renamed from the throwaway `prototype-store-verification` path).

Variants B and C were archived on the throwaway branch `prototype/ticket-04-store-verification` and removed from `main`.
