"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSidebarSections, type NavItem, type NavSection, type SidebarProduct } from "@/lib/navigation/navigation-model"

function NavGroup({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem
  pathname: string
  onNavigate?: () => void
}) {
  const isActive = item.matcher ? item.matcher(pathname) : pathname === item.href
  const hasSubItems = item.subItems && item.subItems.length > 0
  const [open, setOpen] = useState(isActive)

  useEffect(() => {
    if (isActive) setOpen(true)
  }, [isActive])

  const Icon = item.icon

  // Leaf item (no children) — renders as a link
  if (!hasSubItems && item.href) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-muted/55 text-foreground font-semibold shadow-[inset_0_0_0_1px_hsl(var(--border)/0.45)]"
            : "text-muted-foreground/90 hover:bg-muted/70 hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.label}</span>
        {item.comingSoon ? (
          <span className="ml-auto rounded-sm border border-border/70 bg-muted/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Soon
          </span>
        ) : null}
      </Link>
    )
  }

  // Parent item — button only, no navigation
  const activeSubHref = item.subItems?.find(
    (s) => pathname === s.href
  )?.href ?? null
  const activeSubIndex = item.subItems?.findIndex((s) => s.href === activeSubHref) ?? -1
  const subRowHeight = 34
  const subRowGap = 2
  const subRowsTopOffset = 4
  const activeRowCenterY = activeSubIndex >= 0
    ? subRowsTopOffset + activeSubIndex * (subRowHeight + subRowGap) + subRowHeight / 2
    : 0
  const connectorHeight = Math.max(16, Math.ceil(activeRowCenterY) + 4)

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "text-foreground"
            : "text-muted-foreground/90 hover:bg-muted/70 hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open ? "rotate-180" : ""
          )}
        />
      </button>

      {open && (
        <div className="relative mt-0.5 flex flex-col gap-0.5 pb-1 pt-1">
          {activeSubIndex >= 0 && (
            <svg
              aria-hidden
              className="pointer-events-none absolute left-[19px] top-0 z-10 overflow-visible"
              style={{ color: "rgba(255, 255, 255, 0.7)" }}
              width="14"
              height={connectorHeight}
              viewBox={`0 0 14 ${connectorHeight}`}
              fill="none"
            >
              <path
                d={`M1 1 V${activeRowCenterY} H9`}
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={`M6 ${activeRowCenterY - 3} L9 ${activeRowCenterY} L6 ${activeRowCenterY + 3}`}
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {item.subItems!.map((sub) => {
            const subActive = activeSubHref === sub.href
            return (
              <Link
                key={sub.href}
                href={sub.href}
                onClick={onNavigate}
                className={cn(
                  "flex h-[34px] w-full items-center rounded-lg px-3 pl-[38px] text-[13px] transition-colors",
                  subActive
                    ? "bg-muted/55 text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="truncate">{sub.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function V2Sidebar({ product = "payments" }: { product?: SidebarProduct }) {
  const pathname = usePathname()
  const navSections = getSidebarSections(product)

  return (
    <V2SidebarContent pathname={pathname} navSections={navSections} />
  )
}

type V2SidebarContentProps = {
  pathname: string
  navSections: NavSection[]
  mobile?: boolean
  onNavigate?: () => void
}

function V2SidebarContent({ pathname, navSections, mobile = false, onNavigate }: V2SidebarContentProps) {
  const navClassName = mobile
    ? "flex max-h-[76dvh] flex-col gap-5 overflow-y-auto px-3 py-3"
    : "flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4"

  if (mobile) {
    return (
      <nav className={navClassName}>
        {navSections.map((section, si) => (
          <div key={si} className={cn("flex flex-col gap-0.5", si > 0 ? "border-t border-border/35 pt-4" : "")}>
            {section.label && (
              <p className="mb-1 px-3 text-[12px] font-semibold tracking-[0.01em] text-muted-foreground/80">
                {section.label}
              </p>
            )}
            {section.items.map((item, ii) => (
              <NavGroup
                key={`${si}-${ii}-${item.href ?? item.label}`}
                item={item}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </nav>
    )
  }

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 self-start flex-col bg-sidebar md:flex">
      <nav className={navClassName}>
        {navSections.map((section, si) => (
          <div key={si} className={cn("flex flex-col gap-0.5", si > 0 ? "border-t border-border/35 pt-4" : "")}>
            {section.label && (
              <p className="mb-1 px-3 text-[12px] font-semibold tracking-[0.01em] text-muted-foreground/80">
                {section.label}
              </p>
            )}
            {section.items.map((item, ii) => (
              <NavGroup key={`${si}-${ii}-${item.href ?? item.label}`} item={item} pathname={pathname} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}

export function V2SidebarMobile({
  product = "payments",
  onNavigate,
}: {
  product?: SidebarProduct
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const navSections = getSidebarSections(product)

  return (
    <V2SidebarContent pathname={pathname} navSections={navSections} mobile onNavigate={onNavigate} />
  )
}
