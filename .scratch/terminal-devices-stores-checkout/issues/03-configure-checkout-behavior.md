Type: grilling
Status: resolved

## Question

What does "Save details" on Configure checkout → Customisation actually do, and which of the branding controls need to be functionally live against the preview panel versus static/decorative?

Context: Configure checkout is locked as a merchant-wide singleton with no backend (matches this repo's standing no-real-persistence precedent). The mockup shows: a Dark mode toggle described as converting "the header in the dark mode versions," primary-color swatches and logo uploads for both Checkout branding and Wallet branding, a Wallet name text input, four Express checkout preference toggles, and a live mobile/desktop preview panel showing a real checkout mock (Croma order, Simpl/LazyPay/HDFC Credit Card payment options). Resolve:

- Does "Save details" persist the form state anywhere durable for this session (e.g. into the same shared data layer other settings modules might read later), or is it a stub that just shows a success toast and leaves the form as local component state?
- Does the Dark mode toggle actually restyle the live preview panel, or is the preview static regardless of the toggle?
- Do the primary-color swatches open a real color picker that updates the preview's accent color, or are they static/non-interactive swatches?
- Does the Wallet name input actually update the "My wallet" label anywhere in the preview, or is the preview fixed regardless of input?
- Do the four Express checkout preference toggles (contact/delivery details, recommended payment mode, edit contact, edit address) change what's rendered in the live preview, or are they inert switches?

## Answer

**Persistence:** Local component state only, no shared data layer — nothing else in the app reads checkout config. "Save details" shows a confirmation toast and nothing more.

**Live vs. decorative controls:**
- Live: Dark mode toggle (restyles the preview header, per the mockup's own functional copy); primary-color swatch (`<input type="color">`, updates the preview's header/pay-button color); "Show contact and delivery details" and "Show recommended payment mode" toggles (show/hide those rows in the preview).
- Decorative (no wiring): Wallet name input (the preview's default state never shows a wallet row — it's behind "View more payment options," not worth building out just to reach it); "Allow users to edit contact"/"Allow users to edit address" toggles (describe interaction permissions a static, non-interactive preview can't demonstrate); both logo uploads (static placeholder, consistent with the QR/paymodes-link stubs already locked on the map).

