"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { ProductId } from "@/lib/getting-started"
import { ONLINE_MACROS, ONLINE_STEPS, canContinueOnline, type OnlineProfile, type OnlineStepId } from "@/lib/online-onboarding"
import { SetupFrame } from "../setup-frame"
import { asset, themeClass } from "./fields"

const icons = { done: "71132a51cf5fe33c9adbce9f43c5ff5d56db8aa0.svg", current: "c77b02683806a1d206aceaae877710af28c9c9aa.svg", pending: "27972df0d793e2a5bf10675997b1dff37ffbb0bd.svg" }

/** Online verification uses the same workspace, header and action bar as In-store. */
export function OnlineShell({ product, index, profile, children, onPrevious, onContinue, canContinue, onStep, success = false }: {
  product: Exclude<ProductId, "in-store">; index: number; profile: OnlineProfile; children: ReactNode
  onPrevious?: () => void; onContinue?: () => void; canContinue?: boolean; onStep: (index: number) => void; success?: boolean
}) {
  const step = ONLINE_STEPS[Math.min(index, ONLINE_STEPS.length - 1)]
  const [keysOpen, setKeysOpen] = useState(false)
  const [expanded, setExpanded] = useState(step.macro)
  useEffect(() => { setExpanded(step.macro) }, [index, step.macro])
  const rail = <ol aria-label="Onboarding progress" className="mt-6 min-h-0 flex-1 space-y-3 overflow-y-auto">
    {ONLINE_MACROS.map((macro, macroIndex) => {
      const entries = ONLINE_STEPS.map((item, position) => ({ ...item, position })).filter((item, position, items) => item.macro === macroIndex && items.findIndex((other) => other.group === item.group) === position)
      const complete = ONLINE_STEPS.filter((item) => item.macro === macroIndex).every((item) => canContinueOnline(item.id as OnlineStepId, profile))
      return <li key={macro}>
        <button type="button" className="flex min-h-10 w-full items-center gap-2 px-2 text-left text-sm font-medium" onClick={() => setExpanded(expanded === macroIndex ? -1 : macroIndex)} aria-expanded={expanded === macroIndex} aria-controls={`online-macro-${macroIndex}`}>
          {complete ? <img src={asset(icons.done)} alt="Completed" /> : <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] text-background">{macroIndex + 1}</span>}
          <span className="flex-1">{macro}</span><img alt="" src={asset(expanded === macroIndex ? "784c7aa23a4318ff06b592da60dbb9e086df7cd3.svg" : "826748a4b7a8819f3da8c51dd2bd34f7e8a45281.svg")} />
        </button>
        <ol id={`online-macro-${macroIndex}`} hidden={expanded !== macroIndex} className="space-y-2 pt-1">{entries.map((item) => {
          const active = !success && item.group === step.group
          const done = ONLINE_STEPS.filter((other) => other.group === item.group).every((other) => canContinueOnline(other.id as OnlineStepId, profile))
          const reachable = !success && item.position <= index && ONLINE_STEPS.slice(0, item.position).every((other) => canContinueOnline(other.id as OnlineStepId, profile))
          return <li key={item.group}><button type="button" disabled={!reachable} aria-current={active ? "step" : undefined} onClick={() => onStep(item.position)} className={`flex min-h-9 w-full items-center gap-2 rounded-lg py-2 pl-[30px] pr-2 text-left text-sm disabled:text-muted-foreground ${active ? "bg-sidebar-accent" : "hover:bg-muted/40"}`}><img alt={done ? "Completed" : ""} src={asset(icons[done ? "done" : active ? "current" : "pending"])} />{item.label}</button></li>
        })}</ol>
      </li>
    })}
  </ol>
  return <div className={themeClass}>
    <SetupFrame
      product={product}
      stepIndex={step.macro}
      steps={ONLINE_MACROS}
      rail={rail}
      railFooter={<Button variant="ghost" size="sm" className="mt-4 w-fit gap-2 text-xs" onClick={() => setKeysOpen(true)}><img alt="" src={asset("a33e5b78850ec624d1228c9d730f0eb2faed48b0.svg")} />Get API keys</Button>}
      eyebrow={success ? undefined : `${step.label}${step.group === "signatory" ? ` · Step ${index - 5} of 3` : ""}`}
      title={success ? "" : step.id === "agreement" ? "Finish up by signing the agreement" : profile.ownersView === "list" && step.id === "owners" ? "Enter details of business owners" : step.title}
      subtitle={success ? undefined : step.description}
      onBack={success ? undefined : onPrevious}
      onContinue={success || step.id === "video-kyc" ? undefined : onContinue}
      continueLabel={step.id === "agreement" ? "Sign agreement" : step.id === "review" ? "Save & proceed" : "Save & continue"}
      canContinue={canContinue}
      continueHint={success || step.id === "video-kyc" ? undefined : "Complete the required details and verification to continue."}
      wide={success || ["gst", "documents", "video-kyc", "review", "agreement"].includes(step.id)}
    >
      {children}
    </SetupFrame>
    <Dialog open={keysOpen} onOpenChange={setKeysOpen}><DialogContent className={themeClass}><DialogTitle>Online payment API keys</DialogTitle><DialogDescription>Complete onboarding to find your integration settings in Checkout. These are sample test credentials for this prototype.</DialogDescription><code className="break-all rounded-lg bg-muted p-3 text-xs">pk_test_pine_onboarding_demo</code></DialogContent></Dialog>
  </div>
}
