"use client"

import * as React from "react"

type NavVisibilityContextValue = {
  hidden: boolean
  setHidden: (hidden: boolean) => void
}

const NavVisibilityContext = React.createContext<NavVisibilityContextValue | null>(null)

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
    throw new Error("useNavVisibility must be used within NavVisibilityProvider")
  }
  return context
}

