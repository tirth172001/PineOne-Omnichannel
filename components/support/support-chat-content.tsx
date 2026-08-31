"use client"

/**
 * Full-page scripted support chat (Figma "Pine One - Support" screens 4/5/6). This is a
 * mocked/scripted flow, not real NLU — consistent with how the rest of this app fakes
 * backends. The Device & Hardware → "GPRS / Network Issues" → "No SIM / SIM Lock on PoS"
 * → device health check → printer issue → raise ticket path matches the Figma example
 * verbatim; every other topic/subtopic combination falls back to a generic response built
 * from that topic's FAQ answer (lib/support-knowledge.ts) so the whole picker tree is
 * functional, not just the one scripted example.
 */

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  ArrowLeftIcon,
  BatteryFullIcon,
  CheckCircleIcon,
  DownloadSimpleIcon,
  GearIcon,
  MicrophoneIcon,
  PaperPlaneRightIcon,
  PaperclipIcon,
  PlusIcon,
  PrinterIcon,
  RobotIcon,
  SidebarSimpleIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  WarningIcon,
  WifiHighIcon,
  XCircleIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TicketEditPanel, type TicketEditDraft } from "@/components/support/ticket-edit-panel"
import { getSupportTopic, SUPPORT_TOPICS, TOPIC_FAQS, type SupportTopicSlug } from "@/lib/support-knowledge"
import { cn } from "@/lib/utils"

type DeviceOption = { id: string; label: string; meta: string; hasIssue?: boolean }

const DEVICES: DeviceOption[] = [
  { id: "TOU-0143-01", label: "Touch • Front counter", meta: "TOU-0143-01 / Store 01 / Online" },
  { id: "TOU-0143-02", label: "Touch • Billing desk", meta: "TOU-0143-02 / Store 02 / Idle" },
  { id: "TOU-0143-03", label: "Touch • Dispatch counter", meta: "TOU-0143-03 / Store 03 / Needs Attention", hasIssue: true },
  { id: "GO-0143-01", label: "Go • Front counter", meta: "GO-0143-01 / Store 01 / Online" },
  { id: "GO-0143-02", label: "Go • Billing desk", meta: "GO-0143-02 / Store 02 / Idle" },
]

const GPRS_STEPS = ["Open Payments App Menu Set Connection", "Set Connection Priority To GPRS", "Submit Activate Connection"]
const SIM_STEPS = ["Restart machine", "Settle batch", "Check with test transaction"]

type HealthCard = { label: string; icon: "battery" | "printer" | "software" | "connectivity"; ok: boolean }

type ChatMessage =
  | { id: string; role: "user"; kind: "text"; text: string }
  | { id: string; role: "bot"; kind: "text"; text: string }
  | { id: string; role: "bot"; kind: "steps"; heading: string; steps: string[]; footer: string }
  | { id: string; role: "bot"; kind: "options"; prompt: string; options: string[]; onSelect: (option: string) => void }
  | { id: string; role: "bot"; kind: "device-picker"; onSelect: (device: DeviceOption) => void }
  | { id: string; role: "bot"; kind: "health-report"; deviceLabel: string; cards: HealthCard[]; issueNote?: string; message: string; suggestions: string[]; onSuggestion: (option: string) => void }
  | { id: string; role: "bot"; kind: "raise-ticket"; draft: TicketEditDraft; onEdit: () => void; onRaise: () => void }
  | { id: string; role: "bot"; kind: "ticket-confirmation"; ticketId: string }

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

const HEALTH_ICON: Record<HealthCard["icon"], typeof BatteryFullIcon> = {
  battery: BatteryFullIcon,
  printer: PrinterIcon,
  software: GearIcon,
  connectivity: WifiHighIcon,
}

function ChatAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
      <RobotIcon className="h-4 w-4" />
    </div>
  )
}

function OptionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-border/70 bg-card px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      {label}
    </button>
  )
}

function SuggestionChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      {label}
    </button>
  )
}

function FeedbackRow() {
  return (
    <div className="mt-2 flex items-center gap-2 text-muted-foreground">
      <button type="button" className="rounded-md p-1 transition-colors hover:bg-muted hover:text-foreground" aria-label="Helpful">
        <ThumbsUpIcon className="h-3.5 w-3.5" />
      </button>
      <button type="button" className="rounded-md p-1 transition-colors hover:bg-muted hover:text-foreground" aria-label="Not helpful">
        <ThumbsDownIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    if (message.kind !== "text") return null
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">{message.text}</div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <ChatAvatar />
      <div className="min-w-0 flex-1 space-y-2">
        {message.kind === "text" ? <p className="max-w-[85%] text-sm leading-relaxed text-foreground">{message.text}</p> : null}

        {message.kind === "steps" ? (
          <div className="max-w-[85%] space-y-2 text-sm text-foreground">
            <p className="font-semibold">{message.heading}</p>
            <p className="text-muted-foreground">Try this next:</p>
            <ol className="list-decimal space-y-1 pl-5">
              {message.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="text-muted-foreground">{message.footer}</p>
          </div>
        ) : null}

        {message.kind === "options" ? (
          <div className="max-w-[85%] space-y-2">
            <p className="text-sm text-foreground">{message.prompt}</p>
            <div className="space-y-1.5">
              {message.options.map((option) => (
                <OptionButton key={option} label={option} onClick={() => message.onSelect(option)} />
              ))}
            </div>
          </div>
        ) : null}

        {message.kind === "device-picker" ? (
          <div className="max-w-[85%] space-y-2">
            <p className="text-sm text-foreground">Select the device you want me to check.</p>
            <div className="overflow-hidden rounded-lg border border-border/70">
              {DEVICES.map((device, index) => (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => message.onSelect(device)}
                  className={cn(
                    "block w-full px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50",
                    index !== 0 && "border-t border-border/70"
                  )}
                >
                  <p className="font-medium text-foreground">{device.label}</p>
                  <p className="text-xs text-muted-foreground">{device.meta}</p>
                </button>
              ))}
              <button
                type="button"
                onClick={() => toast("No more devices to show in this demo")}
                className="block w-full border-t border-border/70 px-4 py-2.5 text-center text-sm font-medium text-primary hover:bg-muted/50"
              >
                View more devices
              </button>
            </div>
          </div>
        ) : null}

        {message.kind === "health-report" ? (
          <div className="max-w-[85%] space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">Health check report</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => toast.success("Downloading health check report...")}
              >
                <DownloadSimpleIcon className="h-3.5 w-3.5" />
                Download report
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {message.cards.map((card) => {
                const Icon = HEALTH_ICON[card.icon]
                return (
                  <div key={card.label} className="rounded-lg border border-border/70 bg-card p-3">
                    <div className="flex items-start justify-between gap-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      {card.ok ? (
                        <CheckCircleIcon weight="fill" className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <XCircleIcon weight="fill" className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground">{card.label}</p>
                  </div>
                )
              })}
            </div>
            {message.issueNote ? (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <WarningIcon weight="fill" className="h-3.5 w-3.5" />
                {message.issueNote}
              </p>
            ) : null}
            <p className="text-sm leading-relaxed text-foreground">{message.message}</p>
            <FeedbackRow />
            <div className="flex flex-wrap gap-2">
              {message.suggestions.map((suggestion) => (
                <SuggestionChip key={suggestion} label={suggestion} onClick={() => message.onSuggestion(suggestion)} />
              ))}
            </div>
          </div>
        ) : null}

        {message.kind === "raise-ticket" ? (
          <div className="max-w-[85%] space-y-3 rounded-lg border border-border/70 bg-card p-4">
            <p className="text-sm font-semibold text-foreground">Raise a ticket</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium text-foreground">{message.draft.category}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">POS ID</span>
                <span className="font-medium text-foreground">{message.draft.posId}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Issue description</span>
                <span className="font-medium text-foreground">{message.draft.issueDescription}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Health check report</span>
                <button
                  type="button"
                  onClick={() => toast.success("Downloading health check report...")}
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  {message.draft.healthCheckReport}
                  <DownloadSimpleIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="h-px w-full bg-border/70" />

            <p className="text-sm font-semibold text-foreground">Store details</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{message.draft.storeName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Contact</p>
                <p className="font-medium text-foreground">{message.draft.storeContact}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium text-foreground">{message.draft.storeAddress}</p>
              </div>
            </div>

            <p className="rounded-md bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
              Ensure that you verify the store&apos;s address and contact details.
            </p>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={message.onEdit}>
                Edit details
              </Button>
              <Button className="flex-1" onClick={message.onRaise}>
                Raise ticket
              </Button>
            </div>

            <FeedbackRow />
          </div>
        ) : null}

        {message.kind === "ticket-confirmation" ? (
          <div className="max-w-[85%] rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3.5 py-2.5">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <CheckCircleIcon weight="fill" className="h-4 w-4 text-emerald-600" />
              Ticket raised successfully
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ticket <span className="font-medium text-foreground">{message.ticketId}</span> has been created. Our team will get back to
              you within 48 hours.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

const STORE_DETAILS = {
  name: "Sandowitch",
  contact: "7531810061",
  address: "E-18/B-1, LPG House, Mohan Cooperative extension, Delhi Mathura road, Delhi, PIN: 110044",
}

export function SupportChatContent() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [headerTitle, setHeaderTitle] = useState("New support chat")
  const [promptValue, setPromptValue] = useState("")
  const [editDraft, setEditDraft] = useState<TicketEditDraft | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    startNewChat()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  function append(message: ChatMessage) {
    setMessages((current) => [...current, message])
  }

  function startNewChat() {
    setHeaderTitle("New support chat")
    setMessages([
      {
        id: uid(),
        role: "bot",
        kind: "options",
        prompt: "Hi, tell us how can we help you today. For starters, select a topic of your issue.",
        options: SUPPORT_TOPICS.map((topic) => topic.label),
        onSelect: (label) => handleTopicSelect(label),
      },
    ])
  }

  function handleTopicSelect(topicLabel: string) {
    const topic = SUPPORT_TOPICS.find((item) => item.label === topicLabel)
    if (!topic) return
    setHeaderTitle(topic.label)
    append({ id: uid(), role: "user", kind: "text", text: topic.label })

    const subtopics = (TOPIC_FAQS[topic.slug] ?? []).map((faq) => faq.question)
    append({
      id: uid(),
      role: "bot",
      kind: "options",
      prompt: `Got it — here are some common ${topic.label} issues. Select the one closest to yours, or describe it below.`,
      options: subtopics,
      onSelect: (question) => handleSubtopicSelect(topic.slug, question),
    })
  }

  function handleSubtopicSelect(topicSlug: SupportTopicSlug, question: string) {
    setHeaderTitle(question)
    append({ id: uid(), role: "user", kind: "text", text: question })

    if (topicSlug === "device-hardware" && question === "GPRS / Network Issues") {
      append({
        id: uid(),
        role: "bot",
        kind: "steps",
        heading: "Actions Configuration",
        steps: GPRS_STEPS,
        footer: "I can also use this context for a device check or ticket if the issue continues.",
      })
      appendDeviceCheckPrompt()
      return
    }

    if (topicSlug === "device-hardware" && question === "No SIM / SIM Lock on PoS") {
      append({
        id: uid(),
        role: "bot",
        kind: "steps",
        heading: "Steps — if this remains unresolved, raise a request for Terminal Issues.",
        steps: SIM_STEPS,
        footer: "I can also use this context for a device check or ticket if the issue continues.",
      })
      appendDeviceCheckPrompt()
      return
    }

    const topic = getSupportTopic(topicSlug)
    const faq = (TOPIC_FAQS[topicSlug] ?? []).find((item) => item.question === question)
    append({
      id: uid(),
      role: "bot",
      kind: "text",
      text: faq?.answer ?? `Here's what I found for "${question}" under ${topic?.label ?? "this topic"}.`,
    })
    appendDeviceCheckPrompt()
  }

  function appendDeviceCheckPrompt() {
    append({
      id: uid(),
      role: "bot",
      kind: "options",
      prompt: "If this didn't resolve it, I can run a device health check or raise a ticket for you.",
      options: ["Run device health check", "Raise a ticket"],
      onSelect: (option) => (option === "Run device health check" ? handleRunHealthCheck() : handleRaiseTicketDirect()),
    })
  }

  function handleRunHealthCheck() {
    append({ id: uid(), role: "user", kind: "text", text: "Run device health check" })
    append({ id: uid(), role: "bot", kind: "device-picker", onSelect: handleDeviceSelect })
  }

  function handleDeviceSelect(device: DeviceOption) {
    append({ id: uid(), role: "user", kind: "text", text: device.label })

    if (device.hasIssue) {
      append({
        id: uid(),
        role: "bot",
        kind: "health-report",
        deviceLabel: device.label,
        cards: [
          { label: "Battery", icon: "battery", ok: true },
          { label: "Printer", icon: "printer", ok: false },
          { label: "Software", icon: "software", ok: true },
          { label: "Connectivity", icon: "connectivity", ok: true },
        ],
        issueNote: "Printer is out of paper",
        message:
          "We detected an issue with your printer when we did the device check. If you want, I can raise a ticket for you and someone will get that checked.",
        suggestions: ["Raise a ticket for printer issue", "Try another device check"],
        onSuggestion: (option) =>
          option === "Try another device check" ? handleRunHealthCheck() : handleRaiseTicketForPrinter(device),
      })
      return
    }

    append({
      id: uid(),
      role: "bot",
      kind: "health-report",
      deviceLabel: device.label,
      cards: [
        { label: "Battery", icon: "battery", ok: true },
        { label: "Printer", icon: "printer", ok: true },
        { label: "Software", icon: "software", ok: true },
        { label: "Connectivity", icon: "connectivity", ok: true },
      ],
      message: `Good news — ${device.label} passed every check with no issues detected.`,
      suggestions: ["Try another device check"],
      onSuggestion: () => handleRunHealthCheck(),
    })
  }

  function buildDraft(device: DeviceOption | null, issue: string): TicketEditDraft {
    return {
      category: "Hardware & Device Issue",
      product: device?.label.split(" • ")[0] === "Go" ? "Pine Go" : "Pine Touch",
      topic: "Device & Hardware",
      posId: device?.id ?? "",
      issueDescription: issue,
      healthCheckReport: device ? `Report ${device.label.split(" • ")[0]} • A50 • ${device.id.replace(/\D/g, "")}` : "",
      storeName: STORE_DETAILS.name,
      storeContact: STORE_DETAILS.contact,
      storeAddress: STORE_DETAILS.address,
    }
  }

  function appendRaiseTicketCard(draft: TicketEditDraft, messageId?: string) {
    const id = messageId ?? uid()
    const card: ChatMessage = {
      id,
      role: "bot",
      kind: "raise-ticket",
      draft,
      onEdit: () => {
        setEditingMessageId(id)
        setEditDraft(draft)
        setEditOpen(true)
      },
      onRaise: () => handleRaiseTicketConfirm(),
    }

    setMessages((current) => {
      const existingIndex = current.findIndex((message) => message.id === id)
      if (existingIndex >= 0) {
        const next = [...current]
        next[existingIndex] = card
        return next
      }
      return [...current, card]
    })
  }

  function handleRaiseTicketForPrinter(device: DeviceOption) {
    append({ id: uid(), role: "bot", kind: "text", text: "Please check your details for the ticket." })
    appendRaiseTicketCard(buildDraft(device, "Printer Issue"))
  }

  function handleRaiseTicketDirect() {
    append({ id: uid(), role: "user", kind: "text", text: "Raise a ticket" })
    append({ id: uid(), role: "bot", kind: "text", text: "Please check your details for the ticket." })
    appendRaiseTicketCard(buildDraft(null, headerTitle))
  }

  function handleEditSave(draft: TicketEditDraft) {
    if (editingMessageId) appendRaiseTicketCard(draft, editingMessageId)
    setEditOpen(false)
    setEditingMessageId(null)
  }

  function handleRaiseTicketConfirm() {
    const ticketId = `PL-ITCH${Math.floor(30 + Math.random() * 60)}`
    append({ id: uid(), role: "bot", kind: "ticket-confirmation", ticketId })
    toast.success(`Ticket ${ticketId} raised successfully`)
  }

  function handleSend() {
    const text = promptValue.trim()
    if (!text) return
    append({ id: uid(), role: "user", kind: "text", text })
    setPromptValue("")
    append({
      id: uid(),
      role: "bot",
      kind: "text",
      text: "Got it — let me look into that. In the meantime, you can run a device health check or raise a ticket if this doesn't resolve it.",
    })
    appendDeviceCheckPrompt()
  }

  return (
    <div className="flex h-[calc(100vh-var(--dashboard-top-offset,0px)-16px)] flex-col">
      <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-border/70 px-5">
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 rounded-md px-2 text-xs text-foreground hover:bg-muted" aria-label="Back to Support">
            <Link href="/support">
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="mx-1 h-5 w-px bg-border/70" />
          <Button variant="ghost" size="icon-sm" className="h-8 w-8" aria-label="Toggle chat list" onClick={() => toast("Chat history isn't available in this demo")}>
            <SidebarSimpleIcon className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">{headerTitle}</h1>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={startNewChat}>
          <PlusIcon className="h-3.5 w-3.5" />
          New chat
        </Button>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-6">
        <div className="mx-auto max-w-3xl space-y-5">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-border/70 px-5 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-full border border-input bg-background px-2 py-1.5">
          <Button variant="ghost" size="icon-sm" className="h-8 w-8 shrink-0" aria-label="Attach file" onClick={() => toast("Attachments aren't available in this demo")}>
            <PaperclipIcon className="h-4 w-4" />
          </Button>
          <Input
            value={promptValue}
            onChange={(event) => setPromptValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                handleSend()
              }
            }}
            placeholder="Describe your support issue"
            className="h-8 flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
          />
          <Button variant="ghost" size="icon-sm" className="h-8 w-8 shrink-0" aria-label="Voice input" onClick={() => toast("Voice input isn't available in this demo")}>
            <MicrophoneIcon className="h-4 w-4" />
          </Button>
          <Button size="icon-sm" className="h-8 w-8 shrink-0 rounded-full" aria-label="Send message" onClick={handleSend}>
            <PaperPlaneRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <TicketEditPanel
        open={editOpen}
        onOpenChange={setEditOpen}
        ticket={null}
        initialDraft={editDraft ?? undefined}
        onSave={handleEditSave}
      />
    </div>
  )
}
