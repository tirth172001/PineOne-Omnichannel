/** The ten seeded stores' identity (id/name/address only) — shared by lib/stores-data.ts
 *  (full StoreRecord) and lib/terminal-devices-data.ts (device rows reference a store by id
 *  and display its name/address), kept dependency-free so neither of those two lib files has
 *  to import the other. */
export type StoreIdentity = {
  storeId: string
  merchantId: string
  name: string
  address: string
}

export const STORE_IDENTITIES: StoreIdentity[] = [
  { storeId: "STR-738723324017", merchantId: "MER-738723327021", name: "PineLabs - Noida Kiosk", address: "PineLabs, Candor TechSpace, Noida, 584800" },
  { storeId: "STR-738723325028", merchantId: "MER-738723325032", name: "PineLabs - Sector 35", address: "PineLabs, Candor TechSpace, Noida, 584800" },
  { storeId: "STR-738723326039", merchantId: "MER-738723329043", name: "PineLabs - Sector 21", address: "PineLabs, Candor TechSpace, Noida, 584800" },
  { storeId: "STR-738723328041", merchantId: "MER-738723328045", name: "PineLabs - Sector 27", address: "PineLabs, Candor TechSpace, Noida, 584800" },
  { storeId: "STR-738723329052", merchantId: "MER-738723326047", name: "PineLabs - Sector 10", address: "PineLabs, Candor TechSpace, Noida, 584800" },
  { storeId: "STR-738723331063", merchantId: "MER-738723332058", name: "PineLabs - Sector 15", address: "PineLabs, Candor TechSpace, Noida, 584800" },
  { storeId: "STR-738723332074", merchantId: "MER-738723330061", name: "PineLabs - Sector 12", address: "PineLabs, Candor TechSpace, Noida, 584800" },
  { storeId: "STR-738723330085", merchantId: "MER-738723331072", name: "PineLabs - Sector 32", address: "PineLabs, Candor TechSpace, Noida, 584800" },
  { storeId: "STR-738723327096", merchantId: "MER-738723333083", name: "PineLabs - Sector 22", address: "PineLabs, Candor TechSpace, Noida, 584800" },
  { storeId: "STR-738723323017", merchantId: "MER-738723324094", name: "PineLabs - Sector 11", address: "PineLabs, Candor TechSpace, Noida, 584800" },
]

export function findStoreIdentity(storeId: string) {
  return STORE_IDENTITIES.find((store) => store.storeId === storeId)
}
