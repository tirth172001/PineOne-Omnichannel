"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

// This branch happens at the signup fork, before the post-business-name sequence — it's a
// sibling to tickets 02–10, not part of that rail. A simple centered shell (matching the
// login page's page-background convention) is enough for its 2–3 quick screens.
export function RequestAccessShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted ? resolvedTheme !== "light" : true

  return (
    <div className="min-h-screen bg-sidebar p-2">
      <div className="relative flex h-[calc(100vh-1rem)] w-full items-center justify-center rounded-md bg-background">
        <div className="absolute left-5 top-5 sm:left-8 sm:top-8">
          <img
            alt="Pine One"
            className="h-7 w-auto"
            src={isDark ? "/brand/pineone-omni-logo.svg" : "/brand/pineone-omni-logo-light.svg"}
          />
        </div>
        {children}
      </div>
    </div>
  )
}
