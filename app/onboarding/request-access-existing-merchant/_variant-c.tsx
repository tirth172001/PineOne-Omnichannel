"use client"

import { useState } from "react"
import { HourglassIcon, PaperPlaneRightIcon, RobotIcon, StorefrontIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { foundMerchant } from "./_mock"

type Bubble =
  | { from: "assistant"; kind: "text"; text: string }
  | { from: "user"; kind: "text"; text: string }
  | { from: "assistant"; kind: "typing" }
  | { from: "assistant"; kind: "found"; resolved: boolean }
  | { from: "assistant"; kind: "pending" }

// Variant C — a conversational, assistant-guided thread instead of a form. This app already
// uses a chat-style assistant panel elsewhere in onboarding, so this leans on that precedent.
export function VariantC() {
  const [bubbles, setBubbles] = useState<Bubble[]>([
    { from: "assistant", kind: "text", text: "Hi! What's the email or mobile number your business account is registered with?" },
  ])
  const [input, setInput] = useState("")
  const [awaitingConfirm, setAwaitingConfirm] = useState(false)

  function send() {
    if (!input.trim()) return
    setBubbles((current) => [...current, { from: "user", kind: "text", text: input.trim() }, { from: "assistant", kind: "typing" }])
    setInput("")

    window.setTimeout(() => {
      setBubbles((current) => [...current.slice(0, -1), { from: "assistant", kind: "found", resolved: false }])
      setAwaitingConfirm(true)
    }, 900)
  }

  function confirm(yes: boolean) {
    setAwaitingConfirm(false)
    setBubbles((current) => {
      const withoutCard = current.map((bubble) => (bubble.kind === "found" ? { ...bubble, resolved: true } : bubble))
      const reply: Bubble = { from: "user", kind: "text", text: yes ? "Yes, that's right" : "No, try again" }
      if (!yes) {
        return [...withoutCard, reply, { from: "assistant", kind: "text", text: "No worries — what's the correct email or phone number?" }]
      }
      return [...withoutCard, reply, { from: "assistant", kind: "pending" }]
    })
  }

  return (
    <div className="flex h-[calc(100%-2rem)] w-full max-w-md flex-col px-6">
      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {bubbles.map((bubble, index) => (
          <ChatBubble key={index} bubble={bubble} onConfirm={confirm} />
        ))}
      </div>

      {!awaitingConfirm && !bubbles.some((bubble) => bubble.kind === "pending") ? (
        <div className="flex gap-2 border-t border-border pt-3">
          <Input
            placeholder="Type your answer…"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") send()
            }}
          />
          <Button type="button" size="icon" aria-label="Send" onClick={send} disabled={!input.trim()}>
            <PaperPlaneRightIcon size={16} />
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function ChatBubble({ bubble, onConfirm }: { bubble: Bubble; onConfirm: (yes: boolean) => void }) {
  if (bubble.kind === "text") {
    const fromUser = bubble.from === "user"
    return (
      <div className={cn("flex items-end gap-2", fromUser && "flex-row-reverse")}>
        {!fromUser ? (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <RobotIcon size={14} />
          </span>
        ) : null}
        <div
          className={cn(
            "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
            fromUser ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted text-foreground"
          )}
        >
          {bubble.text}
        </div>
      </div>
    )
  }

  if (bubble.kind === "typing") {
    return (
      <div className="flex items-end gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <RobotIcon size={14} />
        </span>
        <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2.5">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="motion-safe:animate-[pv11Bounce_1s_ease-in-out_infinite] size-1.5 rounded-full bg-muted-foreground/50"
              style={{ animationDelay: `${dot * 150}ms` }}
            />
          ))}
          <style>{`@keyframes pv11Bounce { 0%, 100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(-3px); opacity: 1; } }`}</style>
        </div>
      </div>
    )
  }

  if (bubble.kind === "found") {
    return (
      <div className="flex items-end gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <RobotIcon size={14} />
        </span>
        <div className="max-w-[85%] space-y-2.5 rounded-2xl rounded-bl-sm bg-muted p-3">
          <p className="text-sm text-foreground">I found this business — is this the one you&apos;re joining?</p>
          <div className="flex items-center gap-2.5 rounded-lg bg-card px-3 py-2.5 ring-1 ring-border">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <StorefrontIcon size={16} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">{foundMerchant.name}</p>
              <p className="text-[11px] text-muted-foreground">{foundMerchant.category}</p>
            </div>
          </div>
          {!bubble.resolved ? (
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" className="flex-1" onClick={() => onConfirm(false)}>
                No
              </Button>
              <Button type="button" size="sm" className="flex-1" onClick={() => onConfirm(true)}>
                Yes, that&apos;s it
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <RobotIcon size={14} />
      </span>
      <div className="max-w-[85%] space-y-2 rounded-2xl rounded-bl-sm bg-muted p-3">
        <p className="text-sm text-foreground">
          Great — I&apos;ve sent your request to <span className="font-medium">{foundMerchant.name}</span>&apos;s admin.
          You&apos;ll hear back soon!
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning">
          <HourglassIcon size={11} weight="fill" />
          Pending approval
        </span>
      </div>
    </div>
  )
}
