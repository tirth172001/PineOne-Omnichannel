import { STORE_IDENTITIES } from "@/lib/store-identity"
import { countDevicesForStore } from "@/lib/terminal-devices-data"
import { usersInvitedCount } from "@/lib/user-roster-data"

export type StoreStatus = "Active" | "Inactive"

export type StoreRecord = {
  id: string
  storeId: string
  merchantId: string
  name: string
  address: string
  status: StoreStatus
  createdOnDate: string
  createdOnTime: string
}

const CREATED_ON: Array<{ date: string; time: string }> = [
  { date: "14 Jun 2026", time: "09:45 AM" },
  { date: "18 Jun 2026", time: "04:20 PM" },
  { date: "20 Jun 2026", time: "06:25 PM" },
  { date: "12 Jun 2026", time: "10:14 AM" },
  { date: "19 Jun 2026", time: "05:10 PM" },
  { date: "15 Jun 2026", time: "01:30 PM" },
  { date: "16 Jun 2026", time: "02:15 PM" },
  { date: "13 Jun 2026", time: "11:00 PM" },
  { date: "21 Jun 2026", time: "07:40 PM" },
  { date: "17 Jun 2026", time: "03:00 PM" },
]

export const STORE_RECORDS: StoreRecord[] = STORE_IDENTITIES.map((store, index) => ({
  id: `store-${index + 1}`,
  storeId: store.storeId,
  merchantId: store.merchantId,
  name: store.name,
  address: store.address,
  status: "Active",
  createdOnDate: CREATED_ON[index % CREATED_ON.length].date,
  createdOnTime: CREATED_ON[index % CREATED_ON.length].time,
}))

export function findStoreByStoreId(storeId: string) {
  return STORE_RECORDS.find((store) => store.storeId === storeId)
}

/** Live-computed, not stored — can't drift out of sync with the device/roster data. */
export function terminalsLinkedCount(storeId: string) {
  return countDevicesForStore(storeId)
}

/** Live-computed, not stored — can't drift out of sync with the device/roster data. */
export function usersInvitedForStore(storeId: string) {
  return usersInvitedCount(storeId)
}
