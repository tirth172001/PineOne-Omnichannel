import pineOneFreshTokens from "@/app/component-docs/_data/pineone-fresh.tokens.json"

type JsonLike = Record<string, unknown>

export type FoundationTableRow = {
  id: string
  section: string
  name: string
  light: string
  dark: string
  mode: "paired" | "single"
}

const SECTION_ORDER = [
  "colors",
  "font",
  "text",
  "font-weight",
  "radius",
  "shadow",
  "inset-shadow",
  "drop-shadow",
  "blur",
  "breakpoint",
  "container",
] as const

function isRecord(value: unknown): value is JsonLike {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeTokenValue(input: unknown): string {
  if (input === null || input === undefined) return "-"
  if (typeof input === "string") return input
  if (typeof input === "number" || typeof input === "boolean") return String(input)
  if (Array.isArray(input)) return input.map((item) => normalizeTokenValue(item)).join(", ")
  if (!isRecord(input)) return String(input)

  if (typeof input.hex === "string") return input.hex
  if ("$value" in input) return normalizeTokenValue(input.$value)

  const entries = Object.entries(input).filter(([key]) => key !== "$extensions")
  if (entries.length === 0) return "-"

  return entries.map(([key, value]) => `${key}: ${normalizeTokenValue(value)}`).join(" | ")
}

function prettifySectionName(section: string) {
  return section.replaceAll("-", " ")
}

function sectionSortIndex(section: string) {
  const index = SECTION_ORDER.findIndex((value) => value === section)
  return index === -1 ? Number.MAX_SAFE_INTEGER : index
}

function getSectionRows(section: string, data: JsonLike): FoundationTableRow[] {
  const paired = new Map<string, FoundationTableRow>()
  const singles: FoundationTableRow[] = []

  for (const [rawName, tokenValue] of Object.entries(data)) {
    if (rawName.startsWith("$")) continue

    const value = normalizeTokenValue(tokenValue)
    const match = rawName.match(/^(.*)-(light|dark)$/)

    if (match) {
      const baseName = match[1]
      const mode = match[2] as "light" | "dark"
      const existing = paired.get(baseName) ?? {
        id: `${section}:${baseName}`,
        section,
        name: baseName,
        light: "-",
        dark: "-",
        mode: "paired" as const,
      }

      existing[mode] = value
      paired.set(baseName, existing)
      continue
    }

    singles.push({
      id: `${section}:${rawName}`,
      section,
      name: rawName,
      light: value,
      dark: value,
      mode: "single",
    })
  }

  return [...paired.values(), ...singles].sort((a, b) => a.name.localeCompare(b.name))
}

export function getFoundationTableRows(): FoundationTableRow[] {
  const tokenRoot = pineOneFreshTokens as JsonLike

  const rows = Object.entries(tokenRoot)
    .filter(([section]) => !section.startsWith("$"))
    .flatMap(([section, value]) => {
      if (!isRecord(value)) return []
      return getSectionRows(section, value)
    })

  return rows.sort((a, b) => {
    const sectionDelta = sectionSortIndex(a.section) - sectionSortIndex(b.section)
    if (sectionDelta !== 0) return sectionDelta
    return a.name.localeCompare(b.name)
  })
}

export function getFoundationSectionTitles(rows: FoundationTableRow[]) {
  const sectionSet = new Set(rows.map((row) => row.section))
  const ordered = Array.from(sectionSet).sort((a, b) => {
    const sectionDelta = sectionSortIndex(a) - sectionSortIndex(b)
    if (sectionDelta !== 0) return sectionDelta
    return a.localeCompare(b)
  })

  return ordered.map((section) => ({
    id: section,
    label: prettifySectionName(section),
  }))
}
