"use client"

import { useEffect, useRef, useState } from "react"
import { useIsMobile } from "@/components/ui/use-mobile"
import { AnimatedNumberText } from "@/components/ui/animated-number-text"
import { cn } from "@/lib/utils"

export interface SectionSummaryMetric {
  label: string
  value: string
  delta?: string
}

interface SectionSummaryStripProps {
  metrics: SectionSummaryMetric[]
  className?: string
}

function SectionSummaryMetricCard({
  metric,
  mobile = false,
}: {
  metric: SectionSummaryMetric
  mobile?: boolean
}) {
  return (
    <div
      className={cn(
        "flex min-h-[86px] flex-col justify-center px-4 py-3",
        mobile && "w-[220px] shrink-0 snap-start sm:w-[240px]"
      )}
    >
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground">{metric.label}</p>
      <AnimatedNumberText
        value={metric.value}
        className="mt-2 text-[18px] leading-none font-semibold text-foreground"
      />
    </div>
  )
}

export function SectionSummaryStrip({
  metrics,
  className,
}: SectionSummaryStripProps) {
  const isMobile = useIsMobile()
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [showIndicators, setShowIndicators] = useState(false)

  const getCardWidth = () => {
    const node = trackRef.current
    const firstCard = node?.firstElementChild as HTMLElement | null
    if (!firstCard) return 220
    return firstCard.getBoundingClientRect().width
  }

  useEffect(() => {
    if (!metrics.length || !isMobile) {
      setShowIndicators(false)
      return
    }
    const node = trackRef.current
    if (!node) return

    const updateIndicators = () => {
      setShowIndicators(node.scrollWidth > node.clientWidth + 4 && metrics.length > 1)
    }
    updateIndicators()
    window.addEventListener("resize", updateIndicators)
    return () => window.removeEventListener("resize", updateIndicators)
  }, [isMobile, metrics.length])

  useEffect(() => {
    if (!metrics.length || !isMobile) return
    const node = trackRef.current
    if (!node) return

    const onScroll = () => {
      const cardWidth = getCardWidth()
      const index = Math.round(node.scrollLeft / cardWidth)
      setActiveIndex(Math.max(0, Math.min(metrics.length - 1, index)))
    }
    onScroll()
    node.addEventListener("scroll", onScroll, { passive: true })
    return () => node.removeEventListener("scroll", onScroll)
  }, [isMobile, metrics.length])

  if (!metrics.length) return null

  if (!isMobile) {
    return (
      <section className={cn("overflow-hidden rounded-lg border border-border/70 bg-card/80", className)}>
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] divide-x divide-y divide-border/65">
          {metrics.map((metric) => (
            <SectionSummaryMetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className={cn("overflow-hidden rounded-lg border border-border/70 bg-card/80", className)}>
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {metrics.map((metric) => (
          <div key={metric.label} className="border-r border-border/65 last:border-r-0">
            <SectionSummaryMetricCard metric={metric} mobile />
          </div>
        ))}
      </div>
      {showIndicators ? (
        <div className="flex items-center justify-center gap-1.5 border-t border-border/65 px-3 py-2">
          {metrics.map((metric, index) => (
            <button
              key={`${metric.label}-dot`}
              type="button"
              onClick={() => {
                const node = trackRef.current
                if (!node) return
                const cardWidth = getCardWidth()
                node.scrollTo({ left: index * cardWidth, behavior: "smooth" })
              }}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all",
                activeIndex === index ? "w-4 bg-primary" : "bg-muted-foreground/35 hover:bg-muted-foreground/60"
              )}
              aria-label={`View summary card ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
