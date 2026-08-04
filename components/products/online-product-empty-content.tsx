"use client"

import { PageHeader } from "@/components/ui/panels"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"

export function OnlineProductEmptyContent({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <WorkspaceShell
        centerMain={
          <div className="h-full overflow-y-auto p-4">
            <section className="rounded-lg border border-border/70 bg-card/80 p-6">
              <p className="text-sm text-muted-foreground">No content added yet.</p>
            </section>
          </div>
        }
      />
    </>
  )
}
