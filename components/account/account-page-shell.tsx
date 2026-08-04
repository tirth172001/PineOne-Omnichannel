"use client"

import { useEffect, type ReactNode } from "react"
import { PageHeader } from "@/components/ui/panels"
import { useAccountHeaderActions } from "@/components/account/account-header-actions-context"

type AccountPageShellProps = {
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
  embedded?: boolean
}

export function AccountPageShell({
  title,
  description,
  actions,
  children,
  embedded = false,
}: AccountPageShellProps) {
  const headerActions = useAccountHeaderActions()

  useEffect(() => {
    if (!embedded || !headerActions) return
    headerActions.setActions(actions ?? null)
    return () => headerActions.setActions(null)
  }, [actions, embedded, headerActions])

  if (embedded) {
    return (
      <div className="w-full space-y-8 pb-6">{children}</div>
    )
  }

  return (
    <>
      <PageHeader title={title} description={description}>
        {actions}
      </PageHeader>
      <div
        className="mx-auto w-full space-y-8 px-4 pb-6"
        style={{ maxWidth: "var(--dashboard-center-max-width, 1440px)" }}
      >
        {children}
      </div>
    </>
  )
}
