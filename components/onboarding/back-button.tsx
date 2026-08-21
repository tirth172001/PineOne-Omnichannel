"use client"

import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "@phosphor-icons/react"

// Ticket 08 (.scratch/onboarding-experience-v2/issues/08-add-back-navigation.md): a single
// reusable back control, driven by router.back() rather than a hardcoded prev-route map, so it
// works correctly across both the onboarding sequence and the signup sequence without either
// needing to know about the other's routes.
export function BackButton({ className }: { className?: string }) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={className ?? "mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"}
    >
      <ArrowLeftIcon size={14} weight="bold" />
      Back
    </button>
  )
}
