"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CaretLeftIcon, CaretRightIcon, CopyIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { componentRegistry } from "@/app/component-docs/_lib/component-registry"

export function DocsPageActions() {
  const pathname = usePathname()
  const slug = pathname.startsWith("/component-docs/") ? pathname.split("/")[2] : null
  const index = slug
    ? componentRegistry.findIndex((component) => component.slug === slug)
    : -1

  const prevHref =
    index > 0 ? `/component-docs/${componentRegistry[index - 1].slug}` : null
  const nextHref =
    index >= 0 && index < componentRegistry.length - 1
      ? `/component-docs/${componentRegistry[index + 1].slug}`
      : null

  const copyPage = async () => {
    if (typeof window === "undefined") return
    await navigator.clipboard.writeText(window.location.href)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        className="h-10 rounded-xl"
        onClick={copyPage}
      >
        <CopyIcon />
        Copy Page
      </Button>

      {prevHref ? (
        <Button
          asChild
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-xl"
        >
          <Link href={prevHref} aria-label="Previous page">
            <CaretLeftIcon />
          </Link>
        </Button>
      ) : null}

      {nextHref ? (
        <Button
          asChild
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-xl"
        >
          <Link href={nextHref} aria-label="Next page">
            <CaretRightIcon />
          </Link>
        </Button>
      ) : null}
    </div>
  )
}
