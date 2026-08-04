"use client"

import { CrossBorderContent, type CrossBorderSection } from "@/components/cross-border/cross-border-content"

export function CrossBorderRouteContent({ initialSection = "overview" }: { initialSection?: CrossBorderSection } = {}) {
  return <CrossBorderContent initialSection={initialSection} />
}
