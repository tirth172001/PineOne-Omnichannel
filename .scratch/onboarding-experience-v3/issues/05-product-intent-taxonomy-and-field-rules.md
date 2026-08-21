Type: grilling
Status: resolved

## Question

Nail down the product/use-case intent taxonomy that drives the new business-name-step intent capture (tickets 06-08 read this ticket's answer directly rather than re-deciding it). Resolve:

1. **The "products" list** shown as teaser cards directly below the business-name field on `app/signup/business-name/_client.tsx`. The user named two so far: in-store devices (POS/terminal), QR soundbox. What else belongs, if anything, and what copy/icon represents each?
2. **The "intents" list** offered as multi-select checkboxes in the "view more" side panel. The user named: accept payments online, use checkout, QR code generation, payment link. Is this the same list as (1) presented differently, a distinct list, or a superset of it?
3. **The field-dependency rule.** Confirmed so far: selecting "in-store devices" is the only thing that requires store address — the entire `store-verification` route plus its "Store details" preview section (`onboarding-preview.tsx`) becomes required only in that case; if "in-store devices" isn't selected, `store-verification` is skipped entirely (no shipping/store address collected at all, replacing today's unconditional generic shipping-address field). Confirm whether any *other* intent should ever gate a field, or whether "in-store devices → store address, everything else → nothing extra" is the complete rule for this pass.

Record the resolved taxonomy and rule as this ticket's answer.

## Answer

**Top-level categories** — this is the selection unit for both the teaser row on `app/signup/business-name/_client.tsx` and the field-dependency rule. Exactly four, no more:

1. **In-store devices** — POS terminal, QR code stickers, soundbox
2. **Online checkout**
3. **Payment links**
4. **Subscriptions**

**Side panel ("View more")** is a richer illustrated catalog for browsing — not a separate selection taxonomy and not its own selection mechanism (no "Add"/cart pattern; that was in the reference screenshot only to show real product content, not to dictate the interaction). Selection stays at the top-level category, one toggle per category, same four as the teaser row. Catalog structure, grounded in a real Pine Labs "Choose products that fit your business needs" reference screenshot (grouped sections; each card: image, tag, name, bullet-point description, "Know more" link):

- **In-store devices** splits into two illustrated sub-groups:
  - *Swipe machines*: A910 (tagged "Medium & large businesses"), A50, A920 — all "All payment modes • Compact and portable • supports 4G and wifi connection."
  - *QR devices*: Mini Pro (tagged "Small businesses"), Mini — same description pattern.
- **Online checkout** shown as *Online payment solutions*: Payment gateway (tagged "Express checkout"), Tap to Pay on iPhone ("Easy, secure and instant • Supported on Phone models XS and above only").
- **Payment links** and **Subscriptions** — no reference supplied for these two; ticket 06 invents one or two illustrative cards each in the same visual/card style (image, tag, name, bullet description) rather than leaving them empty or under-specified.

**Field-dependency rule** (confirmed, no changes from the ticket's draft): only "In-store devices" being selected gates anything — it requires the `store-verification` step (store address). Every other category, selected alone or in any combination with others, requires nothing extra. The rule keys off the top-level category only, never the specific product/model within it — e.g. selecting any item under Swipe machines or QR devices has the same effect (store address required); no per-model distinction exists in this pass.

Tickets 06, 07, and 08 read this answer directly.
