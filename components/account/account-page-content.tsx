"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PanelEmpty } from "@/components/ui/panels"
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
import { Textarea } from "@/components/ui/textarea"
import { readDummyAuthSession } from "@/lib/dummy-auth"
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  getLanguageByCode,
  readLanguagePreference,
  writeLanguagePreference,
} from "@/lib/language-settings"
import { AlertTriangle, MoreVertical } from "lucide-react"
import { AccountPageShell } from "./account-page-shell"

type AccountPageContentProps = {
  page:
    | "profile"
    | "business-details"
    | "users"
    | "preferences"
    | "security"
    | "feedback"
}

type UserProfileRole =
  | "Store Manager"
  | "User Admin"
  | "Owner"
  | "Store Cashier"
  | "EMI World User"
  | "Admin"
  | "Accountant"

type ManagedUser = {
  id: string
  fullName: string
  email: string
  role: UserProfileRole
  createdOn: string
  lastModifiedOn: string
}

type PendingUser = {
  id: string
  fullName: string
  email: string
  role: UserProfileRole
  requestedOn: string
  requestedBy: string
  scope: string
  reason: string
}

const USER_PROFILE_ORDER: UserProfileRole[] = [
  "Store Manager",
  "User Admin",
  "Owner",
  "Store Cashier",
  "EMI World User",
  "Admin",
  "Accountant",
]

const INITIAL_TEAM_USERS: ManagedUser[] = [
  {
    id: "u-bharath",
    fullName: "BHARATH GHOSH",
    email: "bharath.ghosh4@pinelabs.com",
    role: "Store Cashier",
    createdOn: "14 Apr 2026, 3:02 PM",
    lastModifiedOn: "14 Apr 2026, 3:02 PM",
  },
  {
    id: "u-akshay",
    fullName: "Akshaykumar Miskin",
    email: "akshaykumar.m@pinelabs-demo.in",
    role: "Store Cashier",
    createdOn: "11 Apr 2026, 11:39 AM",
    lastModifiedOn: "11 Apr 2026, 1:39 PM",
  },
  {
    id: "u-mohd",
    fullName: "Mohd",
    email: "mdadnansyed2@gmail.com",
    role: "Admin",
    createdOn: "23 Mar 2026, 3:49 PM",
    lastModifiedOn: "23 Mar 2026, 3:51 PM",
  },
  {
    id: "u-prajwal",
    fullName: "Prajwal M",
    email: "prajwal.p4@pinelabs.com",
    role: "Store Cashier",
    createdOn: "20 Feb 2026, 6:09 PM",
    lastModifiedOn: "20 Feb 2026, 6:09 PM",
  },
  {
    id: "u-sanket",
    fullName: "Sanket Pawar",
    email: "sanket.pawar@pinelabs-demo.in",
    role: "Store Manager",
    createdOn: "13 Feb 2026, 2:39 PM",
    lastModifiedOn: "13 Feb 2026, 2:41 PM",
  },
  {
    id: "u-pine-demo",
    fullName: "Pine Demo",
    email: "pine-demo@pinelabs-demo.in",
    role: "Store Manager",
    createdOn: "07 Jan 2026, 5:39 PM",
    lastModifiedOn: "07 Jan 2026, 7:50 PM",
  },
  {
    id: "u-purvi",
    fullName: "Purvi Khare",
    email: "purvi.khare16@gmail.com",
    role: "Admin",
    createdOn: "07 Jan 2026, 12:52 PM",
    lastModifiedOn: "07 Jan 2026, 1:04 PM",
  },
  {
    id: "u-vinay",
    fullName: "Vinay Sharma",
    email: "vinay.sharma@pinelabs-demo.in",
    role: "EMI World User",
    createdOn: "28 Dec 2025, 10:14 AM",
    lastModifiedOn: "04 Jan 2026, 11:18 AM",
  },
]

const INITIAL_PENDING_USERS: PendingUser[] = [
  {
    id: "p-aswin",
    fullName: "Aswin S Thomas",
    email: "aswin.sthomas@pinelabs-demo.in",
    role: "Admin",
    requestedOn: "17 Apr 2026, 10:12 AM",
    requestedBy: "Rahul Sharma",
    scope: "All stores",
    reason: "Needs admin access for store onboarding approvals.",
  },
  {
    id: "p-rakesh",
    fullName: "Rakesh",
    email: "rakesh.store@pinelabs-demo.in",
    role: "Store Cashier",
    requestedOn: "17 Apr 2026, 9:41 AM",
    requestedBy: "Ananya Patel",
    scope: "Store #102 · Andheri East",
    reason: "Counter cashier setup for evening shift operations.",
  },
  {
    id: "p-kk-mobile",
    fullName: "KK MOBILE",
    email: "kk.mobile@pinelabs-demo.in",
    role: "Admin",
    requestedOn: "16 Apr 2026, 6:28 PM",
    requestedBy: "Prajwal M",
    scope: "All stores",
    reason: "Owner requested complete payout and dispute visibility.",
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

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("")
}

function rolePillClass(role: UserProfileRole) {
  if (role === "Store Cashier") return "border-primary/55 text-primary"
  if (role === "Store Manager") return "border-violet-500/55 text-violet-500"
  if (role === "EMI World User") return "border-emerald-500/55 text-emerald-500"
  if (role === "User Admin") return "border-sky-500/55 text-sky-500"
  if (role === "Owner") return "border-amber-500/55 text-amber-600 dark:text-amber-500"
  if (role === "Accountant") return "border-fuchsia-500/55 text-fuchsia-500"
  return "border-cyan-500/55 text-cyan-500"
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
    <Card className="rounded-2xl border border-border/70 bg-card/90 shadow-none">
      <CardHeader className="px-6 pb-4">
        <CardTitle className="text-[16px] font-semibold text-foreground">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-[13px] leading-relaxed text-muted-foreground">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="px-6 pb-6">{children}</CardContent>
    </Card>
  )
}

function StatGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
          <p className="text-[11px] text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-[18px] font-semibold text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

function DetailRow({
  label,
  value,
  badge,
}: {
  label: string
  value: React.ReactNode
  badge?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex items-center gap-3 text-right">
        <div className="text-sm font-medium text-foreground">{value}</div>
        {badge}
      </div>
    </div>
  )
}

function FieldGrid({
  fields,
}: {
  fields: {
    id: string
    label: string
    defaultValue?: string
    value?: string
    type?: string
    disabled?: boolean
    onChange?: (value: string) => void
  }[]
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id}>{field.label}</Label>
          <Input
            id={field.id}
            type={field.type ?? "text"}
            defaultValue={field.defaultValue}
            value={field.value}
            onChange={
              field.onChange
                ? (event) => field.onChange?.(event.target.value)
                : undefined
            }
            disabled={field.disabled}
          />
        </div>
      ))}
    </div>
  )
}

function DividedList({ children }: { children: React.ReactNode[] | React.ReactNode }) {
  return <div className="space-y-0">{children}</div>
}

export function AccountPageContent({ page }: AccountPageContentProps) {
  const [sessionName, setSessionName] = useState("Rahul Sharma")
  const [sessionEmail, setSessionEmail] = useState("rahul.sharma@pinelabs-demo.in")
  const [sessionRole, setSessionRole] = useState("Admin")
  const [isEditing, setIsEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({
    fullName: "Rahul Sharma",
    role: "Admin",
    email: "rahul.sharma@pinelabs-demo.in",
    phone: "+91 98765 43210",
    defaultMarket: "India",
  })
  const [businessForm, setBusinessForm] = useState({
    legalBusinessName: "Pine Retail Ventures Private Limited",
    businessCategory: "Retail and omnichannel commerce",
    website: "https://www.pineretail.in",
    businessPhone: "+91 22 4567 8901",
    primaryPayoutAccount: "HDFC Bank · •••• 4821",
    secondaryAccount: "ICICI Bank · •••• 9932",
    defaultSettlementCycle: "T+1 day",
  })
  const [preferencesForm, setPreferencesForm] = useState({
    languageCode: DEFAULT_LANGUAGE.code,
    transactionAlerts: true,
    settlementUpdates: true,
    weeklyDigest: false,
  })
  const [securityForm, setSecurityForm] = useState({
    passwordUpdatedAt: "3 months ago",
    require2FA: false,
    sessionTimeoutMinutes: "30",
    passwordRotationDays: "90",
  })
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>(INITIAL_PENDING_USERS)
  const [approvedUsers, setApprovedUsers] = useState<ManagedUser[]>([])
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedPendingIds, setSelectedPendingIds] = useState<string[]>([])
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [reviewPendingUserId, setReviewPendingUserId] = useState<string | null>(null)
  const [newUserDraft, setNewUserDraft] = useState({
    fullName: "",
    email: "",
    role: "Store Cashier" as UserProfileRole,
    scope: "Store #102 · Andheri East",
    reason: "",
  })

  useEffect(() => {
    const session = readDummyAuthSession()
    if (session) {
      setSessionName(session.name)
      setSessionEmail(session.email)
      setSessionRole(session.role)
      setProfileForm((prev) => ({
        ...prev,
        fullName: session.name,
        email: session.email,
        role: session.role,
      }))
    }
    const storedLanguage = readLanguagePreference().code
    setPreferencesForm((prev) => ({
      ...prev,
      languageCode: storedLanguage,
    }))
  }, [])
  useEffect(() => {
    setIsEditing(false)
  }, [page])

  const currentLanguage = useMemo(
    () => getLanguageByCode(preferencesForm.languageCode),
    [preferencesForm.languageCode]
  )
  const isAdmin = sessionRole.toLowerCase() === "admin"
  const supportsHeaderEditCta =
    page === "profile" ||
    page === "business-details" ||
    page === "preferences" ||
    page === "security"
  const editDetailsAction = supportsHeaderEditCta ? (
    <Button
      size="sm"
      className="h-9 text-xs"
      onClick={() => {
        if (isEditing && page === "preferences") {
          writeLanguagePreference(preferencesForm.languageCode)
        }
        setIsEditing((prev) => !prev)
      }}
    >
      {isEditing ? "Save details" : "Edit details"}
    </Button>
  ) : null
  const managedUsers = useMemo<ManagedUser[]>(
    () => [
      {
        id: "u-session",
        fullName: sessionName,
        email: sessionEmail,
        role: sessionRole === "Admin" ? "Admin" : "User Admin",
        createdOn: "31 Jan 2025, 7:57 PM",
        lastModifiedOn: "12 Oct 2025, 9:55 AM",
      },
      ...INITIAL_TEAM_USERS,
      ...approvedUsers,
    ],
    [approvedUsers, sessionEmail, sessionName, sessionRole]
  )
  const roleCounts = useMemo(
    () =>
      managedUsers.reduce<Record<UserProfileRole, number>>((acc, user) => {
        acc[user.role] = (acc[user.role] ?? 0) + 1
        return acc
      }, {} as Record<UserProfileRole, number>),
    [managedUsers]
  )
  const rankedRoleFilters = useMemo(() => {
    return Object.entries(roleCounts)
      .filter(([, count]) => count > 0)
      .sort((a, b) => {
        const countDiff = (b[1] ?? 0) - (a[1] ?? 0)
        if (countDiff !== 0) return countDiff
        return USER_PROFILE_ORDER.indexOf(a[0] as UserProfileRole) - USER_PROFILE_ORDER.indexOf(b[0] as UserProfileRole)
      })
      .map(([role]) => role as UserProfileRole)
  }, [roleCounts])
  const primaryRoleFilters = useMemo(() => rankedRoleFilters.slice(0, 3), [rankedRoleFilters])
  const overflowRoleFilters = useMemo(() => rankedRoleFilters.slice(3), [rankedRoleFilters])
  const roleFilterOptions = useMemo(
    () => [
      { label: "All", value: "all" },
      ...rankedRoleFilters.map((role) => ({ label: role, value: role.toLowerCase() })),
    ],
    [rankedRoleFilters]
  )
  const primaryRoleFilterOptions = useMemo(
    () => [
      { label: "All", value: "all" },
      ...primaryRoleFilters.map((role) => ({ label: role, value: role.toLowerCase() })),
    ],
    [primaryRoleFilters]
  )
  const overflowRoleFilterOptions = useMemo(
    () => overflowRoleFilters.map((role) => ({ label: role, value: role.toLowerCase() })),
    [overflowRoleFilters]
  )
  const userTableColumns = useMemo<DataTableColumn<ManagedUser>[]>(
    () => [
      {
        id: "fullName",
        header: "FULL NAME",
        accessorKey: "fullName",
        getSearchValue: (row) => row.fullName,
        searchable: true,
      },
      {
        id: "email",
        header: "EMAIL ID",
        accessorKey: "email",
        getSearchValue: (row) => row.email,
        searchable: true,
      },
      {
        id: "role",
        header: "ROLE",
        accessorKey: "role",
        getFilterValue: (row) => row.role.toLowerCase(),
        cell: (row) => (
          <Badge variant="outline" className={rolePillClass(row.role)}>
            {row.role}
          </Badge>
        ),
      },
      {
        id: "createdOn",
        header: "CREATED ON",
        accessorKey: "createdOn",
      },
      {
        id: "lastModifiedOn",
        header: "LAST MODIFIED ON",
        accessorKey: "lastModifiedOn",
      },
      {
        id: "action",
        header: "ACTION",
        cell: (row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-lg">
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Edit role</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Deactivate user</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        searchable: false,
      },
    ],
    []
  )
  const pendingUserTableColumns = useMemo<DataTableColumn<PendingUser>[]>(
    () => [
      {
        id: "selection",
        header: "SELECT",
        cell: (row) => (
          <Checkbox
            checked={selectedPendingIds.includes(row.id)}
            onCheckedChange={(checked) =>
              setSelectedPendingIds((current) =>
                checked ? Array.from(new Set([...current, row.id])) : current.filter((id) => id !== row.id)
              )
            }
            aria-label={`Select ${row.fullName}`}
          />
        ),
        searchable: false,
        draggable: false,
        pinnable: false,
        hideable: false,
        width: 56,
        align: "center",
      },
      {
        id: "fullName",
        header: "FULL NAME",
        accessorKey: "fullName",
        getSearchValue: (row) => row.fullName,
      },
      {
        id: "email",
        header: "EMAIL ID",
        accessorKey: "email",
        getSearchValue: (row) => row.email,
      },
      {
        id: "role",
        header: "REQUESTED ROLE",
        accessorKey: "role",
        cell: (row) => (
          <Badge variant="outline" className={rolePillClass(row.role)}>
            {row.role}
          </Badge>
        ),
        getFilterValue: (row) => row.role.toLowerCase(),
      },
      {
        id: "scope",
        header: "ACCESS SCOPE",
        accessorKey: "scope",
      },
      {
        id: "requestedBy",
        header: "REQUESTED BY",
        accessorKey: "requestedBy",
      },
      {
        id: "requestedOn",
        header: "REQUESTED ON",
        accessorKey: "requestedOn",
      },
      {
        id: "action",
        header: "ACTION",
        align: "right",
        searchable: false,
        cell: (row) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-lg">
                <DropdownMenuItem onSelect={() => setReviewPendingUserId(row.id)}>
                  Review request
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => approvePendingUser(row.id)}>Approve</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onSelect={() => rejectPendingUser(row.id)}>
                  Reject
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [selectedPendingIds]
  )

  function approvePendingUser(id: string) {
    setPendingUsers((prev) => {
      const target = prev.find((entry) => entry.id === id)
      if (target) {
        setApprovedUsers((existing) => [
          {
            id: `u-approved-${target.id}`,
            fullName: target.fullName,
            email: target.email,
            role: target.role,
            createdOn: formatNowLabel(),
            lastModifiedOn: formatNowLabel(),
          },
          ...existing,
        ])
      }
      return prev.filter((entry) => entry.id !== id)
    })
  }

  function rejectPendingUser(id: string) {
    setPendingUsers((prev) => prev.filter((entry) => entry.id !== id))
  }

  function approveSelectedPendingUsers() {
    if (selectedPendingIds.length === 0) return
    selectedPendingIds.forEach((id) => approvePendingUser(id))
    setSelectedPendingIds([])
  }

  function rejectSelectedPendingUsers() {
    if (selectedPendingIds.length === 0) return
    selectedPendingIds.forEach((id) => rejectPendingUser(id))
    setSelectedPendingIds([])
  }

  function submitNewUserRequest() {
    const trimmedName = newUserDraft.fullName.trim()
    const trimmedEmail = newUserDraft.email.trim()
    if (!trimmedName || !trimmedEmail) return

    setPendingUsers((prev) => [
      {
        id: `p-new-${Date.now()}`,
        fullName: trimmedName,
        email: trimmedEmail,
        role: newUserDraft.role,
        requestedOn: formatNowLabel(),
        requestedBy: sessionName,
        scope: newUserDraft.scope,
        reason: newUserDraft.reason.trim() || "Role-based access requested by admin.",
      },
      ...prev,
    ])
    setNewUserDraft({
      fullName: "",
      email: "",
      role: "Store Cashier",
      scope: "Store #102 · Andheri East",
      reason: "",
    })
    setIsCreateUserOpen(false)
  }

  const selectedPendingUser = useMemo(
    () => pendingUsers.find((entry) => entry.id === reviewPendingUserId) ?? null,
    [pendingUsers, reviewPendingUserId]
  )
  const selectedPendingCount = selectedPendingIds.length
  const isAllPendingSelected = pendingUsers.length > 0 && selectedPendingCount === pendingUsers.length

  useEffect(() => {
    setSelectedPendingIds((prev) =>
      prev.filter((id) => pendingUsers.some((entry) => entry.id === id))
    )
  }, [pendingUsers])

  if (page === "profile") {
    return (
      <AccountPageShell
        title="Profile"
        description="Personal details, primary contact information, and approval identity for the current user."
        actions={editDetailsAction}
      >
        <SectionCard
          title="Personal details"
          description="These details are used for approvals, ownership attribution, and operational communication."
        >
          <StatGrid
            items={[
              { label: "Role", value: profileForm.role },
              { label: "Primary email", value: profileForm.email },
              { label: "Mobile", value: profileForm.phone },
              { label: "Default market", value: profileForm.defaultMarket },
            ]}
          />
          <Separator className="my-6" />
          {isEditing ? (
            <FieldGrid
              fields={[
                {
                  id: "profile-name",
                  label: "Full name",
                  value: profileForm.fullName,
                  onChange: (value) =>
                    setProfileForm((prev) => ({ ...prev, fullName: value })),
                },
                {
                  id: "profile-role",
                  label: "Role",
                  value: profileForm.role,
                  disabled: true,
                },
                {
                  id: "profile-email",
                  label: "Work email",
                  value: profileForm.email,
                  type: "email",
                  onChange: (value) =>
                    setProfileForm((prev) => ({ ...prev, email: value })),
                },
                {
                  id: "profile-phone",
                  label: "Mobile number",
                  value: profileForm.phone,
                  onChange: (value) =>
                    setProfileForm((prev) => ({ ...prev, phone: value })),
                },
              ]}
            />
          ) : (
            <DividedList>
              <DetailRow label="Full name" value={profileForm.fullName} />
              <Separator />
              <DetailRow label="Role" value={profileForm.role} />
              <Separator />
              <DetailRow label="Work email" value={profileForm.email} />
              <Separator />
              <DetailRow label="Mobile number" value={profileForm.phone} />
            </DividedList>
          )}
        </SectionCard>

        <SectionCard
          title="Working identity"
          description="How the platform understands your ownership, responsibility, and communication context."
        >
          <DividedList>
            <DetailRow label="Primary identity" value="Used for approvals and workflow attribution" />
            <Separator />
            <DetailRow label="Contact channel" value="Critical alerts and task updates route here" />
            <Separator />
            <DetailRow label="Approval level" value="Role controls access to users, payouts, and configuration" />
          </DividedList>
        </SectionCard>
      </AccountPageShell>
    )
  }

  if (page === "business-details") {
    return (
      <AccountPageShell
        title="Business details"
        description="Business identity, operational details, compliance records, and payout accounts."
        actions={editDetailsAction}
      >
        <SectionCard
          title="Business profile"
          description="Merchant identity details used across products, KYC, and support operations."
        >
          {isEditing ? (
            <FieldGrid
              fields={[
                {
                  id: "business-name",
                  label: "Legal business name",
                  value: businessForm.legalBusinessName,
                  onChange: (value) =>
                    setBusinessForm((prev) => ({ ...prev, legalBusinessName: value })),
                },
                {
                  id: "business-category",
                  label: "Business category",
                  value: businessForm.businessCategory,
                  onChange: (value) =>
                    setBusinessForm((prev) => ({ ...prev, businessCategory: value })),
                },
                {
                  id: "business-site",
                  label: "Website",
                  value: businessForm.website,
                  onChange: (value) =>
                    setBusinessForm((prev) => ({ ...prev, website: value })),
                },
                {
                  id: "business-phone",
                  label: "Business phone",
                  value: businessForm.businessPhone,
                  onChange: (value) =>
                    setBusinessForm((prev) => ({ ...prev, businessPhone: value })),
                },
              ]}
            />
          ) : (
            <DividedList>
              <DetailRow label="Legal business name" value={businessForm.legalBusinessName} />
              <Separator />
              <DetailRow label="Business category" value={businessForm.businessCategory} />
              <Separator />
              <DetailRow label="Website" value={businessForm.website} />
              <Separator />
              <DetailRow label="Business phone" value={businessForm.businessPhone} />
            </DividedList>
          )}
        </SectionCard>

        <SectionCard
          title="Documents and compliance"
          description="Verification records linked to settlement readiness and onboarding status."
        >
          <DividedList>
            <DetailRow
              label="PAN"
              value="ABCDE1234F"
              badge={<Badge variant="outline" className="border-success/30 bg-success/10 text-success">Verified</Badge>}
            />
            <Separator />
            <DetailRow
              label="GSTIN"
              value="27ABCDE1234F1Z5"
              badge={<Badge variant="outline" className="border-success/30 bg-success/10 text-success">Verified</Badge>}
            />
            <Separator />
            <DetailRow
              label="Incorporation certificate"
              value="Uploaded"
              badge={<Badge variant="outline">Reviewed</Badge>}
            />
            <Separator />
            <DetailRow
              label="Authorized signatory proof"
              value="Pending renewal"
              badge={<Badge variant="outline" className="border-warning/30 bg-warning/10 text-foreground">Pending</Badge>}
            />
          </DividedList>
        </SectionCard>

        <SectionCard
          title="Bank accounts"
          description="Accounts and cycles used for settlements and payout routing."
        >
          {isEditing ? (
            <FieldGrid
              fields={[
                {
                  id: "business-primary-payout",
                  label: "Primary payout account",
                  value: businessForm.primaryPayoutAccount,
                  onChange: (value) =>
                    setBusinessForm((prev) => ({ ...prev, primaryPayoutAccount: value })),
                },
                {
                  id: "business-secondary-account",
                  label: "Secondary account",
                  value: businessForm.secondaryAccount,
                  onChange: (value) =>
                    setBusinessForm((prev) => ({ ...prev, secondaryAccount: value })),
                },
                {
                  id: "business-settlement-cycle",
                  label: "Default settlement cycle",
                  value: businessForm.defaultSettlementCycle,
                  onChange: (value) =>
                    setBusinessForm((prev) => ({ ...prev, defaultSettlementCycle: value })),
                },
              ]}
            />
          ) : (
            <DividedList>
              <DetailRow label="Primary payout account" value={businessForm.primaryPayoutAccount} />
              <Separator />
              <DetailRow label="Secondary account" value={businessForm.secondaryAccount} />
              <Separator />
              <DetailRow label="Default settlement cycle" value={businessForm.defaultSettlementCycle} />
            </DividedList>
          )}
        </SectionCard>
      </AccountPageShell>
    )
  }

  if (page === "users") {
    return (
      <AccountPageShell
        title="Users management"
        description="Create, review, and manage user access across your merchant operations."
        actions={
          isAdmin ? (
            <>
              <Button asChild size="sm" variant="outline" className="h-9 text-xs">
                <Link href="/account/users/roles">Manage user roles</Link>
              </Button>
              <Button size="sm" className="h-9 text-xs" onClick={() => setIsCreateUserOpen(true)}>
                Invite user
              </Button>
            </>
          ) : null
        }
      >
        {!isAdmin ? (
          <PanelEmpty
            icon={AlertTriangle}
            title="Restricted access"
            description="Only admins can manage users and invitations on this workspace."
          />
        ) : (
          <>
            <SectionCard
              title="Approval queue"
              description="Every new user request is reviewed before profile activation."
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Checkbox
                      checked={isAllPendingSelected}
                      onCheckedChange={(checked) =>
                        setSelectedPendingIds(checked ? pendingUsers.map((user) => user.id) : [])
                      }
                      aria-label="Select all pending users"
                    />
                    <span>Select all</span>
                    <span aria-hidden="true">•</span>
                    <span>
                      {pendingUsers.length > 0
                        ? `${pendingUsers.length} user requests pending approval`
                        : "No pending user approvals right now."}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-md px-2.5 text-xs"
                        disabled={selectedPendingCount === 0}
                      >
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 rounded-lg">
                      <DropdownMenuItem onSelect={approveSelectedPendingUsers}>
                        Approve selected
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onSelect={rejectSelectedPendingUsers}>
                        Reject selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <DataTable
                  data={pendingUsers}
                  columns={pendingUserTableColumns}
                  rowId={(row) => row.id}
                  searchPlaceholder="Search pending users..."
                  defaultRowsPerPage={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  className="rounded-lg border border-border/70"
                  tableClassName="rounded-lg"
                  emptyText="No pending user approvals right now."
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Users directory"
              description="Profiles can be filtered by user role from the top-left switcher."
            >
              <DataTable
                data={managedUsers}
                columns={userTableColumns}
                rowId={(row) => row.id}
                searchPlaceholder="Search by name or email..."
                statusColumnId="role"
                statusOptions={roleFilterOptions}
                statusPrimaryOptions={primaryRoleFilterOptions}
                statusOverflowOptions={overflowRoleFilterOptions}
                statusValue={roleFilter}
                onStatusChange={setRoleFilter}
                includeAllStatusOption={false}
                defaultRowsPerPage={10}
                rowsPerPageOptions={[10, 25, 50]}
                className="rounded-lg border border-border/70"
                tableClassName="rounded-lg"
              />
            </SectionCard>

            <Sheet
              open={isCreateUserOpen}
              onOpenChange={(open) => {
                setIsCreateUserOpen(open)
              }}
            >
              <SheetContent
                side="right"
                className="w-full sm:max-w-xl"
                a11yTitle="Create user request"
                a11yDescription="Create a new user and send the access request for approval."
              >
                <SheetHeader className="border-b border-border/70 px-6 pb-4">
                  <SheetTitle>Create user request</SheetTitle>
                  <SheetDescription>
                    New users are activated only after admin approval.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-5 overflow-y-auto px-6 py-5">
                  <div className="space-y-2">
                    <Label htmlFor="new-user-full-name">Full name</Label>
                    <Input
                      id="new-user-full-name"
                      value={newUserDraft.fullName}
                      onChange={(event) =>
                        setNewUserDraft((prev) => ({
                          ...prev,
                          fullName: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-user-email">Email ID</Label>
                    <Input
                      id="new-user-email"
                      type="email"
                      value={newUserDraft.email}
                      onChange={(event) =>
                        setNewUserDraft((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-user-role">User profile</Label>
                    <select
                      id="new-user-role"
                      className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                      value={newUserDraft.role}
                      onChange={(event) =>
                        setNewUserDraft((prev) => ({
                          ...prev,
                          role: event.target.value as UserProfileRole,
                        }))
                      }
                    >
                      {USER_PROFILE_ORDER.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-user-scope">Access scope</Label>
                    <Input
                      id="new-user-scope"
                      value={newUserDraft.scope}
                      onChange={(event) =>
                        setNewUserDraft((prev) => ({
                          ...prev,
                          scope: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-user-reason">Reason for access</Label>
                    <Textarea
                      id="new-user-reason"
                      rows={4}
                      value={newUserDraft.reason}
                      onChange={(event) =>
                        setNewUserDraft((prev) => ({
                          ...prev,
                          reason: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <SheetFooter className="border-t border-border/70 px-6 py-4 sm:flex-row sm:justify-end">
                  <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={submitNewUserRequest}
                    disabled={!newUserDraft.fullName.trim() || !newUserDraft.email.trim()}
                  >
                    Submit for approval
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <Sheet
              open={Boolean(selectedPendingUser)}
              onOpenChange={(open) => {
                if (!open) setReviewPendingUserId(null)
              }}
            >
              <SheetContent
                side="right"
                className="w-full sm:max-w-xl"
                a11yTitle="Review user approval"
                a11yDescription="Review user access request details and approve or reject."
              >
                <SheetHeader className="border-b border-border/70 px-6 pb-4">
                  <SheetTitle>Review approval</SheetTitle>
                  <SheetDescription>
                    Validate request details before granting workspace access.
                  </SheetDescription>
                </SheetHeader>
                {selectedPendingUser ? (
                  <>
                    <div className="space-y-4 overflow-y-auto px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-base font-semibold text-sky-700 dark:bg-sky-950/70 dark:text-sky-300">
                          {getInitials(selectedPendingUser.fullName)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{selectedPendingUser.fullName}</p>
                          <p className="text-xs text-muted-foreground">{selectedPendingUser.email}</p>
                        </div>
                      </div>
                      <Separator />
                      <DividedList>
                        <DetailRow
                          label="Requested role"
                          value={
                            <Badge variant="outline" className={rolePillClass(selectedPendingUser.role)}>
                              {selectedPendingUser.role}
                            </Badge>
                          }
                        />
                        <Separator />
                        <DetailRow label="Requested by" value={selectedPendingUser.requestedBy} />
                        <Separator />
                        <DetailRow label="Requested on" value={selectedPendingUser.requestedOn} />
                        <Separator />
                        <DetailRow label="Access scope" value={selectedPendingUser.scope} />
                      </DividedList>
                      <Separator />
                      <div className="space-y-2">
                        <Label>Reason</Label>
                        <p className="rounded-lg border border-border/70 bg-muted/35 px-3 py-2 text-sm text-foreground">
                          {selectedPendingUser.reason}
                        </p>
                      </div>
                    </div>
                    <SheetFooter className="border-t border-border/70 px-6 py-4 sm:flex-row sm:justify-end">
                      <Button
                        variant="outline"
                        className="border-destructive/50 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          rejectPendingUser(selectedPendingUser.id)
                          setReviewPendingUserId(null)
                        }}
                      >
                        Reject request
                      </Button>
                      <Button
                        onClick={() => {
                          approvePendingUser(selectedPendingUser.id)
                          setReviewPendingUserId(null)
                        }}
                      >
                        Approve user
                      </Button>
                    </SheetFooter>
                  </>
                ) : null}
              </SheetContent>
            </Sheet>
          </>
        )}
      </AccountPageShell>
    )
  }

  if (page === "preferences") {
    return (
      <AccountPageShell
        title="Preferences"
        description="Language, notification defaults, and working preferences for the current user."
        actions={editDetailsAction}
      >
        <SectionCard
          title="Platform language"
          description="Saved locally for this browser session on the workspace."
        >
          {isEditing ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">{currentLanguage.label}</p>
                <p className="text-sm text-muted-foreground">{currentLanguage.nativeLabel}</p>
              </div>
              <select
                aria-label="Preferred language"
                className="h-9 rounded-md border border-border bg-background px-3 text-sm"
                value={preferencesForm.languageCode}
                onChange={(event) => {
                  setPreferencesForm((prev) => ({
                    ...prev,
                    languageCode: event.target.value,
                  }))
                }}
              >
                {SUPPORTED_LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <DividedList>
              <DetailRow label="Preferred language" value={currentLanguage.label} />
              <Separator />
              <DetailRow label="Native label" value={currentLanguage.nativeLabel} />
            </DividedList>
          )}
        </SectionCard>

        <SectionCard
          title="Default alerts"
          description="Merchant-facing communication defaults for payments and operations."
        >
          <DividedList>
            {[
              {
                label: "Transaction alerts",
                description: "Receive merchant-facing payment notifications.",
                checked: preferencesForm.transactionAlerts,
                key: "transactionAlerts" as const,
              },
              {
                label: "Settlement updates",
                description: "Get daily payout and delay alerts.",
                checked: preferencesForm.settlementUpdates,
                key: "settlementUpdates" as const,
              },
              {
                label: "Weekly performance digest",
                description: "A weekly roll-up of payments, disputes, and refunds.",
                checked: preferencesForm.weeklyDigest,
                key: "weeklyDigest" as const,
              },
            ].map((item, index, arr) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  {isEditing ? (
                    <Switch
                      checked={item.checked}
                      onCheckedChange={(checked) =>
                        setPreferencesForm((prev) => ({ ...prev, [item.key]: checked }))
                      }
                    />
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      {item.checked ? "Enabled" : "Disabled"}
                    </Badge>
                  )}
                </div>
                {index < arr.length - 1 ? <Separator /> : null}
              </div>
            ))}
          </DividedList>
        </SectionCard>
      </AccountPageShell>
    )
  }

  if (page === "security") {
    return (
      <AccountPageShell
        title="Security"
        description="Authentication controls, password hygiene, and current session visibility."
        actions={editDetailsAction}
      >
        <SectionCard
          title="Access controls"
          description="Security controls tied to login protection and sensitive workspace actions."
        >
          <DividedList>
            {isEditing ? (
              <>
                <FieldGrid
                  fields={[
                    {
                      id: "security-password-rotation",
                      label: "Password rotation (days)",
                      value: securityForm.passwordRotationDays,
                      onChange: (value) =>
                        setSecurityForm((prev) => ({ ...prev, passwordRotationDays: value })),
                    },
                    {
                      id: "security-session-timeout",
                      label: "Session timeout (minutes)",
                      value: securityForm.sessionTimeoutMinutes,
                      onChange: (value) =>
                        setSecurityForm((prev) => ({ ...prev, sessionTimeoutMinutes: value })),
                    },
                  ]}
                />
                <Separator className="my-6" />
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <p className="text-sm font-medium text-foreground">Two-factor authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add SMS verification for sensitive actions.
                    </p>
                  </div>
                  <Switch
                    checked={securityForm.require2FA}
                    onCheckedChange={(checked) =>
                      setSecurityForm((prev) => ({ ...prev, require2FA: checked }))
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <DetailRow label="Password rotation (days)" value={securityForm.passwordRotationDays} />
                <Separator />
                <DetailRow label="Session timeout (minutes)" value={securityForm.sessionTimeoutMinutes} />
                <Separator />
                <DetailRow
                  label="Two-factor authentication"
                  value={securityForm.require2FA ? "Enabled" : "Disabled"}
                />
                <Separator />
                <DetailRow label="Password last updated" value={securityForm.passwordUpdatedAt} />
              </>
            )}
          </DividedList>
        </SectionCard>

        <SectionCard
          title="Active sessions"
          description="Devices and browsers currently or recently signed into this account."
        >
          <DividedList>
            {[
              { device: "Chrome · macOS", location: "Mumbai, India", status: "Current session" },
              { device: "Safari · iPhone", location: "Mumbai, India", status: "2 hours ago" },
              { device: "Chrome · Windows", location: "Delhi, India", status: "3 days ago" },
            ].map((session, index, arr) => (
              <div key={session.device + session.status}>
                <div className="flex items-center justify-between gap-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{session.device}</p>
                    <p className="text-sm text-muted-foreground">{session.location}</p>
                  </div>
                  <p className="text-sm text-foreground">{session.status}</p>
                </div>
                {index < arr.length - 1 ? <Separator /> : null}
              </div>
            ))}
          </DividedList>
        </SectionCard>
      </AccountPageShell>
    )
  }

  return (
    <AccountPageShell
      title="Feedback"
      description="Share product feedback, usability issues, or ideas for the merchant platform."
      actions={<Button size="sm" className="h-8 text-xs">Submit feedback</Button>}
    >
      <SectionCard
        title="Share feedback"
        description="This goes to the product team with current workspace context."
      >
        <FieldGrid
          fields={[
            { id: "feedback-name", label: "Your name", defaultValue: sessionName },
            { id: "feedback-email", label: "Email", defaultValue: sessionEmail },
          ]}
        />
        <Separator className="my-6" />
        <div className="space-y-2">
          <Label htmlFor="feedback-category">Category</Label>
          <Input id="feedback-category" defaultValue="Product feedback" />
        </div>
        <div className="space-y-2 pt-2">
          <Label htmlFor="feedback-message">Details</Label>
          <Textarea
            id="feedback-message"
            rows={8}
            defaultValue="I’d like to suggest improvements to the language switcher and account experience."
          />
        </div>
      </SectionCard>

      <SectionCard
        title="What happens next"
        description="How this input is handled after submission."
      >
        <DividedList>
          <DetailRow label="Context capture" value="Feedback is logged with route and product context" />
          <Separator />
          <DetailRow label="Prioritization" value="Business impact signals help the team rank requests" />
          <Separator />
          <DetailRow label="Urgent path" value="Support can still be used for business-critical blockers" />
        </DividedList>
      </SectionCard>
    </AccountPageShell>
  )
}
