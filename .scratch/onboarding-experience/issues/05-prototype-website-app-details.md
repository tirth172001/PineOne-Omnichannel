Type: prototype
Blocked by: 01
Status: resolved

## Question

Design the "Website/app details" screen: optional website link and/or app link for merchants who accept payments online.

Build in this repo using `/prototype`, following the shell and interaction standard from "Architect the post-business-name sequence." The right-panel preview should be a browser-chrome mockup with the URL bar filling in live as the user types — this exact preview was specified directly by the user as the reference example for this step.

## Answer

Built three variants, all honoring the browser-chrome requirement in some form (verified in the browser, no console/server errors):

- **A — Document + browser row**: the running Business Profile document, checkboxes reveal each field, browser-chrome URL bar fills in live exactly as specified, small app badge if a mobile app link is added.
- **B — Two device mockups**: both fields always visible (no toggles), preview shows two full separate mockups together — a browser window and a phone with a home-screen app icon.
- **C — Accordion + morphing preview**: accordion for Website/Mobile app; a single preview area cross-fades between the browser-chrome mockup and a phone mockup as focus moves between fields.

**Winner: Variant A** — continues the running document metaphor from tickets 02–04, and most directly matches the user's original reference example. Folded into `app/onboarding/website-app-details/` (renamed from the throwaway `prototype-website-app-details` path). This closes out the "Business verification" macro-section (tickets 02–05).

Variants B and C were archived on the throwaway branch `prototype/ticket-05-website-app-details` and removed from `main`.
