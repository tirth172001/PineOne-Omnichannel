import type { ReactNode } from "react"
import { PageHeader } from "@/components/ui/panels"

type AccountPageShellProps = {
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
}

export function AccountPageShell({
  title,
  description,
  actions,
  children,
}: AccountPageShellProps) {
  return (
    <>
      <PageHeader title={title} description={description}>
        {actions}
      </PageHeader>
      <div
        className="mx-auto w-full space-y-4 px-4 pb-6"
        style={{ maxWidth: "var(--dashboard-center-max-width, 1440px)" }}
      >
        {children}
      </div>
    </>
  )
}
