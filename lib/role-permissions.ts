/**
 * Shared permission catalog for the Omni roles system.
 *
 * Offline permissions + the 7-role default matrix are transcribed directly from
 * the legacy in-store "Create user" role cards and permission table. Online
 * permissions and the Owner/Operations/Finance/Support matrix are transcribed
 * directly from the legacy online "Create/Update Role" permission table (themed
 * as Transactions & Settlements, Refunds, Gateway Management, Routing Logic,
 * Merchant Settings & Configuration, User & Role Management, Payment Links,
 * Payouts & Beneficiaries, IMEI, Partner Management, Reports, Credentials).
 * Labels are the user-facing versions of that table, not its raw permission names.
 */

export type PermissionChannel = "offline" | "online"

export type Permission = {
  key: string
  label: string
  channel: PermissionChannel
  group: string
}

export const OFFLINE_PERMISSIONS: Permission[] = [
  // Transactions & Settlements — same group name as its online counterpart
  { key: "offline:transactions", label: "Transactions", channel: "offline", group: "Transactions & Settlements" },
  { key: "offline:void_transaction", label: "Void Transaction", channel: "offline", group: "Transactions & Settlements" },
  { key: "offline:pbl_transaction", label: "PBL Transaction", channel: "offline", group: "Transactions & Settlements" },
  { key: "offline:cloud_transaction", label: "Cloud Transaction", channel: "offline", group: "Transactions & Settlements" },
  { key: "offline:settlements", label: "Settlements", channel: "offline", group: "Transactions & Settlements" },
  // Refunds
  { key: "offline:refunds", label: "Refunds", channel: "offline", group: "Refunds" },
  { key: "offline:refunds_view", label: "Refunds View", channel: "offline", group: "Refunds" },
  { key: "offline:refunds_initiate", label: "Refunds Initiate", channel: "offline", group: "Refunds" },
  { key: "offline:refunds_approve", label: "Refunds Approve", channel: "offline", group: "Refunds" },
  // Reports
  { key: "offline:reports", label: "Reports", channel: "offline", group: "Reports" },
  { key: "offline:mpr", label: "MPR", channel: "offline", group: "Reports" },
  // User & Role Management
  { key: "offline:user_management", label: "User Management", channel: "offline", group: "User & Role Management" },
  // Merchant Settings & Configuration
  { key: "offline:settings", label: "Settings", channel: "offline", group: "Merchant Settings & Configuration" },
  // Account — personal/account-level, no online equivalent
  { key: "offline:profile", label: "Profile", channel: "offline", group: "Account" },
  { key: "offline:notifications", label: "Notifications", channel: "offline", group: "Account" },
  { key: "offline:financial_details", label: "Financial Details", channel: "offline", group: "Account" },
  // In-store-only concepts — kept as their own groups since no online equivalent exists
  { key: "offline:service_request_management", label: "Service Request Management", channel: "offline", group: "Service Requests" },
  { key: "offline:campaigns_and_offers", label: "Campaigns and Offers", channel: "offline", group: "Campaigns & Offers" },
  { key: "offline:emi_world_access", label: "EMI World Access", channel: "offline", group: "EMI World" },
]

export const ONLINE_PERMISSIONS: Permission[] = [
  // Transactions & Settlements
  { key: "online:view_all_transactions", label: "View All Transactions", channel: "online", group: "Transactions & Settlements" },
  { key: "online:view_settlement", label: "View Settlements", channel: "online", group: "Transactions & Settlements" },
  // Refunds
  { key: "online:initiate_refund", label: "Initiate Refunds", channel: "online", group: "Refunds" },
  { key: "online:create_refund", label: "Create Refunds", channel: "online", group: "Refunds" },
  { key: "online:create_bulk_refund", label: "Create Bulk Refunds", channel: "online", group: "Refunds" },
  { key: "online:view_bulk_refund", label: "View Bulk Refunds", channel: "online", group: "Refunds" },
  // Gateway Management
  { key: "online:view_merchant_gateway", label: "View Gateway Configuration", channel: "online", group: "Gateway Management" },
  { key: "online:update_merchant_config", label: "Update Gateway Configuration", channel: "online", group: "Gateway Management" },
  { key: "online:create_gateways", label: "Create Payment Gateways", channel: "online", group: "Gateway Management" },
  { key: "online:activation_deactivation", label: "Activate/Deactivate Gateways", channel: "online", group: "Gateway Management" },
  { key: "online:create_bin_issuer_brand", label: "Create BIN/Issuer/Brand Routes", channel: "online", group: "Gateway Management" },
  // Routing Logic
  { key: "online:update_delete_preference_routes", label: "Manage Preference Routes", channel: "online", group: "Routing Logic" },
  { key: "online:update_preference_priority", label: "Update Preference Priority", channel: "online", group: "Routing Logic" },
  { key: "online:update_delete_custom_routing", label: "Manage Custom Routing Logic", channel: "online", group: "Routing Logic" },
  // Merchant Settings & Configuration
  { key: "online:update_merchant_settings", label: "Update Merchant Settings", channel: "online", group: "Merchant Settings & Configuration" },
  { key: "online:update_general_settings", label: "Update General Settings", channel: "online", group: "Merchant Settings & Configuration" },
  { key: "online:update_webhook_settings", label: "Update Webhook Settings", channel: "online", group: "Merchant Settings & Configuration" },
  { key: "online:update_checkout_theme", label: "Update Checkout Theme", channel: "online", group: "Merchant Settings & Configuration" },
  // User & Role Management
  { key: "online:create_user", label: "Invite Users", channel: "online", group: "User & Role Management" },
  { key: "online:create_role", label: "Create Roles", channel: "online", group: "User & Role Management" },
  { key: "online:update_delete_users", label: "Edit & Remove Users", channel: "online", group: "User & Role Management" },
  // Payment Links
  { key: "online:create_payment_links", label: "Create Payment Links", channel: "online", group: "Payment Links" },
  { key: "online:customize_payment_links", label: "Customize Payment Links", channel: "online", group: "Payment Links" },
  { key: "online:manage_payment_link", label: "Manage Payment Links", channel: "online", group: "Payment Links" },
  // Payouts & Beneficiaries
  { key: "online:create_beneficiaries", label: "Add Beneficiaries", channel: "online", group: "Payouts & Beneficiaries" },
  { key: "online:approve_reject_beneficiaries", label: "Approve/Reject Beneficiaries", channel: "online", group: "Payouts & Beneficiaries" },
  { key: "online:create_payouts", label: "Create Payouts", channel: "online", group: "Payouts & Beneficiaries" },
  { key: "online:approve_reject_payouts", label: "Approve/Reject Payouts", channel: "online", group: "Payouts & Beneficiaries" },
  { key: "online:create_individual_payout", label: "Create Individual Payout", channel: "online", group: "Payouts & Beneficiaries" },
  { key: "online:create_bulk_payout", label: "Create Bulk Payout", channel: "online", group: "Payouts & Beneficiaries" },
  // IMEI
  { key: "online:verify_imei", label: "Verify IMEI", channel: "online", group: "IMEI" },
  { key: "online:create_bulk_imei", label: "Create Bulk IMEI Records", channel: "online", group: "IMEI" },
  { key: "online:view_bulk_imei", label: "View Bulk IMEI Records", channel: "online", group: "IMEI" },
  // Partner Management
  { key: "online:create_partner_user", label: "Invite Partner Users", channel: "online", group: "Partner Management" },
  { key: "online:create_partner_role", label: "Create Partner Roles", channel: "online", group: "Partner Management" },
  { key: "online:update_delete_partner_user", label: "Edit & Remove Partner Users", channel: "online", group: "Partner Management" },
  { key: "online:generate_partner_reports", label: "Generate Partner Reports", channel: "online", group: "Partner Management" },
  // Reports
  { key: "online:get_mpr", label: "Download MPR", channel: "online", group: "Reports" },
  { key: "online:generate_reports", label: "Generate Reports", channel: "online", group: "Reports" },
  // Credentials
  { key: "online:view_credentials", label: "View API Credentials", channel: "online", group: "Credentials" },
]

export const ALL_PERMISSIONS: Permission[] = [...OFFLINE_PERMISSIONS, ...ONLINE_PERMISSIONS]

/** Shared groups (used by both channels for the same underlying concept) come first,
 *  so a permission's "home" reads the same regardless of which channel you're in —
 *  followed by groups that only exist on one side because the feature is channel-only. */
export const PERMISSION_GROUPS = [
  // Shared across both channels
  "Transactions & Settlements",
  "Refunds",
  "Reports",
  "User & Role Management",
  "Merchant Settings & Configuration",
  "Account",
  // In-store only
  "Service Requests",
  "Campaigns & Offers",
  "EMI World",
  // Online only
  "Gateway Management",
  "Routing Logic",
  "Payment Links",
  "Payouts & Beneficiaries",
  "IMEI",
  "Partner Management",
  "Credentials",
] as const

const OFFLINE_KEY_BY_LABEL = new Map(OFFLINE_PERMISSIONS.map((p) => [p.label, p.key]))
const ONLINE_KEY_BY_LABEL = new Map(ONLINE_PERMISSIONS.map((p) => [p.label, p.key]))

function offlineKeys(...labels: string[]) {
  return labels.map((label) => {
    const key = OFFLINE_KEY_BY_LABEL.get(label)
    if (!key) throw new Error(`Unknown offline permission label: ${label}`)
    return key
  })
}

function onlineKeys(...labels: string[]) {
  return labels.map((label) => {
    const key = ONLINE_KEY_BY_LABEL.get(label)
    if (!key) throw new Error(`Unknown online permission label: ${label}`)
    return key
  })
}

export function keysFor(permissions: Permission[]) {
  return permissions.map((permission) => permission.key)
}

export function unionKeys(a: string[], b: string[]) {
  return Array.from(new Set([...a, ...b]))
}

export type AccessScope = "In-store" | "Online" | "In-store and Online"

export function computeAccessScope(permissionKeys: string[]): AccessScope {
  const hasOffline = permissionKeys.some((key) => key.startsWith("offline:"))
  const hasOnline = permissionKeys.some((key) => key.startsWith("online:"))
  if (hasOffline && hasOnline) return "In-store and Online"
  if (hasOffline) return "In-store"
  return "Online"
}

/** Transcribed 1:1 from the legacy in-store permission matrix. */
export const OFFLINE_ROLE_PERMISSIONS: Record<string, string[]> = {
  Owner: keysFor(OFFLINE_PERMISSIONS),
  Admin: offlineKeys(
    "Transactions", "Void Transaction", "PBL Transaction", "Cloud Transaction", "Refunds",
    "Settlements", "Reports", "MPR", "Settings", "Profile", "Notifications",
    "Financial Details", "Service Request Management", "User Management", "Campaigns and Offers", "EMI World Access"
  ),
  "Store Manager": offlineKeys(
    "Transactions", "Void Transaction", "PBL Transaction", "Refunds", "Settlements", "Reports",
    "Settings", "Profile", "Notifications", "Financial Details", "Service Request Management",
    "User Management", "EMI World Access"
  ),
  "User Admin": offlineKeys("Settings", "Profile", "User Management"),
  "Store Cashier": offlineKeys(
    "Transactions", "PBL Transaction", "Settings", "Profile", "Notifications",
    "Financial Details", "Service Request Management", "EMI World Access"
  ),
  Accountant: offlineKeys(
    "Transactions", "Settlements", "Reports", "MPR", "Settings", "Profile", "Notifications", "Financial Details"
  ),
  "EMI World User": offlineKeys("EMI World Access"),
}

/** Transcribed 1:1 from the legacy online permission matrix. */
export const ONLINE_ROLE_PERMISSIONS: Record<string, string[]> = {
  Owner: keysFor(ONLINE_PERMISSIONS),
  Operations: onlineKeys("View All Transactions", "Generate Reports"),
  Finance: onlineKeys("Update Gateway Configuration", "Generate Reports"),
  Support: onlineKeys("Initiate Refunds", "View Gateway Configuration", "Generate Reports"),
}

export type RoleCatalogSystem = "offline" | "online"

export type RoleCatalogEntry = {
  id: string
  name: string
  system: RoleCatalogSystem
  description: string
  permissionKeys: string[]
}

export const DEFAULT_ROLE_CATALOG: RoleCatalogEntry[] = [
  { id: "cat-off-owner", name: "Owner", system: "offline", description: "Full access to every in-store feature, including refund approvals.", permissionKeys: OFFLINE_ROLE_PERMISSIONS.Owner },
  { id: "cat-off-admin", name: "Admin", system: "offline", description: "Manages users, downloads reports and MPR, handles service tickets.", permissionKeys: OFFLINE_ROLE_PERMISSIONS.Admin },
  { id: "cat-off-store-manager", name: "Store Manager", system: "offline", description: "Views transactions and settlements, processes refunds, manages cashiers for a store.", permissionKeys: OFFLINE_ROLE_PERMISSIONS["Store Manager"] },
  { id: "cat-off-user-admin", name: "User Admin", system: "offline", description: "Views, creates, manages and deletes users.", permissionKeys: OFFLINE_ROLE_PERMISSIONS["User Admin"] },
  { id: "cat-off-store-cashier", name: "Store Cashier", system: "offline", description: "Views transactions and raises service requests for a store.", permissionKeys: OFFLINE_ROLE_PERMISSIONS["Store Cashier"] },
  { id: "cat-off-accountant", name: "Accountant", system: "offline", description: "Downloads reports, processes refunds, views past transactions and settlement history.", permissionKeys: OFFLINE_ROLE_PERMISSIONS.Accountant },
  { id: "cat-off-emi-world-user", name: "EMI World User", system: "offline", description: "Exclusive user for EMI World — access limited to EMI World only.", permissionKeys: OFFLINE_ROLE_PERMISSIONS["EMI World User"] },
  { id: "cat-on-owner", name: "Online Owner", system: "online", description: "Full access to every online feature — transactions, refunds, gateways, routing, payouts, IMEI, partners, and reports.", permissionKeys: ONLINE_ROLE_PERMISSIONS.Owner },
  { id: "cat-on-operations", name: "Operations", system: "online", description: "Views all transactions and generates reports.", permissionKeys: ONLINE_ROLE_PERMISSIONS.Operations },
  { id: "cat-on-finance", name: "Finance", system: "online", description: "Updates gateway configuration and generates reports.", permissionKeys: ONLINE_ROLE_PERMISSIONS.Finance },
  { id: "cat-on-support", name: "Support", system: "online", description: "Initiates refunds, views gateway configuration, and generates reports.", permissionKeys: ONLINE_ROLE_PERMISSIONS.Support },
]
