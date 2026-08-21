"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CheckIcon, CircleNotchIcon, TrashIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { initials, type Person } from "./onboarding-person"

// Unified person card — avatar, name, designation, ownership %, a "Signatory" badge, and a
// verification badge that animates from spinner (verifying) to checkmark (verified) once face
// authentication succeeds. Resolved by ticket 14
// (.scratch/onboarding-experience/issues/14-unify-person-model-and-card.md).
export function PersonCard({
  person,
  selected,
  onClick,
  onRemove,
}: {
  person: Person
  selected?: boolean
  onClick?: () => void
  onRemove?: () => void
}) {
  const interactive = Boolean(onClick)

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors",
        selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card",
        interactive && !selected && "hover:bg-muted/60",
        !interactive && "cursor-default"
      )}
    >
      <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
        {initials(person.name)}
        {person.verificationStatus !== "unverified" ? (
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border-2 border-card",
              person.verificationStatus === "verified" ? "bg-success" : "bg-primary"
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {person.verificationStatus === "verified" ? (
                <motion.span
                  key="verified"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="flex items-center justify-center text-success-foreground"
                >
                  <CheckIcon size={9} weight="bold" />
                </motion.span>
              ) : (
                <motion.span
                  key="verifying"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center text-primary-foreground"
                >
                  <CircleNotchIcon size={9} weight="bold" className="animate-spin" />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        ) : null}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-foreground">
            {person.designation || person.name}
          </span>
          {person.isSignatory ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              Signatory
            </span>
          ) : null}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {[person.designation ? person.name : null, person.ownershipPercent > 0 ? `${person.ownershipPercent}% ownership` : null]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </span>

      {onRemove ? (
        <span
          role="button"
          tabIndex={0}
          aria-label={`Remove ${person.name}`}
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
        >
          <TrashIcon size={14} />
        </span>
      ) : null}
    </button>
  )
}
