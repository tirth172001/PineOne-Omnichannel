import { computeAccessScope, DEFAULT_ROLE_CATALOG } from "@/lib/role-permissions"
import { STORE_IDENTITIES } from "@/lib/store-identity"

/** "Pending" = requested access during onboarding (e.g. tried to open a store) and is
 *  waiting on an admin to approve or reject — distinct from "Invited", which is an
 *  admin-initiated invite waiting on the invitee to accept. */
export type UserStatus = "Active" | "Invited" | "Deactivated" | "Pending"

export type RosterEntry = {
  id: string
  name: string
  email: string
  phone?: string
  addedOnDate: string
  addedOnTime: string
  scope: string
  role: string
  status: UserStatus
  /** Stores this user is assigned to, for Manage stores' store-detail Users tab and for
   *  roles with in-store access. Undefined/empty for merchant-wide or online-only users. */
  storeIds?: string[]
}

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function formatTime(hour24: number, minute: number) {
  const period = hour24 >= 12 ? "PM" : "AM"
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`
}

function scopeForRoleName(roleName: string): string {
  const entry = DEFAULT_ROLE_CATALOG.find((role) => role.name === roleName)
  return entry ? computeAccessScope(entry.permissionKeys) : "In-store"
}

const FIRST_NAMES = [
  "Karan", "Rajesh", "Siddharth", "Maya", "Priya", "Neha", "Aditi", "Tirth", "Vinay", "Ananya",
  "Rohan", "Kavita", "Arjun", "Sneha", "Vikram", "Pooja", "Manish", "Divya", "Suresh", "Meera",
  "Rahul", "Isha", "Nikhil", "Shreya", "Amit", "Ritu", "Sanjay", "Pallavi", "Gaurav", "Swati",
]
const LAST_NAMES = [
  "Joshi", "Kumar", "Mehta", "Patel", "Singh", "Verma", "Sharma", "Trivedi", "Bansal", "Iyer",
  "Nair", "Reddy", "Gupta", "Chawla", "Malhotra", "Kapoor", "Rao", "Desai", "Pillai", "Chopra",
]
const EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]
/** Mix of offline and online predefined role names — must match DEFAULT_ROLE_CATALOG entries exactly. */
const ROLE_CYCLE = [
  "Admin", "Store Manager", "Owner", "User Admin", "Accountant", "Store Cashier", "Operations", "Finance", "Support",
]

const SEED_STORE_IDS = STORE_IDENTITIES.map((store) => store.storeId)

const SEED_ROSTER: RosterEntry[] = [
  { id: "role-0", name: "Admin", email: "tirthtrivedi17@gmail.com", addedOnDate: "19 Jun 2026", addedOnTime: "10:12 PM", scope: scopeForRoleName("Admin"), role: "Admin", status: "Active" },
  { id: "role-1", name: "Karan Joshi", email: "karanjoshi77@gmail.com", addedOnDate: "23 Jun 2026", addedOnTime: "01:20 PM", scope: scopeForRoleName("Store Manager"), role: "Store Manager", status: "Active", storeIds: [SEED_STORE_IDS[0]] },
  { id: "role-2", name: "Rajesh Kumar", email: "rajeshkumar84@yahoo.com", addedOnDate: "22 Jun 2026", addedOnTime: "09:45 AM", scope: scopeForRoleName("Owner"), role: "Owner", status: "Active" },
  { id: "role-3", name: "Siddharth Mehta", email: "siddharthmehta01@gmail.com", addedOnDate: "26 Jun 2026", addedOnTime: "12:00 PM", scope: scopeForRoleName("User Admin"), role: "User Admin", status: "Active" },
  { id: "role-4", name: "Maya Patel", email: "mayapatel92@gmail.com", addedOnDate: "24 Jun 2026", addedOnTime: "03:50 PM", scope: scopeForRoleName("Accountant"), role: "Accountant", status: "Active" },
  { id: "role-5", name: "Priya Singh", email: "priyasingh65@yahoo.com", addedOnDate: "21 Jun 2026", addedOnTime: "02:30 PM", scope: scopeForRoleName("Store Cashier"), role: "Store Cashier", status: "Active", storeIds: [SEED_STORE_IDS[0], SEED_STORE_IDS[2]] },
  { id: "role-6", name: "Neha Verma", email: "nehaverma88@outlook.com", addedOnDate: "27 Jun 2026", addedOnTime: "04:30 PM", scope: scopeForRoleName("Admin"), role: "Admin", status: "Active", storeIds: [SEED_STORE_IDS[1]] },
  { id: "role-7", name: "Aditi Sharma", email: "aditisharma99@hotmail.com", addedOnDate: "20 Jun 2026", addedOnTime: "11:15 AM", scope: "In-store", role: "Admin", status: "Invited", storeIds: [SEED_STORE_IDS[1]] },
  { id: "role-8", name: "Tirth Trivedi", email: "tirthtrivedi17@gmail.com", addedOnDate: "25 Jun 2026", addedOnTime: "08:00 AM", scope: "In-store", role: "Admin", status: "Active" },
  { id: "role-9", name: "Vinay Bansal", email: "vinaybansal44@hotmail.com", addedOnDate: "28 Jun 2026", addedOnTime: "05:55 PM", scope: "In-store", role: "Admin", status: "Active" },
  {
    id: "role-pending-1",
    name: "Ishaan Kapoor",
    email: "ishaankapoor21@gmail.com",
    phone: "9876500011",
    addedOnDate: "26 Aug 2026",
    addedOnTime: "10:05 AM",
    scope: scopeForRoleName("Store Cashier"),
    role: "Store Cashier",
    status: "Pending",
    storeIds: [SEED_STORE_IDS[3]],
  },
  {
    id: "role-pending-2",
    name: "Fatima Sheikh",
    email: "fatimasheikh64@outlook.com",
    phone: "9876500022",
    addedOnDate: "27 Aug 2026",
    addedOnTime: "03:40 PM",
    scope: scopeForRoleName("Store Manager"),
    role: "Store Manager",
    status: "Pending",
    storeIds: [SEED_STORE_IDS[4]],
  },
]

function buildGeneratedRosterEntry(index: number): RosterEntry {
  const first = FIRST_NAMES[index % FIRST_NAMES.length]
  const last = LAST_NAMES[(index * 3 + 7) % LAST_NAMES.length]
  const domain = EMAIL_DOMAINS[(index * 2 + 1) % EMAIL_DOMAINS.length]
  const role = ROLE_CYCLE[(index * 5 + 2) % ROLE_CYCLE.length]
  const scope = scopeForRoleName(role)
  const day = (index % 27) + 1
  const month = MONTHS[(index * 7 + 3) % MONTHS.length]
  const hour = (index * 3 + 6) % 24
  const minute = (index * 11) % 60

  return {
    id: `role-${index}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}${last.toLowerCase()}${index}@${domain}`,
    addedOnDate: `${day} ${month} 2026`,
    addedOnTime: formatTime(hour, minute),
    scope,
    role,
    status: index % 13 === 0 ? "Deactivated" : index % 7 === 0 ? "Invited" : "Active",
    storeIds: [SEED_STORE_IDS[index % SEED_STORE_IDS.length]],
  }
}

export const INITIAL_ROSTER: RosterEntry[] = [
  ...SEED_ROSTER,
  ...Array.from({ length: 90 }, (_, i) => buildGeneratedRosterEntry(i + 10)),
]

export function usersForStore(storeId: string, roster: RosterEntry[] = INITIAL_ROSTER) {
  return roster.filter((entry) => entry.storeIds?.includes(storeId))
}

export function usersInvitedCount(storeId: string, roster: RosterEntry[] = INITIAL_ROSTER) {
  return roster.filter((entry) => entry.storeIds?.includes(storeId) && entry.status !== "Deactivated").length
}
