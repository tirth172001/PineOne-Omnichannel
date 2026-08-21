"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SectionSummaryStrip, type SectionSummaryMetric } from "@/components/dashboard/section-summary-strip"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/panels"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { CaretRightIcon, DotsThreeVerticalIcon, MagnifyingGlassIcon } from "@phosphor-icons/react"
type RoleRecord = {
  id: string
  roleName: string
  scope: string
  permissions: string[]
  usersAssigned: number
  createdOn: string
  lastModifiedOn: string
  createdBy: string
  isCustom: boolean
}

type PermissionDefinition = {
  key: string
  label: string
  group: "Payments" | "Operations" | "Admin" | "Support"
}

const PERMISSION_GROUP_ORDER = ["Payments", "Operations", "Admin", "Support"] as const

const PERMISSION_CATALOG: PermissionDefinition[] = [
  { key: "transactions:view", label: "View transactions", group: "Payments" },
  { key: "transactions:refund", label: "Initiate refunds", group: "Payments" },
  { key: "settlements:view", label: "View settlements", group: "Payments" },
  { key: "disputes:resolve", label: "Resolve disputes", group: "Operations" },
  { key: "reports:download", label: "Download reports", group: "Operations" },
  { key: "devices:manage", label: "Manage POS devices", group: "Operations" },
  { key: "users:invite", label: "Invite users", group: "Admin" },
  { key: "users:approve", label: "Approve users", group: "Admin" },
  { key: "roles:manage", label: "Manage user roles", group: "Admin" },
  { key: "support:tickets", label: "Manage support tickets", group: "Support" },
]

const INITIAL_ROLE_RECORDS: RoleRecord[] = [
  {
    id: "role-admin",
    roleName: "Admin",
    scope: "All stores",
    permissions: [
      "transactions:view",
      "transactions:refund",
      "settlements:view",
      "disputes:resolve",
      "reports:download",
      "devices:manage",
      "users:invite",
      "users:approve",
      "roles:manage",
    ],
    usersAssigned: 4,
    createdOn: "14 Jan 2026, 11:22 AM",
    lastModifiedOn: "12 Apr 2026, 5:34 PM",
    createdBy: "System",
    isCustom: false,
  },
  {
    id: "role-store-manager",
    roleName: "Store Manager",
    scope: "Assigned stores",
    permissions: [
      "transactions:view",
      "transactions:refund",
      "settlements:view",
      "disputes:resolve",
      "reports:download",
      "devices:manage",
    ],
    usersAssigned: 7,
    createdOn: "28 Feb 2026, 2:08 PM",
    lastModifiedOn: "09 Apr 2026, 9:18 AM",
    createdBy: "Rahul Sharma",
    isCustom: false,
  },
  {
    id: "role-store-cashier",
    roleName: "Store Cashier",
    scope: "Single store",
    permissions: ["transactions:view", "transactions:refund", "reports:download"],
    usersAssigned: 16,
    createdOn: "02 Mar 2026, 4:21 PM",
    lastModifiedOn: "15 Apr 2026, 10:05 AM",
    createdBy: "Rahul Sharma",
    isCustom: false,
  },
  {
    id: "role-finance-ops",
    roleName: "Finance Ops",
    scope: "All stores",
    permissions: ["transactions:view", "settlements:view", "reports:download"],
    usersAssigned: 2,
    createdOn: "10 Apr 2026, 6:34 PM",
    lastModifiedOn: "13 Apr 2026, 8:18 AM",
    createdBy: "Rahul Sharma",
    isCustom: true,
  },
]

function formatNowLabel() {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date())
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="border-y border-border/70">
      <div className="px-0 py-4">
        <div className="space-y-1 pb-4">
          <h2 className="text-[16px] font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="text-[13px] leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div>{children}</div>
      </div>
    </section>
  )
}

function renderPermissionChips(permissionKeys: string[]) {
  const labels = permissionKeys
    .map((key) => PERMISSION_CATALOG.find((permission) => permission.key === key)?.label)
    .filter(Boolean) as string[]
  const visible = labels.slice(0, 2)
  const remaining = labels.length - visible.length

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((label) => (
        <Badge key={label} variant="outline" className="text-[10px]">
          {label}
        </Badge>
      ))}
      {remaining > 0 ? (
        <Badge variant="outline" className="text-[10px] text-muted-foreground">
          +{remaining} more
        </Badge>
      ) : null}
    </div>
  )
}

export function ManageUserRolesContent() {
  const [roles, setRoles] = useState<RoleRecord[]>(INITIAL_ROLE_RECORDS)
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [permissionSearchQuery, setPermissionSearchQuery] = useState("")
  const [expandedGroups, setExpandedGroups] = useState<
    Record<(typeof PERMISSION_GROUP_ORDER)[number], boolean>
  >({
    Payments: false,
    Operations: false,
    Admin: false,
    Support: false,
  })
  const [newRoleDraft, setNewRoleDraft] = useState({
    roleName: "",
    scope: "Store operations",
    description: "",
    selectedPermissions: [] as string[],
  })

  const summary = useMemo(() => {
    const totalRoles = roles.length
    const customRoles = roles.filter((role) => role.isCustom).length
    const totalAssignments = roles.reduce((acc, role) => acc + role.usersAssigned, 0)
    const averagePermissions = Math.round(
      roles.reduce((acc, role) => acc + role.permissions.length, 0) / Math.max(1, roles.length)
    )
    return { totalRoles, customRoles, totalAssignments, averagePermissions }
  }, [roles])
  const summaryMetrics = useMemo<SectionSummaryMetric[]>(
    () => [
      { label: "Total roles", value: String(summary.totalRoles) },
      { label: "Custom roles", value: String(summary.customRoles) },
      { label: "Assigned users", value: String(summary.totalAssignments) },
      { label: "Avg permissions / role", value: String(summary.averagePermissions) },
    ],
    [summary]
  )
  const normalizedPermissionSearch = permissionSearchQuery.trim().toLowerCase()
  const filteredPermissions = useMemo(() => {
    if (!normalizedPermissionSearch) return PERMISSION_CATALOG
    return PERMISSION_CATALOG.filter((permission) => {
      const haystack = `${permission.label} ${permission.key} ${permission.group}`.toLowerCase()
      return haystack.includes(normalizedPermissionSearch)
    })
  }, [normalizedPermissionSearch])
  const permissionsByGroup = useMemo(() => {
    return PERMISSION_GROUP_ORDER.reduce<
      Record<(typeof PERMISSION_GROUP_ORDER)[number], PermissionDefinition[]>
    >((acc, group) => {
      acc[group] = filteredPermissions.filter((permission) => permission.group === group)
      return acc
    }, {
      Payments: [],
      Operations: [],
      Admin: [],
      Support: [],
    })
  }, [filteredPermissions])
  const roleColumns = useMemo<DataTableColumn<RoleRecord>[]>(
    () => [
      {
        id: "roleName",
        header: "ROLE NAME",
        width: 180,
        getSearchValue: (row) => `${row.roleName} ${row.scope} ${row.createdBy}`,
        cell: (row) => (
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-foreground">{row.roleName}</p>
            <p className="text-[11px] text-muted-foreground">{row.scope}</p>
          </div>
        ),
      },
      {
        id: "permissions",
        header: "PERMISSIONS",
        width: 180,
        getSearchValue: (row) => row.permissions.join(" "),
        cell: (row) => renderPermissionChips(row.permissions),
      },
      {
        id: "usersAssigned",
        header: "USERS ASSIGNED",
        width: 140,
        cell: (row) => row.usersAssigned,
      },
      {
        id: "createdOn",
        header: "CREATED ON",
        width: 160,
        accessorKey: "createdOn",
        cell: (row) => row.createdOn,
      },
      {
        id: "lastModifiedOn",
        header: "LAST MODIFIED ON",
        width: 180,
        accessorKey: "lastModifiedOn",
        cell: (row) => row.lastModifiedOn,
      },
      {
        id: "action",
        header: "ACTION",
        width: 100,
        align: "right",
        cell: () => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg">
                  <DotsThreeVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-lg">
                <DropdownMenuItem>View permissions</DropdownMenuItem>
                <DropdownMenuItem>Edit role</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Deactivate role</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    []
  )

  function togglePermission(permissionKey: string, checked: boolean) {
    setNewRoleDraft((prev) => ({
      ...prev,
      selectedPermissions: checked
        ? Array.from(new Set([...prev.selectedPermissions, permissionKey]))
        : prev.selectedPermissions.filter((key) => key !== permissionKey),
    }))
  }

  function createRole() {
    if (!newRoleDraft.roleName.trim()) return
    if (newRoleDraft.selectedPermissions.length === 0) return

    setRoles((prev) => [
      {
        id: `role-${Date.now()}`,
        roleName: newRoleDraft.roleName.trim(),
        scope: newRoleDraft.scope,
        permissions: newRoleDraft.selectedPermissions,
        usersAssigned: 0,
        createdOn: formatNowLabel(),
        lastModifiedOn: formatNowLabel(),
        createdBy: "Rahul Sharma",
        isCustom: true,
      },
      ...prev,
    ])
    setNewRoleDraft({
      roleName: "",
      scope: "Store operations",
      description: "",
      selectedPermissions: [],
    })
    setPermissionSearchQuery("")
    setExpandedGroups({
      Payments: false,
      Operations: false,
      Admin: false,
      Support: false,
    })
    setIsCreateRoleOpen(false)
  }

  function toggleGroup(group: (typeof PERMISSION_GROUP_ORDER)[number]) {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }))
  }

  return (
    <>
      <PageHeader
        title="Manage user roles"
        description="Configure role definitions and permission sets for operational teams."
        backHref="/account/users"
        actions={
          <Button size="sm" className="h-9 text-xs" onClick={() => setIsCreateRoleOpen(true)}>
            Create user role
          </Button>
        }
      />
      <div className="mx-auto w-full space-y-4 px-8 pb-8" style={{ maxWidth: "var(--dashboard-center-max-width, 1440px)" }}>
        <SectionCard
          title="Role summary"
          description="Visibility over role definitions and permission coverage."
        >
          <SectionSummaryStrip metrics={summaryMetrics} />
        </SectionCard>

        <SectionCard
          title="Role permissions"
          description="All available roles and their permission sets."
        >
          <DataTable
            data={roles}
            rowId={(row) => row.id}
            columns={roleColumns}
            tableClassName="min-w-[1080px]"
            searchPlaceholder="Search roles or permissions"
            emptyText="No roles match your search."
          />
        </SectionCard>
      </div>

      <Sheet open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl"
          a11yTitle="Create user role"
          a11yDescription="Create a role and select required permissions."
        >
          <SheetHeader className="border-b border-border/70 px-6 pb-4">
            <SheetTitle>Create user role</SheetTitle>
            <SheetDescription>
              Role creation requires selecting a permission set.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 overflow-y-auto px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role name</Label>
              <Input
                id="role-name"
                value={newRoleDraft.roleName}
                onChange={(event) =>
                  setNewRoleDraft((prev) => ({ ...prev, roleName: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-scope">Scope</Label>
              <Input
                id="role-scope"
                value={newRoleDraft.scope}
                onChange={(event) =>
                  setNewRoleDraft((prev) => ({ ...prev, scope: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                rows={3}
                value={newRoleDraft.description}
                onChange={(event) =>
                  setNewRoleDraft((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Select permissions</p>
                <p className="text-xs text-muted-foreground">
                  Select at least one permission to save the role.
                </p>
              </div>
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={permissionSearchQuery}
                  onChange={(event) => setPermissionSearchQuery(event.target.value)}
                  placeholder="Search permission or module"
                  className="h-9 rounded-md border-border/70 pl-8 text-xs"
                />
              </div>

              <div className="space-y-2">
                {PERMISSION_GROUP_ORDER.map((group) => {
                  const groupPermissions = permissionsByGroup[group]
                  const allGroupPermissions = PERMISSION_CATALOG.filter((permission) => permission.group === group)
                  const groupSelectedCount = allGroupPermissions.filter((permission) =>
                    newRoleDraft.selectedPermissions.includes(permission.key)
                  ).length
                  const isOpen = normalizedPermissionSearch
                    ? groupPermissions.length > 0
                    : expandedGroups[group]

                  return (
                    <div key={group} className="overflow-hidden rounded-lg border border-border/70">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
                        onClick={() => {
                          if (normalizedPermissionSearch) return
                          toggleGroup(group)
                        }}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                            {group}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {groupSelectedCount} selected of {allGroupPermissions.length}
                          </p>
                        </div>
                        <CaretRightIcon
                          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`}
                        />
                      </button>
                      {isOpen ? (
                        <div className="border-t border-border/70 p-3">
                          {groupPermissions.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No permissions match this search.</p>
                          ) : (
                            <div className="space-y-2">
                              {groupPermissions.map((permission) => (
                                <label
                                  key={permission.key}
                                  className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm"
                                >
                                  <Checkbox
                                    checked={newRoleDraft.selectedPermissions.includes(permission.key)}
                                    onCheckedChange={(checked) =>
                                      togglePermission(permission.key, checked === true)
                                    }
                                    aria-label={permission.label}
                                  />
                                  <span>{permission.label}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <SheetFooter className="border-t border-border/70 px-6 py-4 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={createRole}
              disabled={!newRoleDraft.roleName.trim() || newRoleDraft.selectedPermissions.length === 0}
            >
              Save role
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
