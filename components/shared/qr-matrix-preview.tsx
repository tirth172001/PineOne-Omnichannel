"use client"

import { useMemo } from "react"
import { CopyIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export const qrBackgroundSwatches = ["#FFFFFF", "#5478F8", "#4FD387", "#053B29", "#43A114", "#CC8108"] as const

function hashSeed(input: string) {
  let hash = 0
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

function isFinder(x: number, y: number, ox: number, oy: number) {
  if (x < ox || x >= ox + 7 || y < oy || y >= oy + 7) return false
  const lx = x - ox
  const ly = y - oy
  if (lx === 0 || lx === 6 || ly === 0 || ly === 6) return true
  if (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4) return true
  return false
}

function createQrMatrix(seed: string, size = 29) {
  const base = hashSeed(seed)
  const matrix: boolean[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => false))
  const finderOffsets: [number, number][] = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ]

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (finderOffsets.some(([ox, oy]) => isFinder(x, y, ox, oy))) {
        matrix[y][x] = true
        continue
      }
      const value = ((x + 17) * 2246822519) ^ ((y + 31) * 3266489917) ^ base
      const normalized = Math.abs(Math.sin(value) * 10000) % 1
      matrix[y][x] = normalized > 0.55
    }
  }

  return matrix
}

/** The bare scan pattern with no branding/chrome — reusable anywhere a "fake QR" is needed
 *  (app-download promos, etc.), not just the UPI payment context QrMatrixPreview renders.
 *  Always square: pass `size` (px) to scale it, otherwise it renders at its natural
 *  fixed-cell size (~288px, matching the original QrMatrixPreview look). */
export function QrCodeGrid({ seed, color = "#1F1F1F", size }: { seed: string; color?: string; size?: number }) {
  const matrix = useMemo(() => createQrMatrix(seed), [seed])
  const cols = matrix[0]?.length ?? 0

  return (
    <div
      className="grid aspect-square"
      style={
        size
          ? { width: size, height: size, gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${cols}, minmax(0, 1fr))`, gap: 1 }
          : { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: 2 }
      }
    >
      {matrix.flatMap((row, rowIndex) =>
        row.map((filled, colIndex) => (
          <div key={`${rowIndex}-${colIndex}`} className={cn("flex items-center justify-center", !size && "h-[8px] w-[8px]")}>
            {filled ? <span className="h-full w-full rounded-[1px]" style={{ backgroundColor: color }} /> : null}
          </div>
        ))
      )}
    </div>
  )
}

/** Deterministic, seed-driven fake QR code (not a real scannable code) used everywhere this
 *  app shows a merchant/store UPI QR — same look across the Store QR listing and the store
 *  detail "View & edit store QR" panel, just re-seeded per store/background so each looks unique. */
export function QrMatrixPreview({
  seed,
  backgroundColor,
  upiId,
}: {
  seed: string
  backgroundColor: string
  /** Shown in the bottom VPA bar. Omit to hide that bar entirely. */
  upiId?: string
}) {
  const darkBackground = backgroundColor !== "#FFFFFF"
  const qrColor = darkBackground ? "#FFFFFF" : "#1F1F1F"
  const subTextColor = darkBackground ? "rgba(255,255,255,0.85)" : "#333333"

  return (
    <div className="w-full overflow-hidden rounded-md border border-border/70">
      <div className="flex flex-col items-center justify-center gap-6 px-6 py-9" style={{ backgroundColor }}>
        <div className="text-center">
          <p className="text-[43px] font-semibold leading-none tracking-[-0.03em]" style={{ color: qrColor }}>
            pine labs
          </p>
          <p className="mt-2 text-sm font-medium" style={{ color: subTextColor }}>
            Scan & pay via any UPI apps
          </p>
        </div>

        <QrCodeGrid seed={seed} color={qrColor} />

        <div className="flex items-center gap-2">
          {["PhonePe", "Paytm", "GPay", "CRED", "+50"].map((label) => (
            <span
              key={label}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-medium"
              style={{
                borderColor: darkBackground ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.18)",
                color: darkBackground ? "#FFFFFF" : "#1F1F1F",
                backgroundColor: darkBackground ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.72)",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {upiId ? (
        <div className="flex items-center justify-center gap-2 bg-background px-6 py-2">
          <p className="text-sm font-medium text-foreground">UPI ID / VPA: {upiId}</p>
          <CopyIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      ) : null}
    </div>
  )
}
