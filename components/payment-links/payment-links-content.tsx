"use client"

import { useState } from "react"
import { Link2, Plus, Copy, CheckCircle2, X, XCircle, Clock, Download, Mail, MessageSquare, Filter, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PanelEmpty } from "@/components/ui/panels"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { ProductWorkspaceNav, type ProductWorkspaceSection } from "@/components/dashboard/product-workspace-nav"

type LinkSection = "overview" | "active" | "paid" | "expired" | "failed"
type LinkNavSection = ProductWorkspaceSection
type VasItem = { id: string; name: string; detail: string; enabled: boolean; requiresConfig: boolean }
type VasConfig = { label: string; cadence: string; owner: string }
type PaymentLinkConfigStatus = "success" | "expired" | "failed"
type PaymentLinkConfigRow = {
  id: string
  amount: number
  createdAt: string
  txnId: string
  expiresAt: string
  status: PaymentLinkConfigStatus
  linkRefId: string
  contactPhone: string
  contactEmail: string
  initiatedAt: string
  sentAt: string
  finalisedAt: string
}

const links = [
  {
    id: "PL-001",
    transactionId: "6908904733",
    name: "Anniversary Sale — 20% off",
    amount: 2499,
    status: "paid",
    created: "28 Feb 2026, 07:37 PM",
    expires: "Paid",
    revenue: "₹2,499",
    paymentMethod: "********4767",
    paymentRail: "Credit · Diners",
    channel: "SMS",
    invoiceNo: "124",
    merchantName: "Future World Apple",
    storeName: "Future World Retail Pvt Ltd",
    acquirer: "ICICI Lyra",
    cardIssuer: "HDFC Bank",
    product: "Pay by Link",
    transactionType: "Sale",
    terminalId: "PL042255",
    batchNo: "194",
    hardwareModel: "Virtual Link",
    contactPhone: "+91 9886186111",
    contactEmail: "buyer+anniversary@sample.com",
  },
  {
    id: "PL-002",
    transactionId: "6908904734",
    name: "Custom Order — Laptop Stand",
    amount: 3200,
    status: "active",
    created: "01 Mar 2026, 10:04 AM",
    expires: "14 days",
    revenue: "₹0",
    paymentMethod: "UPI Collect",
    paymentRail: "UPI · Intent",
    channel: "SMS",
    invoiceNo: "203",
    merchantName: "Studio Merchants",
    storeName: "Studio Merchants Koramangala",
    acquirer: "HDFC SmartGateway",
    cardIssuer: "NA",
    product: "Pay by Link",
    transactionType: "Pending",
    terminalId: "PL063118",
    batchNo: "221",
    hardwareModel: "Virtual Link",
    contactPhone: "+91 9886154032",
    contactEmail: "stark.tony@gmail.com",
  },
  {
    id: "PL-003",
    transactionId: "6908904735",
    name: "Bulk Office Supplies",
    amount: 12500,
    status: "paid",
    created: "01 Mar 2026, 11:51 AM",
    expires: "Paid",
    revenue: "₹12,500",
    paymentMethod: "********9231",
    paymentRail: "Credit · Visa",
    channel: "Email",
    invoiceNo: "422",
    merchantName: "Procure Hub",
    storeName: "Procure Hub B2B Central",
    acquirer: "Axis eCom",
    cardIssuer: "ICICI Bank",
    product: "Pay by Link",
    transactionType: "Sale",
    terminalId: "PL078411",
    batchNo: "319",
    hardwareModel: "Virtual Link",
    contactPhone: "+91 9822055511",
    contactEmail: "procurement@officegroup.com",
  },
  {
    id: "PL-004",
    transactionId: "6908904736",
    name: "Website Redesign Deposit",
    amount: 25000,
    status: "failed",
    created: "01 Mar 2026, 02:18 PM",
    expires: "10 days",
    revenue: "₹0",
    paymentMethod: "Netbanking",
    paymentRail: "NB · SBI",
    channel: "Email",
    invoiceNo: "621",
    merchantName: "Brand Studio",
    storeName: "Brand Studio Operations",
    acquirer: "Razorpay",
    cardIssuer: "NA",
    product: "Pay by Link",
    transactionType: "Failed",
    terminalId: "PL098221",
    batchNo: "404",
    hardwareModel: "Virtual Link",
    contactPhone: "+91 9988776655",
    contactEmail: "ops@brandstudio.io",
  },
  {
    id: "PL-005",
    transactionId: "6908904737",
    name: "Product Photography Pack",
    amount: 8000,
    status: "expired",
    created: "02 Mar 2026, 09:12 AM",
    expires: "Expired",
    revenue: "₹0",
    paymentMethod: "UPI Collect",
    paymentRail: "UPI · QR",
    channel: "SMS",
    invoiceNo: "701",
    merchantName: "Marketverse",
    storeName: "Marketverse Creative",
    acquirer: "PayU",
    cardIssuer: "NA",
    product: "Pay by Link",
    transactionType: "Expired",
    terminalId: "PL105632",
    batchNo: "512",
    hardwareModel: "Virtual Link",
    contactPhone: "+91 9012345678",
    contactEmail: "creative@marketverse.in",
  },
]

const settlementRows = [
  { id: "LST-401", title: "Collected today", amount: "₹48,300", state: "Completed" },
  { id: "LST-400", title: "Pending collection", amount: "₹18,900", state: "In progress" },
]

const disputeRows = [
  { id: "LNK-884", state: "Customer reversed transfer", amount: "₹2,400" },
  { id: "LNK-871", state: "Payer bank timeout", amount: "₹1,800" },
]

const refundRows = [
  { id: "PLR-392", state: "Refund completed", amount: "₹999" },
  { id: "PLR-381", state: "Waiting bank confirmation", amount: "₹1,850" },
]

const reportRows = [
  { id: "RPT-71", title: "Link conversion report", cadence: "Daily", owner: "Collections Ops" },
  { id: "RPT-72", title: "Collection velocity report", cadence: "Weekly", owner: "Finance Ops" },
  { id: "RPT-73", title: "Channel performance report", cadence: "Weekly", owner: "Growth Team" },
]

const paymentLinkConfigurationSeed: PaymentLinkConfigRow[] = [
  { id: "235476", amount: 18000, createdAt: "26 Sep 2025, 01:47 PM", txnId: "302738452", expiresAt: "26 Dec 2025, 01:12 PM", status: "success", linkRefId: "PL-001", contactPhone: "+91 9886186111", contactEmail: "buyer+anniversary@sample.com", initiatedAt: "26 Sep 2025, 01:47 PM", sentAt: "26 Sep 2025, 01:55 PM", finalisedAt: "26 Sep 2025, 02:12 PM" },
  { id: "325476", amount: 13000, createdAt: "28 Sep 2025, 01:47 PM", txnId: "834738452", expiresAt: "28 Dec 2025, 02:47 PM", status: "success", linkRefId: "PL-002", contactPhone: "+91 9886154032", contactEmail: "stark.tony@gmail.com", initiatedAt: "28 Sep 2025, 01:47 PM", sentAt: "28 Sep 2025, 01:57 PM", finalisedAt: "28 Sep 2025, 02:18 PM" },
  { id: "824572", amount: 7000, createdAt: "26 Sep 2025, 01:47 PM", txnId: "291738452", expiresAt: "26 Dec 2025, 02:47 PM", status: "expired", linkRefId: "PL-005", contactPhone: "+91 9012345678", contactEmail: "creative@marketverse.in", initiatedAt: "26 Sep 2025, 01:47 PM", sentAt: "26 Sep 2025, 01:57 PM", finalisedAt: "26 Sep 2025, 02:59 PM" },
  { id: "234234", amount: 8000, createdAt: "24 Sep 2025, 01:47 PM", txnId: "593738452", expiresAt: "24 Dec 2025, 02:47 PM", status: "failed", linkRefId: "PL-004", contactPhone: "+91 9445566677", contactEmail: "events@cityhall.co", initiatedAt: "24 Sep 2025, 01:47 PM", sentAt: "24 Sep 2025, 01:57 PM", finalisedAt: "24 Sep 2025, 02:09 PM" },
  { id: "234235", amount: 500, createdAt: "22 Sep 2025, 01:47 PM", txnId: "201738452", expiresAt: "22 Dec 2025, 02:47 PM", status: "failed", linkRefId: "PL-004", contactPhone: "+91 9876543210", contactEmail: "finance@advisory.one", initiatedAt: "22 Sep 2025, 01:47 PM", sentAt: "22 Sep 2025, 01:57 PM", finalisedAt: "22 Sep 2025, 02:05 PM" },
]

const defaultVasItems: VasItem[] = [
  { id: "smart-reminders", name: "Smart reminders", detail: "Auto-send follow-ups based on payer intent windows.", enabled: true, requiresConfig: true },
  { id: "brand-templates", name: "Branded templates", detail: "Use custom themes and dynamic fields for link pages.", enabled: false, requiresConfig: true },
  { id: "partial-payments", name: "Partial payments", detail: "Allow split collections with due-date milestones.", enabled: false, requiresConfig: false },
]

const defaultVasConfig: Record<string, VasConfig> = {
  "smart-reminders": { label: "Reminder workflow", cadence: "24", owner: "Collections Team" },
  "brand-templates": { label: "Branded checkout", cadence: "0", owner: "Design Ops" },
  "partial-payments": { label: "Split collection", cadence: "48", owner: "Finance Ops" },
}

const vasGroups = [
  { id: "collection", title: "Collection acceleration", itemIds: ["smart-reminders", "partial-payments"] },
  { id: "branding", title: "Experience and branding", itemIds: ["brand-templates"] },
] as const

const statusMap = {
  active: { Icon: Clock, badge: "bg-primary/18 text-foreground border-primary/35", label: "Active" },
  paid: { Icon: CheckCircle2, badge: "bg-success/20 text-foreground border-success/35", label: "Paid" },
  expired: { Icon: XCircle, badge: "bg-muted text-muted-foreground border-border", label: "Expired" },
  failed: { Icon: X, badge: "bg-destructive/15 text-destructive border-destructive/20", label: "Failed" },
}

const paymentLinkConfigStatusMap: Record<PaymentLinkConfigStatus, { label: string; badge: string }> = {
  success: { label: "Success", badge: "bg-success/20 text-foreground border-success/35" },
  expired: { label: "Expired", badge: "bg-muted text-muted-foreground border-border" },
  failed: { label: "Failed", badge: "bg-destructive/15 text-destructive border-destructive/20" },
}

function LinkDetail({ link }: { link: typeof links[0] }) {
  const { Icon, badge, label } = statusMap[link.status as keyof typeof statusMap]

  return (
    <div className="p-5 space-y-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Transaction ID</p>
        <p className="mt-1 text-[22px] font-semibold leading-tight text-foreground">{link.transactionId}</p>
      </div>

      <div className="rounded-lg bg-muted/35 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Transaction amount</p>
            <p className="mt-1 text-2xl font-bold text-foreground">₹{link.amount.toLocaleString("en-IN")}</p>
          </div>
          <Badge variant="outline" className={`text-xs ${badge}`}>
            {label}
          </Badge>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
          <div>
            <p className="font-medium text-foreground">{link.paymentMethod}</p>
            <p className="text-muted-foreground">{link.paymentRail}</p>
          </div>
          <p className="text-right text-muted-foreground">{link.created}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Payment status</p>
        <div className="flex items-center justify-between rounded-lg bg-muted/35 p-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-foreground">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{link.created}</p>
            </div>
          </div>
          <Badge variant="outline" className={`text-[10px] ${badge}`}>{label}</Badge>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Transaction details</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-muted/20 p-3">
          {[
            ["Invoice no", link.invoiceNo],
            ["Payment Link ID", link.id],
            ["Merchant name", link.merchantName],
            ["Store name", link.storeName],
            ["Acquirer", link.acquirer],
            ["Card issuer", link.cardIssuer],
            ["Product", link.product],
            ["Transaction type", link.transactionType],
            ["Batch no", link.batchNo],
            ["Terminal ID", link.terminalId],
            ["Channel", link.channel],
            ["Recipient", link.contactPhone || link.contactEmail],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</p>
              <p className="mt-1 text-xs font-medium text-foreground">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Charge slip</p>
          <Button variant="ghost" size="xs" className="h-6 gap-1 px-2">
            <Download className="h-3 w-3" />Download
          </Button>
        </div>
        <Tabs defaultValue="customer" className="w-full">
          <TabsList variant="line" className="w-full justify-start rounded-md bg-muted/60 p-1">
            <TabsTrigger value="customer" className="text-xs">Customer copy</TabsTrigger>
            <TabsTrigger value="merchant" className="text-xs">Merchant copy</TabsTrigger>
          </TabsList>
          <TabsContent value="customer">
            <div className="rounded-lg border border-border bg-card/60 p-3 text-xs">
              <p className="font-semibold text-foreground">Pine Labs — Customer copy</p>
              <p className="mt-2 text-muted-foreground">Txn ID: {link.transactionId}</p>
              <p className="text-muted-foreground">Amount: ₹{link.amount.toLocaleString("en-IN")}</p>
              <p className="text-muted-foreground">Method: {link.paymentMethod}</p>
              <p className="text-muted-foreground">Date: {link.created}</p>
            </div>
          </TabsContent>
          <TabsContent value="merchant">
            <div className="rounded-lg border border-border bg-card/60 p-3 text-xs">
              <p className="font-semibold text-foreground">Pine Labs — Merchant copy</p>
              <p className="mt-2 text-muted-foreground">Merchant: {link.merchantName}</p>
              <p className="text-muted-foreground">Invoice: {link.invoiceNo}</p>
              <p className="text-muted-foreground">Acquirer: {link.acquirer}</p>
              <p className="text-muted-foreground">Status: {label}</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {link.status === "active" && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5"><Mail className="h-3.5 w-3.5" />Email receipt</Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1.5"><MessageSquare className="h-3.5 w-3.5" />SMS receipt</Button>
          <Button variant="ghost" size="sm" className="flex-1 gap-1.5 text-destructive hover:text-destructive">
            Deactivate
          </Button>
        </div>
      )}
    </div>
  )
}

function CreateLinkForm({
  form,
  onFieldChange,
  onCreate,
  disabled,
}: {
  form: { contactNumber: string; amount: string; name: string; email: string }
  onFieldChange: (key: "contactNumber" | "amount" | "name" | "email", value: string) => void
  onCreate: () => void
  disabled: boolean
}) {
  return (
    <div className="p-5 space-y-4">
      <p className="text-sm font-semibold text-foreground">New Payment Link</p>
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Contact Number *</Label>
          <Input
            value={form.contactNumber}
            onChange={(event) => onFieldChange("contactNumber", event.target.value)}
            placeholder="+91 9886154032"
            className="h-9 text-sm bg-muted border-border"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Amount (INR) *</Label>
          <Input
            value={form.amount}
            onChange={(event) => onFieldChange("amount", event.target.value)}
            placeholder="2000.00"
            type="number"
            className="h-9 text-sm bg-muted border-border"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Name</Label>
          <Input
            value={form.name}
            onChange={(event) => onFieldChange("name", event.target.value)}
            placeholder="Tony Stark"
            className="h-9 text-sm bg-muted border-border"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Email</Label>
          <Input
            value={form.email}
            onChange={(event) => onFieldChange("email", event.target.value)}
            placeholder="stark.tony@gmail.com"
            type="email"
            className="h-9 text-sm bg-muted border-border"
          />
        </div>
        <Button className="w-full gap-1.5" onClick={onCreate} disabled={disabled}>
          <Plus className="h-4 w-4" /> Create Payment Link
        </Button>
      </div>
    </div>
  )
}

function CreateLinkSuccess({
  url,
  recipient,
  copied,
  onCopy,
  onBack,
}: {
  url: string
  recipient: string
  copied: boolean
  onCopy: () => void
  onBack: () => void
}) {
  return (
    <div className="p-5 space-y-4">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/20 text-success">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <div className="space-y-1 text-center">
        <h3 className="text-base font-semibold text-foreground">Link Created Successfully</h3>
        <p className="text-xs text-muted-foreground">Shared to {recipient}</p>
      </div>
      <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
        <p className="flex-1 truncate font-mono text-xs text-foreground">{url}</p>
        <Button variant="secondary" size="xs" className="gap-1" onClick={onCopy}>
          <Copy className="h-3 w-3" />
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <Button className="w-full" onClick={onBack}>
        Go back to payment link
      </Button>
    </div>
  )
}

function ConfigurationLifecycleProgress({ row }: { row: PaymentLinkConfigRow }) {
  const stageThreeTitle =
    row.status === "success" ? "Payment completed" : row.status === "expired" ? "Payment link expired" : "Payment failed"
  const stageThreeTone = row.status === "success" ? "success" : row.status === "expired" ? "expired" : "failed"
  const recipientLabel = row.contactPhone || row.contactEmail || "recipient"

  const steps = [
    { title: "Payment initiated", time: row.initiatedAt, tone: "done" as const },
    { title: `Link sent to ${recipientLabel}`, time: row.sentAt, tone: "done" as const },
    { title: stageThreeTitle, time: row.finalisedAt, tone: stageThreeTone },
  ]

  return (
    <div className="space-y-2">
      {steps.map((step, index) => {
        const isDone = step.tone === "done" || step.tone === "success"
        const isFailed = step.tone === "failed"
        const isExpired = step.tone === "expired"
        const connectorDone = index === 0 || (index === 1 && stageThreeTone === "success")
        return (
          <div key={step.title} className="flex items-start gap-3">
            <div className="flex flex-col items-center pt-0.5">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                  isDone
                    ? "border-success bg-success text-success-foreground"
                    : isFailed
                      ? "border-destructive bg-destructive text-destructive-foreground"
                      : isExpired
                        ? "border-muted-foreground/40 bg-muted text-muted-foreground"
                        : "border-border bg-card text-muted-foreground"
                }`}
              >
                {isFailed ? <X className="h-3.5 w-3.5" /> : isExpired ? <Clock className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              </div>
              {index < steps.length - 1 ? (
                <div className={`mt-1 h-10 w-px ${connectorDone ? "bg-success/60" : "bg-border"}`} />
              ) : null}
            </div>
            <div className="flex-1 pb-2">
              <p className="text-xs font-medium leading-snug text-foreground">{step.title}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{step.time}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ConfigurationDetail({ row, link }: { row: PaymentLinkConfigRow; link?: (typeof links)[0] }) {
  const statusLabel = paymentLinkConfigStatusMap[row.status].label

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
          <Link2 className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground">Payment Link {row.id}</p>
          <p className="text-2xl font-bold text-foreground mt-0.5">₹{row.amount.toLocaleString("en-IN")}</p>
          <Badge variant="outline" className={`mt-1.5 text-xs ${paymentLinkConfigStatusMap[row.status].badge}`}>
            {statusLabel}
          </Badge>
        </div>
      </div>

      <Separator />

      <div className="rounded-lg bg-muted/35 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Payment progress</p>
        <ConfigurationLifecycleProgress row={row} />
      </div>

      <Separator />

      <div className="space-y-3">
        {[
          ["Link ID", row.id],
          ["Txn ID", row.txnId],
          ["Created", row.createdAt],
          ["Expiry", row.expiresAt],
          ["Phone", row.contactPhone || link?.contactPhone || "—"],
          ["Email", row.contactEmail || link?.contactEmail || "—"],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xs font-medium text-foreground text-right">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PaymentLinksContent({ initialSection }: { initialSection?: LinkNavSection } = {}) {
  const [navSection, setNavSection] = useState<LinkNavSection>(initialSection ?? "transactions")
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null)
  const [section, setSection] = useState<LinkSection>("overview")
  const [rightTab, setRightTab] = useState<"detail" | "create">("detail")
  const [configurationRows, setConfigurationRows] = useState<PaymentLinkConfigRow[]>(paymentLinkConfigurationSeed)
  const [createStep, setCreateStep] = useState<"form" | "success">("form")
  const [createdLinkUrl, setCreatedLinkUrl] = useState("")
  const [copiedCreatedLink, setCopiedCreatedLink] = useState(false)
  const [newLinkForm, setNewLinkForm] = useState({
    contactNumber: "",
    amount: "",
    name: "",
    email: "",
  })
  const [vasItems, setVasItems] = useState<VasItem[]>(defaultVasItems)
  const [selectedVasId, setSelectedVasId] = useState<string | null>(null)
  const [vasConfigById, setVasConfigById] = useState<Record<string, VasConfig>>(defaultVasConfig)
  const [vasPreferences, setVasPreferences] = useState({
    reminderDigest: true,
    approvalGuardrails: true,
    autoPublish: false,
  })

  const selectedLink = links.find(l => l.id === selected)
  const selectedConfiguration = configurationRows.find((row) => row.id === selectedConfigId) ?? null
  const selectedVas = vasItems.find((item) => item.id === selectedVasId) ?? null
  const selectedVasConfig = selectedVas ? vasConfigById[selectedVas.id] : null
  const filteredLinks = links
    .filter((l) => {
      if (section === "overview") return true
      return l.status === section
    })
  const createRecipientText = [newLinkForm.contactNumber, newLinkForm.email].filter(Boolean).join(" & ")

  const resetCreateLinkFlow = () => {
    setCreateStep("form")
    setCreatedLinkUrl("")
    setCopiedCreatedLink(false)
    setNewLinkForm({
      contactNumber: "",
      amount: "",
      name: "",
      email: "",
    })
  }

  const handleCreateLink = () => {
    if (!newLinkForm.contactNumber.trim() || !newLinkForm.amount.trim()) {
      return
    }

    const now = new Date()
    const createdAt = now.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    const expiryDate = new Date(now)
    expiryDate.setDate(expiryDate.getDate() + 90)
    const expiresAt = expiryDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    const generatedId = `${Math.floor(100000 + Math.random() * 900000)}`
    const generatedTxnId = `${Math.floor(100000000 + Math.random() * 900000000)}`
    const amountValue = Number(newLinkForm.amount)
    const nextLinkUrl = `https://pyn.onl/PLUTUS/${generatedId}`
    const sentAtDate = new Date(now)
    sentAtDate.setMinutes(sentAtDate.getMinutes() + 10)
    const finalisedDate = new Date(now)
    finalisedDate.setHours(finalisedDate.getHours() + 24)

    const sentAt = sentAtDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    const finalisedAt = finalisedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })

    setConfigurationRows((current) => [
      {
        id: generatedId,
        amount: Number.isFinite(amountValue) ? amountValue : 0,
        createdAt,
        txnId: generatedTxnId,
        expiresAt,
        status: "success",
        linkRefId: "PL-001",
        contactPhone: newLinkForm.contactNumber,
        contactEmail: newLinkForm.email,
        initiatedAt: createdAt,
        sentAt,
        finalisedAt,
      },
      ...current,
    ])
    setCreatedLinkUrl(nextLinkUrl)
    setCreateStep("success")
  }

  const handleCopyCreatedLink = async () => {
    if (!createdLinkUrl) return
    try {
      await navigator.clipboard.writeText(createdLinkUrl)
      setCopiedCreatedLink(true)
      setTimeout(() => setCopiedCreatedLink(false), 1500)
    } catch {
      setCopiedCreatedLink(false)
    }
  }

  const linkColumns: DataTableColumn<(typeof links)[number]>[] = [
    { id: "transactionId", header: "Transaction ID", accessorKey: "transactionId", width: 150, pinnable: true },
    { id: "id", header: "Payment Link ID", accessorKey: "id", width: 140 },
    { id: "name", header: "Purpose", accessorKey: "name", width: 220 },
    {
      id: "recipient",
      header: "Recipient",
      getValue: (link) => link.contactPhone || link.contactEmail,
      getSearchValue: (link) => `${link.contactPhone} ${link.contactEmail}`,
      width: 170,
      cell: (link) => <span className="text-xs text-foreground">{link.contactPhone || link.contactEmail}</span>,
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      width: 110,
      filterOptions: [
        { label: "Active", value: "active" },
        { label: "Paid", value: "paid" },
        { label: "Expired", value: "expired" },
        { label: "Failed", value: "failed" },
      ],
      cell: (link) => {
        const { badge, label } = statusMap[link.status as keyof typeof statusMap]
        return (
          <Badge variant="outline" className={`text-[10px] ${badge}`}>
            {label}
          </Badge>
        )
      },
    },
    {
      id: "amount",
      header: "Amount",
      getValue: (link) => link.amount,
      align: "right",
      width: 120,
      cell: (link) => <span className="font-medium tabular-nums">₹{link.amount.toLocaleString("en-IN")}</span>,
    },
    { id: "paymentMethod", header: "Payment Method", accessorKey: "paymentMethod", width: 140 },
    {
      id: "channel",
      header: "Channel",
      accessorKey: "channel",
      width: 90,
      filterOptions: [
        { label: "SMS", value: "SMS" },
        { label: "Email", value: "Email" },
      ],
    },
    { id: "created", header: "Created", accessorKey: "created", width: 170 },
    { id: "expires", header: "Expiry", accessorKey: "expires", width: 120 },
  ]

  const configurationColumns: DataTableColumn<PaymentLinkConfigRow>[] = [
    { id: "id", header: "Payment Link ID", accessorKey: "id", width: 150, pinnable: true },
    {
      id: "amount",
      header: "Amount",
      getValue: (row) => row.amount,
      align: "right",
      width: 130,
      cell: (row) => <span className="font-medium tabular-nums">₹{row.amount.toLocaleString("en-IN")}</span>,
    },
    { id: "createdAt", header: "Link Creation Date", accessorKey: "createdAt", width: 190 },
    { id: "txnId", header: "Txn ID", accessorKey: "txnId", width: 140 },
    { id: "expiresAt", header: "Expiry Date", accessorKey: "expiresAt", width: 190 },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      width: 120,
      filterOptions: [
        { label: "Success", value: "success" },
        { label: "Expired", value: "expired" },
        { label: "Failed", value: "failed" },
      ],
      cell: (row) => {
        const mappedStatus = paymentLinkConfigStatusMap[row.status]
        return (
          <Badge variant="outline" className={`text-[10px] ${mappedStatus.badge}`}>
            {mappedStatus.label}
          </Badge>
        )
      },
    },
  ]

  const settlementColumns: DataTableColumn<(typeof settlementRows)[number]>[] = [
    { id: "id", header: "Batch", accessorKey: "id", width: 110, pinnable: true },
    { id: "title", header: "Settlement", accessorKey: "title", width: 220 },
    {
      id: "state",
      header: "State",
      accessorKey: "state",
      width: 130,
      filterOptions: [
        { label: "Completed", value: "Completed" },
        { label: "In progress", value: "In progress" },
      ],
    },
    { id: "amount", header: "Amount", accessorKey: "amount", align: "right", width: 120 },
  ]

  const disputeColumns: DataTableColumn<(typeof disputeRows)[number]>[] = [
    { id: "id", header: "Case ID", accessorKey: "id", width: 120, pinnable: true },
    { id: "state", header: "Status", accessorKey: "state", width: 220 },
    { id: "amount", header: "Amount", accessorKey: "amount", align: "right", width: 120 },
  ]

  const refundColumns: DataTableColumn<(typeof refundRows)[number]>[] = [
    { id: "id", header: "Refund ID", accessorKey: "id", width: 120, pinnable: true },
    { id: "state", header: "State", accessorKey: "state", width: 220 },
    { id: "amount", header: "Amount", accessorKey: "amount", align: "right", width: 120 },
  ]

  const reportColumns: DataTableColumn<(typeof reportRows)[number]>[] = [
    { id: "id", header: "Report ID", accessorKey: "id", width: 110, pinnable: true },
    { id: "title", header: "Report", accessorKey: "title", width: 260 },
    { id: "cadence", header: "Cadence", accessorKey: "cadence", width: 120 },
    { id: "owner", header: "Owner", accessorKey: "owner", width: 140 },
  ]

  const leftContext = (
    <ProductWorkspaceNav
      title="Pay By Link"
      value={navSection}
      showConfigurations
      configurationsLabel="Manage Links"
      onChange={(nextSection) => {
        setNavSection(nextSection)
        setSection("overview")
        setSelected(null)
        setSelectedConfigId(null)
        setSelectedVasId(null)
        setRightTab("detail")
      }}
    />
  )

  const centerMain = (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <section className="rounded-lg bg-card/80 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{navSection}</p>
            <h2 className="text-[15px] font-semibold text-foreground">Payment links workspace</h2>
          </div>
          {navSection === "transactions" && (
            <div className="ml-auto flex items-center gap-1 rounded-md bg-muted/70 p-1">
              {[
                { key: "overview", label: "All" },
                { key: "active", label: "Active" },
                { key: "paid", label: "Paid" },
                { key: "expired", label: "Expired" },
                { key: "failed", label: "Failed" },
              ].map((item) => (
                <Button variant="ghost"
                  key={item.key}
                  onClick={() => setSection(item.key as LinkSection)}
                  className={`rounded-sm px-2.5 py-1 text-[11px] ${
                    section === item.key ? "bg-card text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </section>

      {navSection === "transactions" && (
        <>
          <div className="grid grid-cols-4 gap-3">
            {[{l:"Active",v:`${links.filter(l=>l.status==="active").length}`},{l:"Paid",v:`${links.filter(l=>l.status==="paid").length}`},{l:"Failed",v:`${links.filter(l=>l.status==="failed").length}`},{l:"Expired",v:`${links.filter(l=>l.status==="expired").length}`}].map(s => (
              <div key={s.l} className="rounded-lg bg-card/80 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
                <p className="mt-1 text-[15px] font-semibold text-foreground">{s.v}</p>
              </div>
            ))}
          </div>

          <DataTable
            data={filteredLinks}
            columns={linkColumns}
            rowId={(link) => link.id}
            selectedRowId={selected}
            onRowClick={(link) => {
              setSelected(link.id)
              setSelectedConfigId(null)
              setRightTab("detail")
            }}
            searchPlaceholder="Search payment links..."
            emptyText="No payment links found"
            initialPinnedColumnIds={["id"]}
            toolbarActions={
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  setRightTab("create")
                  setSelected(null)
                  setSelectedConfigId(null)
                }}
              >
                Create
              </Button>
            }
          />
        </>
      )}

      {navSection === "configurations" && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              Last 7 days
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              Filter by
            </Button>
          </div>

          <DataTable
            data={configurationRows}
            columns={configurationColumns}
            rowId={(row) => row.id}
            selectedRowId={selectedConfigId}
            onRowClick={(row) => {
              setSelectedConfigId(row.id)
              setSelected(row.linkRefId)
              setRightTab("detail")
            }}
            searchPlaceholder="Search by payment link id, amount or txn id..."
            emptyText="No payment-link configuration records found"
            initialPinnedColumnIds={["id"]}
            toolbarActions={
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  Download
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => {
                    resetCreateLinkFlow()
                    setSelected(null)
                    setSelectedConfigId(null)
                    setSelectedVasId(null)
                    setRightTab("create")
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create New Payment Link
                </Button>
              </div>
            }
          />
        </>
      )}

      {navSection === "settlements" && (
        <DataTable
          data={settlementRows}
          columns={settlementColumns}
          rowId={(row) => row.id}
          searchPlaceholder="Search settlements..."
          emptyText="No settlements found"
          initialPinnedColumnIds={["id"]}
          onRowClick={() => setRightTab("create")}
        />
      )}

      {navSection === "disputes" && (
        <DataTable
          data={disputeRows}
          columns={disputeColumns}
          rowId={(row) => row.id}
          searchPlaceholder="Search disputes..."
          emptyText="No disputes found"
          initialPinnedColumnIds={["id"]}
          onRowClick={() => setRightTab("create")}
        />
      )}

      {navSection === "reports" && (
        <DataTable
          data={reportRows}
          columns={reportColumns}
          rowId={(row) => row.id}
          searchPlaceholder="Search reports..."
          emptyText="No reports found"
          initialPinnedColumnIds={["id"]}
          toolbarActions={<Button variant="ghost" size="sm" className="h-8 text-xs">Generate report</Button>}
        />
      )}

      {navSection === "refunds" && (
        <DataTable
          data={refundRows}
          columns={refundColumns}
          rowId={(row) => row.id}
          searchPlaceholder="Search refunds..."
          emptyText="No refunds found"
          initialPinnedColumnIds={["id"]}
          onRowClick={() => setRightTab("create")}
        />
      )}

      {navSection === "vas" && (
        <section className="rounded-lg bg-card/80 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Value Added Services</p>
          <div className="space-y-4">
            {vasGroups.map((group) => {
              const groupItems = vasItems.filter((item) => group.itemIds.some((groupId) => groupId === item.id))
              return (
                <div key={group.id}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">{group.title}</p>
                  <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                    {groupItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between px-4 py-3 gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.detail}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.requiresConfig && (
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelectedVasId(item.id)}>
                              Configure
                            </Button>
                          )}
                          <Switch
                            checked={item.enabled}
                            onCheckedChange={(checked) =>
                              setVasItems((current) =>
                                current.map((entry) => (entry.id === item.id ? { ...entry, enabled: checked } : entry)),
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <Separator className="my-4" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Operational preferences</p>
            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
              {[
                {
                  key: "reminderDigest",
                  label: "Reminder digest",
                  desc: "Share daily reminder effectiveness across active links.",
                },
                {
                  key: "approvalGuardrails",
                  label: "Approval guardrails",
                  desc: "Require review before high-value VAS changes are applied.",
                },
                {
                  key: "autoPublish",
                  label: "Auto publish templates",
                  desc: "Automatically publish approved branded templates.",
                },
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{pref.label}</p>
                    <p className="text-xs text-muted-foreground">{pref.desc}</p>
                  </div>
                  <Switch
                    checked={vasPreferences[pref.key as keyof typeof vasPreferences]}
                    onCheckedChange={(checked) =>
                      setVasPreferences((current) => ({ ...current, [pref.key]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )

  const rightContextBody = selectedVas ? (
    <div className="p-6 space-y-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Value-added service</p>
        <h4 className="mt-1 text-[18px] font-semibold text-foreground">{selectedVas.name}</h4>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{selectedVas.detail}</p>
      {selectedVasConfig && (
        <div className="space-y-3 rounded-md olive-surface-chip p-3">
          <div>
            <p className="text-xs text-muted-foreground">Configuration label</p>
            <Input
              value={selectedVasConfig.label}
              onChange={(event) =>
                setVasConfigById((current) => ({
                  ...current,
                  [selectedVas.id]: { ...current[selectedVas.id], label: event.target.value },
                }))
              }
              className="mt-1 h-8 bg-background/50 text-xs"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Reminder cadence (hours)</p>
            <Input
              value={selectedVasConfig.cadence}
              onChange={(event) =>
                setVasConfigById((current) => ({
                  ...current,
                  [selectedVas.id]: { ...current[selectedVas.id], cadence: event.target.value },
                }))
              }
              className="mt-1 h-8 bg-background/50 text-xs"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Owner team</p>
            <Input
              value={selectedVasConfig.owner}
              onChange={(event) =>
                setVasConfigById((current) => ({
                  ...current,
                  [selectedVas.id]: { ...current[selectedVas.id], owner: event.target.value },
                }))
              }
              className="mt-1 h-8 bg-background/50 text-xs"
            />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Button
          className="w-full"
          variant={selectedVas.enabled ? "secondary" : "default"}
          onClick={() =>
            setVasItems((current) =>
              current.map((entry) => (entry.id === selectedVas.id ? { ...entry, enabled: !entry.enabled } : entry)),
            )
          }
        >
          {selectedVas.enabled ? "Disable service" : "Enable service"}
        </Button>
        <Button className="w-full" onClick={() => setSelectedVasId(null)}>Save details</Button>
        <Button variant="outline" className="w-full" onClick={() => setSelectedVasId(null)}>Cancel</Button>
      </div>
    </div>
  ) : rightTab === "create" ? (
    createStep === "form" ? (
      <CreateLinkForm
        form={newLinkForm}
        onFieldChange={(key, value) => setNewLinkForm((current) => ({ ...current, [key]: value }))}
        onCreate={handleCreateLink}
        disabled={!newLinkForm.contactNumber.trim() || !newLinkForm.amount.trim()}
      />
    ) : (
      <CreateLinkSuccess
        url={createdLinkUrl}
        recipient={createRecipientText || "customer"}
        copied={copiedCreatedLink}
        onCopy={handleCopyCreatedLink}
        onBack={() => {
          resetCreateLinkFlow()
          setRightTab("detail")
          setSelected(null)
          setSelectedConfigId(null)
          setNavSection("configurations")
        }}
      />
    )
  ) : navSection === "configurations" && selectedConfiguration ? (
    <ConfigurationDetail row={selectedConfiguration} link={selectedLink ?? undefined} />
  ) : selectedLink ? <LinkDetail link={selectedLink} /> : (
    <PanelEmpty icon={Link2} title="Select a payment link" description="Click a link to open contextual actions like sharing, QR, and lifecycle controls." />
  )

  const rightContext = (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Context</p>
          <p className="text-[16px] font-semibold text-foreground">
            {selectedVas
              ? "Service configuration"
              : rightTab === "create"
                ? "Create link"
                : navSection === "configurations"
                  ? "Configuration detail"
                  : "Transaction detail"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8"
          aria-label="Close contextual panel"
          onClick={() => {
            setSelectedVasId(null)
            setSelected(null)
            setSelectedConfigId(null)
            setRightTab("detail")
            resetCreateLinkFlow()
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      {rightContextBody}
    </div>
  )

  return (
    <WorkspaceShell
      leftContext={leftContext}
      showLeftContext={false}
      centerMain={centerMain}
      rightContext={rightContext}
      showRightContext={Boolean(selectedVas) || rightTab === "create" || Boolean(selectedLink) || Boolean(selectedConfiguration)}
      leftWidth={248}
      leftMaxWidth={300}
    />
  )
}
