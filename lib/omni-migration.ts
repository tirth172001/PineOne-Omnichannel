/**
 * Omni roles/permissions migration model.
 *
 * Permission data and default role definitions live in lib/role-permissions.ts
 * (transcribed from the legacy systems' real permission matrix/UI). This file
 * only models the migration RULES, based on the PRD's worked examples and the
 * confirmed decisions:
 *   - Only a Owner+Owner pair on both channels elevates to full Omni access.
 *   - Every other combination is a straight union of whatever permissions the
 *     user already had — migration never invents new access.
 *   - Single-channel users keep their existing role untouched.
 */

import {
  ALL_PERMISSIONS,
  OFFLINE_ROLE_PERMISSIONS,
  ONLINE_ROLE_PERMISSIONS,
  computeAccessScope,
  keysFor,
  unionKeys,
  type AccessScope,
} from "@/lib/role-permissions"

export { computeAccessScope, type AccessScope } from "@/lib/role-permissions"

export type RoleType = "system_default" | "system_omni" | "custom_migrated" | "custom"

export type MigratedRole = {
  name: string
  roleType: RoleType
  permissionKeys: string[]
}

export type ChannelAssignment = {
  roleName: string
  permissionKeys: string[]
  isCustom?: boolean
} | null

export function migrateUser(
  offline: ChannelAssignment,
  online: ChannelAssignment
): { role: MigratedRole; comment: string } {
  if (offline && !online) {
    return {
      role: {
        name: offline.roleName,
        roleType: offline.isCustom ? "custom" : "system_default",
        permissionKeys: offline.permissionKeys,
      },
      comment: `Migrated user will only have ${offline.roleName} permissions`,
    }
  }

  if (online && !offline) {
    return {
      role: {
        name: online.roleName,
        roleType: online.isCustom ? "custom" : "system_default",
        permissionKeys: online.permissionKeys,
      },
      comment: online.isCustom
        ? `Migrated user will only have existing Online custom role - ${online.roleName} permission`
        : `Migrated user will only have existing Online ${online.roleName} permissions`,
    }
  }

  if (offline && online) {
    if (offline.roleName === "Owner" && online.roleName === "Owner") {
      return {
        role: { name: "[Omni] Owner", roleType: "system_omni", permissionKeys: keysFor(ALL_PERMISSIONS) },
        comment: "Will have all the Online & Offline permissions",
      }
    }

    const permissionKeys = unionKeys(offline.permissionKeys, online.permissionKeys)
    const name = `[Offline] ${offline.roleName} + [Online] ${online.roleName}`

    return {
      role: { name, roleType: "custom_migrated", permissionKeys },
      comment:
        offline.roleName === online.roleName
          ? `Migrated user will have a union of permissions for Offline ${offline.roleName} and Online ${online.roleName}`
          : `Will have Offline ${offline.roleName} permissions + Online ${online.roleName} permissions`,
    }
  }

  throw new Error("migrateUser requires at least one channel assignment")
}

/** Permission sets for the two illustrative custom roles used only in the seed data below
 *  (the PRD names them as pre-existing custom roles on the online side, not defaults). */
const SEED_CUSTOM_ONLINE_PERMISSIONS: Record<string, string[]> = {
  Accountant: [
    "online:view_all_transactions",
    "online:view_merchant_gateway",
    "online:create_refund",
  ],
  Analytics: ["online:view_all_transactions", "online:view_merchant_gateway"],
}

function offlineRole(roleName: string): NonNullable<ChannelAssignment> {
  return { roleName, permissionKeys: OFFLINE_ROLE_PERMISSIONS[roleName] ?? [], isCustom: false }
}

function onlineRole(roleName: string, isCustom = false): NonNullable<ChannelAssignment> {
  const permissionKeys = isCustom
    ? SEED_CUSTOM_ONLINE_PERMISSIONS[roleName] ?? []
    : ONLINE_ROLE_PERMISSIONS[roleName] ?? []
  return { roleName, permissionKeys, isCustom }
}

export type MigrationScenario = "true_omni" | "offline_only" | "online_only"
export type MigrationStatus = "pending" | "approved" | "overridden"

export type MigrationAuditRow = {
  id: string
  scenario: MigrationScenario
  offlineEmail: string | null
  onlineEmail: string | null
  offlineRoleName: string | null
  onlineRoleName: string | null
  migratedRole: MigratedRole
  accessScope: AccessScope
  comment: string
  status: MigrationStatus
}

function buildRow(
  id: string,
  scenario: MigrationScenario,
  offlineEmail: string | null,
  onlineEmail: string | null,
  offline: ChannelAssignment,
  online: ChannelAssignment
): MigrationAuditRow {
  const { role, comment } = migrateUser(offline, online)
  return {
    id,
    scenario,
    offlineEmail,
    onlineEmail,
    offlineRoleName: offline?.roleName ?? null,
    onlineRoleName: online?.roleName ?? null,
    migratedRole: role,
    accessScope: computeAccessScope(role.permissionKeys),
    comment,
    status: "pending",
  }
}

/** Seed data mirroring the PRD's worked examples exactly, run through migrateUser(). */
export const MIGRATION_AUDIT_SEED: MigrationAuditRow[] = [
  buildRow(
    "true-omni-1",
    "true_omni",
    "himanjali@pinelabs.com",
    "himanjali@pinelabs.com",
    offlineRole("Owner"),
    onlineRole("Owner")
  ),
  buildRow(
    "true-omni-2",
    "true_omni",
    "himanjali@pinelabs.com",
    "himanjali@pinelabs.com",
    offlineRole("Owner"),
    onlineRole("Finance")
  ),
  buildRow(
    "true-omni-3a",
    "true_omni",
    "himanjali@pinelabs.com",
    "tirth@pinelabs.com",
    offlineRole("Owner"),
    onlineRole("Owner")
  ),
  buildRow(
    "true-omni-4",
    "true_omni",
    "samir@pinelabs.com",
    "samir@pinelabs.com",
    offlineRole("Accountant"),
    onlineRole("Accountant", true)
  ),
  buildRow("true-omni-5", "true_omni", "kapil@pinelabs.com", null, offlineRole("Store Cashier"), null),
  buildRow("true-omni-6", "true_omni", null, "kapil@pinelabs.com", null, onlineRole("Support")),
  buildRow("true-omni-7", "true_omni", null, "kapil@pinelabs.com", null, onlineRole("Analytics", true)),

  buildRow("offline-only-1", "offline_only", "himanjali@pinelabs.com", null, offlineRole("Owner"), null),
  buildRow("offline-only-2", "offline_only", "himanjali@pinelabs.com", null, offlineRole("Accountant"), null),
  buildRow("offline-only-3", "offline_only", "himanjali@pinelabs.com", null, offlineRole("Store Manager"), null),

  buildRow("online-only-1", "online_only", null, "himanjali@pinelabs.com", null, onlineRole("Owner")),
  buildRow("online-only-2", "online_only", null, "himanjali@pinelabs.com", null, onlineRole("Accountant", true)),
  buildRow("online-only-3", "online_only", null, "himanjali@pinelabs.com", null, onlineRole("Support")),
]

export const MIGRATION_SCENARIO_LABELS: Record<MigrationScenario, string> = {
  true_omni: "True Omni account",
  offline_only: "Offline MID only",
  online_only: "Online MID only",
}

export type RoleOption = {
  name: string
  roleType: RoleType
  permissionKeys: string[]
}

/** Fixed role catalog an admin can pick from when manually overriding a proposed migration row. */
export const OVERRIDE_ROLE_OPTIONS: RoleOption[] = [
  { name: "[Omni] Owner", roleType: "system_omni", permissionKeys: keysFor(ALL_PERMISSIONS) },
  ...Object.entries(OFFLINE_ROLE_PERMISSIONS).map(([name, permissionKeys]) => ({
    name: `${name} (Offline)`,
    roleType: "system_default" as RoleType,
    permissionKeys,
  })),
  ...Object.entries(ONLINE_ROLE_PERMISSIONS).map(([name, permissionKeys]) => ({
    name: `${name} (Online)`,
    roleType: "system_default" as RoleType,
    permissionKeys,
  })),
]
