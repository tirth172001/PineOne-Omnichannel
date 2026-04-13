"use client"

import React, { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { SidebarProvider } from "@/lib/sidebar-context"
import { isDummyAuthenticated } from "@/lib/dummy-auth"
import { AppTopbar } from "./app-topbar"
import { NavVisibilityProvider } from "./nav-visibility-context"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [authReady, setAuthReady] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const isAuthenticated = isDummyAuthenticated()
    setAuthenticated(isAuthenticated)
    setAuthReady(true)
    if (!isAuthenticated) {
      router.replace("/login")
    }
  }, [pathname, router])

  if (!authReady) {
    return <div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">Loading workspace…</div>
  }

  if (!authenticated) {
    return null
  }

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
    <div className="relative flex h-screen overflow-hidden bg-background">
      <AppTopbar pathname={pathname} />
      <div className="min-w-0 flex flex-1 flex-col overflow-hidden">
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
    </div>
  )
}
