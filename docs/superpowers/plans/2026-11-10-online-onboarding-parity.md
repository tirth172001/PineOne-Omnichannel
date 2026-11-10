# Online Payment Onboarding Parity Implementation Plan

> **For agentic workers:** Execute inline and request focused review. Preserve existing user work and main-app isolation.

**Goal:** Match Figma online onboarding for both Checkout and Payment links inside `/onboarding-demo`.

**Architecture:** Use one persisted merchant verification profile with per-product progress, four macro sections and twelve screens. Verification, video, uploads and signing remain simulated.

**Tech Stack:** Next.js, React, TypeScript, existing Tailwind/Radix primitives and Node tests.

## Evidence

- File `gTal6M0e7vNU0gZz6lqJuE`, section `501:24107`.
- Local Figma desktop MCP supplied 32 screenshots and full design contexts for major screens; sparse owner sheet expanded at `501:15533`.
- Cache: `/tmp/pine-online-reference/`; first-screen code `/tmp/pine-online-pan-code.txt`.
- Original assets downloaded to `public/onboarding/online/`.
- User confirmed both online products.

## Work

- [x] Add failing validation tests and pure model/types/flow metadata.
- [x] Add persisted online profile and four-section resume progress.
- [x] Build shared In-store/online SetupFrame: full-page rail, setup header, Save and exit, focused forms and bottom action bar.
- [x] About business: PAN fetch/linked-phone OTP, GST selection/manual, website/app verify or skip, document uploads/attestation.
- [x] Business verification: bank/confirmation/IFSC or cheque upload; owners yes/no, list and PAN/percentage sheet.
- [x] KYC: signatory name/PAN/designation, political exposure, DigiLocker OTP, Video KYC preparation/session.
- [x] Review/sign: captured data, agreement acceptance, submitted success and return to demo dashboard.
- [x] Wire both products; remove branding and first-link creation as mandatory verification steps.
- [x] Verify tests, TypeScript delta, browser flows/branches, persistence and main isolation; review and capture screenshots.

## Source nodes

PAN `501:15200`, `501:15724`, `501:22640`, `501:22883`; GST `501:23159`, `501:23187`, `501:23596`; website `552:27894`; documents `551:25380`; bank `610:9599`, `610:9789`; owners `501:15397`, `501:15457`, `501:15475`, `501:15515`, `501:15533`; signatory `501:16330`, `501:16351`, `501:16372`, `501:16392`; video `501:15437`, `501:15458`; review/sign `501:16018`, `501:16044`, `501:16070`; success `610:8625`.

## Reference limits

The GST preview is a neutral placeholder; preserve its slot and show fetched demo details. Documents have two-file and extended four-file variants: require MoA/AoA, show Board resolution/CoI as optional until a business-type rule is supplied. Video session is a placeholder; provide explicit simulated completion without camera access. Agreement is a non-binding demo template.

## Additional acceptance checks

- PAN, linked-mobile and signatory edits clear dependent proof; edits clear agreement/submission.
- Fresh agreement consent is required for each online product; verification can be reused.
- Cancelled-cheque submission preserves an existing In-store settlement account.
- Reference layout and portalled controls use scoped light tokens without changing app theme.
- Browser verified both product completion paths, resume, success reload and main-app independence.
- Figma transfer completed in `8pTOs0aNOMdEPACHnzfrcz`, page `21560:166`, with 52 editable screens and prototype entry points.
