"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
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
import { CaretDownIcon, DotsThreeVerticalIcon, MagnifyingGlassIcon, WarningIcon } from "@phosphor-icons/react"
import { AccountPageShell } from "./account-page-shell"
import { DetailSidepanelShell } from "@/components/shared/activity-timeline-sidepanel"

type AccountPageContentProps = {
  page:
    | "profile"
    | "business-details"
    | "users"
    | "preferences"
    | "security"
    | "feedback"
  embedded?: boolean
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
  action,
  children,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl space-y-1">
          <h2 className="text-[24px] font-semibold leading-8 text-foreground">{title}</h2>
          {description ? (
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="rounded-xl border border-border/70 p-5 md:p-6">{children}</div>
    </section>
  )
}

function StatGrid({
  items,
  columns = 4,
}: {
  items: { label: string; value: React.ReactNode; hint?: string; badge?: React.ReactNode }[]
  columns?: 2 | 3 | 4
}) {
  const gridClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 3
        ? "sm:grid-cols-2 xl:grid-cols-3"
        : "sm:grid-cols-2 xl:grid-cols-4"

  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-border/70 px-4 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
              {item.label}
            </p>
            {item.badge ? <div className="shrink-0">{item.badge}</div> : null}
          </div>
          <p className="mt-2 break-words text-[16px] font-semibold leading-6 text-foreground">{item.value}</p>
          {item.hint ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.hint}</p> : null}
        </div>
      ))}
    </div>
  )
}

function StatusRows({
  items,
}: {
  items: {
    label: string
    value: React.ReactNode
    context?: string
    badge?: React.ReactNode
  }[]
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/70">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={`grid gap-2 px-4 py-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] md:items-center md:gap-4 ${
            index === 0 ? "" : "border-t border-border/70"
          }`}
        >
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
              {item.label}
            </p>
            {item.context ? (
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.context}</p>
            ) : null}
          </div>
          <div className="text-sm font-semibold leading-6 text-foreground">{item.value}</div>
          {item.badge ? <div className="justify-self-start md:justify-self-end">{item.badge}</div> : null}
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
    <div className="rounded-lg border border-border/70 bg-muted/10 px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className="mt-1 text-[15px] font-semibold text-foreground break-words">{value}</div>
        </div>
        {badge ? <div className="shrink-0 self-start">{badge}</div> : null}
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
          <Label htmlFor={field.id} className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            {field.label}
          </Label>
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

function DividedList({
  children,
  columns = 1,
}: {
  children: React.ReactNode[] | React.ReactNode
  columns?: 1 | 2 | 3
}) {
  const columnsClass =
    columns === 3
      ? "xl:grid-cols-3"
      : columns === 2
        ? "lg:grid-cols-2"
        : "grid-cols-1"

  return (
    <div className={`grid grid-cols-1 gap-3 ${columnsClass} [&_[data-slot=separator]]:hidden`}>
      {children}
    </div>
  )
}

type EditableSectionId =
  | "profile-personal"
  | "business-profile"
  | "business-bank"
  | "preferences-language"
  | "preferences-alerts"
  | "security-access"

export function AccountPageContent({ page, embedded = false }: AccountPageContentProps) {
  const [sessionName, setSessionName] = useState("Rahul Sharma")
  const [sessionEmail, setSessionEmail] = useState("rahul.sharma@pinelabs-demo.in")
  const [sessionRole, setSessionRole] = useState("Admin")
  const [activeSectionEditor, setActiveSectionEditor] = useState<EditableSectionId | null>(null)
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
  const [profileDraft, setProfileDraft] = useState({
    fullName: "Rahul Sharma",
    role: "Admin",
    email: "rahul.sharma@pinelabs-demo.in",
    phone: "+91 98765 43210",
    defaultMarket: "India",
  })
  const [businessProfileDraft, setBusinessProfileDraft] = useState({
    legalBusinessName: "Pine Retail Ventures Private Limited",
    businessCategory: "Retail and omnichannel commerce",
    website: "https://www.pineretail.in",
    businessPhone: "+91 22 4567 8901",
  })
  const [businessBankDraft, setBusinessBankDraft] = useState({
    primaryPayoutAccount: "HDFC Bank · •••• 4821",
    secondaryAccount: "ICICI Bank · •••• 9932",
    defaultSettlementCycle: "T+1 day",
  })
  const [preferencesLanguageDraft, setPreferencesLanguageDraft] = useState(DEFAULT_LANGUAGE.code)
  const [preferencesAlertsDraft, setPreferencesAlertsDraft] = useState({
    transactionAlerts: true,
    settlementUpdates: true,
    weeklyDigest: false,
  })
  const [securityDraft, setSecurityDraft] = useState({
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
      setProfileDraft((prev) => ({
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
    setPreferencesLanguageDraft(storedLanguage)
  }, [])
  useEffect(() => {
    setActiveSectionEditor(null)
  }, [page])
  useEffect(() => {
    setBusinessProfileDraft({
      legalBusinessName: businessForm.legalBusinessName,
      businessCategory: businessForm.businessCategory,
      website: businessForm.website,
      businessPhone: businessForm.businessPhone,
    })
    setBusinessBankDraft({
      primaryPayoutAccount: businessForm.primaryPayoutAccount,
      secondaryAccount: businessForm.secondaryAccount,
      defaultSettlementCycle: businessForm.defaultSettlementCycle,
    })
  }, [businessForm])
  useEffect(() => {
    setPreferencesAlertsDraft({
      transactionAlerts: preferencesForm.transactionAlerts,
      settlementUpdates: preferencesForm.settlementUpdates,
      weeklyDigest: preferencesForm.weeklyDigest,
    })
  }, [
    preferencesForm.transactionAlerts,
    preferencesForm.settlementUpdates,
    preferencesForm.weeklyDigest,
  ])
  useEffect(() => {
    setSecurityDraft({
      require2FA: securityForm.require2FA,
      sessionTimeoutMinutes: securityForm.sessionTimeoutMinutes,
      passwordRotationDays: securityForm.passwordRotationDays,
    })
  }, [
    securityForm.require2FA,
    securityForm.sessionTimeoutMinutes,
    securityForm.passwordRotationDays,
  ])

  const currentLanguage = useMemo(
    () => getLanguageByCode(preferencesForm.languageCode),
    [preferencesForm.languageCode]
  )
  const isAdmin = sessionRole.toLowerCase() === "admin"
  const usersHeaderActions = useMemo(() => {
    if (!isAdmin) return null

    return (
      <>
        <Button asChild size="sm" variant="outline" className="h-9 text-xs">
          <Link href="/account/users/roles">Manage user roles</Link>
        </Button>
        <Button size="sm" className="h-9 text-xs" onClick={() => setIsCreateUserOpen(true)}>
          Invite user
        </Button>
      </>
    )
  }, [isAdmin])
  const feedbackHeaderAction = useMemo(
    () => (
      <Button size="sm" className="h-8 text-xs">
        Submit feedback
      </Button>
    ),
    []
  )
  const currentLanguageDraft = useMemo(
    () => getLanguageByCode(preferencesLanguageDraft),
    [preferencesLanguageDraft]
  )

  function openSectionEditor(section: EditableSectionId) {
    if (section === "profile-personal") {
      setProfileDraft({ ...profileForm })
    } else if (section === "business-profile") {
      setBusinessProfileDraft({
        legalBusinessName: businessForm.legalBusinessName,
        businessCategory: businessForm.businessCategory,
        website: businessForm.website,
        businessPhone: businessForm.businessPhone,
      })
    } else if (section === "business-bank") {
      setBusinessBankDraft({
        primaryPayoutAccount: businessForm.primaryPayoutAccount,
        secondaryAccount: businessForm.secondaryAccount,
        defaultSettlementCycle: businessForm.defaultSettlementCycle,
      })
    } else if (section === "preferences-language") {
      setPreferencesLanguageDraft(preferencesForm.languageCode)
    } else if (section === "preferences-alerts") {
      setPreferencesAlertsDraft({
        transactionAlerts: preferencesForm.transactionAlerts,
        settlementUpdates: preferencesForm.settlementUpdates,
        weeklyDigest: preferencesForm.weeklyDigest,
      })
    } else if (section === "security-access") {
      setSecurityDraft({
        require2FA: securityForm.require2FA,
        sessionTimeoutMinutes: securityForm.sessionTimeoutMinutes,
        passwordRotationDays: securityForm.passwordRotationDays,
      })
    }

    setActiveSectionEditor(section)
  }

  function saveSectionEditor() {
    if (!activeSectionEditor) return

    if (activeSectionEditor === "profile-personal") {
      setProfileForm({ ...profileDraft })
    } else if (activeSectionEditor === "business-profile") {
      setBusinessForm((prev) => ({
        ...prev,
        legalBusinessName: businessProfileDraft.legalBusinessName,
        businessCategory: businessProfileDraft.businessCategory,
        website: businessProfileDraft.website,
        businessPhone: businessProfileDraft.businessPhone,
      }))
    } else if (activeSectionEditor === "business-bank") {
      setBusinessForm((prev) => ({
        ...prev,
        primaryPayoutAccount: businessBankDraft.primaryPayoutAccount,
        secondaryAccount: businessBankDraft.secondaryAccount,
        defaultSettlementCycle: businessBankDraft.defaultSettlementCycle,
      }))
    } else if (activeSectionEditor === "preferences-language") {
      setPreferencesForm((prev) => ({
        ...prev,
        languageCode: preferencesLanguageDraft,
      }))
      writeLanguagePreference(preferencesLanguageDraft)
    } else if (activeSectionEditor === "preferences-alerts") {
      setPreferencesForm((prev) => ({
        ...prev,
        ...preferencesAlertsDraft,
      }))
    } else if (activeSectionEditor === "security-access") {
      setSecurityForm((prev) => ({
        ...prev,
        require2FA: securityDraft.require2FA,
        sessionTimeoutMinutes: securityDraft.sessionTimeoutMinutes,
        passwordRotationDays: securityDraft.passwordRotationDays,
      }))
    }

    setActiveSectionEditor(null)
  }

  function getSectionEditorMeta(section: EditableSectionId | null) {
    if (!section) {
      return {
        title: "Edit section details",
        description: "Update section details and save your changes.",
      }
    }
    if (section === "profile-personal") {
      return {
        title: "Edit personal details",
        description: "Update your profile details for account identity and communication.",
      }
    }
    if (section === "business-profile") {
      return {
        title: "Edit business profile",
        description: "Update your legal identity and primary business contact details.",
      }
    }
    if (section === "business-bank") {
      return {
        title: "Edit bank accounts",
        description: "Update payout accounts and default settlement cycle.",
      }
    }
    if (section === "preferences-language") {
      return {
        title: "Edit platform language",
        description: "Language preference is saved for this browser session.",
      }
    }
    if (section === "preferences-alerts") {
      return {
        title: "Edit default alerts",
        description: "Choose which alerts should be enabled by default.",
      }
    }
    if (section === "security-access") {
      return {
        title: "Edit access controls",
        description: "Update security controls for account access and session protection.",
      }
    }

    return {
      title: "Edit access controls",
      description: "Update security controls for account access and session protection.",
    }
  }

  function renderSectionEditorBody() {
    if (activeSectionEditor === "profile-personal") {
      return (
        <div className="space-y-5">
          <FieldGrid
            fields={[
              {
                id: "editor-profile-name",
                label: "Full name",
                value: profileDraft.fullName,
                onChange: (value) =>
                  setProfileDraft((prev) => ({ ...prev, fullName: value })),
              },
              {
                id: "editor-profile-role",
                label: "Role",
                value: profileDraft.role,
                disabled: true,
              },
              {
                id: "editor-profile-email",
                label: "Work email",
                type: "email",
                value: profileDraft.email,
                onChange: (value) =>
                  setProfileDraft((prev) => ({ ...prev, email: value })),
              },
              {
                id: "editor-profile-phone",
                label: "Mobile number",
                value: profileDraft.phone,
                onChange: (value) =>
                  setProfileDraft((prev) => ({ ...prev, phone: value })),
              },
              {
                id: "editor-profile-market",
                label: "Default market",
                value: profileDraft.defaultMarket,
                onChange: (value) =>
                  setProfileDraft((prev) => ({ ...prev, defaultMarket: value })),
              },
            ]}
          />
        </div>
      )
    }

    if (activeSectionEditor === "business-profile") {
      return (
        <div className="space-y-5">
          <FieldGrid
            fields={[
              {
                id: "editor-business-name",
                label: "Legal business name",
                value: businessProfileDraft.legalBusinessName,
                onChange: (value) =>
                  setBusinessProfileDraft((prev) => ({ ...prev, legalBusinessName: value })),
              },
              {
                id: "editor-business-category",
                label: "Business category",
                value: businessProfileDraft.businessCategory,
                onChange: (value) =>
                  setBusinessProfileDraft((prev) => ({ ...prev, businessCategory: value })),
              },
              {
                id: "editor-business-website",
                label: "Website",
                value: businessProfileDraft.website,
                onChange: (value) =>
                  setBusinessProfileDraft((prev) => ({ ...prev, website: value })),
              },
              {
                id: "editor-business-phone",
                label: "Business phone",
                value: businessProfileDraft.businessPhone,
                onChange: (value) =>
                  setBusinessProfileDraft((prev) => ({ ...prev, businessPhone: value })),
              },
            ]}
          />
        </div>
      )
    }

    if (activeSectionEditor === "business-bank") {
      return (
        <div className="space-y-5">
          <FieldGrid
            fields={[
              {
                id: "editor-business-primary-payout",
                label: "Primary payout account",
                value: businessBankDraft.primaryPayoutAccount,
                onChange: (value) =>
                  setBusinessBankDraft((prev) => ({ ...prev, primaryPayoutAccount: value })),
              },
              {
                id: "editor-business-secondary-account",
                label: "Secondary account",
                value: businessBankDraft.secondaryAccount,
                onChange: (value) =>
                  setBusinessBankDraft((prev) => ({ ...prev, secondaryAccount: value })),
              },
              {
                id: "editor-business-settlement-cycle",
                label: "Default settlement cycle",
                value: businessBankDraft.defaultSettlementCycle,
                onChange: (value) =>
                  setBusinessBankDraft((prev) => ({ ...prev, defaultSettlementCycle: value })),
              },
            ]}
          />
        </div>
      )
    }

    if (activeSectionEditor === "preferences-language") {
      return (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="editor-language">Preferred language</Label>
            <select
              id="editor-language"
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={preferencesLanguageDraft}
              onChange={(event) => setPreferencesLanguageDraft(event.target.value)}
            >
              {SUPPORTED_LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-md border border-border/70 px-3 py-2">
            <p className="text-sm font-medium text-foreground">{currentLanguageDraft.label}</p>
            <p className="text-xs text-muted-foreground">{currentLanguageDraft.nativeLabel}</p>
          </div>
        </div>
      )
    }

    if (activeSectionEditor === "preferences-alerts") {
      return (
        <div className="space-y-4">
          {[
            {
              key: "transactionAlerts" as const,
              label: "Transaction alerts",
              description: "Receive merchant-facing payment notifications.",
            },
            {
              key: "settlementUpdates" as const,
              label: "Settlement updates",
              description: "Get daily payout and delay alerts.",
            },
            {
              key: "weeklyDigest" as const,
              label: "Weekly performance digest",
              description: "A weekly roll-up of payments, disputes, and refunds.",
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4 rounded-md border border-border/70 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Switch
                checked={preferencesAlertsDraft[item.key]}
                onCheckedChange={(checked) =>
                  setPreferencesAlertsDraft((prev) => ({ ...prev, [item.key]: checked }))
                }
              />
            </div>
          ))}
        </div>
      )
    }

    if (activeSectionEditor === "security-access") {
      return (
        <div className="space-y-5">
          <FieldGrid
            fields={[
              {
                id: "editor-security-password-rotation",
                label: "Password rotation (days)",
                value: securityDraft.passwordRotationDays,
                onChange: (value) =>
                  setSecurityDraft((prev) => ({ ...prev, passwordRotationDays: value })),
              },
              {
                id: "editor-security-session-timeout",
                label: "Session timeout (minutes)",
                value: securityDraft.sessionTimeoutMinutes,
                onChange: (value) =>
                  setSecurityDraft((prev) => ({ ...prev, sessionTimeoutMinutes: value })),
              },
            ]}
          />
          <div className="flex items-center justify-between gap-6 rounded-md border border-border/70 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">Two-factor authentication</p>
              <p className="text-xs text-muted-foreground">Add SMS verification for sensitive actions.</p>
            </div>
            <Switch
              checked={securityDraft.require2FA}
              onCheckedChange={(checked) =>
                setSecurityDraft((prev) => ({ ...prev, require2FA: checked }))
              }
            />
          </div>
        </div>
      )
    }

    return null
  }

  const sectionEditorMeta = getSectionEditorMeta(activeSectionEditor)
  const sectionEditorSheet = (
    <DetailSidepanelShell
      open={Boolean(activeSectionEditor)}
      onOpenChange={(open) => {
        if (!open) setActiveSectionEditor(null)
      }}
      title={sectionEditorMeta.title}
    >
      <div className="flex min-h-full flex-col">
        <section className="border-b border-muted px-6 py-4">
          <p className="text-sm leading-5 text-muted-foreground">{sectionEditorMeta.description}</p>
        </section>
        <section className="flex-1 px-6 py-6">
          {renderSectionEditorBody()}
        </section>
        <div className="border-t border-muted px-6 py-4">
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setActiveSectionEditor(null)}>
              Cancel
            </Button>
            <Button onClick={saveSectionEditor}>Save changes</Button>
          </div>
        </div>
      </div>
    </DetailSidepanelShell>
  )
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
  const [pendingSearchQuery, setPendingSearchQuery] = useState("")

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
  const filteredPendingUsers = useMemo(() => {
    const query = pendingSearchQuery.trim().toLowerCase()
    if (!query) return pendingUsers
    return pendingUsers.filter((entry) =>
      [entry.fullName, entry.email, entry.role, entry.scope, entry.requestedBy, entry.requestedOn]
        .join(" ")
        .toLowerCase()
        .includes(query)
    )
  }, [pendingUsers, pendingSearchQuery])
  const filteredManagedUsers = useMemo(() => {
    return managedUsers.filter((entry) => roleFilter === "all" || entry.role.toLowerCase() === roleFilter)
  }, [managedUsers, roleFilter])
  const selectedPendingCount = selectedPendingIds.length
  const isAllPendingSelected =
    filteredPendingUsers.length > 0 &&
    filteredPendingUsers.every((entry) => selectedPendingIds.includes(entry.id))

  const pendingUserColumns = useMemo<DataTableColumn<PendingUser>[]>(
    () => [
      {
        id: "selection",
        header: "SELECT",
        width: 64,
        align: "center",
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
      },
      {
        id: "fullName",
        header: "FULL NAME",
        width: 180,
        cell: (row) => row.fullName,
      },
      {
        id: "email",
        header: "EMAIL ID",
        width: 220,
        cell: (row) => row.email,
      },
      {
        id: "role",
        header: "REQUESTED ROLE",
        width: 160,
        cell: (row) => (
          <Badge variant="outline" className={rolePillClass(row.role)}>
            {row.role}
          </Badge>
        ),
      },
      {
        id: "scope",
        header: "ACCESS SCOPE",
        width: 180,
        cell: (row) => row.scope,
      },
      {
        id: "requestedBy",
        header: "REQUESTED BY",
        width: 150,
        cell: (row) => row.requestedBy,
      },
      {
        id: "requestedOn",
        header: "REQUESTED ON",
        width: 170,
        cell: (row) => row.requestedOn,
      },
      {
        id: "action",
        header: "ACTION",
        width: 100,
        align: "right",
        cell: (row) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg">
                  <DotsThreeVerticalIcon className="h-4 w-4" />
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

  const managedUserColumns = useMemo<DataTableColumn<ManagedUser>[]>(
    () => [
      {
        id: "fullName",
        header: "FULL NAME",
        width: 180,
        getSearchValue: (row) =>
          `${row.fullName} ${row.email} ${row.role} ${row.createdOn} ${row.lastModifiedOn}`,
        cell: (row) => row.fullName,
      },
      {
        id: "email",
        header: "EMAIL ID",
        width: 220,
        cell: (row) => row.email,
      },
      {
        id: "role",
        header: "ROLE",
        width: 160,
        cell: (row) => (
          <Badge variant="outline" className={rolePillClass(row.role)}>
            {row.role}
          </Badge>
        ),
      },
      {
        id: "createdOn",
        header: "CREATED ON",
        width: 170,
        cell: (row) => row.createdOn,
      },
      {
        id: "lastModifiedOn",
        header: "LAST MODIFIED ON",
        width: 190,
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
              <DropdownMenuContent align="end" className="w-44 rounded-lg">
                <DropdownMenuItem>View details</DropdownMenuItem>
                <DropdownMenuItem>Edit role</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Deactivate user</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    []
  )

  useEffect(() => {
    setSelectedPendingIds((prev) =>
      prev.filter((id) => pendingUsers.some((entry) => entry.id === id))
    )
  }, [pendingUsers])

  if (page === "profile") {
    return (
      <>
      <AccountPageShell
        embedded={embedded}
        title="Profile"
        description="Personal details, primary contact information, and approval identity for the current user."
      >
        <SectionCard
          title="Personal details"
          description="These details are used for approvals, ownership attribution, and operational communication."
          action={
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => openSectionEditor("profile-personal")}
            >
              Edit
            </Button>
          }
        >
          <div className="grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-4">
              <div className="rounded-lg border border-border/70 p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="size-12">
                    <AvatarImage src="/placeholder-user.jpg" alt={`${profileForm.fullName} profile photo`} />
                    <AvatarFallback className="text-sm font-semibold">
                      {getInitials(profileForm.fullName) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-foreground">{profileForm.fullName}</p>
                    <p className="truncate text-sm text-muted-foreground">{profileForm.email}</p>
                    <Badge variant="outline" className="mt-2">{profileForm.role}</Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="xl:col-span-8">
              <StatusRows
                items={[
                  {
                    label: "Mobile",
                    value: profileForm.phone,
                    context: "Used for login verification and security communication.",
                  },
                  {
                    label: "Default market",
                    value: profileForm.defaultMarket,
                    context: "Controls payout, reporting, and policy defaults.",
                  },
                  {
                    label: "Approval authority",
                    value: profileForm.role === "Admin" ? "Full admin approvals" : "Role-based approvals",
                    context: "Defines access to users, payout controls, and configuration.",
                  },
                ]}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Working identity"
          description="How the platform understands your ownership, responsibility, and communication context."
        >
          <StatusRows
            items={[
              {
                label: "Primary identity",
                value: "Linked to approvals and transaction ownership",
                context: "Every approval and critical action is attributed to this account.",
              },
              {
                label: "Escalation contact",
                value: "Available for disputes, settlements, and compliance reviews",
                context: "Operations teams use this channel for time-sensitive follow-up.",
              },
              {
                label: "Workspace scope",
                value: "Role controls users, payout workflows, and configurations",
                context: "Higher privileges unlock additional merchant controls.",
              },
            ]}
          />
        </SectionCard>
      </AccountPageShell>
      {sectionEditorSheet}
      </>
    )
  }

  if (page === "business-details") {
    return (
      <>
      <AccountPageShell
        embedded={embedded}
        title="Business details"
        description="Business identity, operational details, compliance records, and payout accounts."
      >
        <SectionCard
          title="Business profile"
          description="Merchant identity details used across products, KYC, and support operations."
          action={
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => openSectionEditor("business-profile")}
            >
              Edit
            </Button>
          }
        >
          <div className="grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-5">
              <StatGrid
                columns={2}
                items={[
                  { label: "Legal business name", value: businessForm.legalBusinessName },
                  { label: "Business category", value: businessForm.businessCategory },
                ]}
              />
            </div>
            <div className="xl:col-span-7">
              <StatusRows
                items={[
                  {
                    label: "Website",
                    value: businessForm.website,
                    context: "Displayed in invoices, payment links, and merchant communication.",
                  },
                  {
                    label: "Business phone",
                    value: businessForm.businessPhone,
                    context: "Primary contact for onboarding and payout exceptions.",
                  },
                ]}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Documents and compliance"
          description="Verification records linked to settlement readiness and onboarding status."
        >
          <StatusRows
            items={[
              {
                label: "PAN",
                value: "ABCDE1234F",
                context: "Tax identity",
                badge: (
                  <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                    Verified
                  </Badge>
                ),
              },
              {
                label: "GSTIN",
                value: "27ABCDE1234F1Z5",
                context: "Indirect tax registration",
                badge: (
                  <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                    Verified
                  </Badge>
                ),
              },
              {
                label: "Incorporation certificate",
                value: "Uploaded",
                context: "Legal entity proof",
                badge: <Badge variant="outline">Reviewed</Badge>,
              },
              {
                label: "Authorized signatory proof",
                value: "Pending renewal",
                context: "Signatory validation",
                badge: (
                  <Badge variant="outline" className="border-warning/30 bg-warning/10 text-foreground">
                    Pending
                  </Badge>
                ),
              },
            ]}
          />
        </SectionCard>

        <SectionCard
          title="Bank accounts"
          description="Accounts and cycles used for settlements and payout routing."
          action={
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => openSectionEditor("business-bank")}
            >
              Edit
            </Button>
          }
        >
          <div className="grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <StatusRows
                items={[
                  {
                    label: "Primary payout account",
                    value: businessForm.primaryPayoutAccount,
                    context: "Used for default settlement routing.",
                    badge: <Badge variant="outline" className="border-success/30 bg-success/10 text-success">Primary</Badge>,
                  },
                  {
                    label: "Secondary account",
                    value: businessForm.secondaryAccount,
                    context: "Fallback account for payout continuity.",
                    badge: <Badge variant="outline">Backup</Badge>,
                  },
                ]}
              />
            </div>
            <div className="xl:col-span-4">
              <StatGrid
                columns={2}
                items={[
                  { label: "Default settlement cycle", value: businessForm.defaultSettlementCycle },
                  { label: "Settlement mode", value: "Automatic" },
                ]}
              />
            </div>
          </div>
        </SectionCard>
      </AccountPageShell>
      {sectionEditorSheet}
      </>
    )
  }

  if (page === "users") {
    return (
      <AccountPageShell
        embedded={embedded}
        title="Users management"
        description="Create, review, and manage user access across your merchant operations."
        actions={usersHeaderActions}
      >
        {!isAdmin ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WarningIcon className="h-4 w-4" />
              </EmptyMedia>
              <EmptyTitle>Restricted access</EmptyTitle>
              <EmptyDescription>Only admins can manage users and invitations on this workspace.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <SectionCard
              title="Approval queue"
              description="Every new user request is reviewed before profile activation."
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Checkbox
                      checked={isAllPendingSelected}
                      onCheckedChange={(checked) =>
                        setSelectedPendingIds(
                          checked
                            ? Array.from(new Set([...selectedPendingIds, ...filteredPendingUsers.map((user) => user.id)]))
                            : selectedPendingIds.filter((id) => !filteredPendingUsers.some((user) => user.id === id))
                        )
                      }
                      aria-label="Select all pending users"
                    />
                    <span>Select all</span>
                    <span aria-hidden="true">•</span>
                    <span>
                      {filteredPendingUsers.length > 0
                        ? `${filteredPendingUsers.length} user requests pending approval`
                        : "No pending user approvals right now."}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-[240px]">
                      <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={pendingSearchQuery}
                        onChange={(event) => setPendingSearchQuery(event.target.value)}
                        placeholder="Search pending users"
                        className="h-8 rounded-md border-input pl-8 pr-3 text-sm"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-md px-2.5 text-sm"
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
                </div>
                <DataTable
                  data={filteredPendingUsers}
                  rowId={(row) => row.id}
                  columns={pendingUserColumns}
                  emptyText="No pending user approvals right now."
                  tableClassName="min-w-[1220px]"
                  showSearch={false}
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Users directory"
              description="Profiles can be filtered by user role from the top-left switcher."
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant={roleFilter === "all" ? "default" : "outline"}
                      className="h-8 rounded-md px-2.5 text-sm"
                      onClick={() => setRoleFilter("all")}
                    >
                      All
                    </Button>
                    {primaryRoleFilters.map((role) => (
                      <Button
                        key={role}
                        variant={roleFilter === role.toLowerCase() ? "default" : "outline"}
                        className="h-8 rounded-md px-2.5 text-sm"
                        onClick={() => setRoleFilter(role.toLowerCase())}
                      >
                        {role}
                      </Button>
                    ))}
                    {overflowRoleFilters.length > 0 ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="h-8 gap-1.5 rounded-md px-2.5 text-sm">
                            More <CaretDownIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <DropdownMenuRadioGroup value={roleFilter} onValueChange={setRoleFilter}>
                            {overflowRoleFilters.map((role) => (
                              <DropdownMenuRadioItem key={role} value={role.toLowerCase()}>
                                {role}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </div>
                </div>
                <DataTable
                  data={filteredManagedUsers}
                  rowId={(row) => row.id}
                  columns={managedUserColumns}
                  tableClassName="min-w-[1080px]"
                  searchPlaceholder="Search by name or email"
                />
              </div>
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
                        <p className="rounded-md border border-border/70 px-3 py-2 text-sm text-foreground">
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
      <>
      <AccountPageShell
        embedded={embedded}
        title="Preferences"
        description="Language, notification defaults, and working preferences for the current user."
      >
        <SectionCard
          title="Platform language"
          description="Saved locally for this browser session on the workspace."
          action={
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => openSectionEditor("preferences-language")}
            >
              Edit
            </Button>
          }
        >
          <div className="grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-4">
              <StatGrid
                columns={2}
                items={[
                  { label: "Preferred language", value: currentLanguage.label },
                  { label: "Native label", value: currentLanguage.nativeLabel },
                ]}
              />
            </div>
            <div className="xl:col-span-8">
              <StatusRows
                items={[
                  {
                    label: "Applied scope",
                    value: "Current browser session",
                    context: "Language is saved for this device and browser context.",
                  },
                  {
                    label: "Fallback language",
                    value: "English",
                    context: "Used when content is unavailable in selected language.",
                  },
                ]}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Default alerts"
          description="Merchant-facing communication defaults for payments and operations."
          action={
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => openSectionEditor("preferences-alerts")}
            >
              Edit
            </Button>
          }
        >
          <StatusRows
            items={[
              {
                label: "Transaction alerts",
                value: "Payment success/failure notifications",
                context: "Real-time updates for payment operations.",
                badge: <Badge variant="outline">{preferencesForm.transactionAlerts ? "Enabled" : "Disabled"}</Badge>,
              },
              {
                label: "Settlement updates",
                value: "Payout and delay notifications",
                context: "Daily settlement progress and exception monitoring.",
                badge: <Badge variant="outline">{preferencesForm.settlementUpdates ? "Enabled" : "Disabled"}</Badge>,
              },
              {
                label: "Weekly digest",
                value: "Performance summary (payments, disputes, refunds)",
                context: "Weekly rollup for leadership and operations review.",
                badge: <Badge variant="outline">{preferencesForm.weeklyDigest ? "Enabled" : "Disabled"}</Badge>,
              },
            ]}
          />
        </SectionCard>
      </AccountPageShell>
      {sectionEditorSheet}
      </>
    )
  }

  if (page === "security") {
    return (
      <>
      <AccountPageShell
        embedded={embedded}
        title="Security"
        description="Authentication controls, password hygiene, and current session visibility."
      >
        <SectionCard
          title="Access controls"
          description="Security controls tied to login protection and sensitive workspace actions."
          action={
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => openSectionEditor("security-access")}
            >
              Edit
            </Button>
          }
        >
          <div className="grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-5">
              <StatGrid
                columns={2}
                items={[
                  { label: "Password rotation (days)", value: securityForm.passwordRotationDays },
                  { label: "Session timeout (minutes)", value: securityForm.sessionTimeoutMinutes },
                ]}
              />
            </div>
            <div className="xl:col-span-7">
              <StatusRows
                items={[
                  {
                    label: "Two-factor authentication",
                    value: securityForm.require2FA ? "Enabled" : "Disabled",
                    context: "Extra verification for sensitive account actions.",
                    badge: (
                      <Badge
                        variant="outline"
                        className={
                          securityForm.require2FA
                            ? "border-success/30 bg-success/10 text-success"
                            : "border-warning/30 bg-warning/10 text-foreground"
                        }
                      >
                        {securityForm.require2FA ? "Protected" : "Recommended"}
                      </Badge>
                    ),
                  },
                  {
                    label: "Password last updated",
                    value: securityForm.passwordUpdatedAt,
                    context: "Use frequent rotation for high-privilege accounts.",
                  },
                ]}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Active sessions"
          description="Devices and browsers currently or recently signed into this account."
        >
          <StatusRows
            items={[
              {
                label: "Chrome · macOS",
                value: "Mumbai, India · Last active now",
                context: "Device fingerprint trusted.",
                badge: (
                  <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                    Current session
                  </Badge>
                ),
              },
              {
                label: "Safari · iPhone",
                value: "Mumbai, India · Last active 2 hours ago",
                context: "Mobile companion session.",
                badge: <Badge variant="outline">Recent</Badge>,
              },
              {
                label: "Chrome · Windows",
                value: "Delhi, India · Last active 3 days ago",
                context: "Review and sign out if no longer in use.",
                badge: <Badge variant="outline">Older session</Badge>,
              },
            ]}
          />
        </SectionCard>
      </AccountPageShell>
      {sectionEditorSheet}
      </>
    )
  }

  return (
    <AccountPageShell
      embedded={embedded}
      title="Feedback"
      description="Share product feedback, usability issues, or ideas for the merchant platform."
      actions={feedbackHeaderAction}
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
        <DividedList columns={3}>
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
