Type: prototype
Status: resolved
Blocked by: 07

## Question

Enhance the store-address capture on `app/onboarding/store-verification/_variant-a.tsx` (currently just a Google Maps link field feeding `profile.store.mapsLink`) to offer three ways to provide the address, all inline on the same page — no side panel, per explicit correction from the user:

1. Paste a Google Maps link (existing — keep as-is).
2. A "Use current location" button (browser Geolocation API; reverse-populate what's reasonably available — see the map's Out of scope for the accuracy bar).
3. A full manual address form entered inline on the same page: address line 1, address line 2, landmark, district, city, state, country, pincode.

Extend `profile.store` in `onboarding-profile.ts` to hold the structured manual-address fields alongside the existing `mapsLink` / `photoUrl` / `skipPhoto`, and update the `store` section of `onboarding-preview.tsx`'s preview panel to summarize whichever method was used. Match field naming/shape to the existing `StoreIdentity.address` convention in `lib/store-identity.ts` where sensible, without merging the two — that one is seeded account-settings data for a different domain.

## Answer

Implemented all three methods inline on `store-verification/_variant-a.tsx` using a `Tabs` control (`Maps link` / `Current location` / `Enter manually`) — no side panel:

1. **Maps link** — unchanged, kept as-is.
2. **Current location** — a "Use current location" button calling `navigator.geolocation.getCurrentPosition`. On success, captures `{ latitude, longitude }` and shows a confirmation row (coordinates formatted as `"1.2834° N, 103.8607° E"`) with an "Update" button to re-request; on failure or an unsupported browser, shows an inline destructive-text error. No reverse geocoding — matches the map's Out of scope (browser Geolocation API is enough for this prototype).
3. **Enter manually** — an 8-field form (`addressLine1`, `addressLine2`, `landmark`, `district`, `city`, `state`, `country`, `pincode`) in a 2-column grid, address-line/landmark fields spanning both columns. Required: line 1, city, state, country, pincode; optional: line 2, landmark, district. Field naming matches the precedent already in `components/onboarding/pos-onboarding-flow.tsx` (not `lib/store-identity.ts`'s flat `address: string`, which is a different, unrelated seeded dataset).

**Profile store shape** (`onboarding-profile.ts`): added `currentLocation: { latitude: number; longitude: number } | null` and `manualAddress: StoreManualAddress | null` next to the existing `mapsLink`. The active tab's `useEffect` writes only that method's field and explicitly nulls the other two, so exactly one is ever non-null at a time.

**Preview panel** (`onboarding-preview.tsx`): added `hasStoreAddress(store)` and `storeAddressSummary(store)` helpers — the former ORs all three fields for "is there an address" (used by `countConfirmedDetails` and the accordion section's `isComplete`), the latter returns `mapsLink`, a formatted `"Current location · <coordinates>"` string, or the joined manual-address parts, whichever is populated. Both the accordion section header and the expanded "Store location" content row now read through these helpers instead of `profile.store.mapsLink` directly.

Verified live in the browser: all three tabs render and switch correctly; filling the manual form updates the preview panel's "Store location" summary and the confirmed-details count in real time; the current-location error path renders correctly (geolocation permission denied in the sandboxed test browser, as expected). `npx tsc --noEmit` clean on all three touched files. Recorded in `docs/decisions/decision-log.md` entry 85.
