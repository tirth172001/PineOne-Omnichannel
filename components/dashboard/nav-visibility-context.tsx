"use client"

import * as React from "react"

type NavVisibilityContextValue = {
  hidden: boolean
  setHidden: (hidden: boolean) => void
}

const NavVisibilityContext = React.createContext<NavVisibilityContextValue | null>(null)
const fallbackNavVisibilityContext: NavVisibilityContextValue = {
  hidden: false,
  setHidden: () => {},
}
let hasWarnedMissingProvider = false

export function NavVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = React.useState(false)

  const value = React.useMemo(
    () => ({
      hidden,
      setHidden,
    }),
    [hidden],
  )

  return <NavVisibilityContext.Provider value={value}>{children}</NavVisibilityContext.Provider>
}

export function useNavVisibility() {
  const context = React.useContext(NavVisibilityContext)
  if (!context) {
    if (process.env.NODE_ENV !== "production" && !hasWarnedMissingProvider) {
      console.warn("useNavVisibility used outside NavVisibilityProvider; applying fallback behavior.")
      hasWarnedMissingProvider = true
    }
    return fallbackNavVisibilityContext
  }
  return context
}
