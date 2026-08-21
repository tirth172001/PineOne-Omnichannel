"use client"

import { motion, type Variants } from "framer-motion"

// Ticket 09 (.scratch/onboarding-experience-v2/issues/09-establish-substep-motion-pattern.md):
// field-level choreography for sub-step transitions, replacing the old whole-panel cross-fade.
// Wrap a step's content in <StaggerFields>, then wrap each field/heading/CTA that should
// cascade in <StaggerField> — variants propagate down automatically since the children only
// declare `variants`, not their own initial/animate. Old fields fade out + translate up on exit;
// new fields fade in from below, offset ~60ms after the previous one.
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
  exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
}

export const staggerField: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.18, ease: "easeIn" } },
}

export function StaggerFields({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerContainer} initial="hidden" animate="visible" exit="exit">
      {children}
    </motion.div>
  )
}

export function StaggerField({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerField}>
      {children}
    </motion.div>
  )
}
