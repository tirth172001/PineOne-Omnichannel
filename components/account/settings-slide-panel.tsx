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
  SlidersIcon,
  StorefrontIcon,
  TrashIcon,
  UserCircleIcon,
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  LINE_TAB_TRIGGER_CLASSES,
  LINE_TABS_LIST_CLASSES,
  ListingToolbar,
  PAGE_HEADING_CLASSES,
  type ListingFilter,
} from "@/components/shared/listing-page-primitives"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SectionSummaryStrip } from "@/components/dashboard/section-summary-strip"
import { StoreMultiSelect } from "@/components/shared/store-multi-select"
import { readDummyAuthSession } from "@/lib/dummy-auth"
import { STORE_IDENTITIES } from "@/lib/store-identity"
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

export type AccountSettingsTab = "personal-details" | "credentials" | "webhooks" | "refunds"

/* --------------------------------- Shared bits ------------------------------- */

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

function SectionIntro({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
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
  )
}

/* --------------------------------- Credentials -------------------------------- */

function CredentialsSection() {
  const merchantId = "2874783427443743984"
  const clientId = "2874783427443743984"
  const secretKey = "sk_live_9F72xLp84QzTn5W1yRVdKt"

  return (
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
  )
}

/* ---------------------------------- Webhooks ----------------------------------- */

function WebhooksSection() {
  const [url] = useState("https://www.pinelabs.com/updates")

  return (
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
  )
}

/* ---------------------------------- Refunds ------------------------------------ */

/** Lets an admin grant refund access to individual Store Managers and Accountants —
 *  Owners and Admins always have refund access, so this dialog only manages the two
 *  roles whose access is opt-in. Selections are staged in `draft` until Apply. */
function RefundAccessDialog({
  open,
  onOpenChange,
  storeManagers,
  accountants,
  selectedIds,
  onApply,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeManagers: RosterEntry[]
  accountants: RosterEntry[]
  selectedIds: string[]
  onApply: (ids: string[]) => void
}) {
  const [group, setGroup] = useState<"store-managers" | "accountants">("store-managers")
  const [search, setSearch] = useState("")
  const [storeFilter, setStoreFilter] = useState("all")
  const [draft, setDraft] = useState<string[]>(selectedIds)

  useEffect(() => {
    if (!open) return
    setDraft(selectedIds)
    setSearch("")
    setStoreFilter("all")
    setGroup("store-managers")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const groupUsers = group === "store-managers" ? storeManagers : accountants
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return groupUsers.filter((user) => {
      if (storeFilter !== "all" && !user.storeIds?.includes(storeFilter)) return false
      if (!query) return true
      return `${user.name} ${user.email}`.toLowerCase().includes(query)
    })
  }, [groupUsers, search, storeFilter])

  const allFilteredSelected = filteredUsers.length > 0 && filteredUsers.every((user) => draft.includes(user.id))
  const selectedInGroupCount = groupUsers.filter((user) => draft.includes(user.id)).length

  function toggleUser(id: string) {
    setDraft((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  function toggleAllFiltered(checked: boolean) {
    const ids = filteredUsers.map((user) => user.id)
    setDraft((current) => {
      if (checked) return Array.from(new Set([...current, ...ids]))
      const idSet = new Set(ids)
      return current.filter((item) => !idSet.has(item))
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="border-b border-border/70 px-5 py-4">
          <DialogTitle>Select users</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users"
                className="h-9 pl-8 text-sm"
              />
            </div>
            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger className="h-9 w-full text-xs sm:w-44">
                <SelectValue placeholder="Filter by store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stores</SelectItem>
                {STORE_IDENTITIES.map((store) => (
                  <SelectItem key={store.storeId} value={store.storeId}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={group === "store-managers" ? "default" : "outline"}
              size="sm"
              className="h-7 rounded-full text-xs"
              onClick={() => setGroup("store-managers")}
            >
              Store Managers ({storeManagers.length})
            </Button>
            <Button
              type="button"
              variant={group === "accountants" ? "default" : "outline"}
              size="sm"
              className="h-7 rounded-full text-xs"
              onClick={() => setGroup("accountants")}
            >
              Accountants ({accountants.length})
            </Button>
          </div>

          <p className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            List also contains store managers managing more than 1 store
          </p>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Checkbox checked={allFilteredSelected} onCheckedChange={(checked) => toggleAllFiltered(checked === true)} />
              Select all
            </label>
            <span className="text-xs text-muted-foreground">
              {selectedInGroupCount}/{groupUsers.length} users selected
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto rounded-md border border-border/70">
            {filteredUsers.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">No users found.</p>
            ) : (
              <div className="divide-y divide-border/60">
                {filteredUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-sm text-foreground"
                  >
                    <span className="min-w-0 truncate">{user.name}</span>
                    <Checkbox checked={draft.includes(user.id)} onCheckedChange={() => toggleUser(user.id)} />
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-border/70 px-5 py-4 sm:justify-end">
          <Button variant="outline" onClick={() => setDraft(selectedIds)}>
            Reset
          </Button>
          <Button
            onClick={() => {
              onApply(draft)
              onOpenChange(false)
              toast.success("Refund access updated")
            }}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RefundsSettingsSection() {
  const [refundsEnabled, setRefundsEnabled] = useState(false)
  const [adminApprovalRequired, setAdminApprovalRequired] = useState(true)
  const [adminApprovalEditable, setAdminApprovalEditable] = useState(false)
  const [otpRequired, setOtpRequired] = useState(false)
  const [partialRefundAllowed, setPartialRefundAllowed] = useState<"yes" | "no">("no")
  const [paymentModes, setPaymentModes] = useState({ upi: true, card: true, smsPay: true })
  const [refundLimit, setRefundLimit] = useState("1")
  const [accessUserIds, setAccessUserIds] = useState<string[]>([])
  const [editUsersOpen, setEditUsersOpen] = useState(false)

  const storeManagerUsers = useMemo(
    () => INITIAL_ROSTER.filter((user) => user.status !== "Deactivated" && user.role === "Store Manager"),
    []
  )
  const accountantUsers = useMemo(
    () => INITIAL_ROSTER.filter((user) => user.status !== "Deactivated" && user.role === "Accountant"),
    []
  )
  const ownerCount = useMemo(
    () => INITIAL_ROSTER.filter((user) => user.status !== "Deactivated" && user.role === "Owner").length,
    []
  )
  const adminCount = useMemo(
    () => INITIAL_ROSTER.filter((user) => user.status !== "Deactivated" && user.role === "Admin").length,
    []
  )
  const selectedStoreManagerCount = storeManagerUsers.filter((user) => accessUserIds.includes(user.id)).length
  const selectedAccountantCount = accountantUsers.filter((user) => accessUserIds.includes(user.id)).length
  const totalAccessCount = ownerCount + adminCount + selectedStoreManagerCount + selectedAccountantCount
  const allPaymentModesChecked = paymentModes.upi && paymentModes.card && paymentModes.smsPay

  return (
    <div className="w-full max-w-[1360px] space-y-8">
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <SectionIntro
          title="Refunds via Pine Labs One"
          description="Enable refunds to start offering them for different transactions."
        />
        <div className="space-y-3">
          <FieldRow
            icon={ArrowCounterClockwiseIcon}
            label="Enable refunds"
            value={refundsEnabled ? "Enabled" : "Disabled"}
            action={<Switch checked={refundsEnabled} onCheckedChange={setRefundsEnabled} />}
          />
        </div>
      </div>

      <div className={cn("space-y-8", !refundsEnabled && "pointer-events-none opacity-50")}>
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <SectionIntro
            title="User access"
            description="Owners and admins always have refund access. Grant it to store managers and accountants here."
          />
          <div className="space-y-3">
            <FieldRow
              icon={UsersIcon}
              label={`${totalAccessCount} users have access`}
              value={`${ownerCount} Owner · ${adminCount} Admins · ${selectedStoreManagerCount} Store Managers · ${selectedAccountantCount} Accountant`}
              action={
                <Button variant="outline" size="sm" onClick={() => setEditUsersOpen(true)}>
                  Edit users
                </Button>
              }
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <SectionIntro title="Security controls" description="Add extra checks before a refund is processed." />
          <div className="space-y-3">
            <FieldRow
              icon={KeyIcon}
              label="Admin approval required"
              value="Requires an admin to approve refunds initiated by store managers or accountants"
              action={
                <div className="flex items-center gap-3">
                  {!adminApprovalEditable ? (
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                      onClick={() => setAdminApprovalEditable(true)}
                    >
                      Edit
                    </button>
                  ) : null}
                  <Switch
                    checked={adminApprovalRequired}
                    disabled={!adminApprovalEditable}
                    onCheckedChange={setAdminApprovalRequired}
                  />
                </div>
              }
            />
            <FieldRow
              icon={DeviceMobileIcon}
              label="OTP based authentication"
              value="Send an OTP to the customer before processing their refund"
              action={<Switch checked={otpRequired} onCheckedChange={setOtpRequired} />}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <SectionIntro title="Refund type" description="Choose whether store staff can issue partial refunds." />
          <div className="space-y-3">
            <FieldRow
              icon={RepeatIcon}
              label="Partial refund"
              value="Allow refunding less than the full transaction amount"
              action={
                <RadioGroup
                  value={partialRefundAllowed}
                  onValueChange={(value) => setPartialRefundAllowed(value as "yes" | "no")}
                  className="flex w-auto items-center gap-4"
                >
                  <label className="flex items-center gap-1.5 text-sm text-foreground">
                    <RadioGroupItem value="yes" /> Yes
                  </label>
                  <label className="flex items-center gap-1.5 text-sm text-foreground">
                    <RadioGroupItem value="no" /> No
                  </label>
                </RadioGroup>
              }
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <SectionIntro title="Payment modes" description="Choose which payment modes support refunds." />
          <div className="space-y-3">
            <FieldRow
              icon={WalletIcon}
              label="All payment modes"
              value="Enable refunds across every supported payment mode"
              action={
                <Checkbox
                  checked={allPaymentModesChecked}
                  onCheckedChange={(checked) =>
                    setPaymentModes({ upi: checked === true, card: checked === true, smsPay: checked === true })
                  }
                />
              }
            />
            <FieldRow
              icon={LinkIcon}
              label="UPI"
              value="Refunds for transactions paid via UPI"
              action={
                <Checkbox
                  checked={paymentModes.upi}
                  onCheckedChange={(checked) => setPaymentModes((current) => ({ ...current, upi: checked === true }))}
                />
              }
            />
            <FieldRow
              icon={CreditCardIcon}
              label="Card"
              value="Refunds for transactions paid via card"
              action={
                <Checkbox
                  checked={paymentModes.card}
                  onCheckedChange={(checked) => setPaymentModes((current) => ({ ...current, card: checked === true }))}
                />
              }
            />
            <FieldRow
              icon={PhoneIcon}
              label="SMS Pay"
              value="Refunds for transactions paid via SMS Pay"
              action={
                <Checkbox
                  checked={paymentModes.smsPay}
                  onCheckedChange={(checked) => setPaymentModes((current) => ({ ...current, smsPay: checked === true }))}
                />
              }
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <SectionIntro
            title="Refund limit"
            description="Refunds above this amount always require admin approval."
          />
          <div className="space-y-3">
            <FieldRow
              icon={HardDrivesIcon}
              label="Limit processed without approval"
              value={`₹${refundLimit || 0}`}
              action={
                <InputGroup className="h-9 w-32">
                  <InputGroupAddon>
                    <InputGroupText>₹</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    value={refundLimit}
                    onChange={(event) => setRefundLimit(event.target.value.replace(/[^0-9]/g, ""))}
                    inputMode="numeric"
                  />
                </InputGroup>
              }
            />
          </div>
        </div>
      </div>

      <RefundAccessDialog
        open={editUsersOpen}
        onOpenChange={setEditUsersOpen}
        storeManagers={storeManagerUsers}
        accountants={accountantUsers}
        selectedIds={accessUserIds}
        onApply={setAccessUserIds}
      />
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
  if (status === "Pending") return "bg-sky-500"
  return "bg-muted-foreground/50"
}

function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium",
        status === "Deactivated" ? "border-border/60 text-muted-foreground" : "border-border bg-background text-foreground"
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
    <div className="flex flex-wrap items-center gap-1.5">
      {showStore ? (
        <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-xs font-medium text-foreground">
          <StorefrontIcon className="h-3 w-3 text-muted-foreground" />
          In-store
        </span>
      ) : null}
      {showGlobe ? (
        <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-xs font-medium text-foreground">
          <GlobeIcon className="h-3 w-3 text-muted-foreground" />
          Online
        </span>
      ) : null}
    </div>
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

/* --------------------------------- Generic table -------------------------------- */

/** Actions available depend on status: pending invites can be resent or cancelled,
 *  active users can be edited or deactivated, deactivated users can only be
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label="User actions" className="h-8 w-8 rounded-md">
          <DotsThreeVerticalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {entry.status === "Invited" ? (
          <>
            <DropdownMenuItem onSelect={onResendInvite}>
              <EnvelopeSimpleIcon className="h-4 w-4" />
              Send reminder mail
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onEdit}>
              <PencilSimpleIcon className="h-4 w-4" />
              Edit users details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onCancelInvite}>
              <TrashIcon className="h-4 w-4" />
              Cancel invite
            </DropdownMenuItem>
          </>
        ) : entry.status === "Active" ? (
          <>
            <DropdownMenuItem onSelect={onEdit}>
              <PencilSimpleIcon className="h-4 w-4" />
              Edit users details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onRemove}>
              <TrashIcon className="h-4 w-4" />
              Deactivate user
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onSelect={onReactivate}>
            <ArrowCounterClockwiseIcon className="h-4 w-4" />
            Reactivate user
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Editing and cloning both live inside the "View permissions" sheet now — the row
 *  only needs an action to open that view, plus a quick destructive Delete for custom roles. */
function RoleRowActions({
  role,
  onClone,
  onEdit,
  onDelete,
}: {
  role: ManagedRole
  onClone: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const isCustom = role.roleType === "custom"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Role actions"
          className="h-8 w-8 rounded-md"
          onClick={(event) => event.stopPropagation()}
        >
          <DotsThreeVerticalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onSelect={onClone}>
          <CopyIcon className="h-4 w-4" />
          Create role from this
        </DropdownMenuItem>
        {isCustom ? (
          <>
            <DropdownMenuItem onSelect={onEdit}>
              <PencilSimpleIcon className="h-4 w-4" />
              Edit role details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <TrashIcon className="h-4 w-4" />
              Delete role
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function roleTypeChipLabel(roleType: ManagedRole["roleType"]) {
  return roleType === "custom" ? "Custom role" : "Default role"
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
  onClone,
  onEdit,
  onDelete,
}: {
  roles: ManagedRole[]
  roster: RosterEntry[]
  onView: (role: ManagedRole) => void
  onClone: (role: ManagedRole) => void
  onEdit: (role: ManagedRole) => void
  onDelete: (role: ManagedRole) => void
}) {
  const [search, setSearch] = useState("")

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return roles
    return roles.filter((role) => `${role.name} ${role.description}`.toLowerCase().includes(query))
  }, [roles, search])

  return (
    <div className="space-y-6">
      <ListingToolbar
        className="px-0 py-0"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by role name or description"
        filters={[]}
      />

      <div className="overflow-hidden rounded-[8px] border border-border bg-background">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow className="h-10 [&>th:first-child]:rounded-tl-[8px] [&>th:last-child]:rounded-tr-[8px]">
                <TableHead className="px-3 text-sm font-medium text-muted-foreground">Role details</TableHead>
                <TableHead className="px-3 text-sm font-medium text-muted-foreground">Role type</TableHead>
                <TableHead className="px-3 text-sm font-medium text-muted-foreground">Access scope</TableHead>
                <TableHead className="px-3 text-sm font-medium text-muted-foreground">User assigned</TableHead>
                <TableHead className="px-3 text-right text-sm font-medium text-muted-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.length === 0 ? (
                <TableRow className="h-[72px] hover:bg-transparent">
                  <TableCell colSpan={5} className="px-3 text-sm text-muted-foreground">
                    No roles match your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => (
                  <TableRow
                    key={role.id}
                    className="h-[72px] cursor-pointer"
                    onClick={(event) => {
                      if ((event.target as HTMLElement).closest("button")) return
                      onView(role)
                    }}
                  >
                    <TableCell className="px-3">
                      <p className="text-sm font-medium text-foreground">{role.name}</p>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </TableCell>
                    <TableCell className="px-3">
                      <RoleTypeChip roleType={role.roleType} />
                    </TableCell>
                    <TableCell className="px-3">
                      <AccessScopeBadge scope={computeAccessScope(role.permissionKeys)} />
                    </TableCell>
                    <TableCell className="px-3 text-sm text-foreground">
                      {roster.filter((entry) => entry.role === role.name && entry.status !== "Deactivated").length}
                    </TableCell>
                    <TableCell className="px-3 text-right">
                      <RoleRowActions role={role} onClone={() => onClone(role)} onEdit={() => onEdit(role)} onDelete={() => onDelete(role)} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
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
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")

  const roleFilterOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.role))).sort((a, b) => a.localeCompare(b)),
    [rows]
  )

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false
      if (roleFilter !== "all" && row.role !== roleFilter) return false
      if (query && !`${row.name} ${row.email}`.toLowerCase().includes(query)) return false
      return true
    })
  }, [rows, search, statusFilter, roleFilter])

  const filters: ListingFilter[] = [
    {
      id: "status",
      type: "select",
      label: "Status",
      value: statusFilter,
      onValueChange: setStatusFilter,
      options: [
        { label: "All status", value: "all" },
        { label: "Active", value: "Active" },
        { label: "Invited", value: "Invited" },
        { label: "Deactivated", value: "Deactivated" },
      ],
    },
    {
      id: "role",
      type: "select",
      label: "Role",
      value: roleFilter,
      onValueChange: setRoleFilter,
      options: [
        { label: "All roles", value: "all" },
        ...roleFilterOptions.map((role) => ({ label: role, value: role })),
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <ListingToolbar
        className="px-0 py-0"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email ID"
        filters={filters}
      />

      <div className="overflow-hidden rounded-[8px] border border-border bg-background">
        <div className="overflow-x-auto">
          <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow className="h-10 [&>th:first-child]:rounded-tl-[8px] [&>th:last-child]:rounded-tr-[8px]">
                <TableHead className="px-3 text-sm font-medium text-muted-foreground">User details</TableHead>
                <TableHead className="px-3 text-sm font-medium text-muted-foreground">Role</TableHead>
                <TableHead className="px-3 text-sm font-medium text-muted-foreground">Access scope</TableHead>
                <TableHead className="px-3 text-sm font-medium text-muted-foreground">Status</TableHead>
                <TableHead className="px-3 text-sm font-medium text-muted-foreground">Invited on</TableHead>
                <TableHead className="px-3 text-right text-sm font-medium text-muted-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow className="h-[72px] hover:bg-transparent">
                  <TableCell colSpan={6} className="px-3 text-sm text-muted-foreground">
                    No users match your search or filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row) => {
                  const permissionKeys = roleCatalog.find((role) => role.name === row.role)?.permissionKeys ?? []
                  return (
                    <TableRow key={row.id} className="h-[72px]">
                      <TableCell className={cn("px-3", row.status === "Deactivated" && "opacity-60")}>
                        <p className="text-sm font-medium text-foreground">{row.name}</p>
                        <p className="text-sm text-muted-foreground">{row.email}</p>
                      </TableCell>
                      <TableCell className={cn("px-3", row.status === "Deactivated" && "opacity-60")}>
                        <RoleBadge role={row.role} />
                      </TableCell>
                      <TableCell className={cn("px-3", row.status === "Deactivated" && "opacity-60")}>
                        <AccessScopeBadge scope={computeAccessScope(permissionKeys)} />
                      </TableCell>
                      <TableCell className="px-3">
                        <StatusBadge status={row.status} />
                      </TableCell>
                      <TableCell className="px-3">
                        <p className="text-sm text-foreground">{row.addedOnDate}</p>
                        <p className="text-sm text-muted-foreground">{row.addedOnTime}</p>
                      </TableCell>
                      <TableCell className="px-3 text-right">
                        <UserRowActions
                          entry={row}
                          onEdit={() => onEdit(row)}
                          onRemove={() => onRemove(row)}
                          onReactivate={() => onReactivate(row)}
                          onCancelInvite={() => onCancelInvite(row)}
                          onResendInvite={() => onResendInvite(row)}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
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
      <div className="flex flex-wrap items-center gap-3 px-8 pt-8 pb-8">
        <Button variant="ghost" size="icon-sm" className="h-8 w-8" onClick={onBack} aria-label="Back to Manage users">
          <CaretLeftIcon className="h-4 w-4" />
        </Button>
        <h1 className={PAGE_HEADING_CLASSES}>Migration review</h1>
      </div>

      <Separator />

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
  const [selectedKeys, setSelectedKeys] = useState<string[]>(initial?.permissionKeys ?? [])
  const [offlineSearch, setOfflineSearch] = useState("")
  const [onlineSearch, setOnlineSearch] = useState("")

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

  function buildGroupSections(channel: PermissionChannel, search: string) {
    const query = search.trim().toLowerCase()
    const channelPermissions = channelCatalog[channel]
    const filtered = query
      ? channelPermissions.filter((permission) => `${permission.label} ${permission.group}`.toLowerCase().includes(query))
      : channelPermissions
    return PERMISSION_GROUPS.map((group) => ({
      group,
      permissions: filtered.filter((permission) => permission.group === group),
    })).filter((section) => section.permissions.length > 0)
  }

  function renderPermissionRow(permission: Permission) {
    const checked = selectedKeys.includes(permission.key)
    return (
      <label key={permission.key} className="flex cursor-pointer items-center gap-2.5 px-1 py-1">
        <Checkbox checked={checked} onCheckedChange={(next) => togglePermission(permission.key, next === true)} />
        <span className="min-w-0 truncate text-sm text-foreground" title={permission.label}>
          {permission.label}
        </span>
      </label>
    )
  }

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

  function renderChannelAccordion(
    channel: PermissionChannel,
    label: string,
    search: string,
    setSearch: (value: string) => void
  ) {
    const channelAll = channelCatalog[channel]
    const selectedInChannel = channelAll.filter((permission) => selectedKeys.includes(permission.key)).length
    const allChannelSelected = channelAll.length > 0 && selectedInChannel === channelAll.length
    const groups = buildGroupSections(channel, search)
    const ChannelIcon = channel === "offline" ? StorefrontIcon : GlobeIcon

    return (
      <AccordionItem value={channel} className="rounded-lg border border-border/70 px-4">
        <AccordionTrigger>
          <div className="flex flex-1 items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ChannelIcon className="h-3.5 w-3.5 text-muted-foreground" />
              {label}
            </span>
            <span className="text-xs text-muted-foreground">
              {selectedInChannel}/{channelAll.length} selected
            </span>
          </div>
        </AccordionTrigger>
        <AccordionPrimitive.Content className="pb-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search permission"
                  className="h-9 rounded-md border-border/70 pl-8 text-xs"
                />
              </div>
              <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
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
                  return (
                    <div key={group} className="mb-3 break-inside-avoid rounded-lg bg-muted/40 p-3">
                      <div className="flex items-center gap-2">
                        <GroupIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">{group}</span>
                      </div>
                      <div className="mt-1">{permissions.map(renderPermissionRow)}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </AccordionPrimitive.Content>
      </AccordionItem>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-8 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <CaretLeftIcon className="h-4 w-4" />
          Back
        </button>
        <Button onClick={handleSave} disabled={!canSave}>
          {isEditingExisting ? "Save changes" : "Save role and permission"}
        </Button>
      </div>
      <div className="border-b border-border/70 px-8 pb-5 pt-3">
        <h1 className={PAGE_HEADING_CLASSES}>{isEditingExisting ? "Edit custom role" : "Create new role"}</h1>
      </div>

      <div className="px-8 py-6">
        <div className="mx-auto w-full space-y-5" style={{ maxWidth: "var(--dashboard-center-max-width, 1440px)" }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="custom-role-name">Role name</Label>
              <Input
                id="custom-role-name"
                value={roleName}
                onChange={(event) => setRoleName(event.target.value)}
                placeholder="Enter role name"
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
                placeholder="Enter role description"
              />
            </div>
          </div>

          {permissionsError ? <p className="text-xs text-destructive">{permissionsError}</p> : null}

          <Accordion type="multiple" defaultValue={["offline", "online"]} className="space-y-3">
            {renderChannelAccordion("offline", "In-store permissions", offlineSearch, setOfflineSearch)}
            {renderChannelAccordion("online", "Online permissions", onlineSearch, setOnlineSearch)}
          </Accordion>
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
        <SheetHeader>
          <SheetTitle>{role?.name}</SheetTitle>
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
    if (!target) return
    const options = roleOptions.filter((option) => option.id !== target.role.id)
    const defaultReplacement = options.find((option) => option.name === "Viewer") ?? options[0]
    setReplacement(defaultReplacement?.name ?? "")
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
    both: roleCatalog.filter((role) => role.system === "both"),
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
      <Label>User role</Label>
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
          {grouped.both.length > 0 ? (
            <SelectGroup>
              <SelectLabel>Offline &amp; online</SelectLabel>
              {grouped.both.map(renderRoleItem)}
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
 *  user so the admin can see the access they're about to hand out before confirming.
 *  Lists every permission in the role's channel(s) (not just the granted ones) with a
 *  check or cross, grouped and collapsible per channel — same shape as the permissions
 *  step on the create-role page, so the two feel like the same feature. Only shows the
 *  channel(s) the role actually touches (an in-store-only role has no Online section). */
function RolePermissionsPreview({ role: maybeRole }: { role: ManagedRole | undefined }) {
  if (!maybeRole) return null
  const role = maybeRole

  const channels: Array<{ id: PermissionChannel; label: string; icon: ComponentType<{ className?: string }> }> = [
    { id: "offline", label: "In-store permissions", icon: StorefrontIcon },
    { id: "online", label: "Online permissions", icon: GlobeIcon },
  ].filter((channel) => role.permissionKeys.some((key) => key.startsWith(`${channel.id}:`))) as Array<{
    id: PermissionChannel
    label: string
    icon: ComponentType<{ className?: string }>
  }>

  if (channels.length === 0) return null

  return (
    <Accordion type="multiple" defaultValue={channels.map((channel) => channel.id)} className="space-y-3">
      {channels.map((channel) => {
        const channelPermissions = ALL_PERMISSIONS.filter((permission) => permission.channel === channel.id)
        const grantedInChannel = channelPermissions.filter((permission) => role.permissionKeys.includes(permission.key)).length
        const groups = PERMISSION_GROUPS.map((group) => ({
          group,
          permissions: channelPermissions.filter((permission) => permission.group === group),
        })).filter((section) => section.permissions.length > 0)

        return (
          <AccordionItem key={channel.id} value={channel.id} className="rounded-lg border border-border/70 px-4">
            <AccordionTrigger>
              <div className="flex flex-1 items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <channel.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  {channel.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {grantedInChannel}/{channelPermissions.length} allowed
                </span>
              </div>
            </AccordionTrigger>
            <AccordionPrimitive.Content className="pb-3">
              <div className="max-h-72 space-y-4 overflow-y-auto pr-1">
                {groups.map(({ group, permissions }) => {
                  const GroupIcon = GROUP_ICON[group] ?? HardDrivesIcon
                  return (
                    <div key={group}>
                      <p className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <GroupIcon className="h-4 w-4 text-foreground" />
                        {group}
                      </p>
                      <div className="space-y-1.5">
                        {permissions.map((permission) => {
                          const granted = role.permissionKeys.includes(permission.key)
                          return (
                            <div key={permission.key} className="flex items-center gap-2 text-sm text-muted-foreground">
                              {granted ? (
                                <CheckIcon className="h-4 w-4 shrink-0 text-emerald-500" />
                              ) : (
                                <XIcon className="h-4 w-4 shrink-0 text-destructive" />
                              )}
                              <span className="truncate" title={permission.label}>
                                {permission.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </AccordionPrimitive.Content>
          </AccordionItem>
        )
      })}
    </Accordion>
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
  onSave: (id: string, patch: { name: string; email: string; phone: string; role: string; scope: string; storeIds: string[] }) => void
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [roleName, setRoleName] = useState("")
  const [storeIds, setStoreIds] = useState<string[]>([])

  useEffect(() => {
    if (!open || !entry) return
    setName(entry.name)
    setEmail(entry.email)
    setPhone(entry.phone ?? "")
    setRoleName(entry.role)
    setStoreIds(entry.storeIds ?? [])
  }, [open, entry])

  const nameValid = name.trim().length > 0
  const normalizedEmail = email.trim().toLowerCase()
  const emailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  const selectedRole = roleCatalog.find((role) => role.name === roleName)
  const needsStoreAccess = roleNeedsStoreAccess(selectedRole)

  const collidingEntry = emailFormatValid
    ? roster.find((row) => row.id !== entry?.id && row.email.trim().toLowerCase() === normalizedEmail)
    : undefined
  const emailError = collidingEntry ? `This email already belongs to ${collidingEntry.name}.` : null

  const canSave = Boolean(entry) && nameValid && emailFormatValid && !emailError

  function handleSave() {
    if (!entry || !canSave) return
    const scope = selectedRole ? computeAccessScope(selectedRole.permissionKeys) : entry.scope
    onSave(entry.id, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: roleName,
      scope,
      storeIds: needsStoreAccess ? storeIds : [],
    })
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
        <SheetHeader>
          <SheetTitle>Edit user</SheetTitle>
        </SheetHeader>

        <div className="space-y-5 overflow-y-auto px-6 py-5">
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

          <div className="space-y-2">
            <Label htmlFor="edit-user-phone">Phone number</Label>
            <Input
              id="edit-user-phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="9876543210"
            />
          </div>

          <RoleSelectField roleName={roleName} onChange={setRoleName} roleCatalog={roleCatalog} />

          {needsStoreAccess ? (
            <div className="space-y-2">
              <Label>Store access</Label>
              <StoreMultiSelect stores={STORE_IDENTITIES} selectedStoreIds={storeIds} onChange={setStoreIds} />
            </div>
          ) : null}

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

/** A role grants store-scoped access whenever any of its permission keys are offline
 *  ones — online-only roles have no store concept, so the field never applies to them. */
function roleNeedsStoreAccess(role: ManagedRole | undefined) {
  return Boolean(role?.permissionKeys.some((key) => key.startsWith("offline:")))
}

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
  /** Used to catch inviting an email that's already active, pending, or deactivated. */
  roster: RosterEntry[]
  onInvite: (invite: { name: string; email: string; phone: string; role: string; storeIds: string[] }) => void
}) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [roleName, setRoleName] = useState(roleCatalog[0]?.name ?? "")
  const [storeIds, setStoreIds] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setFirstName("")
    setLastName("")
    setEmail("")
    setPhone("")
    setRoleName(roleCatalog[0]?.name ?? "")
    setStoreIds([])
  }, [open, roleCatalog])

  const nameValid = firstName.trim().length > 0 && lastName.trim().length > 0
  const normalizedEmail = email.trim().toLowerCase()
  const emailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  const selectedRole = roleCatalog.find((role) => role.name === roleName)
  const needsStoreAccess = roleNeedsStoreAccess(selectedRole)

  const existingEntry = emailFormatValid
    ? roster.find((entry) => entry.email.trim().toLowerCase() === normalizedEmail)
    : undefined
  const emailError = !existingEntry
    ? null
    : existingEntry.status === "Active"
      ? "This email already belongs to an active user."
      : existingEntry.status === "Invited"
        ? "An invite is already pending for this email."
        : existingEntry.status === "Pending"
          ? "This person already has a pending access request."
          : "This user was previously deactivated — reactivate them from the Users list instead of inviting again."

  const canInvite = nameValid && emailFormatValid && Boolean(roleName) && !emailError

  function handleInvite() {
    if (!canInvite) return
    onInvite({
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: roleName,
      storeIds: needsStoreAccess ? storeIds : [],
    })
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
        <SheetHeader>
          <SheetTitle>Invite users</SheetTitle>
        </SheetHeader>

        <div className="space-y-5 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="invite-first-name">First name</Label>
              <Input
                id="invite-first-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Priya"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-last-name">Last name</Label>
              <Input
                id="invite-last-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Singh"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-email">User email</Label>
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

          <div className="space-y-2">
            <Label htmlFor="invite-phone">Phone number</Label>
            <Input
              id="invite-phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="9876543210"
            />
          </div>

          <RoleSelectField roleName={roleName} onChange={setRoleName} roleCatalog={roleCatalog} />

          {needsStoreAccess ? (
            <div className="space-y-2">
              <Label>Store access</Label>
              <StoreMultiSelect stores={STORE_IDENTITIES} selectedStoreIds={storeIds} onChange={setStoreIds} />
            </div>
          ) : null}

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

/* ------------------------------- Pending approvals ------------------------------- */

/** Requests raised when someone tries to access a store/the platform during onboarding
 *  before an admin has invited them — distinct from an admin-initiated invite. An admin
 *  reviews each one here and approves (→ Active, keeps the requested role/stores) or
 *  rejects (→ removed from the roster entirely) it. */
function PendingApprovalsPage({
  rows,
  roleCatalog,
  onApprove,
  onReject,
  onBack,
}: {
  rows: RosterEntry[]
  roleCatalog: ManagedRole[]
  onApprove: (row: RosterEntry) => void
  onReject: (row: RosterEntry) => void
  onBack: () => void
}) {
  return (
    <div>
      <div className="px-8 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <CaretLeftIcon className="h-4 w-4" />
          Back
        </button>
      </div>
      <div className="border-b border-border/70 px-8 pb-5 pt-3">
        <h1 className={PAGE_HEADING_CLASSES}>Pending access requests</h1>
      </div>

      <div className="px-8 py-6">
        <div className="overflow-hidden rounded-[8px] border border-border bg-background">
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="h-10 [&>th:first-child]:rounded-tl-[8px] [&>th:last-child]:rounded-tr-[8px]">
                  <TableHead className="px-3 text-sm font-medium text-muted-foreground">User details</TableHead>
                  <TableHead className="px-3 text-sm font-medium text-muted-foreground">Role</TableHead>
                  <TableHead className="px-3 text-sm font-medium text-muted-foreground">Access scope</TableHead>
                  <TableHead className="px-3 text-sm font-medium text-muted-foreground">Requested on</TableHead>
                  <TableHead className="px-3 text-right text-sm font-medium text-muted-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow className="h-[72px] hover:bg-transparent">
                    <TableCell colSpan={5} className="px-3 text-sm text-muted-foreground">
                      No pending access requests.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => {
                    const permissionKeys = roleCatalog.find((role) => role.name === row.role)?.permissionKeys ?? []
                    return (
                      <TableRow key={row.id} className="h-[72px]">
                        <TableCell className="px-3">
                          <p className="text-sm font-medium text-foreground">{row.name}</p>
                          <p className="text-sm text-muted-foreground">{row.email}</p>
                        </TableCell>
                        <TableCell className="px-3">
                          <RoleBadge role={row.role} />
                        </TableCell>
                        <TableCell className="px-3">
                          <AccessScopeBadge scope={computeAccessScope(permissionKeys)} />
                        </TableCell>
                        <TableCell className="px-3">
                          <p className="text-sm text-foreground">{row.addedOnDate}</p>
                          <p className="text-sm text-muted-foreground">{row.addedOnTime}</p>
                        </TableCell>
                        <TableCell className="px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Reject"
                                  className="h-8 w-8 rounded-md text-destructive hover:text-destructive"
                                  onClick={() => onReject(row)}
                                >
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reject</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Approve"
                                  className="h-8 w-8 rounded-md text-emerald-600 hover:text-emerald-600"
                                  onClick={() => onApprove(row)}
                                >
                                  <CheckIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Approve</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- Manage users shell ----------------------------- */

export function ManageUsersSection() {
  const [screen, setScreen] = useState<"list" | "migration" | "role-form" | "pending-approvals">("list")
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
  const pendingAccessCount = roster.filter((entry) => entry.status === "Pending").length

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

  function handleSaveAssignment(
    id: string,
    patch: { name: string; email: string; phone: string; role: string; scope: string; storeIds: string[] }
  ) {
    setRoster((current) => current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)))
    toast.success("User updated")
  }

  function handleInvite({
    name,
    email,
    phone,
    role,
    storeIds,
  }: {
    name: string
    email: string
    phone: string
    role: string
    storeIds: string[]
  }) {
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
      phone: phone || undefined,
      addedOnDate: dateStr,
      addedOnTime: timeStr,
      scope,
      role,
      status: "Invited",
      storeIds: storeIds.length > 0 ? storeIds : undefined,
    }
    setRoster((current) => [newEntry, ...current])
    toast.success(`Invite sent to ${email}`)
  }

  /** Active users lose access but stay in the list (status → Deactivated) so they can be
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

  /** Approving keeps the requester's requested role/stores as-is and simply flips them
   *  to Active; rejecting drops the request from the roster entirely. */
  function handleApproveUser(row: RosterEntry) {
    setRoster((current) => current.map((entry) => (entry.id === row.id ? { ...entry, status: "Active" } : entry)))
    toast.success(`${row.name} approved — access granted`)
  }

  function handleRejectUser(row: RosterEntry) {
    setRoster((current) => current.filter((entry) => entry.id !== row.id))
    toast.success(`${row.name}'s access request rejected`)
  }

  /** Custom-role deletes get routed through a reassign-first flow when active/invited users
   *  are still on that role — deactivated users don't block the delete since they've lost access. */
  function requestDeleteRole(role: ManagedRole) {
    const assignedCount = roster.filter((entry) => entry.role === role.name && entry.status !== "Deactivated").length
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
        current.map((entry) => (entry.id === deleteTarget.entry.id ? { ...entry, status: "Deactivated" } : entry))
      )
      toast.success(`${deleteTarget.entry.name} deactivated — access revoked`)
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

  if (screen === "pending-approvals") {
    return (
      <PendingApprovalsPage
        rows={roster.filter((entry) => entry.status === "Pending")}
        roleCatalog={roleCatalog}
        onApprove={handleApproveUser}
        onReject={handleRejectUser}
        onBack={() => setScreen("list")}
      />
    )
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
    <div>
      <Tabs value={tab} onValueChange={(value) => setTab(value as "users" | "roles")}>
        <div className="px-8 pt-8 pb-0">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className={PAGE_HEADING_CLASSES}>Manage users &amp; roles</h1>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={openCreateRole}>
                Add new roles
              </Button>
              <Button onClick={() => setInviteOpen(true)}>
                <UserPlusIcon className="h-3.5 w-3.5" />
                Invite new users
              </Button>
            </div>
          </div>
        </div>

        <div className="px-8 pt-8 pb-0">
          <TabsList variant="line" className={LINE_TABS_LIST_CLASSES}>
            <TabsTrigger value="users" className={LINE_TAB_TRIGGER_CLASSES}>
              Users
            </TabsTrigger>
            <TabsTrigger value="roles" className={LINE_TAB_TRIGGER_CLASSES}>
              Roles
            </TabsTrigger>
          </TabsList>
        </div>

        <Separator />

        {tab === "users" && pendingAccessCount > 0 ? (
          <div className="px-8 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3">
              <div className="flex items-center gap-2.5">
                <WarningIcon className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-foreground">
                  <span className="font-medium">{pendingAccessCount}</span> Users are asking for approval to access the
                  platform
                </p>
              </div>
              <Button variant="outline" onClick={() => setScreen("pending-approvals")}>
                View users
              </Button>
            </div>
          </div>
        ) : null}

        <div className="px-8 py-6">
          <TabsContent value="users">
            <UsersTable
              rows={roster.filter((entry) => entry.status !== "Pending")}
              roleCatalog={roleCatalog}
              onEdit={openEditRow}
              onRemove={requestRemoveUser}
              onReactivate={handleReactivateUser}
              onCancelInvite={requestCancelInvite}
              onResendInvite={handleResendInvite}
            />
          </TabsContent>
          <TabsContent value="roles">
            <RolesTable
              roles={roleCatalog}
              roster={roster}
              onView={openViewRole}
              onClone={openCloneRole}
              onEdit={openEditRole}
              onDelete={requestDeleteRole}
            />
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
              ? `Deactivate ${deleteTarget.entry.name}?`
              : deleteTarget?.type === "cancelInvite"
                ? `Cancel invite to ${deleteTarget.entry.name}?`
                : ""
        }
        description={
          deleteTarget?.type === "role"
            ? "This role definition will be removed. No users are currently assigned to it."
            : deleteTarget?.type === "removeUser"
              ? "This user's access will be deactivated immediately. You can reactivate them later from the Users list."
              : "The pending invite will be cancelled and removed from the list."
        }
        confirmLabel={
          deleteTarget?.type === "role" ? "Delete" : deleteTarget?.type === "removeUser" ? "Deactivate user" : "Cancel invite"
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

/* ------------------------------- Account settings ----------------------------- */

export function AccountSettingsContent() {
  const [tab, setTab] = useState<AccountSettingsTab>("personal-details")

  return (
    <div className="w-full">
      <section>
        <div className="px-8 pt-8 pb-0">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className={PAGE_HEADING_CLASSES}>Account settings</h1>
            <div className="flex items-center gap-3">
              <Button>Change password</Button>
            </div>
          </div>
        </div>

        <div className="px-8 pt-8 pb-0">
          <Tabs value={tab} onValueChange={(value) => setTab(value as AccountSettingsTab)}>
            <TabsList variant="line" className={LINE_TABS_LIST_CLASSES}>
              <TabsTrigger value="personal-details" className={LINE_TAB_TRIGGER_CLASSES}>
                Personal details
              </TabsTrigger>
              <TabsTrigger value="credentials" className={LINE_TAB_TRIGGER_CLASSES}>
                Credentials
              </TabsTrigger>
              <TabsTrigger value="webhooks" className={LINE_TAB_TRIGGER_CLASSES}>
                Webhooks
              </TabsTrigger>
              <TabsTrigger value="refunds" className={LINE_TAB_TRIGGER_CLASSES}>
                Refunds
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Separator />
      </section>

      <div className="px-8 pt-8 pb-8">
        {tab === "personal-details" ? <PersonalDetailsSection /> : null}
        {tab === "credentials" ? <CredentialsSection /> : null}
        {tab === "webhooks" ? <WebhooksSection /> : null}
        {tab === "refunds" ? <RefundsSettingsSection /> : null}
      </div>
    </div>
  )
}
