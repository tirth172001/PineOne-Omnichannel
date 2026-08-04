"use client"

import * as React from "react"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

type AnimatedNumberTextProps = {
  value: string | number
  className?: string
  delay?: number
}

export function AnimatedNumberText({
  value,
  className,
  delay = 0,
}: AnimatedNumberTextProps) {
  const displayValue = typeof value === "number" ? value.toLocaleString("en-IN") : value
  const splittedText = displayValue.split("")
  const containerRef = React.useRef<HTMLSpanElement | null>(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.35 })

  const pullupVariant = {
    initial: { y: -10, opacity: 0 },
    animate: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: delay + i * 0.05,
      },
    }),
  }

  return (
    <span
      ref={containerRef}
      className={cn("inline-flex items-baseline whitespace-nowrap", className)}
      aria-label={displayValue}
    >
      {splittedText.map((current, i) => (
        <motion.span
          key={`${displayValue}-${i}`}
          variants={pullupVariant}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          custom={i}
          className="inline-block"
        >
          {current === " " ? "\u00A0" : current}
        </motion.span>
      ))}
    </span>
  )
}
