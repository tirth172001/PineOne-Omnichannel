"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowsOutCardinalIcon,
  CursorIcon,
  GridFourIcon,
  MoonIcon,
  SunIcon,
  WrenchIcon,
} from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DEMO_SETTINGS_CHANGED_EVENT,
  notifyDemoSettingsChanged,
  readDemoSettings,
  writeDemoSettings,
  type DemoSettings,
} from "@/lib/demo-settings"
import { ROUTES } from "@/lib/navigation/routes"
import { setThemeWithTransition } from "@/lib/theme-transition"
import { cn } from "@/lib/utils"

const FAB_POSITION_KEY = "pine-one-demo-fab-position"
const FAB_SIZE = 44
const FAB_MARGIN = 12

const MAX_WIDTH_PRESETS = [1100, 1440, 1680] as const

const CASE_LINKS = [
  { label: "Overview", href: ROUTES.home },
  { label: "Transactions", href: ROUTES.transactions.root },
  { label: "Settlements", href: ROUTES.settlements.root },
  { label: "Disputes", href: ROUTES.disputes.root },
  { label: "Refunds", href: ROUTES.refunds.root },
  { label: "Reports", href: ROUTES.reports.root },
  { label: "Products", href: ROUTES.products.root },
  { label: "Support", href: ROUTES.support.root },
]

type Position = {
  x: number
  y: number
}

function clampPosition(position: Position) {
  if (typeof window === "undefined") return position
  const maxX = Math.max(FAB_MARGIN, window.innerWidth - FAB_SIZE - FAB_MARGIN)
  const maxY = Math.max(FAB_MARGIN, window.innerHeight - FAB_SIZE - FAB_MARGIN)
  return {
    x: Math.min(maxX, Math.max(FAB_MARGIN, position.x)),
    y: Math.min(maxY, Math.max(FAB_MARGIN, position.y)),
  }
}

function loadFabPosition(): Position {
  if (typeof window === "undefined") return { x: 16, y: 96 }
  try {
    const raw = window.localStorage.getItem(FAB_POSITION_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Position
      if (Number.isFinite(parsed?.x) && Number.isFinite(parsed?.y)) {
        return clampPosition(parsed)
      }
    }
  } catch {
    // no-op
  }
  return getDefaultFabPosition()
}

function getDefaultFabPosition(): Position {
  if (typeof window === "undefined") return { x: 16, y: 96 }
  return clampPosition({
    x: Math.max(FAB_MARGIN, window.innerWidth - 340),
    y: Math.max(FAB_MARGIN, window.innerHeight - 220),
  })
}

function saveFabPosition(position: Position) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(FAB_POSITION_KEY, JSON.stringify(position))
}

export function FloatingDemoFab() {
  const router = useRouter()
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [settings, setSettings] = useState<DemoSettings>(readDemoSettings)
  const [customWidthInput, setCustomWidthInput] = useState(() => String(readDemoSettings().customMaxWidth))
  const [position, setPosition] = useState<Position>({ x: 16, y: 96 })
  const dragStateRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
    dragged: boolean
  } | null>(null)
  const suppressClickRef = useRef(false)

  useEffect(() => {
    setReady(true)
    const initialSettings = readDemoSettings()
    setSettings(initialSettings)
    setCustomWidthInput(String(initialSettings.customMaxWidth))
    setPosition(loadFabPosition())
  }, [])

  useEffect(() => {
    if (!ready) return
    const syncSettings = () => {
      const next = readDemoSettings()
      setSettings(next)
      setCustomWidthInput(String(next.customMaxWidth))
    }
    const onResize = () => {
      setPosition((current) => clampPosition(current))
    }
    window.addEventListener(DEMO_SETTINGS_CHANGED_EVENT, syncSettings)
    window.addEventListener("storage", syncSettings)
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener(DEMO_SETTINGS_CHANGED_EVENT, syncSettings)
      window.removeEventListener("storage", syncSettings)
      window.removeEventListener("resize", onResize)
    }
  }, [ready])

  const themeValue = resolvedTheme === "dark" ? "dark" : "light"

  function applySettings(patch: Partial<DemoSettings>) {
    const next = { ...settings, ...patch }
    setSettings(next)
    writeDemoSettings(next)
    notifyDemoSettingsChanged()
  }

  function handleCaseNavigation(targetPath: string) {
    setOpen(false)
    if (targetPath !== pathname) {
      router.push(targetPath)
    } else {
      router.refresh()
    }
  }

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      dragged: false,
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const dragState = dragStateRef.current
    if (!dragState || event.pointerId !== dragState.pointerId) return

    const deltaX = event.clientX - dragState.startX
    const deltaY = event.clientY - dragState.startY
    if (!dragState.dragged && Math.hypot(deltaX, deltaY) < 4) return

    dragState.dragged = true
    if (!isDragging) {
      setIsDragging(true)
      setOpen(false)
    }
    const next = clampPosition({
      x: dragState.originX + deltaX,
      y: dragState.originY + deltaY,
    })
    setPosition(next)
  }

  function releaseDrag(event: React.PointerEvent<HTMLButtonElement>) {
    const dragState = dragStateRef.current
    if (!dragState || event.pointerId !== dragState.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (dragState.dragged) {
      const next = clampPosition(position)
      saveFabPosition(next)
      suppressClickRef.current = true
      setTimeout(() => {
        suppressClickRef.current = false
      }, 0)
    }
    dragStateRef.current = null
    setIsDragging(false)
  }

  function commitCustomWidth() {
    const parsed = Number(customWidthInput)
    if (!Number.isFinite(parsed)) return
    const clamped = Math.max(800, Math.min(2560, parsed))
    setCustomWidthInput(String(clamped))
    applySettings({ maxWidth: "custom", customMaxWidth: clamped })
  }

  if (!ready) return null

  return (
    <div
      className="fixed z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <Popover open={open} onOpenChange={(next) => !isDragging && setOpen(next)}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            aria-label="Open demo controls"
            variant="ghost"
            className={cn(
              "relative isolate h-11 w-11 rounded-full border border-white/85 bg-black p-0 text-white shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-white hover:bg-black hover:shadow-[0_14px_30px_rgba(0,0,0,0.46)] active:translate-y-0 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black dark:border-black/20 dark:bg-white dark:text-black dark:shadow-[0_8px_20px_rgba(0,0,0,0.34)] dark:hover:bg-white dark:hover:shadow-[0_16px_32px_rgba(0,0,0,0.44)] dark:focus-visible:ring-black/35 dark:focus-visible:ring-offset-white",
              open && "translate-y-[-1px] shadow-[0_12px_28px_rgba(0,0,0,0.42)] dark:shadow-[0_14px_30px_rgba(0,0,0,0.4)]",
              isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={releaseDrag}
            onPointerCancel={releaseDrag}
            onClick={(event) => {
              if (suppressClickRef.current) {
                event.preventDefault()
                event.stopPropagation()
              }
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-[-3px] rounded-full border border-white/30 opacity-0 transition-opacity duration-200 group-hover/button:opacity-100 dark:border-black/20"
            />
            <span className="flex h-11 w-11 items-center justify-center">
              <WrenchIcon className="h-4.5 w-4.5 transition-transform duration-200 group-hover/button:rotate-[-10deg]" />
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent side="right" align="start" sideOffset={12} className="w-[360px] max-w-[calc(100vw-2rem)] p-0">
          <div className="space-y-3 p-3">
            <PopoverHeader className="gap-0.5">
              <PopoverTitle className="text-sm">Demo Controls</PopoverTitle>
              <PopoverDescription className="text-xs">
                Switch page cases and live platform settings.
              </PopoverDescription>
            </PopoverHeader>

            <div className="rounded-lg border border-border/70 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Quick Cases</p>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {CASE_LINKS.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Button
                      key={item.label}
                      type="button"
                      variant={active ? "secondary" : "outline"}
                      size="sm"
                      className="h-8 justify-start text-xs"
                      onClick={() => handleCaseNavigation(item.href)}
                    >
                      <GridFourIcon className="h-3.5 w-3.5" />
                      {item.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-lg border border-border/70 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Platform View</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {MAX_WIDTH_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant={settings.maxWidth === preset ? "secondary" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => applySettings({ maxWidth: preset })}
                  >
                    {preset}px
                  </Button>
                ))}
                <Button
                  type="button"
                  variant={settings.maxWidth === "custom" ? "secondary" : "outline"}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => applySettings({ maxWidth: "custom" })}
                >
                  Custom
                </Button>
              </div>
              {settings.maxWidth === "custom" ? (
                <div className="mt-2 flex items-center gap-1.5">
                  <Input
                    type="number"
                    min={800}
                    max={2560}
                    value={customWidthInput}
                    onChange={(event) => setCustomWidthInput(event.target.value)}
                    onBlur={commitCustomWidth}
                    className="h-8 text-xs"
                  />
                  <span className="text-xs text-muted-foreground">px</span>
                </div>
              ) : null}
            </div>

            <div className="rounded-lg border border-border/70 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Theme</p>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                <Button
                  type="button"
                  variant={themeValue === "light" ? "secondary" : "outline"}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setThemeWithTransition(setTheme, "light")}
                >
                  <SunIcon className="h-3.5 w-3.5" />
                  Light
                </Button>
                <Button
                  type="button"
                  variant={themeValue === "dark" ? "secondary" : "outline"}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setThemeWithTransition(setTheme, "dark")}
                >
                  <MoonIcon className="h-3.5 w-3.5" />
                  Dark
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    const dockPosition = getDefaultFabPosition()
                    setPosition(dockPosition)
                    saveFabPosition(dockPosition)
                  }}
                >
                  <ArrowsOutCardinalIcon className="h-3.5 w-3.5" />
                  Reset
                </Button>
              </div>
            </div>

            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <CursorIcon className="h-3.5 w-3.5" />
              Drag this button to reposition it. Position is saved automatically.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
