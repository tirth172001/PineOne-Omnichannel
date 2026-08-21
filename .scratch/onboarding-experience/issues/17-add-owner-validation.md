Type: prototype
Status: resolved

## Question

`app/onboarding/business-owners/_add-owner-sheet.tsx`'s `submit()` only checks that a name and a nonzero percentage were entered (line ~34-38) — nothing stops a user from adding the same person twice, or from entering ownership percentages that sum to more than 100% across all owners. Both are realistic mistakes on a form collecting beneficial-ownership data for KYC purposes (Singapore market — this is what feeds the shared `Person` list from [Unify Owner/Signatory into one Person model + card](14-unify-person-model-and-card.md), which the persistent preview from [Architect the persistent cross-step preview panel](15-architect-persistent-preview-panel.md) now surfaces live as "N% allocated").

Decide and prototype: how does the sheet (or the `business-owners` screen itself) surface a duplicate-name warning — inline validation in the sheet, a confirmation prompt ("this name is already on the list, add anyway?"), or a hard block? Same question for total ownership exceeding 100% — hard block at submission, a warning banner on the main screen once the running total crosses 100% (the preview already computes and shows this total), or both? Decide the exact copy and where each error surfaces (inside the sheet vs. on the main list).

## Answer

**Both are hard blocks, inline in the sheet, at the field the user is actively editing** — not a confirmation dialog, not a separate banner on the main screen. Reasoning: the user is entering data in the sheet right when the mistake happens (typing a name that matches, or a percentage that overflows), so the fastest, clearest feedback loop is right there rather than deferring to a banner they'd have to notice after closing the sheet. A confirmation dialog ("add anyway?") was rejected for the duplicate case — an exact name match on a KYC-adjacent form is almost certainly a mistake, not a legitimate edge case worth a bypass.

**`AddOwnerSheet` now takes an `existingPeople: Person[]` prop** (passed from `business-owners/_variant-a.tsx`, the same list the persistent preview already reads) and computes, live as the user types:
- **Duplicate name** — case-insensitive, trimmed exact match against existing owners. Shows a destructive-styled inline message under the name field ("An owner with this name is already on the list.") and marks the field `aria-invalid`.
- **Over-100% ownership** — `existingTotal + newValue > 100`. Shows the exact overflow and remaining headroom ("That would bring total ownership to 120% — only 30% is left to allocate.") instead of a generic error, so the user knows what number would actually work.
- When neither error is active, the percent field's helper text shows a running **"N% remaining to allocate"** hint proactively, so most users never hit the error in the first place.
- "Add owner" is disabled whenever either condition is true (in addition to the existing name/percent-required checks).

Verified end-to-end in-browser: added Samuel King at 70%; attempting to add "Samuel King" again showed the duplicate error and disabled the button; changing the name to Priya Nair while at 50% (70+50=120) showed the exact overflow message and remaining-30% figure, button still disabled; reducing to 30% cleared both the error and the block, submitted successfully, preview updated to "100% allocated" with both real owners listed, and the sheet correctly reset to show "0% remaining" for a hypothetical next entry. No console errors; `tsc --noEmit` clean.
