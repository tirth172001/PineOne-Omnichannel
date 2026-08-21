"use client"

import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react"
import {
  ArrowCounterClockwiseIcon,
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretDownIcon,
  CaretLeftIcon,
  ChartBarIcon,
  CheckIcon,
  CopyIcon,
  CreditCardIcon,
  DeviceMobileIcon,
  DotsThreeVerticalIcon,
  EnvelopeSimpleIcon,
  EyeIcon,
  GlobeIcon,
  HandshakeIcon,
  HardDrivesIcon,
  KeyIcon,
  LifebuoyIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  PathIcon,
  PencilSimpleIcon,
  PhoneIcon,
  PlugIcon,
  RepeatIcon,
  SignOutIcon,
  SlidersIcon,
  StorefrontIcon,
  TrashIcon,
  UserCircleIcon,
  UserMinusIcon,
  UserPlusIcon,
  UsersIcon,
  WalletIcon,
  WarningIcon,
  XIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Accordion, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { LogoMark } from "@/components/brand/logo-mark"
import { SectionSummaryStrip } from "@/components/dashboard/section-summary-strip"
import { readDummyAuthSession } from "@/lib/dummy-auth"
import { cn } from "@/lib/utils"
import {
  MIGRATION_AUDIT_SEED,
  MIGRATION_SCENARIO_LABELS,
  OVERRIDE_ROLE_OPTIONS,
  type MigrationAuditRow,
  type MigrationStatus,
  type RoleOption,
  type RoleType,
} from "@/lib/omni-migration"
import {
  ALL_PERMISSIONS,
  computeAccessScope,
  DEFAULT_ROLE_CATALOG,
  PERMISSION_GROUPS,
  type AccessScope,
  type Permission,
  type PermissionChannel,
  type RoleCatalogEntry,
  type RoleCatalogSystem,
} from "@/lib/role-permissions"
import {
  formatTime,
  INITIAL_ROSTER,
  MONTHS,
  type RosterEntry,
  type UserStatus,
} from "@/lib/user-roster-data"
import { ManageStoresSection } from "@/components/account/manage-stores-section"
import { ConfigureCheckoutSection } from "@/components/account/configure-checkout-section"

export type SettingsModule =
  | "personal-details"
  | "manage-stores"
  | "configure-checkout"
  | "users"
  | "credentials"
  | "webhooks"

export const SETTINGS_NAV_ITEMS: Array<{
  key: SettingsModule
  label: string
  icon: ComponentType<{ className?: string }>
  adminOnly?: boolean
}> = [
  { key: "personal-details", label: "Personal details", icon: UserCircleIcon },
  { key: "manage-stores", label: "Manage stores", icon: StorefrontIcon },
  { key: "configure-checkout", label: "Configure checkout", icon: CreditCardIcon },
  { key: "users", label: "Manage users & roles", icon: UsersIcon, adminOnly: true },
  { key: "credentials", label: "Credentials", icon: KeyIcon },
  { key: "webhooks", label: "Webhooks", icon: GlobeIcon },
]

/* ---------------------------------- Sidebar --------------------------------- */

export function SettingsSidebarNav({
  activeModule,
  onSelect,
  onBack,
  onLogout,
}: {
  activeModule: SettingsModule
  onSelect: (module: SettingsModule) => void
  onBack: () => void
  onLogout: () => void
}) {
  const [isAdmin, setIsAdmin] = useState(true)

  useEffect(() => {
    const session = readDummyAuthSession()
    if (!session) return
    setIsAdmin(session.role.toLowerCase() === "admin")
  }, [])

  const visibleItems = SETTINGS_NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar">
      <div className="flex h-16 shrink-0 items-center bg-sidebar px-2">
        <LogoMark className="h-12 w-auto pr-4 text-foreground" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-between overflow-y-auto bg-sidebar px-2 py-2">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm leading-none text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <CaretLeftIcon className="h-3.5 w-3.5 shrink-0" />
            <span>Back</span>
          </button>

          <div className="mt-2 space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon
              const active = item.key === activeModule

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelect(item.key)}
                  className={cn(
                    "flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm leading-none transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm leading-none text-destructive transition-colors hover:bg-destructive/10"
        >
          <SignOutIcon className="h-3.5 w-3.5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

/* --------------------------------- Shared bits ------------------------------- */

function SettingsScreenHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-8 py-6">
      <h1 className="text-2xl font-bold leading-none tracking-[-0.01em] text-foreground">{title}</h1>
      {action}
    </div>
  )
}

function FieldRow({
  icon: Icon,
  label,
  value,
  action,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-card px-5 py-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{value}</p>
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  )
}

function SectionIntro({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

function copyToClipboard(value: string, label: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(value).catch(() => {})
  }
  toast.success(`${label} copied to clipboard`)
}

/* ------------------------------- Personal details ---------------------------- */

function PersonalDetailsSection() {
  const [name, setName] = useState("Rahul Sharma")
  const [email, setEmail] = useState("rahul.sharma@pinelabs-demo.in")

  useEffect(() => {
    const session = readDummyAuthSession()
    if (!session) return
    setName(session.name)
    setEmail(session.email)
  }, [])

  return (
    <div className="flex h-full flex-col">
      <SettingsScreenHeader title="Personal details" action={<Button size="sm">Change password</Button>} />
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="grid w-full max-w-[1360px] gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <SectionIntro title="Basic details" description="All your personal details related to your login" />
          <div className="space-y-3">
            <FieldRow
              icon={UserCircleIcon}
              label="Name"
              value={name}
              action={
                <Button variant="outline" size="sm">
                  Update
                </Button>
              }
            />
            <FieldRow
              icon={PhoneIcon}
              label="Registered number"
              value="+91 98765 43210"
              action={
                <Button variant="outline" size="sm">
                  Update
                </Button>
              }
            />
            <FieldRow
              icon={EnvelopeSimpleIcon}
              label="Registered email"
              value={email}
              action={
                <Button variant="outline" size="sm">
                  Update
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* --------------------------------- Credentials -------------------------------- */

function CredentialsSection() {
  const merchantId = "2874783427443743984"
  const clientId = "2874783427443743984"
  const secretKey = "sk_live_9F72xLp84QzTn5W1yRVdKt"

  return (
    <div className="flex h-full flex-col">
      <SettingsScreenHeader title="Credentials" />
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="grid w-full max-w-[1360px] gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <SectionIntro title="Production credentials" description="You can use this credentials for live product" />
          <div className="space-y-3">
            <FieldRow
              icon={HardDrivesIcon}
              label="Merchant ID"
              value={merchantId}
              action={
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(merchantId, "Merchant ID")}>
                  <CopyIcon className="h-3.5 w-3.5" />
                  Copy
                </Button>
              }
            />
            <FieldRow
              icon={HardDrivesIcon}
              label="Client ID"
              value={clientId}
              action={
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(clientId, "Client ID")}>
                  <CopyIcon className="h-3.5 w-3.5" />
                  Copy
                </Button>
              }
            />
            <FieldRow
              icon={KeyIcon}
              label="Secret key"
              value={"*".repeat(28)}
              action={
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(secretKey, "Secret key")}>
                  <CopyIcon className="h-3.5 w-3.5" />
                  Copy
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------- Webhooks ----------------------------------- */

function WebhooksSection() {
  const [url] = useState("https://www.pinelabs.com/updates")

  return (
    <div className="flex h-full flex-col">
      <SettingsScreenHeader title="Webhook" />
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="grid w-full max-w-[1360px] gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <SectionIntro
            title="Webhook URL"
            description="Your transaction status and other information will be provided on this URL"
          />
          <div className="space-y-3">
            <FieldRow
              icon={GlobeIcon}
              label="Added URL"
              value={url}
              action={
                <Button variant="outline" size="sm" onClick={() => toast.success("URL added successfully")}>
                  Update
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- Manage users data ------------------------------ */

/** Roster type/data now live in lib/user-roster-data.ts, shared with Manage stores'
 *  store-detail Users tab and stores-data.ts's live "Users invited" count. */

/** The live, editable role catalog used across Roles/Users/Invite — seeded from the
 *  real predefined roles (lib/role-permissions.ts) and grown with custom roles. */
type ManagedRole = {
  id: string
  name: string
  roleType: "system_default" | "custom"
  system?: RoleCatalogSystem
  description: string
  permissionKeys: string[]
}

const INITIAL_ROLE_CATALOG: ManagedRole[] = DEFAULT_ROLE_CATALOG.map((entry) => ({
  id: entry.id,
  name: entry.name,
  roleType: "system_default",
  system: entry.system,
  description: entry.description,
  permissionKeys: entry.permissionKeys,
}))

function formatNow() {
  const now = new Date()
  return {
    dateStr: `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
    timeStr: formatTime(now.getHours(), now.getMinutes()),
  }
}

function roleDotClass(role: string) {
  if (role === "Admin") return "bg-amber-500"
  if (role === "Owner") return "bg-emerald-500"
  return "bg-muted-foreground/50"
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-xs font-medium text-foreground">
      <span className={cn("h-1.5 w-1.5 rounded-full", roleDotClass(role))} />
      {role}
    </span>
  )
}

function statusDotClass(status: UserStatus) {
  if (status === "Active") return "bg-emerald-500"
  if (status === "Invited") return "bg-amber-500"
  return "bg-muted-foreground/50"
}

function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium",
        status === "Removed" ? "border-border/60 text-muted-foreground" : "border-border bg-background text-foreground"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", statusDotClass(status))} />
      {status}
    </span>
  )
}

/** Which channels a role/user can actually reach — this is what someone scanning
 *  the table wants to know at a glance, not how many permission rows make it up.
 *  Reuses the Store/Online iconography from the permissions sheets so the same
 *  channel reads the same way everywhere in this file. */
export function AccessScopeBadge({ scope }: { scope: AccessScope }) {
  const showStore = scope !== "Online"
  const showGlobe = scope !== "In-store"

  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-xs font-medium text-foreground">
      {showStore ? <StorefrontIcon className="h-3 w-3 text-muted-foreground" /> : null}
      {showGlobe ? <GlobeIcon className="h-3 w-3 text-muted-foreground" /> : null}
      {scope === "In-store and Online" ? "In-store & Online" : scope}
    </span>
  )
}

/** Which functional areas a set of permissions actually touches — e.g. "Refunds,
 *  Reports" — so a table row answers "what can this role/user do" at a glance
 *  instead of just "how many permissions" or "which channel". Ordered to match
 *  PERMISSION_GROUPS so the same capability always reads in the same position. */
function capabilityGroups(permissionKeys: string[]): string[] {
  const keySet = new Set(permissionKeys)
  const present = new Set(ALL_PERMISSIONS.filter((permission) => keySet.has(permission.key)).map((permission) => permission.group))
  return PERMISSION_GROUPS.filter((group) => present.has(group))
}

function CapabilityChips({ permissionKeys, max = 3 }: { permissionKeys: string[]; max?: number }) {
  const groups = capabilityGroups(permissionKeys)
  if (groups.length === 0) return <span className="text-xs text-muted-foreground">No permissions</span>

  const visible = groups.slice(0, max)
  const remaining = groups.length - visible.length

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((group) => {
        const GroupIcon = GROUP_ICON[group] ?? HardDrivesIcon
        return (
          <span
            key={group}
            className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-2 py-0.5 text-[10px] font-medium text-foreground"
            title={group}
          >
            <GroupIcon className="h-2.5 w-2.5 text-muted-foreground" />
            {group}
          </span>
        )
      })}
      {remaining > 0 ? <span className="text-[10px] text-muted-foreground">+{remaining} more</span> : null}
    </div>
  )
}

/** Left side of a wizard step's accordion trigger: a numbered (or checked-off) circle,
 *  the step title, and — only while collapsed — a one-line summary of what was filled
 *  in, so a closed step still tells you what it holds without reopening it. */
function StepHeading({
  number,
  title,
  done,
  open,
  summary,
}: {
  number: number
  title: string
  done: boolean
  open: boolean
  summary?: string
}) {
  return (
    <div className="flex flex-1 items-center gap-3">
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          done ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
        )}
      >
        {done ? <CheckIcon className="h-3.5 w-3.5" /> : number}
      </span>
      <div className="min-w-0 text-left">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {!open && summary ? <p className="truncate text-xs text-muted-foreground">{summary}</p> : null}
      </div>
    </div>
  )
}

/* --------------------------------- Generic table -------------------------------- */

/** Icon-only by default; the label only appears on hover/focus via tooltip, so a row
 *  of actions stays compact but is never a mystery. */
function IconActionButton({
  label,
  icon: Icon,
  onClick,
  destructive,
}: {
  label: string
  icon: ComponentType<{ className?: string }>
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          className={cn("h-8 w-8 rounded-md", destructive && "text-destructive hover:text-destructive")}
          onClick={(event) => {
            event.stopPropagation()
            onClick()
          }}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/** Actions available depend on status: pending invites can be resent or cancelled,
 *  active users can be edited or have access removed, removed users can only be
 *  reactivated. Status itself is never editable directly — it only changes as a
 *  side effect of these actions. */
function UserRowActions({
  entry,
  onEdit,
  onRemove,
  onReactivate,
  onCancelInvite,
  onResendInvite,
}: {
  entry: RosterEntry
  onEdit: () => void
  onRemove: () => void
  onReactivate: () => void
  onCancelInvite: () => void
  onResendInvite: () => void
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {entry.status === "Invited" ? (
        <>
          <IconActionButton label="Resend invite" icon={EnvelopeSimpleIcon} onClick={onResendInvite} />
          <IconActionButton label="Edit" icon={PencilSimpleIcon} onClick={onEdit} />
          <IconActionButton label="Cancel invite" icon={TrashIcon} onClick={onCancelInvite} destructive />
        </>
      ) : entry.status === "Active" ? (
        <>
          <IconActionButton label="Edit" icon={PencilSimpleIcon} onClick={onEdit} />
          <IconActionButton label="Remove user" icon={UserMinusIcon} onClick={onRemove} destructive />
        </>
      ) : (
        <IconActionButton label="Reactivate" icon={ArrowCounterClockwiseIcon} onClick={onReactivate} />
      )}
    </div>
  )
}

/** Editing and cloning both live inside the "View permissions" sheet now — the row
 *  only needs an action to open that view, plus a quick destructive Delete for custom roles. */
function RoleRowActions({
  role,
  onView,
  onDelete,
}: {
  role: ManagedRole
  onView: () => void
  onDelete: () => void
}) {
  const isCustom = role.roleType === "custom"

  return (
    <div className="flex items-center justify-end gap-1">
      <IconActionButton label="View permissions" icon={EyeIcon} onClick={onView} />
      {isCustom ? <IconActionButton label="Delete" icon={TrashIcon} onClick={onDelete} destructive /> : null}
    </div>
  )
}

function roleTypeChipLabel(roleType: ManagedRole["roleType"]) {
  return roleType === "custom" ? "Custom" : "Predefined"
}

function RoleTypeChip({ roleType }: { roleType: ManagedRole["roleType"] }) {
  const isCustom = roleType === "custom"
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px]",
        isCustom
          ? "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400"
          : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      )}
    >
      {roleTypeChipLabel(roleType)}
    </Badge>
  )
}

function RolesTable({
  roles,
  roster,
  onView,
  onDelete,
}: {
  roles: ManagedRole[]
  roster: RosterEntry[]
  onView: (role: ManagedRole) => void
  onDelete: (role: ManagedRole) => void
}) {
  const [typeFilter, setTypeFilter] = useState<"all" | "system_default" | "custom">("all")

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => typeFilter === "all" || role.roleType === typeFilter)
  }, [roles, typeFilter])

  const columns: DataTableColumn<ManagedRole>[] = [
    {
      id: "role",
      header: "Role",
      getSearchValue: (row) => `${row.name} ${row.description}`,
      cell: (row) => (
        <div>
          <p className="text-sm font-semibold text-foreground">{row.name}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{row.description}</p>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: (row) => <RoleTypeChip roleType={row.roleType} />,
    },
    {
      id: "access",
      header: "Access",
      cell: (row) => <AccessScopeBadge scope={computeAccessScope(row.permissionKeys)} />,
    },
    {
      id: "capabilities",
      header: "Capabilities",
      width: 220,
      cell: (row) => <CapabilityChips permissionKeys={row.permissionKeys} />,
    },
    {
      id: "usersAssigned",
      header: "Users assigned",
      cell: (row) => (
        <span className="text-sm text-foreground">
          {roster.filter((entry) => entry.role === row.name && entry.status !== "Removed").length}
        </span>
      ),
    },
    {
      id: "action",
      header: "Actions",
      align: "right",
      cell: (row) => <RoleRowActions role={row} onView={() => onView(row)} onDelete={() => onDelete(row)} />,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={typeFilter === "all" ? "default" : "outline"}
          className="h-8 rounded-md px-2.5 text-sm"
          onClick={() => setTypeFilter("all")}
        >
          All
        </Button>
        <Button
          variant={typeFilter === "system_default" ? "default" : "outline"}
          className="h-8 rounded-md px-2.5 text-sm"
          onClick={() => setTypeFilter("system_default")}
        >
          Predefined
        </Button>
        <Button
          variant={typeFilter === "custom" ? "default" : "outline"}
          className="h-8 rounded-md px-2.5 text-sm"
          onClick={() => setTypeFilter("custom")}
        >
          Custom
        </Button>
      </div>
      <DataTable
        data={filteredRoles}
        rowId={(row) => row.id}
        columns={columns}
        tableClassName="min-w-[1160px]"
        searchPlaceholder="Search roles by name or description"
        emptyText="No roles match your search or filters."
      />
    </div>
  )
}

function UsersTable({
  rows,
  roleCatalog,
  onEdit,
  onRemove,
  onReactivate,
  onCancelInvite,
  onResendInvite,
}: {
  rows: RosterEntry[]
  roleCatalog: ManagedRole[]
  onEdit: (row: RosterEntry) => void
  onRemove: (row: RosterEntry) => void
  onReactivate: (row: RosterEntry) => void
  onCancelInvite: (row: RosterEntry) => void
  onResendInvite: (row: RosterEntry) => void
}) {
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all")
  const [roleFilter, setRoleFilter] = useState("all")

  const roleFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.role))).sort((a, b) => a.localeCompare(b)),
    [rows]
  )

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false
      if (roleFilter !== "all" && row.role !== roleFilter) return false
      return true
    })
  }, [rows, statusFilter, roleFilter])

  const columns: DataTableColumn<RosterEntry>[] = [
    {
      id: "user",
      header: "User",
      getSearchValue: (row) => `${row.name} ${row.email}`,
      cell: (row) => (
        <div className={cn(row.status === "Removed" && "opacity-60")}>
          <p className="text-sm font-semibold text-foreground">{row.name}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      cell: (row) => (
        <div className={cn(row.status === "Removed" && "opacity-60")}>
          <RoleBadge role={row.role} />
        </div>
      ),
    },
    {
      id: "access",
      header: "Access",
      cell: (row) => {
        const permissionKeys = roleCatalog.find((role) => role.name === row.role)?.permissionKeys ?? []
        return (
          <div className={cn(row.status === "Removed" && "opacity-60")}>
            <AccessScopeBadge scope={computeAccessScope(permissionKeys)} />
          </div>
        )
      },
    },
    {
      id: "capabilities",
      header: "Capabilities",
      width: 220,
      cell: (row) => {
        const permissionKeys = roleCatalog.find((role) => role.name === row.role)?.permissionKeys ?? []
        return (
          <div className={cn(row.status === "Removed" && "opacity-60")}>
            <CapabilityChips permissionKeys={permissionKeys} max={2} />
          </div>
        )
      },
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: "action",
      header: "Actions",
      align: "right",
      cell: (row) => (
        <UserRowActions
          entry={row}
          onEdit={() => onEdit(row)}
          onRemove={() => onRemove(row)}
          onReactivate={() => onReactivate(row)}
          onCancelInvite={() => onCancelInvite(row)}
          onResendInvite={() => onResendInvite(row)}
        />
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          className="h-8 rounded-md px-2.5 text-sm"
          onClick={() => setStatusFilter("all")}
        >
          All
        </Button>
        <Button
          variant={statusFilter === "Active" ? "default" : "outline"}
          className="h-8 rounded-md px-2.5 text-sm"
          onClick={() => setStatusFilter("Active")}
        >
          Active
        </Button>
        <Button
          variant={statusFilter === "Invited" ? "default" : "outline"}
          className="h-8 rounded-md px-2.5 text-sm"
          onClick={() => setStatusFilter("Invited")}
        >
          Invited
        </Button>
        <Button
          variant={statusFilter === "Removed" ? "default" : "outline"}
          className="h-8 rounded-md px-2.5 text-sm"
          onClick={() => setStatusFilter("Removed")}
        >
          Removed
        </Button>
        <div className="h-6 w-px bg-border" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-md px-2.5 text-sm">
              {roleFilter === "all" ? "All roles" : roleFilter}
              <CaretDownIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuRadioGroup value={roleFilter} onValueChange={setRoleFilter}>
              <DropdownMenuRadioItem value="all">All roles</DropdownMenuRadioItem>
              {roleFilterOptions.map((role) => (
                <DropdownMenuRadioItem key={role} value={role}>
                  {role}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <DataTable
        data={filteredRows}
        rowId={(row) => row.id}
        columns={columns}
        tableClassName="min-w-[1260px]"
        searchPlaceholder="Search by name or email"
        emptyText="No users match your search or filters."
      />
    </div>
  )
}

/* ------------------------------ Migration audit ------------------------------- */

function roleTypeBadgeClass(roleType: RoleType) {
  switch (roleType) {
    case "system_omni":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    case "custom_migrated":
      return "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400"
    case "custom":
      return "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400"
    default:
      return "border-border bg-muted/40 text-muted-foreground"
  }
}

function roleTypeLabel(roleType: RoleType) {
  switch (roleType) {
    case "system_omni":
      return "Omni"
    case "custom_migrated":
      return "Migrated"
    case "custom":
      return "Custom"
    default:
      return "Default"
  }
}

function RoleTypeBadge({ roleType }: { roleType: RoleType }) {
  return (
    <Badge variant="outline" className={cn("text-[10px]", roleTypeBadgeClass(roleType))}>
      {roleTypeLabel(roleType)}
    </Badge>
  )
}

function migrationStatusDotClass(status: MigrationStatus) {
  if (status === "approved") return "bg-emerald-500"
  if (status === "overridden") return "bg-sky-500"
  return "bg-amber-500"
}

function MigrationStatusPill({ status }: { status: MigrationStatus }) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-xs font-medium capitalize text-foreground">
      <span className={cn("h-1.5 w-1.5 rounded-full", migrationStatusDotClass(status))} />
      {status}
    </span>
  )
}

function MigrationAuditSection({
  rows,
  onApprove,
  onOverride,
  onReset,
  onApproveAll,
  onCommit,
  onBack,
}: {
  rows: MigrationAuditRow[]
  onApprove: (id: string) => void
  onOverride: (id: string, option: RoleOption) => void
  onReset: (id: string) => void
  onApproveAll: () => void
  onCommit: () => void
  onBack: () => void
}) {
  const summaryMetrics = useMemo(
    () => [
      { label: "Users to migrate", value: String(rows.length) },
      { label: "Omni Owners created", value: String(rows.filter((row) => row.migratedRole.roleType === "system_omni").length) },
      { label: "Merged custom roles", value: String(rows.filter((row) => row.migratedRole.roleType === "custom_migrated").length) },
      { label: "Pending review", value: String(rows.filter((row) => row.status === "pending").length) },
    ],
    [rows]
  )

  const pendingCount = rows.filter((row) => row.status === "pending").length
  const allReviewed = pendingCount === 0

  const columns: DataTableColumn<MigrationAuditRow>[] = [
    {
      id: "scenario",
      header: "Scenario",
      width: 150,
      filterOptions: [
        { label: "True Omni account", value: "true_omni" },
        { label: "Offline MID only", value: "offline_only" },
        { label: "Online MID only", value: "online_only" },
      ],
      getFilterValue: (row) => row.scenario,
      getValue: (row) => MIGRATION_SCENARIO_LABELS[row.scenario],
      cell: (row) => <span className="text-xs text-muted-foreground">{MIGRATION_SCENARIO_LABELS[row.scenario]}</span>,
    },
    {
      id: "user",
      header: "User",
      width: 220,
      getSearchValue: (row) => `${row.offlineEmail ?? ""} ${row.onlineEmail ?? ""}`,
      cell: (row) => (
        <div className="space-y-0.5 text-xs">
          {row.offlineEmail ? (
            <p className="text-foreground">
              {row.offlineEmail} <span className="text-muted-foreground">(Offline)</span>
            </p>
          ) : null}
          {row.onlineEmail && row.onlineEmail !== row.offlineEmail ? (
            <p className="text-foreground">
              {row.onlineEmail} <span className="text-muted-foreground">(Online)</span>
            </p>
          ) : null}
        </div>
      ),
    },
    {
      id: "offlineRole",
      header: "Offline role",
      width: 140,
      getValue: (row) => row.offlineRoleName ?? "—",
      cell: (row) => <span className="text-sm text-foreground">{row.offlineRoleName ?? "—"}</span>,
    },
    {
      id: "onlineRole",
      header: "Online role",
      width: 140,
      getValue: (row) => row.onlineRoleName ?? "—",
      cell: (row) => <span className="text-sm text-foreground">{row.onlineRoleName ?? "—"}</span>,
    },
    {
      id: "migratedRole",
      header: "Migrated role",
      width: 240,
      getValue: (row) => row.migratedRole.name,
      cell: (row) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-medium text-foreground">{row.migratedRole.name}</span>
          <RoleTypeBadge roleType={row.migratedRole.roleType} />
        </div>
      ),
    },
    {
      id: "accessScope",
      header: "Access scope",
      width: 150,
      accessorKey: "accessScope",
      cell: (row) => <AccessScopeBadge scope={row.accessScope} />,
    },
    {
      id: "comment",
      header: "Comment",
      width: 260,
      searchable: false,
      cell: (row) => <span className="text-xs text-muted-foreground">{row.comment}</span>,
    },
    {
      id: "status",
      header: "Status",
      width: 140,
      filterOptions: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Overridden", value: "overridden" },
      ],
      getFilterValue: (row) => row.status,
      getValue: (row) => row.status,
      cell: (row) => <MigrationStatusPill status={row.status} />,
    },
    {
      id: "action",
      header: "Action",
      width: 190,
      align: "right",
      searchable: false,
      hideable: false,
      draggable: false,
      pinnable: false,
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(event) => event.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            disabled={row.status === "approved"}
            onClick={() => onApprove(row.id)}
          >
            Approve
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-7 w-7 rounded-md">
                <DotsThreeVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-[11px] text-muted-foreground">Override migrated role</DropdownMenuLabel>
              {OVERRIDE_ROLE_OPTIONS.map((option) => (
                <DropdownMenuItem key={option.name} onSelect={() => onOverride(row.id, option)}>
                  {option.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onReset(row.id)}>Reset to proposed mapping</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-border/70 px-8 py-6">
        <Button variant="ghost" size="icon-sm" className="h-8 w-8" onClick={onBack} aria-label="Back to Manage users">
          <CaretLeftIcon className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold leading-none tracking-[-0.01em] text-foreground">Migration review</h1>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-8 py-6">
        <Alert>
          <WarningIcon className="h-4 w-4" />
          <AlertTitle>Review before committing</AlertTitle>
          <AlertDescription>
            This is a one-time mapping, not an ongoing sync. Approve or override each row, then commit — legacy Online
            and Offline dashboards become read-only for users &amp; roles the moment this migration is committed.
          </AlertDescription>
        </Alert>

        <SectionSummaryStrip metrics={summaryMetrics} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {pendingCount > 0 ? `${pendingCount} row(s) awaiting review` : "All rows reviewed"}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onApproveAll} disabled={pendingCount === 0}>
              Approve all pending
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={onCommit} disabled={!allReviewed}>
              Commit migration
            </Button>
          </div>
        </div>

        <DataTable
          data={rows}
          columns={columns}
          rowId={(row) => row.id}
          searchPlaceholder="Search by email..."
          emptyText="No migration rows found"
          statusColumnId="status"
        />
      </div>
    </div>
  )
}

/* ---------------------------- Add custom role sheet ---------------------------- */

type CustomRoleDraft = { name: string; description: string; permissionKeys: string[] }

/** Order-independent comparison — two roles with the same permissions in a different
 *  pick order should still count as duplicates. */
function permissionSetsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  const setB = new Set(b)
  return a.every((key) => setB.has(key))
}

/** One glanceable icon per permission group so a long combined list still reads as
 *  distinct topics instead of one undifferentiated wall of switches. */
const GROUP_ICON: Record<string, ComponentType<{ className?: string }>> = {
  // Shared across both channels
  "Transactions & Settlements": RepeatIcon,
  Refunds: ArrowCounterClockwiseIcon,
  Reports: ChartBarIcon,
  "User & Role Management": UsersIcon,
  "Merchant Settings & Configuration": SlidersIcon,
  Account: UserCircleIcon,
  // In-store only
  "Service Requests": LifebuoyIcon,
  "Campaigns & Offers": MegaphoneIcon,
  "EMI World": CreditCardIcon,
  // Online only
  "Gateway Management": PlugIcon,
  "Routing Logic": PathIcon,
  "Payment Links": LinkIcon,
  "Payouts & Beneficiaries": WalletIcon,
  IMEI: DeviceMobileIcon,
  "Partner Management": HandshakeIcon,
  Credentials: KeyIcon,
}

function CreateRolePage({
  onBack,
  onSave,
  initial,
  isEditingExisting = false,
  roleCatalog,
  excludeRoleId,
}: {
  onBack: () => void
  onSave: (role: CustomRoleDraft) => void
  /** Prefill data — used both when editing an existing custom role and when cloning a predefined one. */
  initial?: CustomRoleDraft | null
  /** True only when editing a real existing custom role (vs. creating new, possibly cloned/prefilled). */
  isEditingExisting?: boolean
  /** Used to catch duplicate names/permission sets against every other role. */
  roleCatalog: ManagedRole[]
  /** The role currently being edited, excluded from its own duplicate checks. */
  excludeRoleId?: string
}) {
  const [roleName, setRoleName] = useState(initial?.name ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [search, setSearch] = useState("")
  const [selectedKeys, setSelectedKeys] = useState<string[]>(initial?.permissionKeys ?? [])

  /** The form is a strict wizard, one step visible at a time — filling a step and
   *  hitting Continue is what opens the next one. */
  const [activeStep, setActiveStep] = useState<"details" | "permissions">("details")
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  /** Starting from another role is opt-in and only offered when creating new —
   *  editing an existing custom role never gets this switch, since applying a
   *  template mid-edit would silently blow away whatever the role already has. */
  const [startFromRole, setStartFromRole] = useState(false)

  const normalizedSearch = search.trim().toLowerCase()
  const filteredPermissions = useMemo(() => {
    if (!normalizedSearch) return ALL_PERMISSIONS
    return ALL_PERMISSIONS.filter((permission) =>
      `${permission.label} ${permission.key} ${permission.group} ${permission.channel}`
        .toLowerCase()
        .includes(normalizedSearch)
    )
  }, [normalizedSearch])

  /** One card per group (not per channel) — a group with permissions on both sides,
   *  like Refunds, shows up once with an In-store subsection and an Online one, instead
   *  of as two separate same-named cards far apart on the page. */
  /** Channel first, like the legacy dashboards — In-store and Online are genuinely
   *  different systems with different owners, so keeping them as separate sections
   *  reads more like "the two systems this merges" than one flattened catalog. */
  const channelGroupSections = useMemo(() => {
    const build = (channel: PermissionChannel) =>
      PERMISSION_GROUPS.map((group) => ({
        group,
        permissions: filteredPermissions.filter((permission) => permission.group === group && permission.channel === channel),
      })).filter((section) => section.permissions.length > 0)
    return { offline: build("offline"), online: build("online") }
  }, [filteredPermissions])

  const channelCatalog = useMemo(
    () => ({
      offline: ALL_PERMISSIONS.filter((permission) => permission.channel === "offline"),
      online: ALL_PERMISSIONS.filter((permission) => permission.channel === "online"),
    }),
    []
  )

  function togglePermission(key: string, checked: boolean) {
    setSelectedKeys((current) =>
      checked ? Array.from(new Set([...current, key])) : current.filter((item) => item !== key)
    )
  }

  function toggleMany(permissions: Permission[], checked: boolean) {
    const keys = permissions.map((permission) => permission.key)
    setSelectedKeys((current) => {
      if (checked) return Array.from(new Set([...current, ...keys]))
      const keySet = new Set(keys)
      return current.filter((key) => !keySet.has(key))
    })
  }

  function renderPermissionRow(permission: Permission) {
    const checked = selectedKeys.includes(permission.key)
    return (
      <label
        key={permission.key}
        className={cn(
          "flex cursor-pointer items-center gap-2.5 rounded-md border px-2.5 py-1.5 transition-colors",
          checked ? "border-emerald-500/30 bg-emerald-500/10" : "border-transparent hover:bg-muted/50"
        )}
      >
        <Checkbox checked={checked} onCheckedChange={(next) => togglePermission(permission.key, next === true)} />
        <span
          className={cn("min-w-0 truncate text-sm", checked ? "font-medium text-foreground" : "text-foreground/90")}
          title={permission.label}
        >
          {permission.label}
        </span>
      </label>
    )
  }

  /** Templates come from two places: the fixed predefined catalog, and whatever custom
   *  roles this account has already built — a new role is often "that one but with
   *  Refunds Approve added", not a rebuild from scratch. */
  const customRoleTemplates = roleCatalog.filter(
    (role) => role.roleType === "custom" && role.id !== excludeRoleId
  )

  /** Prefills permissions (and the name, if still blank) from the chosen role so most
   *  custom roles start as a tweak of something real instead of a blank slate. */
  function applyTemplate(id: string, name: string, permissionKeys: string[]) {
    setSelectedTemplateId(id)
    setSelectedKeys(permissionKeys)
    if (!roleName.trim()) setRoleName(`${name} (Custom)`)
  }

  function clearTemplate() {
    setSelectedTemplateId(null)
    setSelectedKeys([])
  }

  function handleToggleStartFromRole(checked: boolean) {
    setStartFromRole(checked)
    if (!checked) clearTemplate()
  }

  const appliedTemplate = selectedTemplateId
    ? DEFAULT_ROLE_CATALOG.find((entry) => entry.id === selectedTemplateId) ??
      customRoleTemplates.find((role) => role.id === selectedTemplateId)
    : null

  const selectedPermissions = ALL_PERMISSIONS.filter((permission) => selectedKeys.includes(permission.key))
  const selectedOffline = selectedPermissions.filter((permission) => permission.channel === "offline")
  const selectedOnline = selectedPermissions.filter((permission) => permission.channel === "online")

  const trimmedName = roleName.trim()
  const duplicateNameRole = trimmedName
    ? roleCatalog.find(
        (role) => role.id !== excludeRoleId && role.name.trim().toLowerCase() === trimmedName.toLowerCase()
      )
    : undefined
  const nameError = duplicateNameRole ? `A role named "${duplicateNameRole.name}" already exists.` : null

  const duplicatePermissionsRole =
    selectedKeys.length > 0
      ? roleCatalog.find(
          (role) => role.id !== excludeRoleId && permissionSetsEqual(role.permissionKeys, selectedKeys)
        )
      : undefined
  const permissionsError = duplicatePermissionsRole
    ? `A role with the same permissions already exists: "${duplicatePermissionsRole.name}".`
    : null

  const canSave = Boolean(trimmedName) && selectedKeys.length > 0 && !nameError && !permissionsError

  function handleSave() {
    if (!canSave) return
    onSave({ name: trimmedName, description: description.trim(), permissionKeys: selectedKeys })
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={isEditingExisting ? "Edit custom role" : "Create new role"}
        onBack={onBack}
        backLabel="Back to Manage users"
        actions={
          <>
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!canSave}>
              {isEditingExisting ? "Save changes" : "Create role"}
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div
          className="mx-auto grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"
          style={{ maxWidth: "var(--dashboard-center-max-width, 1440px)" }}
        >
          <div className="min-w-0 space-y-5">
            <Accordion
              type="single"
              value={activeStep}
              onValueChange={(value) => {
                if (value) setActiveStep(value as typeof activeStep)
              }}
              className="rounded-lg border border-border/70 px-4"
            >
              <AccordionItem value="details">
                <AccordionTrigger>
                  <StepHeading
                    number={1}
                    title="Role details"
                    done={Boolean(trimmedName) && !nameError}
                    open={activeStep === "details"}
                    summary={trimmedName || undefined}
                  />
                </AccordionTrigger>
                <AccordionPrimitive.Content className="pb-2.5">
                  <div className="space-y-4 pb-2">
                    {!isEditingExisting ? (
                      <div className="space-y-3 rounded-lg border border-border/70 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">Start from an existing role</p>
                            <p className="text-xs text-muted-foreground">
                              Copies that role's permissions in — you can still change anything before saving.
                            </p>
                          </div>
                          <Switch checked={startFromRole} onCheckedChange={handleToggleStartFromRole} />
                        </div>
                        {startFromRole ? (
                          <div className="space-y-2">
                            <Select
                              value={selectedTemplateId ?? undefined}
                              onValueChange={(id) => {
                                const entry =
                                  DEFAULT_ROLE_CATALOG.find((candidate) => candidate.id === id) ??
                                  customRoleTemplates.find((role) => role.id === id)
                                if (entry) applyTemplate(entry.id, entry.name, entry.permissionKeys)
                              }}
                            >
                              <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Pick a role to start with" />
                              </SelectTrigger>
                              <SelectContent>
                                {customRoleTemplates.length > 0 ? (
                                  <SelectGroup>
                                    <SelectLabel>Your custom roles</SelectLabel>
                                    {customRoleTemplates.map((role) => (
                                      <SelectItem key={role.id} value={role.id}>
                                        {role.name}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                ) : null}
                                <SelectGroup>
                                  <SelectLabel>Predefined · In-store</SelectLabel>
                                  {DEFAULT_ROLE_CATALOG.filter((entry) => entry.system === "offline").map((entry) => (
                                    <SelectItem key={entry.id} value={entry.id}>
                                      {entry.name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                                <SelectGroup>
                                  <SelectLabel>Predefined · Online</SelectLabel>
                                  {DEFAULT_ROLE_CATALOG.filter((entry) => entry.system === "online").map((entry) => (
                                    <SelectItem key={entry.id} value={entry.id}>
                                      {entry.name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            {appliedTemplate ? (
                              <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-xs">
                                <span className="text-foreground">
                                  Using <span className="font-medium">{appliedTemplate.name}</span> — {selectedKeys.length}{" "}
                                  permission(s) applied
                                </span>
                                <button
                                  type="button"
                                  className="font-medium text-muted-foreground hover:text-foreground"
                                  onClick={clearTemplate}
                                >
                                  Clear
                                </button>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="custom-role-name">Role name</Label>
                        <Input
                          id="custom-role-name"
                          value={roleName}
                          onChange={(event) => setRoleName(event.target.value)}
                          placeholder="e.g. Regional Ops Lead"
                          aria-invalid={Boolean(nameError)}
                          className={cn(nameError && "border-destructive focus-visible:ring-destructive/40")}
                        />
                        {nameError ? <p className="text-xs text-destructive">{nameError}</p> : null}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="custom-role-description">Role description</Label>
                        <Input
                          id="custom-role-description"
                          value={description}
                          onChange={(event) => setDescription(event.target.value)}
                          placeholder="What is this role for?"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => setActiveStep("permissions")}
                        disabled={!trimmedName || Boolean(nameError)}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </AccordionPrimitive.Content>
              </AccordionItem>

              <AccordionItem value="permissions">
                <AccordionTrigger>
                  <StepHeading
                    number={2}
                    title="Permissions"
                    done={selectedKeys.length > 0}
                    open={activeStep === "permissions"}
                    summary={`${selectedKeys.length} of ${ALL_PERMISSIONS.length} selected`}
                  />
                </AccordionTrigger>
                <AccordionPrimitive.Content className="pb-2.5">
                  <div className="space-y-4 pb-2">
                    {permissionsError ? <p className="text-xs text-destructive">{permissionsError}</p> : null}

                    <div className="relative">
                      <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search permission or channel"
                        className="h-9 rounded-md border-border/70 pl-8 text-xs"
                      />
                    </div>

                    <div className="space-y-5">
                      {(["offline", "online"] as const).map((channel) => {
                        const groups = channelGroupSections[channel]
                        if (normalizedSearch && groups.length === 0) return null

                        const channelAll = channelCatalog[channel]
                        const selectedInChannel = channelAll.filter((permission) => selectedKeys.includes(permission.key)).length
                        const allChannelSelected = channelAll.length > 0 && selectedInChannel === channelAll.length
                        const ChannelIcon = channel === "offline" ? StorefrontIcon : GlobeIcon
                        const title = channel === "offline" ? "In-store payments" : "Online payments"

                        return (
                          <div key={channel}>
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <ChannelIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <p className="text-sm font-semibold text-foreground">{title}</p>
                                <span
                                  className={cn(
                                    "text-xs font-medium",
                                    selectedInChannel > 0 ? "text-foreground" : "text-muted-foreground"
                                  )}
                                >
                                  {selectedInChannel} of {channelAll.length} selected
                                </span>
                              </div>
                              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Checkbox
                                  checked={allChannelSelected}
                                  onCheckedChange={(checked) => toggleMany(channelAll, checked === true)}
                                />
                                Select all
                              </label>
                            </div>

                            {groups.length === 0 ? (
                              <p className="text-xs text-muted-foreground">No permissions match this search.</p>
                            ) : (
                              <div className="columns-1 gap-3 lg:columns-2">
                                {groups.map(({ group, permissions }) => {
                                  const GroupIcon = GROUP_ICON[group] ?? HardDrivesIcon
                                  const selectedCount = permissions.filter((permission) => selectedKeys.includes(permission.key)).length
                                  const allSelected = selectedCount === permissions.length

                                  return (
                                    <div key={group} className="mb-3 break-inside-avoid rounded-lg border border-border/70 p-3">
                                      <div className="flex items-center gap-2">
                                        <Checkbox
                                          checked={allSelected}
                                          onCheckedChange={(checked) => toggleMany(permissions, checked === true)}
                                          aria-label={`Select all permissions in ${group}`}
                                        />
                                        <GroupIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                        <span className="text-sm font-semibold text-foreground">{group}</span>
                                        <span
                                          className={cn(
                                            "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                                            selectedCount > 0
                                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                              : "bg-muted text-muted-foreground"
                                          )}
                                        >
                                          {selectedCount}/{permissions.length}
                                        </span>
                                      </div>
                                      <div className="mt-1.5 space-y-0.5 pl-7">{permissions.map(renderPermissionRow)}</div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </AccordionPrimitive.Content>
              </AccordionItem>
            </Accordion>
          </div>

          <aside className="space-y-4 rounded-lg border border-border/70 p-4 lg:sticky lg:top-0">
            <div>
              <p className="text-sm font-semibold text-foreground">{trimmedName || "Untitled role"}</p>
              <p className="text-xs text-muted-foreground">
                {description.trim() || "No description yet"}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-foreground">Permissions granted</p>
              <p className="text-xs text-muted-foreground">{selectedPermissions.length} permission(s)</p>
            </div>
            {selectedPermissions.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nothing selected yet.</p>
            ) : (
              <div className="max-h-[calc(100vh-360px)] space-y-4 overflow-y-auto">
                {([
                  { label: "In-store", icon: StorefrontIcon, items: selectedOffline },
                  { label: "Online", icon: GlobeIcon, items: selectedOnline },
                ] as const).map(({ label, icon: ChannelIcon, items }) =>
                  items.length > 0 ? (
                    <div key={label}>
                      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        <ChannelIcon className="h-3.5 w-3.5" />
                        {label}
                      </p>
                      <div className="space-y-0.5">
                        {items.map((permission) => (
                          <div
                            key={permission.key}
                            className="flex items-center justify-between gap-1.5 rounded-md px-1.5 py-1 text-xs text-foreground"
                          >
                            <span className="min-w-0 truncate" title={permission.label}>
                              {permission.label}
                            </span>
                            <button
                              type="button"
                              aria-label={`Remove ${permission.label}`}
                              className="shrink-0 text-muted-foreground hover:text-foreground"
                              onClick={() => togglePermission(permission.key, false)}
                            >
                              <XIcon className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

/* ----------------------------- Predefined roles browser -------------------------- */

/** Shows one role's permissions directly — no accordion, since there's only one role
 *  to look at. "Create new role from this" always applies (clone); "Edit this role"
 *  only applies to custom roles, since predefined roles can't be edited in place. */
function ViewRolePermissionsSheet({
  open,
  onOpenChange,
  role,
  onClone,
  onEdit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: ManagedRole | null
  onClone: (role: ManagedRole) => void
  onEdit: (role: ManagedRole) => void
}) {
  const permissions = role ? ALL_PERMISSIONS.filter((permission) => role.permissionKeys.includes(permission.key)) : []
  const offline = permissions.filter((permission) => permission.channel === "offline")
  const online = permissions.filter((permission) => permission.channel === "online")
  const isCustom = role?.roleType === "custom"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl"
        a11yTitle={role ? role.name : "Role permissions"}
        a11yDescription="Permissions granted by this role."
      >
        <SheetHeader className="border-b border-border/70 px-6 pb-4">
          <SheetTitle>{role?.name}</SheetTitle>
          <SheetDescription>
            {role?.description || `${permissions.length} permission(s)`}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto px-6 py-5">
          {permissions.length === 0 ? (
            <p className="text-xs text-muted-foreground">No permissions.</p>
          ) : (
            <>
              {offline.length > 0 ? (
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    <StorefrontIcon className="h-3.5 w-3.5" />
                    In-store
                  </p>
                  <div className="space-y-0.5">
                    {offline.map((permission) => (
                      <div key={permission.key} className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-foreground">
                        <CheckIcon className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        <span className="truncate">{permission.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {online.length > 0 ? (
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    <GlobeIcon className="h-3.5 w-3.5" />
                    Online
                  </p>
                  <div className="space-y-0.5">
                    {online.map((permission) => (
                      <div key={permission.key} className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-foreground">
                        <CheckIcon className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        <span className="truncate">{permission.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>

        <SheetFooter className="border-t border-border/70 px-6 py-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => role && onClone(role)}>
            <CopyIcon className="h-3.5 w-3.5" />
            Create new role from this
          </Button>
          {isCustom && role ? (
            <Button onClick={() => onEdit(role)}>
              <PencilSimpleIcon className="h-3.5 w-3.5" />
              Edit this role
            </Button>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

/* --------------------------- Reassign & delete dialog ---------------------------- */

function ReassignAndDeleteDialog({
  target,
  onOpenChange,
  roleOptions,
  onConfirm,
}: {
  target: { role: ManagedRole; assignedCount: number } | null
  onOpenChange: (open: boolean) => void
  roleOptions: ManagedRole[]
  onConfirm: (replacementRoleName: string) => void
}) {
  const [replacement, setReplacement] = useState("")

  useEffect(() => {
    if (target) setReplacement(roleOptions.find((option) => option.id !== target.role.id)?.name ?? "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  const availableOptions = roleOptions.filter((option) => option.id !== target?.role.id)

  return (
    <AlertDialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reassign {target?.assignedCount} user(s) before deleting "{target?.role.name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This role is still assigned to {target?.assignedCount} user(s). Choose a role to move them to — "{target?.role.name}"
            is deleted immediately after.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
          <Label className="mb-2 block text-xs text-muted-foreground">Move affected users to</Label>
          <Select value={replacement} onValueChange={setReplacement}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableOptions.map((option) => (
                <SelectItem key={option.id} value={option.name}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={!replacement} onClick={() => onConfirm(replacement)}>
            Reassign &amp; delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/* --------------------------- Edit assignment sheet ------------------------------ */

function groupRolesBySystem(roleCatalog: ManagedRole[]) {
  return {
    offline: roleCatalog.filter((role) => role.system === "offline"),
    online: roleCatalog.filter((role) => role.system === "online"),
    custom: roleCatalog.filter((role) => role.roleType === "custom"),
  }
}

function RoleSelectField({
  roleName,
  onChange,
  roleCatalog,
}: {
  roleName: string
  onChange: (name: string) => void
  roleCatalog: ManagedRole[]
}) {
  const grouped = groupRolesBySystem(roleCatalog)
  const selected = roleCatalog.find((role) => role.name === roleName)

  function renderRoleItem(role: ManagedRole) {
    return (
      <SelectItem key={role.id} value={role.name}>
        <span className="flex flex-col gap-0.5 py-0.5">
          <span>{role.name}</span>
          {role.description ? (
            <span className="text-xs whitespace-normal text-muted-foreground">{role.description}</span>
          ) : null}
        </span>
      </SelectItem>
    )
  }

  return (
    <div className="space-y-2">
      <Label>Role</Label>
      <Select value={roleName} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue>{selected?.name}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {grouped.offline.length > 0 ? (
            <SelectGroup>
              <SelectLabel>Offline (in-store)</SelectLabel>
              {grouped.offline.map(renderRoleItem)}
            </SelectGroup>
          ) : null}
          {grouped.online.length > 0 ? (
            <SelectGroup>
              <SelectLabel>Online (payment gateway)</SelectLabel>
              {grouped.online.map(renderRoleItem)}
            </SelectGroup>
          ) : null}
          {grouped.custom.length > 0 ? (
            <SelectGroup>
              <SelectLabel>Custom roles</SelectLabel>
              {grouped.custom.map(renderRoleItem)}
            </SelectGroup>
          ) : null}
        </SelectContent>
      </Select>
    </div>
  )
}

/** Read-only preview of what a role grants — shown while inviting or reassigning a
 *  user so the admin can see the access they're about to hand out before confirming. */
/** Always-visible section (no accordion) so an admin sees the full grant up front
 *  while inviting or reassigning a user, rather than having to expand to find it. */
function RolePermissionsPreview({ role }: { role: ManagedRole | undefined }) {
  if (!role) return null

  const permissions = ALL_PERMISSIONS.filter((permission) => role.permissionKeys.includes(permission.key))
  const offline = permissions.filter((permission) => permission.channel === "offline")
  const online = permissions.filter((permission) => permission.channel === "online")

  return (
    <div className="space-y-4">
      <Separator className="-mx-6 w-auto" />
      <div>
        <p className="text-sm font-medium text-foreground">Permissions this role grants</p>
        <p className="text-xs text-muted-foreground">{permissions.length} permission(s)</p>
      </div>
      {permissions.length === 0 ? (
        <p className="text-xs text-muted-foreground">No permissions.</p>
      ) : (
        <div className="space-y-4">
          {offline.length > 0 ? (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                <StorefrontIcon className="h-3.5 w-3.5" />
                In-store
              </p>
              <div className="space-y-0.5">
                {offline.map((permission) => (
                  <div key={permission.key} className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-foreground">
                    <CheckIcon className="h-3 w-3 shrink-0 text-emerald-500" />
                    <span className="truncate" title={permission.label}>
                      {permission.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {online.length > 0 ? (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                <GlobeIcon className="h-3.5 w-3.5" />
                Online
              </p>
              <div className="space-y-0.5">
                {online.map((permission) => (
                  <div key={permission.key} className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-foreground">
                    <CheckIcon className="h-3 w-3 shrink-0 text-emerald-500" />
                    <span className="truncate" title={permission.label}>
                      {permission.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

function EditAssignmentSheet({
  open,
  onOpenChange,
  entry,
  roleCatalog,
  roster,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: RosterEntry | null
  roleCatalog: ManagedRole[]
  /** Used to catch renaming this user's email to one already used by someone else. */
  roster: RosterEntry[]
  onSave: (id: string, patch: { name: string; email: string; role: string; scope: string }) => void
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [roleName, setRoleName] = useState("")

  useEffect(() => {
    if (!open || !entry) return
    setName(entry.name)
    setEmail(entry.email)
    setRoleName(entry.role)
  }, [open, entry])

  const nameValid = name.trim().length > 0
  const normalizedEmail = email.trim().toLowerCase()
  const emailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  const selectedRole = roleCatalog.find((role) => role.name === roleName)

  const collidingEntry = emailFormatValid
    ? roster.find((row) => row.id !== entry?.id && row.email.trim().toLowerCase() === normalizedEmail)
    : undefined
  const emailError = collidingEntry ? `This email already belongs to ${collidingEntry.name}.` : null

  const canSave = Boolean(entry) && nameValid && emailFormatValid && !emailError

  function handleSave() {
    if (!entry || !canSave) return
    const scope = selectedRole ? computeAccessScope(selectedRole.permissionKeys) : entry.scope
    onSave(entry.id, { name: name.trim(), email: email.trim(), role: roleName, scope })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md"
        a11yTitle="Edit user"
        a11yDescription="Change this user's name, email, and role."
      >
        <SheetHeader className="border-b border-border/70 px-6 pb-4">
          <SheetTitle>Edit user</SheetTitle>
          <SheetDescription className="flex flex-wrap items-center gap-2">
            <span>Update this user's details.</span>
            {entry ? <StatusBadge status={entry.status} /> : null}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="edit-user-name">Full name</Label>
            <Input id="edit-user-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-user-email">Email</Label>
            <Input
              id="edit-user-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(emailError)}
              className={cn(emailError && "border-destructive focus-visible:ring-destructive/40")}
            />
            {emailError ? <p className="text-xs text-destructive">{emailError}</p> : null}
          </div>

          <RoleSelectField roleName={roleName} onChange={setRoleName} roleCatalog={roleCatalog} />
          <RolePermissionsPreview role={selectedRole} />
        </div>

        <SheetFooter className="border-t border-border/70 px-6 py-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

/* ------------------------------ Invite user sheet -------------------------------- */

function InviteUserSheet({
  open,
  onOpenChange,
  roleCatalog,
  roster,
  onInvite,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  roleCatalog: ManagedRole[]
  /** Used to catch inviting an email that's already active, pending, or removed. */
  roster: RosterEntry[]
  onInvite: (invite: { name: string; email: string; role: string }) => void
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [roleName, setRoleName] = useState(roleCatalog[0]?.name ?? "")

  useEffect(() => {
    if (!open) return
    setName("")
    setEmail("")
    setRoleName(roleCatalog[0]?.name ?? "")
  }, [open, roleCatalog])

  const nameValid = name.trim().length > 0
  const normalizedEmail = email.trim().toLowerCase()
  const emailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  const selectedRole = roleCatalog.find((role) => role.name === roleName)

  const existingEntry = emailFormatValid
    ? roster.find((entry) => entry.email.trim().toLowerCase() === normalizedEmail)
    : undefined
  const emailError = !existingEntry
    ? null
    : existingEntry.status === "Active"
      ? "This email already belongs to an active user."
      : existingEntry.status === "Invited"
        ? "An invite is already pending for this email."
        : "This user was previously removed — reactivate them from the Users list instead of inviting again."

  const canInvite = nameValid && emailFormatValid && Boolean(roleName) && !emailError

  function handleInvite() {
    if (!canInvite) return
    onInvite({ name: name.trim(), email: email.trim(), role: roleName })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md"
        a11yTitle="Invite user"
        a11yDescription="Invite a teammate and assign them a role."
      >
        <SheetHeader className="border-b border-border/70 px-6 pb-4">
          <SheetTitle>Invite user</SheetTitle>
          <SheetDescription>They'll show up as Invited — pending until they accept.</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="invite-name">Full name</Label>
            <Input
              id="invite-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Priya Singh"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teammate@company.com"
              aria-invalid={Boolean(emailError)}
              className={cn(emailError && "border-destructive focus-visible:ring-destructive/40")}
            />
            {emailError ? <p className="text-xs text-destructive">{emailError}</p> : null}
          </div>

          <RoleSelectField roleName={roleName} onChange={setRoleName} roleCatalog={roleCatalog} />
          <RolePermissionsPreview role={selectedRole} />
        </div>

        <SheetFooter className="border-t border-border/70 px-6 py-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={!canInvite}>
            <UserPlusIcon className="h-3.5 w-3.5" />
            Send invite
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

/* ------------------------------ Delete confirmation ------------------------------ */

function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/* ------------------------------- Manage users shell ----------------------------- */

function ManageUsersSection() {
  const [screen, setScreen] = useState<"list" | "migration" | "role-form">("list")
  const [tab, setTab] = useState<"users" | "roles">("users")

  const [roster, setRoster] = useState<RosterEntry[]>(INITIAL_ROSTER)
  const [roleCatalog, setRoleCatalog] = useState<ManagedRole[]>(INITIAL_ROLE_CATALOG)
  const [migrationRows, setMigrationRows] = useState<MigrationAuditRow[]>(MIGRATION_AUDIT_SEED)

  const [roleSheetTarget, setRoleSheetTarget] = useState<ManagedRole | null>(null)
  const [rolePrefill, setRolePrefill] = useState<CustomRoleDraft | null>(null)
  const [viewRoleTarget, setViewRoleTarget] = useState<ManagedRole | null>(null)
  const [assignmentSheetOpen, setAssignmentSheetOpen] = useState(false)
  const [assignmentTarget, setAssignmentTarget] = useState<RosterEntry | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [removeUserTarget, setRemoveUserTarget] = useState<RosterEntry | null>(null)
  const [cancelInviteTarget, setCancelInviteTarget] = useState<RosterEntry | null>(null)
  const [deleteRoleTarget, setDeleteRoleTarget] = useState<ManagedRole | null>(null)
  const [reassignTarget, setReassignTarget] = useState<{ role: ManagedRole; assignedCount: number } | null>(null)

  const deleteTarget:
    | { type: "role"; role: ManagedRole }
    | { type: "removeUser"; entry: RosterEntry }
    | { type: "cancelInvite"; entry: RosterEntry }
    | null = deleteRoleTarget
    ? { type: "role", role: deleteRoleTarget }
    : removeUserTarget
      ? { type: "removeUser", entry: removeUserTarget }
      : cancelInviteTarget
        ? { type: "cancelInvite", entry: cancelInviteTarget }
        : null

  const pendingMigrationCount = migrationRows.filter((row) => row.status === "pending").length

  function openCreateRole() {
    setRoleSheetTarget(null)
    setRolePrefill(null)
    setScreen("role-form")
  }

  function openCloneRole(role: ManagedRole) {
    setRoleSheetTarget(null)
    setRolePrefill({ name: `${role.name} (Custom)`, description: role.description, permissionKeys: role.permissionKeys })
    setViewRoleTarget(null)
    setScreen("role-form")
  }

  function openEditRow(row: RosterEntry) {
    setAssignmentTarget(row)
    setAssignmentSheetOpen(true)
  }

  function openEditRole(role: ManagedRole) {
    setViewRoleTarget(null)
    setRoleSheetTarget(role)
    setRolePrefill(null)
    setScreen("role-form")
  }

  function openViewRole(role: ManagedRole) {
    setViewRoleTarget(role)
  }

  function handleSaveRole(role: CustomRoleDraft) {
    const duplicateName = roleCatalog.find(
      (entry) => entry.id !== roleSheetTarget?.id && entry.name.trim().toLowerCase() === role.name.trim().toLowerCase()
    )
    if (duplicateName) {
      toast.error(`A role named "${duplicateName.name}" already exists`)
      return
    }
    const duplicatePermissions = roleCatalog.find(
      (entry) => entry.id !== roleSheetTarget?.id && permissionSetsEqual(entry.permissionKeys, role.permissionKeys)
    )
    if (duplicatePermissions) {
      toast.error(`A role with the same permissions already exists: "${duplicatePermissions.name}"`)
      return
    }

    if (roleSheetTarget) {
      const previousName = roleSheetTarget.name
      setRoleCatalog((current) =>
        current.map((entry) =>
          entry.id === roleSheetTarget.id
            ? { ...entry, name: role.name, description: role.description, permissionKeys: role.permissionKeys }
            : entry
        )
      )
      if (previousName !== role.name) {
        setRoster((current) =>
          current.map((entry) => (entry.role === previousName ? { ...entry, role: role.name } : entry))
        )
      }
      toast.success(`Role "${role.name}" updated`)
      setScreen("list")
      return
    }

    const id = `custom-role-${Date.now()}`
    setRoleCatalog((current) => [
      { id, name: role.name, roleType: "custom", description: role.description, permissionKeys: role.permissionKeys },
      ...current,
    ])
    setRolePrefill(null)
    toast.success(`Custom role "${role.name}" created with ${role.permissionKeys.length} permission(s)`)
    setScreen("list")
  }

  function handleSaveAssignment(id: string, patch: { name: string; email: string; role: string; scope: string }) {
    setRoster((current) => current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)))
    toast.success("User updated")
  }

  function handleInvite({ name, email, role }: { name: string; email: string; role: string }) {
    const normalizedEmail = email.trim().toLowerCase()
    if (roster.some((entry) => entry.email.trim().toLowerCase() === normalizedEmail)) {
      toast.error(`${email} is already invited or added`)
      return
    }
    const catalogEntry = roleCatalog.find((entry) => entry.name === role)
    const scope = catalogEntry ? computeAccessScope(catalogEntry.permissionKeys) : "In-store"
    const { dateStr, timeStr } = formatNow()
    const newEntry: RosterEntry = {
      id: `invite-${Date.now()}`,
      name,
      email,
      addedOnDate: dateStr,
      addedOnTime: timeStr,
      scope,
      role,
      status: "Invited",
    }
    setRoster((current) => [newEntry, ...current])
    toast.success(`Invite sent to ${email}`)
  }

  /** Active users lose access but stay in the list (status → Removed) so they can be
   *  reactivated. Pending invites have no access to revoke, so cancelling removes the row. */
  function requestRemoveUser(row: RosterEntry) {
    setRemoveUserTarget(row)
  }

  function requestCancelInvite(row: RosterEntry) {
    setCancelInviteTarget(row)
  }

  function handleReactivateUser(row: RosterEntry) {
    setRoster((current) => current.map((entry) => (entry.id === row.id ? { ...entry, status: "Active" } : entry)))
    toast.success(`${row.name} reactivated`)
  }

  function handleResendInvite(row: RosterEntry) {
    toast.success(`Invite resent to ${row.email}`)
  }

  /** Custom-role deletes get routed through a reassign-first flow when active/invited users
   *  are still on that role — removed users don't block the delete since they've lost access. */
  function requestDeleteRole(role: ManagedRole) {
    const assignedCount = roster.filter((entry) => entry.role === role.name && entry.status !== "Removed").length
    if (assignedCount > 0) {
      setReassignTarget({ role, assignedCount })
      return
    }
    setDeleteRoleTarget(role)
  }

  function closeDeleteDialog() {
    setRemoveUserTarget(null)
    setCancelInviteTarget(null)
    setDeleteRoleTarget(null)
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return

    if (deleteTarget.type === "role") {
      setRoleCatalog((current) => current.filter((entry) => entry.id !== deleteTarget.role.id))
      toast.success(`Role "${deleteTarget.role.name}" deleted`)
    } else if (deleteTarget.type === "removeUser") {
      setRoster((current) =>
        current.map((entry) => (entry.id === deleteTarget.entry.id ? { ...entry, status: "Removed" } : entry))
      )
      toast.success(`${deleteTarget.entry.name} removed — access revoked`)
    } else {
      setRoster((current) => current.filter((entry) => entry.id !== deleteTarget.entry.id))
      toast.success(`Invite to ${deleteTarget.entry.email} cancelled`)
    }
  }

  function handleReassignAndDelete(replacementName: string) {
    if (!reassignTarget) return
    const replacement = roleCatalog.find((entry) => entry.name === replacementName)
    if (!replacement) return

    const { role, assignedCount } = reassignTarget
    const newScope = computeAccessScope(replacement.permissionKeys)

    setRoster((current) =>
      current.map((entry) =>
        entry.role === role.name ? { ...entry, role: replacement.name, scope: newScope } : entry
      )
    )
    setRoleCatalog((current) => current.filter((entry) => entry.id !== role.id))
    toast.success(`Reassigned ${assignedCount} user(s) to "${replacement.name}" and deleted "${role.name}"`)
    setReassignTarget(null)
  }

  function updateMigrationRow(id: string, patch: Partial<MigrationAuditRow>) {
    setMigrationRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  function approveMigrationRow(id: string) {
    updateMigrationRow(id, { status: "approved" })
  }

  function resetMigrationRow(id: string) {
    const seedRow = MIGRATION_AUDIT_SEED.find((row) => row.id === id)
    if (seedRow) updateMigrationRow(id, { ...seedRow })
  }

  function overrideMigrationRow(id: string, option: RoleOption) {
    updateMigrationRow(id, {
      status: "overridden",
      migratedRole: { name: option.name, roleType: option.roleType, permissionKeys: option.permissionKeys },
      accessScope: computeAccessScope(option.permissionKeys),
      comment: "Manually overridden by admin during migration review.",
    })
  }

  function approveAllPendingMigration() {
    setMigrationRows((current) => current.map((row) => (row.status === "pending" ? { ...row, status: "approved" } : row)))
    toast.success("All pending rows approved")
  }

  function commitMigration() {
    if (pendingMigrationCount > 0) {
      toast.error("Resolve all pending rows before committing the migration")
      return
    }
    toast.success("Migration committed — Omni is now the source of truth for users & roles")
    setScreen("list")
  }

  if (screen === "migration") {
    return (
      <MigrationAuditSection
        rows={migrationRows}
        onApprove={approveMigrationRow}
        onOverride={overrideMigrationRow}
        onReset={resetMigrationRow}
        onApproveAll={approveAllPendingMigration}
        onCommit={commitMigration}
        onBack={() => setScreen("list")}
      />
    )
  }

  if (screen === "role-form") {
    return (
      <CreateRolePage
        onBack={() => setScreen("list")}
        onSave={handleSaveRole}
        isEditingExisting={Boolean(roleSheetTarget)}
        roleCatalog={roleCatalog}
        excludeRoleId={roleSheetTarget?.id}
        initial={
          roleSheetTarget
            ? {
                name: roleSheetTarget.name,
                description: roleSheetTarget.description,
                permissionKeys: roleSheetTarget.permissionKeys,
              }
            : rolePrefill
        }
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Tabs value={tab} onValueChange={(value) => setTab(value as "users" | "roles")} className="flex h-full flex-col gap-0">
        <div className="border-b border-border/70 px-8 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
            <h1 className="text-2xl font-bold leading-none tracking-[-0.01em] text-foreground">Manage users</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={openCreateRole}>
                Add custom role
              </Button>
              <Button size="sm" onClick={() => setInviteOpen(true)}>
                <UserPlusIcon className="h-3.5 w-3.5" />
                Invite user
              </Button>
            </div>
          </div>
          <TabsList variant="line" className="h-9 w-fit gap-6 p-0">
            <TabsTrigger value="users" className="flex-none px-1 text-sm data-active:font-semibold after:bg-primary">
              Users
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex-none px-1 text-sm data-active:font-semibold after:bg-primary">
              Roles
            </TabsTrigger>
          </TabsList>
        </div>

        {pendingMigrationCount > 0 ? (
          <div className="px-8 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <WarningIcon className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-foreground">
                  <span className="font-medium">{pendingMigrationCount} user(s)</span> need migration review before Omni
                  permissions are finalized.
                </p>
              </div>
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setScreen("migration")}>
                Review migration
              </Button>
            </div>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <TabsContent value="users">
            <UsersTable
              rows={roster}
              roleCatalog={roleCatalog}
              onEdit={openEditRow}
              onRemove={requestRemoveUser}
              onReactivate={handleReactivateUser}
              onCancelInvite={requestCancelInvite}
              onResendInvite={handleResendInvite}
            />
          </TabsContent>
          <TabsContent value="roles">
            <RolesTable roles={roleCatalog} roster={roster} onView={openViewRole} onDelete={requestDeleteRole} />
          </TabsContent>
        </div>
      </Tabs>

      <ViewRolePermissionsSheet
        open={Boolean(viewRoleTarget)}
        onOpenChange={(open) => {
          if (!open) setViewRoleTarget(null)
        }}
        role={viewRoleTarget}
        onClone={openCloneRole}
        onEdit={openEditRole}
      />

      <EditAssignmentSheet
        open={assignmentSheetOpen}
        onOpenChange={setAssignmentSheetOpen}
        entry={assignmentTarget}
        roleCatalog={roleCatalog}
        roster={roster}
        onSave={handleSaveAssignment}
      />

      <InviteUserSheet
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        roleCatalog={roleCatalog}
        roster={roster}
        onInvite={handleInvite}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog()
        }}
        title={
          deleteTarget?.type === "role"
            ? `Delete "${deleteTarget.role.name}" role?`
            : deleteTarget?.type === "removeUser"
              ? `Remove ${deleteTarget.entry.name}?`
              : deleteTarget?.type === "cancelInvite"
                ? `Cancel invite to ${deleteTarget.entry.name}?`
                : ""
        }
        description={
          deleteTarget?.type === "role"
            ? "This role definition will be removed. No users are currently assigned to it."
            : deleteTarget?.type === "removeUser"
              ? "This user's access will be revoked immediately. You can reactivate them later from the Users list."
              : "The pending invite will be cancelled and removed from the list."
        }
        confirmLabel={
          deleteTarget?.type === "role" ? "Delete" : deleteTarget?.type === "removeUser" ? "Remove user" : "Cancel invite"
        }
        onConfirm={handleDeleteConfirm}
      />

      <ReassignAndDeleteDialog
        target={reassignTarget}
        onOpenChange={(open) => {
          if (!open) setReassignTarget(null)
        }}
        roleOptions={roleCatalog}
        onConfirm={handleReassignAndDelete}
      />
    </div>
  )
}

/* ---------------------------------- Dispatcher ---------------------------------- */

export function SettingsPanelContent({ module }: { module: SettingsModule }) {
  switch (module) {
    case "personal-details":
      return <PersonalDetailsSection />
    case "manage-stores":
      return <ManageStoresSection />
    case "configure-checkout":
      return <ConfigureCheckoutSection />
    case "users":
      return <ManageUsersSection />
    case "credentials":
      return <CredentialsSection />
    case "webhooks":
      return <WebhooksSection />
    default:
      return null
  }
}
