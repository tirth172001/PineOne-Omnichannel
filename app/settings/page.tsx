"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PanelEmpty } from "@/components/ui/panels"
import { Building2, Bell, Shield, CreditCard, Key, CheckCircle2, AlertTriangle, Settings, X } from "lucide-react"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"

const navItems = [
  { id: "business", label: "Business Info", icon: Building2, desc: "Name, category, contact" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Alerts and preferences" },
  { id: "security", label: "Security", icon: Shield, desc: "Password, 2FA, sessions" },
  { id: "banking", label: "Banking & Settlements", icon: CreditCard, desc: "Bank accounts, schedules" },
  { id: "api", label: "API Keys", icon: Key, desc: "Developer credentials" },
]

function BusinessForm() {
  return (
    <div className="p-5 space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Business Details</p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Business Name</Label>
              <Input defaultValue="Acme Store" className="h-9 text-sm bg-muted border-border" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Category</Label>
              <Input defaultValue="Retail" className="h-9 text-sm bg-muted border-border" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Email</Label>
              <Input type="email" defaultValue="rahul@acmestore.in" className="h-9 text-sm bg-muted border-border" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Phone</Label>
              <Input defaultValue="+91 98765 43210" className="h-9 text-sm bg-muted border-border" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Business Address</Label>
            <Input defaultValue="12, Linking Road, Mumbai, Maharashtra 400050" className="h-9 text-sm bg-muted border-border" />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">KYC & Compliance</p>
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {[
            { label: "PAN Card", value: "ABCDE1234F", status: "verified" },
            { label: "GST Number", value: "27ABCDE1234F1Z5", status: "verified" },
            { label: "Business PAN", value: "XYZAB5678G", status: "pending" },
          ].map(({ label, value, status }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-xs font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground font-mono">{value}</p>
              </div>
              <Badge variant="outline" className={`text-[9px] gap-1 ${status === "verified" ? "text-success border-success/30 bg-success/10" : "text-warning-foreground border-warning/30 bg-warning/10"}`}>
                {status === "verified" ? <CheckCircle2 className="h-2.5 w-2.5" /> : <AlertTriangle className="h-2.5 w-2.5" />}
                {status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="gap-1.5">Save Changes</Button>
        <Button variant="outline" size="sm">Discard</Button>
      </div>
    </div>
  )
}

function NotificationsForm() {
  return (
    <div className="p-5 space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Transaction Alerts</p>
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {[
            { label: "Transaction Alerts", desc: "Get notified for every payment received", on: true },
            { label: "Payment Failures", desc: "Alerts when a transaction fails", on: true },
            { label: "Refund Processed", desc: "When a refund is initiated or completed", on: false },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <Switch defaultChecked={s.on} />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Business Updates</p>
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {[
            { label: "Settlement Updates", desc: "Daily settlement summary and credits", on: true },
            { label: "Product Recommendations", desc: "Personalized growth suggestions", on: true },
            { label: "Weekly Reports", desc: "Business performance digest", on: false },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <Switch defaultChecked={s.on} />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Notification Channels</p>
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {[
            { label: "SMS", desc: "Receive alerts via SMS", on: true },
            { label: "Email", desc: "Email digests and summaries", on: true },
            { label: "WhatsApp", desc: "Instant messages on WhatsApp", on: false },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <Switch defaultChecked={s.on} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SecurityForm() {
  return (
    <div className="p-5 space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Authentication</p>
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security via SMS OTP</p>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs">Enable</Button>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Change Password</p>
              <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs">Change</Button>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Active Sessions</p>
        <div className="space-y-2">
          {[
            { device: "Chrome · MacOS", location: "Mumbai, India", time: "Now (current)" },
            { device: "Safari · iPhone 15", location: "Mumbai, India", time: "2 hours ago" },
            { device: "Chrome · Windows", location: "Delhi, India", time: "3 days ago" },
          ].map(s => (
            <div key={s.device} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border">
              <div>
                <p className="text-xs font-medium text-foreground">{s.device}</p>
                <p className="text-[10px] text-muted-foreground">{s.location} · {s.time}</p>
              </div>
              {s.time !== "Now (current)" && (
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-destructive hover:text-destructive">Revoke</Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Login History</p>
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {[
            ["Today, 9:42 AM", "Mumbai, India", "Success"],
            ["Yesterday, 11:20 PM", "Mumbai, India", "Success"],
            ["Apr 5, 3:14 PM", "Unknown", "Failed"],
          ].map(([time, loc, status]) => (
            <div key={time} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-xs font-medium text-foreground">{time}</p>
                <p className="text-[10px] text-muted-foreground">{loc}</p>
              </div>
              <Badge variant="outline" className={`text-[9px] ${status === "Success" ? "text-success border-success/30 bg-success/10" : "text-destructive border-destructive/30 bg-destructive/10"}`}>
                {status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BankingForm() {
  return (
    <div className="p-5 space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Linked Bank Accounts</p>
        <div className="space-y-2">
          {[
            { bank: "HDFC Bank", account: "•••• •••• 4821", ifsc: "HDFC0001234", primary: true },
            { bank: "ICICI Bank", account: "•••• •••• 9932", ifsc: "ICIC0004567", primary: false },
          ].map(a => (
            <div key={a.account} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-foreground">{a.bank}</p>
                  {a.primary && <Badge variant="outline" className="text-[9px] text-primary border-primary/30 bg-primary/10">Primary</Badge>}
                </div>
                <p className="text-xs text-muted-foreground font-mono">{a.account} · {a.ifsc}</p>
              </div>
              {!a.primary && <Button variant="outline" size="sm" className="h-7 text-xs">Set Primary</Button>}
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs h-8">Add Bank Account</Button>
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Settlement Schedule</p>
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {[
            ["Settlement Cycle", "T+1 (Next Day)"],
            ["Settlement Time", "10:00 AM daily"],
            ["Minimum Amount", "₹100"],
            ["Last Settlement", "₹1,24,350 · Today"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-muted-foreground">{k}</span>
              <span className="text-xs font-medium text-foreground">{v}</span>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-2 h-7 text-xs gap-1.5">Request Instant Settlement</Button>
      </div>
    </div>
  )
}

function ApiKeysForm() {
  return (
    <div className="p-5 space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">API Credentials</p>
        <div className="space-y-3">
          {[
            { label: "Merchant ID", value: "MID_ACM_293847", copyable: true },
            { label: "API Key (Live)", value: "pk_live_••••••••••••••••••••Xk2p", copyable: true },
            { label: "API Key (Test)", value: "pk_test_••••••••••••••••••••7nQr", copyable: true },
            { label: "Webhook Secret", value: "whsec_••••••••••••••••••••mW9f", copyable: true },
          ].map(({ label, value }) => (
            <div key={label}>
              <Label className="text-xs text-muted-foreground mb-1.5 block">{label}</Label>
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 border border-border">
                <p className="text-xs font-mono text-foreground flex-1 truncate">{value}</p>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs shrink-0">Copy</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Webhook Endpoints</p>
        <div className="space-y-2">
          <div className="p-3 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-mono text-foreground">https://acmestore.in/webhooks/pine</p>
              <Badge variant="outline" className="text-[9px] text-success border-success/30 bg-success/10">Active</Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">payment.success, payment.failed, settlement.completed</p>
          </div>
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs h-8">Add Endpoint</Button>
        </div>
      </div>

      <Separator />

      <div className="bg-muted/40 rounded-lg border border-border p-4">
        <p className="text-xs font-medium text-foreground mb-1">API Documentation</p>
        <p className="text-xs text-muted-foreground mb-2">Explore endpoints, SDKs, and integration guides</p>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">View Docs</Button>
      </div>
    </div>
  )
}

const formMap: Record<string, React.ReactNode> = {
  business: <BusinessForm />,
  notifications: <NotificationsForm />,
  security: <SecurityForm />,
  banking: <BankingForm />,
  api: <ApiKeysForm />,
}

const contextOptionsMap: Record<string, string[]> = {
  business: ["KYC status", "Business profile", "Team access"],
  notifications: ["Channel preferences", "Alert thresholds", "Digest schedule"],
  security: ["Authentication rules", "Session policy", "Audit trail"],
  banking: ["Settlement routing", "Primary account", "Payout schedule"],
  api: ["Live keys", "Webhook endpoints", "Rate limits"],
}

export default function SettingsPage() {
  const [active, setActive] = useState<string | null>(navItems[0]?.id ?? null)
  const [selectedContext, setSelectedContext] = useState<string | null>(null)
  const [showContext, setShowContext] = useState(false)
  const activeSectionId = active ?? navItems[0]?.id ?? null
  const activeItem = navItems.find(n => n.id === activeSectionId)
  const contextOptions = activeSectionId ? contextOptionsMap[activeSectionId] ?? [] : []

  const leftContext = (
    <div className="h-full overflow-y-auto p-3">
      <p className="px-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Settings Sections</p>
      <div className="mt-2 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon
          const sel = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => {
                setActive(item.id)
                setSelectedContext(null)
                setShowContext(false)
              }}
              className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                sel ? "bg-secondary/70 text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5" />
                <p className="text-[13px] font-medium">{item.label}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  const centerMain = activeSectionId ? (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pb-2 pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Context selectors</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {contextOptions.map((item) => (
            <Button
              key={item}
              variant={selectedContext === item ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2.5 text-[11px]"
              onClick={() => {
                setSelectedContext(item)
                setShowContext(true)
              }}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>
      <Separator className="mx-4" />
      {formMap[activeSectionId]}
    </div>
  ) : (
    <div className="h-full overflow-y-auto p-5">
      <PanelEmpty
        icon={Settings}
        title="Select a settings section"
        description="Choose a section from the left to edit account preferences."
      />
    </div>
  )

  const rightContext = activeItem ? (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Context</p>
          <p className="text-[16px] font-semibold text-foreground">{selectedContext ?? activeItem.label}</p>
        </div>
        <Button variant="ghost" size="icon-sm" className="h-8 w-8" onClick={() => setShowContext(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <div className="space-y-4 p-6">
        <p className="text-[13px] text-muted-foreground">
          {selectedContext ? `${selectedContext} guidance for ${activeItem.label}.` : activeItem.desc}
        </p>
        <Separator />
        <div className="rounded-lg bg-warning/10 p-3">
          <p className="text-xs text-warning-foreground">Changes may affect team members and transaction operations.</p>
        </div>
        <div className="space-y-2">
          <Button className="w-full">{selectedContext ? `Save ${selectedContext}` : "Save Changes"}</Button>
          <Button variant="ghost" className="w-full" onClick={() => setShowContext(false)}>
            Hide Panel
          </Button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <DashboardLayout>
      <WorkspaceShell
        leftContext={leftContext}
        showLeftContext
        centerMain={centerMain}
        rightContext={rightContext}
        showRightContext={Boolean(activeItem) && Boolean(selectedContext) && showContext}
      />
    </DashboardLayout>
  )
}
