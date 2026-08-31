"use client"

/**
 * Combines the old "Schedule a report" 2-step wizard (Report & Data Fields, then Schedule &
 * Recipients) into a single scrollable side panel, per product request — same fields, one step.
 */

import { useMemo, useState } from "react"
import { CaretDownIcon, InfoIcon, XIcon } from "@phosphor-icons/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { reportSections } from "@/components/reports/reports-content"

type Frequency = "Daily" | "Weekly" | "Monthly"

const FREQUENCY_NOTE: Record<Frequency, string> = {
  Daily: "Includes previous day's data from 00:00 AM to 11:59 PM",
  Weekly: "Includes the previous 7 days' data, delivered every Monday",
  Monthly: "Includes the previous calendar month's data, delivered on the 1st",
}

function nextDeliveryDate(frequency: Frequency) {
  const date = new Date()
  date.setDate(date.getDate() + (frequency === "Daily" ? 1 : frequency === "Weekly" ? 7 : 30))
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long" })
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function ScheduleReportPanel({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const reportOptions = useMemo(() => reportSections.flatMap((section) => section.cards.map((card) => card.title)), [])

  const [reportType, setReportType] = useState(reportOptions[0] ?? "")
  const [fileFormat, setFileFormat] = useState<"Excel" | "Csv">("Excel")
  const [recipientEmail, setRecipientEmail] = useState(true)
  const [recipientSftp, setRecipientSftp] = useState(false)
  const [fileName, setFileName] = useState("")
  const [scheduleName, setScheduleName] = useState("")
  const [frequency, setFrequency] = useState<Frequency>("Daily")
  const [emails, setEmails] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState("")
  const [sftpHost, setSftpHost] = useState("")
  const [sftpPort, setSftpPort] = useState("")
  const [sftpUserId, setSftpUserId] = useState("")
  const [sftpPassword, setSftpPassword] = useState("")

  function resetForm() {
    setReportType(reportOptions[0] ?? "")
    setFileFormat("Excel")
    setRecipientEmail(true)
    setRecipientSftp(false)
    setFileName("")
    setScheduleName("")
    setFrequency("Daily")
    setEmails([])
    setEmailInput("")
    setSftpHost("")
    setSftpPort("")
    setSftpUserId("")
    setSftpPassword("")
  }

  function commitEmailInput() {
    const candidates = emailInput
      .split(/[,\s]+/)
      .map((value) => value.trim())
      .filter(Boolean)
    if (candidates.length === 0) return
    setEmails((current) => {
      const next = new Set(current)
      for (const candidate of candidates) {
        if (isValidEmail(candidate) && next.size < 15) next.add(candidate)
      }
      return Array.from(next)
    })
    setEmailInput("")
  }

  function removeEmail(email: string) {
    setEmails((current) => current.filter((value) => value !== email))
  }

  const canCreate =
    Boolean(reportType) &&
    (recipientEmail || recipientSftp) &&
    Boolean(scheduleName.trim()) &&
    (!recipientEmail || emails.length > 0) &&
    (!recipientSftp || (sftpHost.trim() && sftpPort.trim() && sftpUserId.trim() && sftpPassword.trim()))

  function handleCreate() {
    if (!canCreate) return
    onOpenChange(false)
    toast.success(`"${scheduleName}" schedule created — first report delivers on ${nextDeliveryDate(frequency)}.`)
    resetForm()
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) resetForm()
      }}
    >
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-base font-medium text-foreground">Schedule a report</SheetTitle>
          <SheetDescription className="sr-only">
            Scheduled reports will be delivered to the specified emails as per the chosen frequency.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <p className="-mt-1 text-sm text-muted-foreground">
            Scheduled reports will be delivered to the specified emails as per the chosen frequency.
          </p>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Select report type</h3>

            <div className="space-y-2">
              <Label>
                Report<span className="text-destructive">*</span>
              </Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportOptions.map((title) => (
                    <SelectItem key={title} value={title}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                File format<span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={fileFormat}
                onValueChange={(value) => setFileFormat(value as "Excel" | "Csv")}
                className="flex flex-row gap-4"
              >
                {(["Excel", "Csv"] as const).map((format) => (
                  <label key={format} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                    <RadioGroupItem value={format} />
                    {format}
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>
                Recipient<span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-row gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                  <Checkbox checked={recipientEmail} onCheckedChange={(checked) => setRecipientEmail(checked === true)} />
                  Email
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                  <Checkbox checked={recipientSftp} onCheckedChange={(checked) => setRecipientSftp(checked === true)} />
                  SFTP
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>File name (optional)</Label>
              <Input
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
                placeholder='E.g. "Daily/ Weekly/ Monthly/ Quarterly - XYZ report schedule"'
              />
            </div>

            <div className="space-y-2">
              <Label>
                Schedule name<span className="text-destructive">*</span>
              </Label>
              <Input
                value={scheduleName}
                onChange={(event) => setScheduleName(event.target.value)}
                placeholder='E.g. "Daily/ Weekly/ Monthly/ Quarterly - XYZ report schedule"'
              />
            </div>
          </section>

          <div className="h-px w-full bg-border/70" />

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Schedule details</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Select the frequency &amp; when the report is to be delivered.</p>
            </div>

            <div className="space-y-2">
              <Label>
                Frequency<span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={frequency}
                onValueChange={(value) => setFrequency(value as Frequency)}
                className="flex flex-row gap-4"
              >
                {(["Daily", "Weekly", "Monthly"] as const).map((option) => (
                  <label key={option} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                    <RadioGroupItem value={option} />
                    {option}
                  </label>
                ))}
              </RadioGroup>
              <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{FREQUENCY_NOTE[frequency]}</span>
              </div>
            </div>
          </section>

          <div className="h-px w-full bg-border/70" />

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Recipient details</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Select the mode via which the reports will be sent.</p>
            </div>

            {recipientEmail ? (
              <div className="space-y-2">
                <Label>
                  Emails<span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">Enter upto 15 email IDs, separated by comma or space.</p>
                <div className="flex flex-wrap gap-1.5 rounded-lg border border-input px-2 py-2">
                  {emails.map((email) => (
                    <span
                      key={email}
                      className="inline-flex h-6 items-center gap-1 rounded-full bg-muted px-2 text-xs text-foreground"
                    >
                      {email}
                      <button type="button" onClick={() => removeEmail(email)} aria-label={`Remove ${email}`}>
                        <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={emailInput}
                    onChange={(event) => setEmailInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === ",") {
                        event.preventDefault()
                        commitEmailInput()
                      }
                    }}
                    onBlur={commitEmailInput}
                    placeholder={emails.length === 0 ? "Enter email and press Enter" : ""}
                    className="min-w-32 flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground"
                    disabled={emails.length >= 15}
                  />
                </div>
              </div>
            ) : null}

            {recipientSftp ? (
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="group flex w-full items-center justify-between text-sm font-semibold text-foreground">
                  SFTP details
                  <CaretDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">
                        IP/Hostname<span className="text-destructive">*</span>
                      </Label>
                      <Input value={sftpHost} onChange={(event) => setSftpHost(event.target.value)} placeholder="Enter details" className="h-9 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">
                        Port<span className="text-destructive">*</span>
                      </Label>
                      <Input value={sftpPort} onChange={(event) => setSftpPort(event.target.value)} placeholder="Enter details" className="h-9 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">
                        User ID<span className="text-destructive">*</span>
                      </Label>
                      <Input value={sftpUserId} onChange={(event) => setSftpUserId(event.target.value)} placeholder="Enter details" className="h-9 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">
                        User password<span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="password"
                        value={sftpPassword}
                        onChange={(event) => setSftpPassword(event.target.value)}
                        placeholder="Enter details"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ) : null}
          </section>
        </div>

        <SheetFooter className="flex-col gap-3 border-t border-border/70 sm:flex-col sm:items-stretch">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <InfoIcon className="h-3.5 w-3.5 shrink-0" />
            First report will be delivered on {nextDeliveryDate(frequency)}
          </p>
          <Button onClick={handleCreate} disabled={!canCreate} className="w-full">
            Create schedule
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
