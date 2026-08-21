"use client"

import { motion } from "framer-motion"

// Ticket 09 (.scratch/onboarding-experience-v2/issues/09-establish-substep-motion-pattern.md):
// this is what "seamless extension" resolves to on the preview panel — a skeleton resolving into
// its confirmed value was previously an instant, un-animated DOM swap (the exact "sudden new UI"
// feeling flagged in the ticket). Crossfades the swap in place instead.
//
// Deliberately not an AnimatePresence mode="wait" swap (that was the original approach) — every
// RevealField here lives nested inside DocumentBody's own AnimatePresence-plus-`layout` section
// list, and that nesting made the exit/enter sequencing stall: the value would resolve correctly
// in the data (confirmed via the `show` prop flipping true) but the skeleton never actually
// finished handing off to it, leaving fields the user had already filled in reading as still
// loading. A plain conditional render with a fade-in on the incoming value sidesteps the exit
// choreography entirely — the skeleton just disappears instantly rather than fading out, a minor
// cosmetic trade for not silently freezing.
export function RevealField({
  show,
  skeleton,
  children,
}: {
  show: boolean
  skeleton: React.ReactNode
  children: React.ReactNode
}) {
  if (!show) return <>{skeleton}</>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.22, ease: "easeOut" }}>
      {children}
    </motion.div>
  )
}
