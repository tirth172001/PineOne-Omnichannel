"use client"

import * as React from "react"

export type NavMode = "bottom" | "top"

type NavModeContextValue = {
  mode: NavMode
  setMode: (mode: NavMode) => void
}

const NavModeContext = React.createContext<NavModeContextValue | null>(null)
const STORAGE_KEY = "pine-nav-mode"

export function NavModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<NavMode>("top")

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === "top" || stored === "bottom") {
        setMode(stored)
      }
    } catch {
      // no-op: keep default when storage is unavailable
    }
  }, [])

  const updateMode = React.useCallback((nextMode: NavMode) => {
    setMode(nextMode)
    try {
      window.localStorage.setItem(STORAGE_KEY, nextMode)
    } catch {
      // no-op
    }
  }, [])

  const value = React.useMemo(
    () => ({
      mode,
      setMode: updateMode,
    }),
    [mode, updateMode],
  )

  return <NavModeContext.Provider value={value}>{children}</NavModeContext.Provider>
}

export function useNavMode() {
  const context = React.useContext(NavModeContext)
  if (!context) {
    throw new Error("useNavMode must be used within NavModeProvider")
  }
  return context
}

