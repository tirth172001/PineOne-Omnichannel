"use client"

import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type Hsv = { h: number; s: number; v: number }

function hsvToHex(h: number, s: number, v: number) {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function hexToHsv(hex: string): Hsv {
  const clean = hex.replace("#", "")
  const normalized = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean
  const bigint = Number.parseInt(normalized, 16)
  if (Number.isNaN(bigint) || normalized.length !== 6) return { h: 0, s: 0, v: 0 }
  const r = ((bigint >> 16) & 255) / 255
  const g = ((bigint >> 8) & 255) / 255
  const b = (bigint & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : d / max
  const v = max
  return { h, s, v }
}

export function ColorPickerPopover({
  value,
  onChange,
  trigger,
}: {
  value: string | null
  onChange: (hex: string) => void
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value ?? "#173814"))
  const [hex, setHex] = useState(value ?? "#173814")
  const squareRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const base = value ?? "#173814"
    setHex(base)
    setHsv(hexToHsv(base))
  }, [open, value])

  function applyHsv(next: Hsv) {
    setHsv(next)
    setHex(hsvToHex(next.h, next.s, next.v))
  }

  function updateFromSquare(clientX: number, clientY: number) {
    const el = squareRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const s = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const v = 1 - Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
    applyHsv({ ...hsv, s, v })
  }

  function updateFromHue(clientX: number) {
    const el = hueRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    applyHsv({ ...hsv, h: ratio * 360 })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-72 gap-3">
        <div
          ref={squareRef}
          onPointerDown={(event) => {
            ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
            updateFromSquare(event.clientX, event.clientY)
          }}
          onPointerMove={(event) => {
            if (event.buttons !== 1) return
            updateFromSquare(event.clientX, event.clientY)
          }}
          className="relative h-44 w-full touch-none rounded-md"
          style={{
            backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
            backgroundImage:
              "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
          }}
        >
          <div
            className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
            style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
          />
        </div>

        <div
          ref={hueRef}
          onPointerDown={(event) => {
            ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
            updateFromHue(event.clientX)
          }}
          onPointerMove={(event) => {
            if (event.buttons !== 1) return
            updateFromHue(event.clientX)
          }}
          className="relative h-3 w-full touch-none rounded-full"
          style={{ background: "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)" }}
        >
          <div
            className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
            style={{ left: `${(hsv.h / 360) * 100}%` }}
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-sm text-foreground">Hex</p>
          <Input
            value={hex}
            onChange={(event) => {
              const raw = event.target.value
              setHex(raw)
              if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw)) setHsv(hexToHsv(raw))
            }}
          />
        </div>

        <Button
          className="w-full"
          onClick={() => {
            onChange(hex)
            setOpen(false)
          }}
        >
          Done
        </Button>
      </PopoverContent>
    </Popover>
  )
}
