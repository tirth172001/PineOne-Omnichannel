"use client"

import { useMemo, useState } from "react"
import { CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { FoundationTableRow } from "@/app/component-docs/_lib/foundation-token-table"

function isColorValue(value: string) {
  if (!value || value === "-") return false
  const colorHints = ["#", "oklch(", "rgb(", "rgba(", "hsl(", "hsla(", "color-mix("]
  return colorHints.some((hint) => value.toLowerCase().startsWith(hint))
}

function buildExportObject(rows: FoundationTableRow[]) {
  const grouped = new Map<string, Record<string, string>>()

  for (const row of rows) {
    const section = grouped.get(row.section) ?? {}
    if (row.mode === "paired") {
      section[`${row.name}-light`] = row.light
      section[`${row.name}-dark`] = row.dark
    } else {
      section[row.name] = row.light
    }
    grouped.set(row.section, section)
  }

  return Object.fromEntries(grouped.entries())
}

function MappingInput({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-4 w-4 shrink-0 rounded border border-border"
        style={{ background: isColorValue(value) ? value : "transparent" }}
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 border-border bg-background font-mono text-[11px] text-foreground"
      />
    </div>
  )
}

export function FoundationTokenTable({
  initialRows,
}: {
  initialRows: FoundationTableRow[]
}) {
  const [rows, setRows] = useState(initialRows)

  const sectionEntries = useMemo(() => {
    const grouped = new Map<string, FoundationTableRow[]>()

    for (const row of rows) {
      const existing = grouped.get(row.section) ?? []
      existing.push(row)
      grouped.set(row.section, existing)
    }

    return Array.from(grouped.entries())
  }, [rows])

  const updateRow = (rowId: string, key: "light" | "dark", value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [key]: value } : row))
    )
  }

  const copyEditedValues = async () => {
    if (typeof window === "undefined") return
    await navigator.clipboard.writeText(JSON.stringify(buildExportObject(rows), null, 2))
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={copyEditedValues}
        >
          <CopyIcon />
          Copy Edited Foundations
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-[1.3fr_1fr_1fr] border-b border-border bg-muted/30">
          <div className="px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Name</div>
          <div className="px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Light</div>
          <div className="px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">Dark</div>
        </div>

        {sectionEntries.map(([section, sectionRows]) => (
          <div key={section}>
            <div className="border-y border-border bg-muted/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {section.replaceAll("-", " ")}
            </div>
            {sectionRows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1.3fr_1fr_1fr] gap-2 border-b border-border/60 px-4 py-2 text-sm"
              >
                <div className="self-center font-mono text-[12px] text-foreground">{row.name}</div>
                <MappingInput
                  value={row.light}
                  onChange={(value) => updateRow(row.id, "light", value)}
                />
                <MappingInput
                  value={row.dark}
                  onChange={(value) => updateRow(row.id, "dark", value)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
