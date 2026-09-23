Type: prototype
Status: open
Blocked by: 01

## Question

Build the More tab per the IA mapping in ticket 02 — the catch-all for everything that isn't Overview/Payments/Reports/Support:

- Product activation/config: `products`, `online-products` (qr-codes, smart-routing, third-party-product), and each channel's own setup screens (checkout activation, offline-payments device/store management, etc.)
- `partners`
- `account`, `account-settings`, `settings`
- `disputes` (explicitly placed here per ticket 02, not in Payments)

This is the largest, most heterogeneous tab — likely worth its own sub-navigation (a menu/list screen linking out to each section) rather than one flat screen. Confirm that structure against the Figma file's More frames if they exist before building.
