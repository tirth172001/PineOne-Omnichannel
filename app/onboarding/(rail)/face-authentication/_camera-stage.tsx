"use client"

import { UserIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

// Shared simulated "camera feed" — an animated gradient standing in for a live video feed, with
// a face-guide oval. No real getUserMedia access; this is a visual simulation only, matching the
// prototype skill's "no real mutations / stub external dependencies" rule.
export function CameraStage({
  state,
  className,
}: {
  state: "idle" | "scanning" | "success"
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,var(--color-muted)_0%,var(--color-card)_50%,var(--color-muted)_100%)]",
        className
      )}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 motion-safe:animate-[pv9Drift_6s_ease-in-out_infinite] bg-[radial-gradient(circle_at_30%_30%,color-mix(in_oklch,var(--color-primary)_10%,transparent),transparent_60%)]"
        )}
      />
      <style>{`
        @keyframes pv9Drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(3%, -3%) scale(1.05); }
        }
        @keyframes pv9Pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>

      <div
        className={cn(
          "relative flex h-3/4 w-1/2 items-center justify-center rounded-[50%] border-2 border-dashed motion-safe:transition-colors motion-safe:duration-300",
          state === "idle" && "border-muted-foreground/30",
          state === "scanning" && "motion-safe:animate-[pv9Pulse_1.4s_ease-in-out_infinite] border-primary",
          state === "success" && "border-success"
        )}
      >
        <UserIcon
          size={64}
          weight="thin"
          className={cn(
            state === "idle" && "text-muted-foreground/40",
            state === "scanning" && "text-primary/60",
            state === "success" && "text-success/60"
          )}
        />
      </div>
    </div>
  )
}
