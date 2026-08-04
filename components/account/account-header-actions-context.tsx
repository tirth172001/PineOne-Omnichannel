"use client"

import { createContext, type ReactNode, useContext, useMemo, useState } from "react"

type AccountHeaderActionsContextValue = {
  actions: ReactNode
  setActions: (next: ReactNode) => void
}

const AccountHeaderActionsContext = createContext<AccountHeaderActionsContextValue | null>(null)

export function AccountHeaderActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode>(null)

  const value = useMemo(
    () => ({
      actions,
      setActions,
    }),
    [actions]
  )

  return <AccountHeaderActionsContext.Provider value={value}>{children}</AccountHeaderActionsContext.Provider>
}

export function useAccountHeaderActions() {
  return useContext(AccountHeaderActionsContext)
}
