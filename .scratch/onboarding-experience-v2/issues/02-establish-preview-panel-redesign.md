Type: grilling
Status: resolved

## Question

The current persistent preview panel (`components/onboarding/onboarding-preview.tsx`, architected in v1 ticket 15) shows details "getting merged" — bland, flat, no visual hierarchy. The user wants a redesigned layout that:

- Organizes details so they don't all compete for attention at once — the user's reference point is "hide under accordion" for **preserving** some information and giving visual attention to what matters right now, though accordion was never actually shipped here (see map Notes) — treat this as a new pattern to invent, not a revert.
- Explicitly does **not** mean adding more text/textual elements.
- Shows, by its layout alone, an indication of what the user should be filling in on the left — the preview should visually anticipate/guide the input, not just mirror it after the fact.

Establish this pattern concretely on two modes: **document** (business-verification/business-basics/store-verification/website-app-details) and **signatory** (authorised-signatory) — chosen because ticket 01 feeds document mode and ticket 03 (KYC preview) needs signatory mode's card treatment. Resolve what changes structurally in `onboarding-preview.tsx` and whether each mode needs its own sub-component.

Application to the remaining modes (banking, owners) is fog, not part of this ticket — it graduates once this pattern is concrete (see map's "Not yet specified").

## Answer

**Document mode** (`DocumentBody`) is now a real accordion, built on this repo's existing (previously unused in onboarding) `components/ui/accordion.tsx`:
- Each of the 4 sub-steps (identity, category & shipping, store, online presence) is an `AccordionItem`. Whichever matches the user's current position auto-expands with the full field breakdown (today's content, unchanged) inside a highlighted (`bg-primary/5 ring-primary/20`) row — this is the "visual attention" and "anticipates what to fill" part.
- Sections already passed collapse to a single summary row (icon, checkmark, label, one key confirmed value) — "preserved, not competing."
- Sections not yet reached show as a dimmed, disabled, label-only row with a lock icon — a quiet preview of what's coming, no new text.
- Any passed section stays clickable to review; navigating to a new step always snaps the open section back to the active one, overriding manual review.
- **Correction made during verification**: the checkmark/lock treatment is driven by *position* (`index < subIndex`), not by whether the demo data actually happens to be filled — initially it was data-driven, which looked ambiguous when a section was reached via a direct URL jump (position past it, but demo data reset). Position-driven is more robust and matches how the rest of this sequence already treats progress.

**Signatory mode** (`SignatoryBody`) now leads with the selected signatory's `PersonCard` (empty-state row if none selected) — the card the user explicitly asked for. The previously-dominant "Letter of Authorisation" paragraph is demoted to a single collapsed accordion row beneath it, expandable to review. This is the exact component ticket 03 will reuse on the KYC screen.

Also added two cheap, broadly-applicable accessibility fixes to the code touched here per the user's interface cheat sheet: `role="status"` on the header's live status badge, and a `title` attribute on the accordion's truncated summary text so the full value stays reachable.

**Fog graduated**: applying this pattern to the remaining two modes (banking, owners) is no longer vague — it's now two concrete tickets: [Apply preview redesign to banking mode](issues/10-apply-preview-redesign-to-banking-mode.md) and [Apply preview redesign to owners mode](issues/11-apply-preview-redesign-to-owners-mode.md), both noting that neither mode has document mode's "discrete sub-steps to collapse" shape, so the resolution may be a lighter consistency pass rather than a literal accordion.

Verified end-to-end in an isolated worktree dev server: walked business-verification (Singpass, including the deterministic first-attempt failure) through business-basics, confirming sections collapse/expand/lock correctly and manual re-expansion of a completed section works; confirmed the position-based fix via a direct URL jump to store-verification; added a signatory on authorised-signatory and confirmed the `PersonCard` + collapsible letter render and expand correctly. `tsc --noEmit` clean.
