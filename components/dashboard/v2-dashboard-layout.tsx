"use client"

import React, { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { isDummyAuthenticated } from "@/lib/dummy-auth"
import { NavVisibilityProvider } from "./nav-visibility-context"
import { V2Sidebar } from "./v2-sidebar"

interface V2DashboardLayoutProps {
  children: React.ReactNode
}

export function V2DashboardLayout({ children }: V2DashboardLayoutProps) {
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
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading workspace…
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <NavVisibilityProvider>
    <div className="relative flex h-screen overflow-hidden bg-background">
      <V2Sidebar />
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
    </NavVisibilityProvider>
  )
}
