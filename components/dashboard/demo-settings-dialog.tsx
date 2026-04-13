"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Monitor, Maximize2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  readDemoSettings,
  writeDemoSettings,
  type DemoSettings,
} from "@/lib/demo-settings"

const MAX_WIDTH_OPTIONS = [
  { label: "1100", value: 1100, description: "Focused" },
  { label: "1440", value: 1440, description: "Wide" },
  { label: "Custom", value: "custom" as const, description: "Set your own" },
]

const VERSIONS = [
  { label: "V1", port: 3000, description: "Icon rail nav" },
  { label: "V2", port: 3001, description: "Persistent sidebar" },
]

interface DemoSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DemoSettingsDialog({ open, onOpenChange }: DemoSettingsDialogProps) {
  const pathname = usePathname()
  const [settings, setSettings] = useState<DemoSettings>(readDemoSettings)
  const [customInput, setCustomInput] = useState(String(settings.customMaxWidth))
  const [currentPort, setCurrentPort] = useState(3000)

  useEffect(() => {
    setCurrentPort(Number(window.location.port) || 3000)
  }, [])

  function update(patch: Partial<DemoSettings>) {
    const next = { ...settings, ...patch }
    setSettings(next)
    writeDemoSettings(next)
    // Dispatch a storage event so WorkspaceShell picks it up without a reload
    window.dispatchEvent(new Event("demo-settings-changed"))
  }

  function switchVersion(port: number) {
    if (port === currentPort) return
    const { protocol, hostname } = window.location

    const v1Routes = [
      "/", "/online-payments", "/offline-payments", "/payment-links",
      "/card-payments", "/international-payments", "/products",
      "/use-cases", "/settings", "/support", "/configure-products", "/pos-device",
    ]

    let resolvedPath = pathname
    if (port === 3000 && !v1Routes.includes(pathname)) {
      const topLevel = "/" + pathname.split("/").filter(Boolean)[0]
      resolvedPath = v1Routes.includes(topLevel) ? topLevel : "/"
    }

    window.location.href = `${protocol}//${hostname}:${port}${resolvedPath}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Monitor className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base">Demo Settings</DialogTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Configure this prototype for comparison
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Version switcher */}
          <div className="space-y-2.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Navigation version
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {VERSIONS.map((v) => {
                const active = currentPort === v.port
                return (
                  <button
                    key={v.port}
                    onClick={() => switchVersion(v.port)}
                    className={cn(
                      "flex flex-col items-start gap-0.5 rounded-lg border px-4 py-3 text-left transition-colors",
                      active
                        ? "border-primary bg-primary/8 text-primary"
                        : "border-border hover:border-border/80 hover:bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <span className="text-sm font-semibold">{v.label}</span>
                    <span className="text-[11px] opacity-70">{v.description}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Max width */}
          <div className="space-y-2.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Maximize2 className="h-3 w-3" />
              Center panel max width
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {MAX_WIDTH_OPTIONS.map((opt) => {
                const active = settings.maxWidth === opt.value
                return (
                  <button
                    key={String(opt.value)}
                    onClick={() =>
                      update(
                        opt.value === "custom"
                          ? { maxWidth: "custom" }
                          : { maxWidth: opt.value as number }
                      )
                    }
                    className={cn(
                      "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                      active
                        ? "border-primary bg-primary/8 text-primary"
                        : "border-border hover:border-border/80 hover:bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <span className="text-sm font-semibold">{opt.label}</span>
                    <span className="text-[11px] opacity-70">{opt.description}</span>
                  </button>
                )
              })}
            </div>

            {settings.maxWidth === "custom" && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={800}
                  max={2560}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onBlur={() => {
                    const val = Math.max(800, Math.min(2560, Number(customInput)))
                    setCustomInput(String(val))
                    update({ customMaxWidth: val })
                  }}
                  className="h-9 text-sm"
                  placeholder="e.g. 1280"
                />
                <span className="text-xs text-muted-foreground shrink-0">px</span>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">
              Current:{" "}
              <span className="font-medium text-foreground">
                {settings.maxWidth === "custom"
                  ? `${settings.customMaxWidth}px`
                  : `${settings.maxWidth}px`}
              </span>
              {" · "}Changes apply instantly without a reload.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
