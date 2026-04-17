"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  CircleDashed,
  Clock4,
  LifeBuoy,
  SendHorizontal,
  Sparkles,
  UserCircle2,
  Wrench,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { readDummyAuthSession } from "@/lib/dummy-auth"
import { cn } from "@/lib/utils"

type HealthStatus = "idle" | "running" | "done"

type PosDevice = {
  id: string
  label: string
}

const POS_DEVICES: PosDevice[] = [
  { id: "a891-koramangala", label: "A891 · Koramangala Store · KA-01-4421" },
  { id: "mini-indiranagar", label: "Mini · Indiranagar Store · KA-01-3389" },
  { id: "duo-whitefield", label: "Duo · Whitefield Store · KA-01-7728" },
]

const HEALTH_ISSUES_BY_DEVICE: Record<string, string[]> = {
  "a891-koramangala": [
    "Printer thermal head alignment error detected",
    "Paper-feed sensor response is intermittent",
  ],
  "mini-indiranagar": [
    "Printer connectivity unstable after recent restart",
    "Low print density calibration required",
  ],
  "duo-whitefield": [
    "Receipt spooler queue blocked",
    "Auto-cut trigger delay above threshold",
  ],
}

const ISSUE_SUGGESTIONS = [
  "My POS device is having printer issues",
  "Settlement batch is missing UTR references",
  "Payment links are timing out for customers",
]

function pageLabelFromPath(pathname: string) {
  if (pathname === "/") return "Overview"
  if (pathname.startsWith("/online-payments")) return "Checkout"
  if (pathname.startsWith("/offline-payments")) return "POS Terminal"
  if (pathname.startsWith("/payment-links")) return "Payment Links"
  if (pathname.startsWith("/settlements")) return "Settlements"
  if (pathname.startsWith("/support")) return "Support"
  return "Workspace"
}

interface SupportRequestChatPanelProps {
  pathname: string
  onClose: () => void
  showOpenSupportCenter?: boolean
}

export function SupportRequestChatPanel({
  pathname,
  onClose,
  showOpenSupportCenter = false,
}: SupportRequestChatPanelProps) {
  const router = useRouter()
  const [profileName, setProfileName] = useState("Merchant")
  const [profileRole, setProfileRole] = useState("Admin")
  const [issueText, setIssueText] = useState("My POS device is having some issues")
  const [issueSubmitted, setIssueSubmitted] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("idle")
  const [quickFixApplied, setQuickFixApplied] = useState(false)
  const [requestRaised, setRequestRaised] = useState(false)
  const [requestId] = useState(() => `SUP-${Math.floor(2400 + Math.random() * 300)}`)

  const pageLabel = useMemo(() => pageLabelFromPath(pathname), [pathname])
  const selectedDeviceLabel = useMemo(
    () => POS_DEVICES.find((device) => device.id === selectedDevice)?.label ?? "",
    [selectedDevice]
  )
  const activeIssues = useMemo(
    () => (selectedDevice ? HEALTH_ISSUES_BY_DEVICE[selectedDevice] ?? [] : []),
    [selectedDevice]
  )

  useEffect(() => {
    const session = readDummyAuthSession()
    if (!session) return
    setProfileName(session.name)
    setProfileRole(session.role)
  }, [])

  useEffect(() => {
    if (!selectedDevice) {
      setHealthStatus("idle")
      return
    }
    setHealthStatus("running")
    const timer = window.setTimeout(() => {
      setHealthStatus("done")
    }, 1400)
    return () => window.clearTimeout(timer)
  }, [selectedDevice])

  function handleSubmitIssue(text: string) {
    const clean = text.trim()
    if (clean.length < 10) return
    setIssueText(clean)
    setIssueSubmitted(true)
    setSelectedDevice("")
    setQuickFixApplied(false)
    setRequestRaised(false)
  }

  const canRaiseRequest = issueSubmitted && Boolean(selectedDevice) && healthStatus === "done" && !requestRaised

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/60 bg-muted/30 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <LifeBuoy className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Pine Assist</p>
                <p className="text-xs text-muted-foreground">Guided request flow for {pageLabel}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/10 text-[10px] text-primary">
                <Sparkles className="h-3 w-3" />
                {profileRole}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Chat-led resolution
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Close support" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!issueSubmitted ? (
        <div className="space-y-2 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Quick starters</p>
          <div className="grid gap-2">
            {ISSUE_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSubmitIssue(suggestion)}
                className="rounded-lg border border-border/70 bg-card px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <Separator />

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        <div className="max-w-[92%] rounded-xl bg-muted px-3 py-2 text-foreground">
          <p className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-75">
            <Bot className="h-3 w-3" />
            Pine Assist
          </p>
          <p className="text-sm leading-relaxed">
            Tell me what is wrong, and I will run quick diagnostics with the next best actions.
          </p>
        </div>

        {issueSubmitted ? (
          <div className="ml-auto max-w-[92%] rounded-xl bg-primary px-3 py-2 text-primary-foreground">
            <p className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-80">
              <UserCircle2 className="h-3 w-3" />
              {profileName}
            </p>
            <p className="text-sm leading-relaxed">{issueText}</p>
          </div>
        ) : null}

        {issueSubmitted ? (
          <div className="max-w-[92%] rounded-xl bg-muted px-3 py-2 text-foreground">
            <p className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-75">
              <Bot className="h-3 w-3" />
              Pine Assist
            </p>
            <p className="text-sm leading-relaxed">Select the impacted POS terminal to run an automated health check.</p>
            <div className="mt-2 space-y-1.5">
              {POS_DEVICES.map((device) => {
                const active = selectedDevice === device.id
                return (
                  <Button
                    key={device.id}
                    type="button"
                    size="sm"
                    variant={active ? "secondary" : "outline"}
                    className="h-auto w-full justify-start py-2 text-left text-xs"
                    onClick={() => setSelectedDevice(device.id)}
                  >
                    {device.label}
                  </Button>
                )
              })}
            </div>
          </div>
        ) : null}

        {issueSubmitted && selectedDevice && healthStatus === "running" ? (
          <div className="max-w-[92%] rounded-xl bg-muted px-3 py-2 text-foreground">
            <p className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-75">
              <Bot className="h-3 w-3" />
              Pine Assist
            </p>
            <p className="inline-flex items-center gap-1.5 text-sm">
              <CircleDashed className="h-4 w-4 animate-spin" />
              Running health checks on {selectedDeviceLabel}...
            </p>
          </div>
        ) : null}

        {issueSubmitted && selectedDevice && healthStatus === "done" ? (
          <div className="max-w-[92%] rounded-xl border border-warning/30 bg-warning/5 px-3 py-2 text-foreground">
            <p className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-75">
              <Bot className="h-3 w-3" />
              Pine Assist
            </p>
            <p className="inline-flex items-center gap-1.5 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Health check complete: printer issues detected
            </p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {activeIssues.map((issue) => (
                <li key={issue} className="flex items-start gap-1.5">
                  <span className="mt-1 h-1 w-1 rounded-full bg-muted-foreground" />
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => setQuickFixApplied(true)}
              >
                <Wrench className="mr-1 h-3.5 w-3.5" />
                Restart printer service
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => setQuickFixApplied(true)}
              >
                <Wrench className="mr-1 h-3.5 w-3.5" />
                Calibrate print density
              </Button>
            </div>
          </div>
        ) : null}

        {quickFixApplied && !requestRaised ? (
          <div className="max-w-[92%] rounded-xl bg-muted px-3 py-2 text-foreground">
            <p className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-75">
              <Bot className="h-3 w-3" />
              Pine Assist
            </p>
            <p className="text-sm leading-relaxed">
              Quick fix initiated. If issue still persists, raise request now and we will resolve it within 48 hours.
            </p>
          </div>
        ) : null}

        {requestRaised ? (
          <div className="max-w-[92%] rounded-xl border border-success/30 bg-success/5 px-3 py-2 text-foreground">
            <p className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-75">
              <Bot className="h-3 w-3" />
              Pine Assist
            </p>
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Request raised successfully
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Request <span className="font-medium text-foreground">{requestId}</span> has been created.
            </p>
          </div>
        ) : null}
      </div>

      <Separator />

      <div className="space-y-2 p-4">
        {!issueSubmitted ? (
          <div className="flex items-center gap-2">
            <Input
              value={issueText}
              onChange={(event) => setIssueText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  handleSubmitIssue(issueText)
                }
              }}
              placeholder="Describe your issue..."
              className="h-10 bg-muted/50"
            />
            <Button size="icon-sm" aria-label="Send issue" onClick={() => handleSubmitIssue(issueText)}>
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        <Button className="w-full" disabled={!canRaiseRequest} onClick={() => setRequestRaised(true)}>
          Raise request
        </Button>
        <div
          className={cn(
            "flex items-center justify-between gap-2",
            showOpenSupportCenter ? "flex-row" : "flex-row-reverse"
          )}
        >
          {showOpenSupportCenter ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => {
                router.push("/support/support-queries")
                onClose()
              }}
            >
              Open support center
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          ) : null}
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock4 className="h-3.5 w-3.5" />
            Expected resolution in next 48 hours
          </p>
        </div>
      </div>
    </div>
  )
}
