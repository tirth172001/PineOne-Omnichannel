"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { SidebarProvider } from "@/lib/sidebar-context"
import { AppTopbar } from "./app-topbar"
import { NavVisibilityProvider } from "./nav-visibility-context"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <NavVisibilityProvider>
        <LayoutBody pathname={pathname}>{children}</LayoutBody>
      </NavVisibilityProvider>
    </SidebarProvider>
  )
}

function LayoutBody({ pathname, children }: { pathname: string; children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen flex-col bg-background">
      <AppTopbar pathname={pathname} />
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={pathname}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
