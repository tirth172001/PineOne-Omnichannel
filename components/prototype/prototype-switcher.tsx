"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react"

export type PrototypeVariant = { key: string; name: string }

// Shared floating variant switcher for /prototype-skill UI prototypes. Hidden in production
// builds — never meant to ship. Reused across wayfinder tickets under .scratch/onboarding-experience.
export function PrototypeSwitcher({ variants, current }: { variants: PrototypeVariant[]; current: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (process.env.NODE_ENV === "production") return null

  const currentIndex = Math.max(0, variants.findIndex((variant) => variant.key === current))
  const active = variants[currentIndex]

  function goTo(index: number) {
    const nextIndex = (index + variants.length) % variants.length
    const params = new URLSearchParams(searchParams.toString())
    params.set("variant", variants[nextIndex].key)
    router.replace(`${pathname}?${params.toString()}`)
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const isEditable =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable
      if (isEditable) return
      if (event.key === "ArrowLeft") goTo(currentIndex - 1)
      if (event.key === "ArrowRight") goTo(currentIndex + 1)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-popover/95 p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 backdrop-blur">
        <button
          type="button"
          aria-label="Previous variant"
          className="inline-flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => goTo(currentIndex - 1)}
        >
          <CaretLeftIcon size={16} weight="bold" />
        </button>
        <span className="min-w-[13rem] px-1 text-center text-xs font-medium">
          <span className="font-semibold">{active.key}</span> — {active.name}
        </span>
        <button
          type="button"
          aria-label="Next variant"
          className="inline-flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => goTo(currentIndex + 1)}
        >
          <CaretRightIcon size={16} weight="bold" />
        </button>
      </div>
    </div>
  )
}
