Type: prototype
Status: resolved

## Question

Ticket 02 established the redesigned preview-panel direction on document mode (a real accordion — completed sections collapse to a summary row, the active section expands and is highlighted, upcoming sections stay locked) and signatory mode (a `PersonCard` as the primary visual, supplementary text demoted to a collapsed accordion row). `BankingBody` in `components/onboarding/onboarding-preview.tsx` wasn't touched — it's still the old flat treatment (a single status card: awaiting/reading/confirm/failed).

Resolve whether banking mode needs the same visual language applied (e.g. matching the icon-circle-plus-label treatment used elsewhere now, even though it's a single section with no sub-steps to collapse), or whether its existing single-card treatment is already appropriately minimal and just needs a lighter consistency pass (spacing, icon style) rather than a structural accordion change.

## Answer

Lighter consistency pass, not a structural accordion — banking-details has no internal sub-steps, so there's nothing to collapse against anything else; forcing an `Accordion` here would just be a single always-open item, which is a real anti-pattern the accordion.tsx docs would never endorse.

What changed in `BankingBody`: borrowed the icon-circle-plus-label header row grammar from the document/signatory sections instead — a small circle (`bg-primary/10`, `bg-success/10`, or `bg-destructive/10` depending on state) holding `BankIcon`/`CheckCircleIcon`/`WarningCircleIcon`, next to the "Settlement bank account" label. The "reading"/"upload" states wrap this header in the same `bg-primary/5 ring-primary/20` active-highlight treatment document mode's active section uses. The content card below (bank name/account number on success, error copy on failure, extracting/awaiting copy otherwise) is otherwise unchanged from before this ticket — only the header above it and the redundant in-content icons (now living in the header instead) changed.

Verified in an isolated worktree dev server, using a synthetic `File`/`DataTransfer` dispatched at the file input (no real OS file picker available to automation): confirmed all three states render correctly — the deterministic first-attempt failure (destructive circle + "Couldn't extract details"), the active "reading" highlight on upload, and the success state (green checkmark circle + DBS Bank / masked account number) after "Try again." `tsc --noEmit` clean.
