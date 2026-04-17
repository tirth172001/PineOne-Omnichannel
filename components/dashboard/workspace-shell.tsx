"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { DASHBOARD_CONTENT_MAX_WIDTH } from "@/lib/dashboard-layout"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/components/ui/use-mobile"
import { useNavVisibility } from "./nav-visibility-context"
import { useResolvedDemoMaxWidth } from "./use-demo-settings"

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
  rightMaxWidth,
  centerMaxWidth,
  workspaceMaxWidth = DASHBOARD_CONTENT_MAX_WIDTH,
  hideBottomNavWhenRightOpen = false,
  hideBottomNav = false,
  className,
  centerClassName,
}: WorkspaceShellProps) {
  const { setHidden } = useNavVisibility()
  const isMobile = useIsMobile()
  const demoMaxWidth = useResolvedDemoMaxWidth()

  const resolvedCenterMaxWidth =
    centerMaxWidth ??
    (workspaceMaxWidth === DASHBOARD_CONTENT_MAX_WIDTH ? demoMaxWidth : workspaceMaxWidth)

  React.useEffect(() => {
    if (!hideBottomNavWhenRightOpen && !hideBottomNav) return
    setHidden(showRightContext || hideBottomNav)
    return () => setHidden(false)
  }, [hideBottomNav, hideBottomNavWhenRightOpen, setHidden, showRightContext])

  const hasLeftContext = showLeftContext && Boolean(leftContext) && !isMobile
  const hasRightContext = showRightContext && Boolean(rightContext)
  const resolvedRightWidth = rightMaxWidth
    ? Math.min(rightWidth, rightMaxWidth)
    : rightWidth

  return (
    <div className={cn("relative w-full", className)}>
      <div
        className="mx-auto flex w-full items-start gap-3"
        style={workspaceMaxWidth ? { maxWidth: workspaceMaxWidth } : undefined}
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
              <div className="w-full" style={{ width: leftWidth }}>
                {leftContext}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Center panel — flex-1 so it fills remaining space and shrinks when right panel opens */}
        <main
          className={cn(
            "min-w-0 flex-1",
            centerClassName
          )}
        >
          <div
            className="mx-auto w-full min-w-0"
            style={resolvedCenterMaxWidth ? { maxWidth: resolvedCenterMaxWidth } : undefined}
          >
            <div>
              {centerMain}
            </div>
          </div>
        </main>

      </div>

      {/* Right panel — overlay, does not affect center panel layout */}
      <AnimatePresence initial={false}>
        {hasRightContext ? (
          isMobile ? (
            <motion.aside
              key="right-panel-mobile-sheet"
              className="fixed inset-x-2 bottom-16 z-40 h-[min(78dvh,680px)] overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl"
              initial={{ y: 32, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="h-full overflow-y-auto">
                {rightContext}
              </div>
            </motion.aside>
          ) : (
            <motion.aside
              key="right-panel-overlay"
              className="fixed right-3 z-40 overflow-hidden rounded-lg border border-border/70 bg-card shadow-xl"
              style={{
                top: "calc(var(--dashboard-top-offset, 0px) + 12px)",
                height: "calc(100vh - var(--dashboard-top-offset, 0px) - 24px)",
                width: resolvedRightWidth,
              }}
              initial={{ x: 28, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 28, opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="h-full overflow-y-auto">
                {rightContext}
              </div>
            </motion.aside>
          )
        ) : null}
      </AnimatePresence>
    </div>
  )
}
