// Recreated for the archived variants (the original helper was never committed).
// Owners are the unified Person model now (components/onboarding/onboarding-person.ts).
import type { Person } from "@/components/onboarding/onboarding-person"

export { initials } from "@/components/onboarding/onboarding-person"

export type Owner = Person & { hasDocument?: boolean }

// Avatar backgrounds for owner initials, cycled by position. CSS variables so they follow the theme.
const AVATAR_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

export function colorForIndex(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}
