Type: prototype
Status: resolved

## Question

Review-and-sign (`app/onboarding/review-and-sign/`) currently shows the assembled Business Profile document with signing appended inline on the same scroll (v1 ticket 10), as a full-width exception with no left/right split.

The user wants it restructured as a genuine split: the **agreement on the left**, **all business-related details on the right**, and a single CTA — "Sign agreement" — rather than the current inline treatment. Resolve the concrete layout: what the agreement content looks like on the left (scrollable terms? a summarized agreement?), how the assembled business details are organized on the right (does this reuse ticket 02's redesigned preview pattern, or is this screen's "preview" a distinct read-only summary since there's nothing left to fill in?), and where/how signing happens relative to the single CTA.

## Answer

Restructured `_variant-b.tsx` into a genuine two-card split (`grid lg:grid-cols-2`) inside the screen's own content area — still a `FULL_WIDTH_ROUTES` shell exception (this is this screen's own split, not the shell's input/preview split, so `onboarding-sequence.ts` didn't change).

- **Left — agreement**: scrollable terms in a bounded region (`max-h-64 overflow-y-auto`), with the "I agree" checkbox and the single **"Sign agreement"** CTA directly beneath it, inside the same card. Signing is anchored to the thing being signed, not floated separately.
- **Right — business details**: a distinct, read-only summary — not ticket 02's live/accordion preview pattern. This route's data (`_review-data.ts`) is static mock data, not threaded through the shared profile/people/signatory state those steps use, and per the ticket's own framing there's nothing left to fill in, so no progressive disclosure is needed. Reuses the same card header grammar (icon + label + status pill) for visual consistency. Dropped the per-field edit buttons from the old layout — they had no `onClick` and don't belong on a read receipt.

Implementation note: `OnboardingRailShell`'s height propagation only reaches `h-full` for the split (non-full-width) layout — for full-width routes the wrapper chain doesn't actually stretch to fill the viewport, so an initial `flex-1`/`min-h-0` attempt to make both cards independently fill-height-and-scroll left the CTA below the fold. Fixed by not depending on that (out of scope to fix shell-wide): only the agreement text is capped and scrollable (`max-h-64`), both cards otherwise size to content, and the outer `section`'s existing `overflow-y-auto` is the fallback for anything taller than viewport (mobile single-column especially).

Verified in-browser: agreement scrolls independently within its cap, checkbox + "Sign agreement" always visible without scrolling, business details fully visible in the right card, and the post-sign success screen still renders correctly.

Files changed: [review-and-sign/_variant-b.tsx](../../../app/onboarding/review-and-sign/_variant-b.tsx).
