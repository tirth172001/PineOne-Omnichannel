"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { DASHBOARD_CONTENT_MAX_WIDTH } from "@/lib/dashboard-layout"
import { cn } from "@/lib/utils"
import { useNavVisibility } from "./nav-visibility-context"
import { readDemoSettings, getResolvedMaxWidth } from "@/lib/demo-settings"

interface WorkspaceShellProps {
  centerMain: React.ReactNode
  leftContext?: React.ReactNode
  rightContext?: React.ReactNode
  showLeftContext?: boolean
  showRightContext?: boolean
  leftWidth?: number
  leftMaxWidth?: number
  rightWidth?: number
  rightMaxWidth?: number
  centerMaxWidth?: number
  workspaceMaxWidth?: number
  hideBottomNavWhenRightOpen?: boolean
  hideBottomNav?: boolean
  className?: string
  centerClassName?: string
}

export function WorkspaceShell({
  centerMain,
  leftContext,
  rightContext,
  showLeftContext = false,
  showRightContext = false,
  leftWidth = 280,
  rightWidth = 400,
  centerMaxWidth,
  workspaceMaxWidth = DASHBOARD_CONTENT_MAX_WIDTH,
  hideBottomNavWhenRightOpen = false,
  hideBottomNav = false,
  className,
  centerClassName,
}: WorkspaceShellProps) {
  const { setHidden } = useNavVisibility()

  const [demoMaxWidth, setDemoMaxWidth] = React.useState(() =>
    getResolvedMaxWidth(readDemoSettings())
  )
  React.useEffect(() => {
    const handler = () => setDemoMaxWidth(getResolvedMaxWidth(readDemoSettings()))
    window.addEventListener("demo-settings-changed", handler)
    return () => window.removeEventListener("demo-settings-changed", handler)
  }, [])

  const resolvedWorkspaceMaxWidth =
    workspaceMaxWidth === DASHBOARD_CONTENT_MAX_WIDTH
      ? demoMaxWidth
      : workspaceMaxWidth

  React.useEffect(() => {
    if (!hideBottomNavWhenRightOpen && !hideBottomNav) return
    setHidden(showRightContext || hideBottomNav)
    return () => setHidden(false)
  }, [hideBottomNav, hideBottomNavWhenRightOpen, setHidden, showRightContext])

  const hasLeftContext = showLeftContext && Boolean(leftContext)
  const hasRightContext = showRightContext && Boolean(rightContext)

  return (
    <div className={cn("relative min-h-0 flex-1 overflow-hidden", className)}>
      <div
        className="mx-auto flex h-full w-full min-h-0 gap-2 overflow-hidden px-2 py-3"
        style={{ maxWidth: resolvedWorkspaceMaxWidth }}
      >
        {/* Left panel */}
        <AnimatePresence initial={false}>
          {hasLeftContext && (
            <motion.aside
              key="left-panel"
              className="shrink-0 overflow-hidden"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: leftWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="h-full overflow-hidden" style={{ width: leftWidth }}>
                {leftContext}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Center panel — flex-1 so it fills remaining space and shrinks when right panel opens */}
        <main
          className={cn(
            "min-w-0 flex-1 overflow-hidden",
            centerClassName
          )}
        >
          <div
            className="mx-auto h-full w-full min-w-0 overflow-hidden rounded-lg olive-surface-soft"
            style={{ maxWidth: centerMaxWidth }}
          >
            <div className="h-full overflow-hidden">
              {centerMain}
            </div>
          </div>
        </main>

        {/* Right panel — inline, not overlay */}
        <AnimatePresence initial={false}>
          {hasRightContext && (
            <motion.aside
              key="right-panel"
              className="shrink-0 overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: rightWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Fixed-width inner wrapper prevents content from squishing during animation */}
              <div
                className="h-full overflow-y-auto"
                style={{ width: rightWidth }}
              >
                {rightContext}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
