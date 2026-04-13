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
  leftMaxWidth = 320,
  rightWidth = 432,
  rightMaxWidth = 520,
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

  const resolvedWorkspaceMaxWidth = workspaceMaxWidth === DASHBOARD_CONTENT_MAX_WIDTH
    ? demoMaxWidth
    : workspaceMaxWidth

  React.useEffect(() => {
    if (!hideBottomNavWhenRightOpen && !hideBottomNav) return
    setHidden(showRightContext || hideBottomNav)
    return () => setHidden(false)
  }, [hideBottomNav, hideBottomNavWhenRightOpen, setHidden, showRightContext])

  const hasLeftContext = showLeftContext && Boolean(leftContext)

  return (
    <div className={cn("relative min-h-0 flex-1 overflow-hidden", className)}>
      <div
        className="relative mx-auto flex h-full w-full min-h-0 gap-2 overflow-hidden px-2 py-3"
        style={{ maxWidth: resolvedWorkspaceMaxWidth }}
      >
        <AnimatePresence initial={false}>
          {hasLeftContext && (
            <motion.aside
              className="shrink-0 overflow-hidden"
              style={{ width: "20%", flexBasis: "20%" }}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="h-full overflow-hidden">{leftContext}</div>
            </motion.aside>
          )}
        </AnimatePresence>

        <main
          className={cn("min-w-0 overflow-hidden bg-background", centerClassName)}
          style={{ width: hasLeftContext ? "80%" : "100%", flexBasis: hasLeftContext ? "80%" : "100%" }}
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

      </div>

      <AnimatePresence>
        {rightContext && showRightContext && (
          <>
            <motion.div
              key="workspace-overlay"
              className="pointer-events-none absolute inset-0 z-10 bg-background/45"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.aside
              key="workspace-right-panel"
              className="absolute bottom-0 right-0 top-0 z-20 overflow-hidden border-l border-border/75 bg-card shadow-2xl pointer-events-auto"
              style={{ width: rightWidth, maxWidth: rightMaxWidth }}
              initial={{ x: "100%", opacity: 0.65 }}
              animate={{ x: "0%", opacity: 1 }}
              exit={{ x: "100%", opacity: 0.65 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="h-full overflow-hidden">
                {rightContext}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
