Type: grilling
Status: resolved

## Question

Once a new user has picked "create new business" and entered their business name, four things still need to be collected before the account is fully onboarded: business details / regulatory-body lookup (GST/PAN-type connection), bank account, business owners, and authorized signatory.

What is the sequence and grouping of these into screens/steps? Specifically:

- What order do these four go in, and why?
- Does each get its own screen, or are any combined onto one screen?
- Does the existing onboarding workspace layout (left rail progress + center form + right assistant chat panel, per `docs/flows/onboarding-and-auth.md` §3) carry forward, or does the new sequence need a different shell?
- What does the left-rail progress state look like across this sequence?

Use `/flow-architecture` to work through this one screen/decision at a time. The output should be a clear step sequence that the four prototype tickets (business details, bank account, business owners, authorized signatory) can each build against independently.

## Answer

Resolved against two references the user provided: (1) a screenshot establishing the target *interaction pattern* (50/50 input/preview split, card selection, shimmer verification), and (2) a full legacy flow walkthrough establishing the target *content and sequence* (Singapore-market merchant onboarding — Singpass/ACRA, NRIC, MCC-style business category). The legacy flow's visual execution (dropdowns, plain uploads, bare left rail) is explicitly rejected; only its field content and ordering carry forward.

### Final sequence (10 steps, 4 macro-sections)

**Business verification**
1. Verification method — Singpass (instant) vs. manual ACRA document upload. Card-select.
2. Business basics — business category (MCC-style, large enumerable set — searchable select, not cards) + device shipping address.
3. Store verification — Google Maps store link + storefront photo (with "I'll upload later" escape hatch).
4. Website/app details — optional website and/or app link for online payment acceptance.

**Business details**
5. Banking details — bank statement upload (not manual account-number entry).
6. Business owners — "any owner over 25%?" toggle, then build an ownership list; each owner added via a side panel (name, type, appointment date, ownership %, NRIC upload).

**KYC**
7. Authorised signatory — card-select from the owners just added, or add a new person via side panel. *(Depends on #6 — needs the owners list to populate the cards.)*
8. Face authentication — liveness check tied to the signatory selected in #7. Full-width camera capture with its own step tracker (face detected → blink → complete); this screen is an explicit exception to the input/preview split below — there's nothing to preview, the camera feed is the content. *(Depends on #7 — copy and identity check reference the chosen signatory by name.)*

**Review and sign**
9. Review — read-only summary of every field collected in steps 1–8, each independently editable. Also an exception to the input/preview split (single-column summary, or summary alongside the fully-assembled business-profile document as its "preview," not a live-building one). *(Depends on all content steps 1–8.)*
10. Sign agreement — merchant signing agreement text, consent checkbox, sign action, success confirmation.

### Shell decision

Reject the plan (keep existing three-pane workspace shell) from this ticket's first draft — the user's reference replaces it. Final shell:

- A **persistent, slim left navigation rail** survives from the legacy reference, restyled: shows the 4 macro-sections and their sub-steps, lets the user jump back to a completed section. This resolves the open question of "how is macro-progress shown" — the rail carries it, not a top counter alone.
- The **main content area** (right of the rail) is a 50/50 split: **inputs on the left, a live meaningful preview on the right** — mirrored from the login screen's split.
- The preview is **field-specific, never generic**: a business-profile document skeleton that populates as details are entered (steps 1–3), a browser-chrome mockup with the URL bar filling in live (step 4), an ownership visualization building as owners are added (step 6), etc. — each prototype ticket decides its own preview content, but it must be meaningful to that step's data.
- Once a step's core fields are complete, the right panel **expands to center stage** and plays a **shimmer/gleam animation** to signal "verifying."
- **Cards over dropdowns** wherever the choice set is small and enumerable (verification method, owners, signatory). Dropdown/searchable-select is fine where the set is large (business category).
- **Contextual side panels/modals** for "add" sub-forms (add owner, add signatory) rather than full-page navigation.
- **Success toasts** for confirmations instead of silent state transitions.
- Face authentication (#8) and Review (#9–10) are explicit exceptions to the 50/50 split — full-width camera capture and full-width summary respectively.

This standard is recorded in the map's Notes so every downstream prototype ticket inherits it.
