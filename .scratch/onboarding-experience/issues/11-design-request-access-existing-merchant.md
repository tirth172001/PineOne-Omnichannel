Type: prototype
Status: resolved

## Question

Design the full "request access to an existing merchant" branch, taken after a new user picks "I'm part of an existing merchant" at the fork screen instead of creating a new business. This branch is entirely new — nothing exists for it today.

Needs to cover, end to end:

- What details identify the target merchant (merchant ID? phone/email of an existing admin? business name + some other field?) — not yet decided, decide it here.
- The screen(s) for entering those details and submitting the request.
- The pending-approval state: what the requesting user sees while waiting (and, if relevant, what they can/can't do meanwhile).

Out of scope: the existing merchant's approve/reject experience — that's a separate effort (see map's Out of scope section). This ticket only covers what the *requesting* user sees.

Use `/prototype` to build this as a concrete, clickable flow in this repo.

## Answer

**What identifies the target merchant:** the requester enters the merchant's registered email or phone number (whichever it signed up with), the account is looked up, and the found business name is shown back for the requester to confirm before submitting — chosen over a raw merchant ID (a new joiner likely wouldn't have one) or business name alone (collision risk). This locks in the domain concept later needed for the merchant-side approval effort (map's Out of scope).

Built three variants against that decision (verified end-to-end in the browser, including a real layout bug found and fixed in Variant C — the chat input bar collided with the prototype switcher pill):

- **A — Linear 3-step wizard**: lookup → confirm found business → pending state, with a dot stepper.
- **B — Single screen, inline reveal**: the found business card fades in beneath the search box on the same screen, then morphs in place into the pending state — no screen transition.
- **C — Conversational assistant**: a chat thread (leaning on this app's existing assistant-panel precedent elsewhere in onboarding) — the assistant asks for the contact, presents the found business as a card bubble with inline Yes/No quick-replies, then confirms with a "Pending approval" badge.

**Winner: Variant C** — the conversational framing fits this specific moment better than a form: the user is making a low-information, slightly uncertain request ("I think I work here") rather than filling out known facts, and a guided back-and-forth reduces the chance of submitting to the wrong business. Folded into `app/onboarding/request-access-existing-merchant/` (renamed from the throwaway `prototype-request-access-existing-merchant` path). This branch uses its own simple centered shell (`_shell.tsx`), not the post-business-name rail, since it happens at the signup fork — a sibling to the whole ticket 02–10 sequence, not a continuation of it.

Variants A and B were archived on the throwaway branch `prototype/ticket-11-request-access-existing-merchant` and removed from `main`.

This closes the onboarding-experience map — every ticket (01–11) is now resolved.
