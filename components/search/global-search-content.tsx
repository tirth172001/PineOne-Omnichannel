"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowUpRight, Search } from "lucide-react"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/panels"
import { readDummyAuthSession } from "@/lib/dummy-auth"
import { getConfiguredProductNames, getGlobalSearchItems, type GlobalSearchItem } from "@/lib/global-search"
import { cn } from "@/lib/utils"

function kindLabel(kind: GlobalSearchItem["kind"]) {
  if (kind === "action") return "Action"
  if (kind === "config") return "Config"
  return "Page"
}

function kindStyles(kind: GlobalSearchItem["kind"]) {
  if (kind === "action") return "bg-primary/15 text-primary"
  if (kind === "config") return "bg-warning/15 text-warning"
  return "bg-muted text-muted-foreground"
}

export function GlobalSearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState("")
  const [profileRole, setProfileRole] = useState("Admin")

  const fromPath = searchParams.get("from") ?? "/"
  const configuredProducts = useMemo(() => getConfiguredProductNames(), [])

  useEffect(() => {
    const session = readDummyAuthSession()
    if (session) {
      setProfileRole(session.role)
    }
  }, [])

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "")
  }, [searchParams])

  const results = useMemo(
    () =>
      getGlobalSearchItems({
        pathname: fromPath,
        query,
        profileRole,
        configuredProducts,
        limit: 28,
      }),
    [configuredProducts, fromPath, profileRole, query]
  )

  return (
    <>
      <PageHeader
        title="Search"
        description="Find pages, actions, and product configuration shortcuts across the workspace."
      />
      <WorkspaceShell
        centerMain={
          <div className="space-y-3 px-4 pb-6">
            <Card className="rounded-lg border-border/70 bg-card">
              <CardContent className="space-y-4 p-4">
                <div className="relative max-w-xl">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoFocus
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search pages, actions, products, and settings..."
                    className="h-10 rounded-md border-border/70 bg-background pl-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {query.trim() ? "Best matches" : "Most probable"}
                    </p>
                    <Badge variant="outline" className="rounded-md text-[10px]">
                      {results.length} suggestions
                    </Badge>
                  </div>

                  {results.length > 0 ? (
                    <div className="space-y-1">
                      {results.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => router.push(item.href)}
                          className="flex w-full items-start gap-3 rounded-md border border-transparent px-3 py-2 text-left transition-colors hover:border-border/60 hover:bg-muted/45"
                        >
                          <span
                            className={cn(
                              "inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[10px] font-semibold",
                              kindStyles(item.kind)
                            )}
                          >
                            {kindLabel(item.kind)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-foreground">
                              {item.title}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          </span>
                          <ArrowUpRight className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-md border border-dashed border-border/60 px-3 py-8 text-center text-sm text-muted-foreground">
                      No results found. Try terms like <span className="font-medium">reports</span>,{" "}
                      <span className="font-medium">refunds</span>, or{" "}
                      <span className="font-medium">settings</span>.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        }
      />
    </>
  )
}
