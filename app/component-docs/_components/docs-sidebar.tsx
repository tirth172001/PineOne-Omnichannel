"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import {
  componentRegistry,
  docsCategories,
} from "@/app/component-docs/_lib/component-registry"

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 h-screen overflow-y-auto border-r border-border/40 px-5 py-8">
      <div className="space-y-7">
        <div className="space-y-2">
          <p className="px-2 text-xs text-muted-foreground">Sections</p>
          <nav className="space-y-1">
            <Link
              href="/component-docs#foundations"
              className={cn(
                "block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                pathname === "/component-docs" ? "bg-accent text-foreground" : "text-muted-foreground"
              )}
            >
              Foundations
            </Link>
          </nav>
        </div>

        <div className="space-y-3">
          <p className="px-2 text-xs text-muted-foreground">Components</p>
          <div className="space-y-5">
            {docsCategories
              .filter((category) => category !== "Foundations")
              .map((category) => {
                const group = componentRegistry.filter((item) => item.category === category)
                if (!group.length) return null

                return (
                  <div key={category} className="space-y-1.5">
                    <p className="px-2 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground/80">
                      {category}
                    </p>
                    <nav className="space-y-1">
                      {group.map((component) => {
                        const href = `/component-docs/${component.slug}`
                        const active = pathname === href

                        return (
                          <Link
                            key={component.slug}
                            href={href}
                            className={cn(
                              "block rounded-lg px-3 py-2 text-sm transition-colors",
                              active
                                ? "bg-accent text-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                          >
                            {component.title}
                          </Link>
                        )
                      })}
                    </nav>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </aside>
  )
}
