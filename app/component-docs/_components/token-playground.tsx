"use client"

import { useMemo, useState } from "react"
import { CopyIcon, MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ComponentPreview } from "@/app/component-docs/_components/component-preview"

type ThemeMode = "light" | "dark"

type ThemeToken = {
  name: string
  light: string
  dark: string
}

type TokenGroup = {
  title: string
  tokens: ThemeToken[]
}

type ComponentRole = {
  id: string
  label: string
  targetToken: string
  kind: "color" | "radius"
  defaultRadiusSemantic?: RadiusSemanticToken
}

type LinkedTokenValues = {
  values: Record<ThemeMode, Record<string, string>>
  overrides: Record<ThemeMode, Record<string, boolean>>
}

type RadiusRawToken =
  | "radius-raw-none"
  | "radius-raw-xs"
  | "radius-raw-sm"
  | "radius-raw-md"
  | "radius-raw-lg"
  | "radius-raw-xl"
  | "radius-raw-pill"

type RadiusFoundationToken =
  | "radius-token-xs"
  | "radius-token-sm"
  | "radius-token-md"
  | "radius-token-lg"
  | "radius-token-xl"
  | "radius-token-pill"

type RadiusSemanticToken =
  | "semantic-control-radius"
  | "semantic-surface-radius"
  | "semantic-panel-radius"
  | "semantic-pill-radius"

const RADIUS_RAW_ORDER: RadiusRawToken[] = [
  "radius-raw-none",
  "radius-raw-xs",
  "radius-raw-sm",
  "radius-raw-md",
  "radius-raw-lg",
  "radius-raw-xl",
  "radius-raw-pill",
]

const RADIUS_FOUNDATION_ORDER: RadiusFoundationToken[] = [
  "radius-token-xs",
  "radius-token-sm",
  "radius-token-md",
  "radius-token-lg",
  "radius-token-xl",
  "radius-token-pill",
]

const RADIUS_SEMANTIC_ORDER: RadiusSemanticToken[] = [
  "semantic-control-radius",
  "semantic-surface-radius",
  "semantic-panel-radius",
  "semantic-pill-radius",
]

const DEFAULT_RADIUS_FOUNDATION_MAP: Record<RadiusFoundationToken, RadiusRawToken> = {
  "radius-token-xs": "radius-raw-xs",
  "radius-token-sm": "radius-raw-sm",
  "radius-token-md": "radius-raw-md",
  "radius-token-lg": "radius-raw-lg",
  "radius-token-xl": "radius-raw-xl",
  "radius-token-pill": "radius-raw-pill",
}

const DEFAULT_RADIUS_SEMANTIC_MAP: Record<RadiusSemanticToken, RadiusFoundationToken> = {
  "semantic-control-radius": "radius-token-md",
  "semantic-surface-radius": "radius-token-lg",
  "semantic-panel-radius": "radius-token-xl",
  "semantic-pill-radius": "radius-token-pill",
}

const DEFAULT_RADIUS_RAW_VALUES: Record<RadiusRawToken, string> = {
  "radius-raw-none": "0rem",
  "radius-raw-xs": "0.25rem",
  "radius-raw-sm": "0.5rem",
  "radius-raw-md": "0.625rem",
  "radius-raw-lg": "0.75rem",
  "radius-raw-xl": "1rem",
  "radius-raw-pill": "9999px",
}

const FOUNDATION_COLOR_TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
  "success",
  "success-foreground",
  "warning",
  "warning-foreground",
  "olive-surface-soft",
  "olive-surface-main",
  "olive-surface-panel",
  "olive-surface-panel-hover",
  "olive-surface-chip",
  "olive-surface-chart",
  "olive-surface-alt",
] as const

const FOUNDATION_SHADOW_TOKENS = [
  "shadow-x",
  "shadow-y",
  "shadow-blur",
  "shadow-spread",
  "shadow-opacity",
  "shadow-color",
] as const

const TYPOGRAPHY_VAR_DEFAULTS = {
  "text-xs": "0.75rem",
  "text-sm": "0.875rem",
  "text-base": "1rem",
  "text-lg": "1.125rem",
  "text-xl": "1.25rem",
  "text-2xl": "1.5rem",
} as const

const SEMANTIC_COLOR_EXCLUDE_PREFIXES = ["shadow-", "radius-", "semantic-", "control-"] as const
const SEMANTIC_COLOR_EXCLUDE_NAMES = new Set(["radius"])

const DEFAULT_COMPONENT_ROLES: ComponentRole[] = [
  { id: "surface", label: "Component Surface Color", targetToken: "card", kind: "color" },
  { id: "text", label: "Primary Text Color", targetToken: "foreground", kind: "color" },
  { id: "border", label: "Border Color", targetToken: "border", kind: "color" },
  {
    id: "radius",
    label: "Corner Radius",
    targetToken: "radius",
    kind: "radius",
    defaultRadiusSemantic: "semantic-control-radius",
  },
]

const COMPONENT_ROLE_MAP: Record<string, ComponentRole[]> = {
  input: [
    { id: "input-surface", label: "Input Surface Color", targetToken: "background", kind: "color" },
    { id: "input-text", label: "Input Text Color", targetToken: "foreground", kind: "color" },
    { id: "input-border", label: "Input Border Color", targetToken: "input", kind: "color" },
    {
      id: "input-placeholder",
      label: "Suggestive Text Color",
      targetToken: "muted-foreground",
      kind: "color",
    },
    {
      id: "input-radius",
      label: "Input Corner Radius",
      targetToken: "radius",
      kind: "radius",
      defaultRadiusSemantic: "semantic-control-radius",
    },
  ],
  "input-fields": [
    { id: "fields-surface", label: "Field Surface Color", targetToken: "background", kind: "color" },
    { id: "fields-text", label: "Field Text Color", targetToken: "foreground", kind: "color" },
    { id: "fields-border", label: "Field Border Color", targetToken: "input", kind: "color" },
    {
      id: "fields-placeholder",
      label: "Suggestive Text Color",
      targetToken: "muted-foreground",
      kind: "color",
    },
    { id: "fields-focus", label: "Focus Ring Color", targetToken: "ring", kind: "color" },
    {
      id: "fields-radius",
      label: "Field Corner Radius",
      targetToken: "radius",
      kind: "radius",
      defaultRadiusSemantic: "semantic-control-radius",
    },
  ],
  button: [
    { id: "button-primary", label: "Primary Button Color", targetToken: "primary", kind: "color" },
    {
      id: "button-primary-text",
      label: "Primary Button Text Color",
      targetToken: "primary-foreground",
      kind: "color",
    },
    { id: "button-secondary", label: "Secondary Button Color", targetToken: "secondary", kind: "color" },
    {
      id: "button-secondary-text",
      label: "Secondary Button Text Color",
      targetToken: "secondary-foreground",
      kind: "color",
    },
    {
      id: "button-radius",
      label: "Button Corner Radius",
      targetToken: "radius",
      kind: "radius",
      defaultRadiusSemantic: "semantic-control-radius",
    },
  ],
  table: [
    { id: "table-header", label: "Header Surface Color", targetToken: "muted", kind: "color" },
    { id: "table-row", label: "Row Text Color", targetToken: "foreground", kind: "color" },
    { id: "table-hover", label: "Row Hover Color", targetToken: "accent", kind: "color" },
    { id: "table-border", label: "Table Border Color", targetToken: "border", kind: "color" },
    {
      id: "table-radius",
      label: "Table Container Radius",
      targetToken: "radius",
      kind: "radius",
      defaultRadiusSemantic: "semantic-surface-radius",
    },
  ],
  "layout-shell-v2": [
    { id: "shell-surface", label: "Workspace Surface", targetToken: "surface-table", kind: "color" },
    { id: "shell-header", label: "Header Surface", targetToken: "surface-header", kind: "color" },
    { id: "shell-border", label: "Shell Border", targetToken: "border-subtle", kind: "color" },
    { id: "shell-muted", label: "Meta Text", targetToken: "text-subdued", kind: "color" },
    {
      id: "shell-radius",
      label: "Shell Radius",
      targetToken: "radius",
      kind: "radius",
      defaultRadiusSemantic: "semantic-panel-radius",
    },
  ],
  "page-header-v2": [
    { id: "headerv2-bg", label: "Header Surface", targetToken: "surface-header", kind: "color" },
    { id: "headerv2-title", label: "Header Title Color", targetToken: "foreground", kind: "color" },
    { id: "headerv2-tabs", label: "Tabs Surface", targetToken: "surface-control", kind: "color" },
    { id: "headerv2-border", label: "Header Border", targetToken: "border-subtle", kind: "color" },
    {
      id: "headerv2-radius",
      label: "Header Radius",
      targetToken: "radius",
      kind: "radius",
      defaultRadiusSemantic: "semantic-surface-radius",
    },
  ],
  "status-search-bar-v2": [
    { id: "toolbarv2-surface", label: "Toolbar Surface", targetToken: "surface-control", kind: "color" },
    { id: "toolbarv2-text", label: "Toolbar Text", targetToken: "foreground", kind: "color" },
    { id: "toolbarv2-muted", label: "Placeholder Text", targetToken: "text-subdued", kind: "color" },
    { id: "toolbarv2-border", label: "Toolbar Border", targetToken: "border-subtle", kind: "color" },
    {
      id: "toolbarv2-radius",
      label: "Toolbar Radius",
      targetToken: "radius",
      kind: "radius",
      defaultRadiusSemantic: "semantic-control-radius",
    },
  ],
  "summary-cards-v2": [
    { id: "summaryv2-surface", label: "Card Surface", targetToken: "surface-table", kind: "color" },
    { id: "summaryv2-label", label: "Label Text", targetToken: "text-subdued", kind: "color" },
    { id: "summaryv2-value", label: "Value Text", targetToken: "foreground", kind: "color" },
    { id: "summaryv2-border", label: "Card Border", targetToken: "border-subtle", kind: "color" },
    {
      id: "summaryv2-radius",
      label: "Card Radius",
      targetToken: "radius",
      kind: "radius",
      defaultRadiusSemantic: "semantic-surface-radius",
    },
  ],
  "table-v2": [
    { id: "tablev2-header", label: "Header Surface", targetToken: "surface-header", kind: "color" },
    { id: "tablev2-row", label: "Row Surface", targetToken: "surface-table", kind: "color" },
    { id: "tablev2-text", label: "Primary Text", targetToken: "foreground", kind: "color" },
    { id: "tablev2-muted", label: "Secondary Text", targetToken: "text-subdued", kind: "color" },
    { id: "tablev2-border", label: "Table Border", targetToken: "border-subtle", kind: "color" },
    {
      id: "tablev2-radius",
      label: "Table Radius",
      targetToken: "radius",
      kind: "radius",
      defaultRadiusSemantic: "semantic-surface-radius",
    },
  ],
  sidebar: [
    { id: "sidebar-bg", label: "Sidebar Background", targetToken: "sidebar", kind: "color" },
    {
      id: "sidebar-fg",
      label: "Sidebar Foreground",
      targetToken: "sidebar-foreground",
      kind: "color",
    },
    { id: "sidebar-active", label: "Sidebar Active Color", targetToken: "sidebar-primary", kind: "color" },
    {
      id: "sidebar-active-fg",
      label: "Sidebar Active Text",
      targetToken: "sidebar-primary-foreground",
      kind: "color",
    },
    { id: "sidebar-border", label: "Sidebar Border", targetToken: "sidebar-border", kind: "color" },
  ],
  "page-header": [
    { id: "header-bg", label: "Header Surface", targetToken: "card", kind: "color" },
    { id: "header-title", label: "Header Title Color", targetToken: "foreground", kind: "color" },
    { id: "header-subtitle", label: "Header Subtitle Color", targetToken: "muted-foreground", kind: "color" },
    { id: "header-divider", label: "Header Border", targetToken: "border", kind: "color" },
    {
      id: "header-radius",
      label: "Header Radius",
      targetToken: "radius",
      kind: "radius",
      defaultRadiusSemantic: "semantic-surface-radius",
    },
  ],
  "custom-sheet": [
    { id: "sheet-bg", label: "Sheet Surface", targetToken: "card", kind: "color" },
    { id: "sheet-text", label: "Sheet Text", targetToken: "foreground", kind: "color" },
    { id: "sheet-muted", label: "Sheet Meta Text", targetToken: "muted-foreground", kind: "color" },
    { id: "sheet-border", label: "Sheet Divider", targetToken: "border", kind: "color" },
    {
      id: "sheet-radius",
      label: "Sheet Corner Radius",
      targetToken: "radius",
      kind: "radius",
      defaultRadiusSemantic: "semantic-panel-radius",
    },
  ],
}

function prettifyTokenName(name: string) {
  return name
    .replaceAll("-", " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
}

function isSemanticColorToken(token: ThemeToken) {
  if (SEMANTIC_COLOR_EXCLUDE_NAMES.has(token.name)) return false
  if (SEMANTIC_COLOR_EXCLUDE_PREFIXES.some((prefix) => token.name.startsWith(prefix))) return false
  return true
}

function semanticTokenGroup(tokenName: string) {
  if (tokenName.startsWith("chart-")) return "Data Visualization"
  if (tokenName.startsWith("sidebar-")) return "Sidebar & Navigation"
  if (tokenName.endsWith("-foreground") || tokenName === "foreground") return "Text & Foreground"
  if (tokenName === "border" || tokenName === "input" || tokenName === "ring") {
    return "Borders, Inputs & Focus"
  }
  if (
    tokenName === "destructive" ||
    tokenName.startsWith("destructive-") ||
    tokenName === "success" ||
    tokenName.startsWith("success-") ||
    tokenName === "warning" ||
    tokenName.startsWith("warning-")
  ) {
    return "Feedback & Status"
  }
  if (
    tokenName === "primary" ||
    tokenName.startsWith("primary-") ||
    tokenName === "secondary" ||
    tokenName.startsWith("secondary-") ||
    tokenName === "accent" ||
    tokenName.startsWith("accent-")
  ) {
    return "Actions & Brand"
  }
  return "Surfaces & Containers"
}

function buildSemanticGroups(tokens: ThemeToken[]): TokenGroup[] {
  const grouped = new Map<string, ThemeToken[]>()

  for (const token of tokens) {
    const key = semanticTokenGroup(token.name)
    const existing = grouped.get(key) ?? []
    existing.push(token)
    grouped.set(key, existing)
  }

  return Array.from(grouped.entries())
    .map(([title, groupedTokens]) => ({
      title,
      tokens: groupedTokens.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.title.localeCompare(b.title))
}

function toModeMap(tokens: ThemeToken[], mode: ThemeMode) {
  return Object.fromEntries(tokens.map((token) => [token.name, mode === "light" ? token.light : token.dark]))
}

function tokenByNameMap(tokens: ThemeToken[]) {
  return new Map(tokens.map((token) => [token.name, token]))
}

function getOtherMode(mode: ThemeMode): ThemeMode {
  return mode === "light" ? "dark" : "light"
}

function updateLinkedValues(
  prev: LinkedTokenValues,
  mode: ThemeMode,
  key: string,
  value: string
): LinkedTokenValues {
  const otherMode = getOtherMode(mode)
  const next: LinkedTokenValues = {
    values: {
      light: { ...prev.values.light },
      dark: { ...prev.values.dark },
    },
    overrides: {
      light: { ...prev.overrides.light },
      dark: { ...prev.overrides.dark },
    },
  }

  next.values[mode][key] = value

  if (!prev.overrides[otherMode][key]) {
    next.values[otherMode][key] = value
  }

  next.overrides[mode][key] = true

  return next
}

function cloneLinkedTokenValues(values: LinkedTokenValues): LinkedTokenValues {
  return {
    values: {
      light: { ...values.values.light },
      dark: { ...values.values.dark },
    },
    overrides: {
      light: { ...values.overrides.light },
      dark: { ...values.overrides.dark },
    },
  }
}

function createInitialTokenState(themeTokens: ThemeToken[]): LinkedTokenValues {
  return {
    values: {
      light: toModeMap(themeTokens, "light"),
      dark: toModeMap(themeTokens, "dark"),
    },
    overrides: {
      light: {},
      dark: {},
    },
  }
}

function createInitialFoundationState(): LinkedTokenValues {
  return {
    values: {
      light: {
        spacing: "0.25rem",
        "font-sans": "\"Anek Latin\", sans-serif",
        ...TYPOGRAPHY_VAR_DEFAULTS,
      },
      dark: {
        spacing: "0.25rem",
        "font-sans": "\"Anek Latin\", sans-serif",
        ...TYPOGRAPHY_VAR_DEFAULTS,
      },
    },
    overrides: {
      light: {},
      dark: {},
    },
  }
}

function createInitialRadiusRawState(): LinkedTokenValues {
  return {
    values: {
      light: { ...DEFAULT_RADIUS_RAW_VALUES },
      dark: { ...DEFAULT_RADIUS_RAW_VALUES },
    },
    overrides: {
      light: {},
      dark: {},
    },
  }
}

function pickTokens(tokenValues: Record<string, string>, tokenNames: readonly string[]) {
  return Object.fromEntries(
    tokenNames
      .filter((name) => tokenValues[name] !== undefined)
      .map((name) => [name, tokenValues[name]])
  )
}

function getRoleControls(slug: string) {
  return COMPONENT_ROLE_MAP[slug] ?? DEFAULT_COMPONENT_ROLES
}

function getDefaultRoleMappingFromFoundations(
  roleControls: ComponentRole[],
  foundationColorTokenNames: string[]
) {
  const fallbackColorToken = foundationColorTokenNames[0] ?? "primary"

  return Object.fromEntries(
    roleControls.map((role) => {
      if (role.kind === "radius") {
        return [role.id, role.defaultRadiusSemantic ?? "semantic-control-radius"]
      }

      const preferred = foundationColorTokenNames.includes(role.targetToken)
        ? role.targetToken
        : fallbackColorToken

      return [role.id, preferred]
    })
  )
}

function getDefaultCustomSheetConfig() {
  return {
    sectionCount: 4,
    collapseAfter: 3,
    leftCtaCount: 1,
    rightCtaCount: 2,
    showTabs: true,
  }
}

export function TokenPlayground({
  slug,
  themeTokens,
  semanticTokens,
}: {
  slug: string
  themeTokens: ThemeToken[]
  semanticTokens: ThemeToken[]
}) {
  const [mode, setMode] = useState<ThemeMode>("light")

  const tokenMap = useMemo(() => tokenByNameMap(themeTokens), [themeTokens])

  const semanticColorTokens = useMemo(
    () => semanticTokens.filter(isSemanticColorToken).sort((a, b) => a.name.localeCompare(b.name)),
    [semanticTokens]
  )

  const semanticGroups = useMemo(() => buildSemanticGroups(semanticColorTokens), [semanticColorTokens])

  const roleControls = useMemo(() => getRoleControls(slug), [slug])

  const foundationColorTokenNames = useMemo(
    () => FOUNDATION_COLOR_TOKENS.filter((tokenName) => tokenMap.has(tokenName)),
    [tokenMap]
  )

  const [tokenState, setTokenState] = useState<LinkedTokenValues>(() => createInitialTokenState(themeTokens))
  const [foundationState, setFoundationState] = useState<LinkedTokenValues>(() =>
    createInitialFoundationState()
  )
  const [radiusRawState, setRadiusRawState] = useState<LinkedTokenValues>(() =>
    createInitialRadiusRawState()
  )
  const [radiusFoundationMap, setRadiusFoundationMap] = useState<Record<RadiusFoundationToken, RadiusRawToken>>(
    DEFAULT_RADIUS_FOUNDATION_MAP
  )
  const [radiusSemanticMap, setRadiusSemanticMap] =
    useState<Record<RadiusSemanticToken, RadiusFoundationToken>>(DEFAULT_RADIUS_SEMANTIC_MAP)
  const [roleMapping, setRoleMapping] = useState<Record<string, string>>(() =>
    getDefaultRoleMappingFromFoundations(roleControls, foundationColorTokenNames)
  )
  const [customSheetConfig, setCustomSheetConfig] = useState(getDefaultCustomSheetConfig)
  const [appliedTokenState, setAppliedTokenState] = useState<LinkedTokenValues>(() =>
    createInitialTokenState(themeTokens)
  )
  const [appliedFoundationState, setAppliedFoundationState] = useState<LinkedTokenValues>(() =>
    createInitialFoundationState()
  )
  const [appliedRadiusRawState, setAppliedRadiusRawState] = useState<LinkedTokenValues>(() =>
    createInitialRadiusRawState()
  )
  const [appliedRadiusFoundationMap, setAppliedRadiusFoundationMap] =
    useState<Record<RadiusFoundationToken, RadiusRawToken>>(DEFAULT_RADIUS_FOUNDATION_MAP)
  const [appliedRadiusSemanticMap, setAppliedRadiusSemanticMap] =
    useState<Record<RadiusSemanticToken, RadiusFoundationToken>>(DEFAULT_RADIUS_SEMANTIC_MAP)
  const [appliedRoleMapping, setAppliedRoleMapping] = useState<Record<string, string>>(() =>
    getDefaultRoleMappingFromFoundations(roleControls, foundationColorTokenNames)
  )
  const [appliedCustomSheetConfig, setAppliedCustomSheetConfig] = useState(getDefaultCustomSheetConfig)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [hasDraftChanges, setHasDraftChanges] = useState(false)

  const radiusFoundationValues = useMemo(() => {
    const rawValues = appliedRadiusRawState.values[mode] as Record<RadiusRawToken, string>

    const result = {} as Record<RadiusFoundationToken, string>
    for (const foundationToken of RADIUS_FOUNDATION_ORDER) {
      const mappedRaw = appliedRadiusFoundationMap[foundationToken]
      result[foundationToken] = rawValues[mappedRaw]
    }

    return result
  }, [mode, appliedRadiusFoundationMap, appliedRadiusRawState.values])

  const radiusSemanticValues = useMemo(() => {
    const result = {} as Record<RadiusSemanticToken, string>

    for (const semanticToken of RADIUS_SEMANTIC_ORDER) {
      const foundationToken = appliedRadiusSemanticMap[semanticToken]
      result[semanticToken] = radiusFoundationValues[foundationToken]
    }

    return result
  }, [radiusFoundationValues, appliedRadiusSemanticMap])

  const previewConfig = useMemo(() => {
    if (slug !== "custom-sheet") return undefined
    return appliedCustomSheetConfig
  }, [appliedCustomSheetConfig, slug])

  const previewStyle = useMemo(() => {
    const cssVars: Record<string, string> = {}

    for (const [name, value] of Object.entries(appliedTokenState.values[mode])) {
      cssVars[`--${name}`] = value
    }

    for (const [name, value] of Object.entries(appliedFoundationState.values[mode])) {
      cssVars[`--${name}`] = value
    }

    for (const rawToken of RADIUS_RAW_ORDER) {
      cssVars[`--${rawToken}`] = (appliedRadiusRawState.values[mode] as Record<RadiusRawToken, string>)[rawToken]
    }

    for (const foundationToken of RADIUS_FOUNDATION_ORDER) {
      cssVars[`--${foundationToken}`] = radiusFoundationValues[foundationToken]
    }

    for (const semanticToken of RADIUS_SEMANTIC_ORDER) {
      cssVars[`--${semanticToken}`] = radiusSemanticValues[semanticToken]
    }

    for (const role of roleControls) {
      const selectedToken = appliedRoleMapping[role.id]
      if (!selectedToken) continue

      if (role.kind === "radius") {
        const selectedSemantic = selectedToken as RadiusSemanticToken
        const radiusValue = radiusSemanticValues[selectedSemantic]
        if (radiusValue) {
          cssVars[`--${role.targetToken}`] = radiusValue
        }
        continue
      }

      const selectedValue = appliedTokenState.values[mode][selectedToken]
      if (!selectedValue) continue

      if (selectedToken === role.targetToken) {
        cssVars[`--${role.targetToken}`] = selectedValue
      } else {
        cssVars[`--${role.targetToken}`] = `var(--${selectedToken})`
      }
    }

    return cssVars as React.CSSProperties
  }, [
    appliedFoundationState.values,
    mode,
    radiusFoundationValues,
    appliedRadiusRawState.values,
    radiusSemanticValues,
    roleControls,
    appliedRoleMapping,
    appliedTokenState.values,
  ])

  const settingsPayload = useMemo(
    () => ({
      component: slug,
      preset: "pine-component-docs-playground",
      activeMode: mode,
      themeTokens: {
        light: appliedTokenState.values.light,
        dark: appliedTokenState.values.dark,
      },
      foundations: {
        colors: {
          light: pickTokens(appliedTokenState.values.light, FOUNDATION_COLOR_TOKENS),
          dark: pickTokens(appliedTokenState.values.dark, FOUNDATION_COLOR_TOKENS),
        },
        spacing: {
          light: appliedFoundationState.values.light.spacing,
          dark: appliedFoundationState.values.dark.spacing,
        },
        fonts: {
          light: appliedFoundationState.values.light["font-sans"],
          dark: appliedFoundationState.values.dark["font-sans"],
        },
        typography: {
          light: pickTokens(appliedFoundationState.values.light, Object.keys(TYPOGRAPHY_VAR_DEFAULTS)),
          dark: pickTokens(appliedFoundationState.values.dark, Object.keys(TYPOGRAPHY_VAR_DEFAULTS)),
        },
        shadows: {
          light: pickTokens(appliedTokenState.values.light, FOUNDATION_SHADOW_TOKENS),
          dark: pickTokens(appliedTokenState.values.dark, FOUNDATION_SHADOW_TOKENS),
        },
        radiusWaterfall: {
          rawValues: appliedRadiusRawState.values,
          foundationMap: appliedRadiusFoundationMap,
          semanticMap: appliedRadiusSemanticMap,
        },
      },
      semanticColorGroups: semanticGroups.map((group) => ({
        title: group.title,
        tokens: group.tokens.map((token) => token.name),
      })),
      componentRoleAssignments: roleControls.map((role) => ({
        label: role.label,
        targetToken: role.targetToken,
        selectedToken: appliedRoleMapping[role.id],
      })),
      customSheetConfig: slug === "custom-sheet" ? appliedCustomSheetConfig : undefined,
      notes:
        "Waterfall model is preserved: raw radius values -> foundation radius tokens -> semantic radius tokens -> component role mapping.",
    }),
    [
      appliedCustomSheetConfig,
      appliedFoundationState.values,
      mode,
      appliedRadiusFoundationMap,
      appliedRadiusRawState.values,
      appliedRadiusSemanticMap,
      roleControls,
      appliedRoleMapping,
      foundationColorTokenNames,
      semanticGroups,
      slug,
      appliedTokenState.values,
    ]
  )

  const copyPayload = async () => {
    if (typeof window === "undefined") return
    await navigator.clipboard.writeText(JSON.stringify(settingsPayload, null, 2))
  }

  const setThemeToken = (tokenName: string, value: string) => {
    setHasDraftChanges(true)
    setTokenState((prev) => updateLinkedValues(prev, mode, tokenName, value))
  }

  const setFoundationValue = (key: string, value: string) => {
    setHasDraftChanges(true)
    setFoundationState((prev) => updateLinkedValues(prev, mode, key, value))
  }

  const setRadiusRawValue = (token: RadiusRawToken, value: string) => {
    setHasDraftChanges(true)
    setRadiusRawState((prev) => updateLinkedValues(prev, mode, token, value))
  }

  const applyDraftChanges = () => {
    setAppliedTokenState(cloneLinkedTokenValues(tokenState))
    setAppliedFoundationState(cloneLinkedTokenValues(foundationState))
    setAppliedRadiusRawState(cloneLinkedTokenValues(radiusRawState))
    setAppliedRadiusFoundationMap({ ...radiusFoundationMap })
    setAppliedRadiusSemanticMap({ ...radiusSemanticMap })
    setAppliedRoleMapping({ ...roleMapping })
    setAppliedCustomSheetConfig({ ...customSheetConfig })
    setHasDraftChanges(false)
    setIsEditorOpen(false)
  }

  const discardDraftChanges = () => {
    setTokenState(cloneLinkedTokenValues(appliedTokenState))
    setFoundationState(cloneLinkedTokenValues(appliedFoundationState))
    setRadiusRawState(cloneLinkedTokenValues(appliedRadiusRawState))
    setRadiusFoundationMap({ ...appliedRadiusFoundationMap })
    setRadiusSemanticMap({ ...appliedRadiusSemanticMap })
    setRoleMapping({ ...appliedRoleMapping })
    setCustomSheetConfig({ ...appliedCustomSheetConfig })
    setHasDraftChanges(false)
    setIsEditorOpen(false)
  }

  const renderTokenInput = (tokenName: string) => {
    const token = tokenMap.get(tokenName)
    if (!token) return null

    const inputId = `token-${mode}-${tokenName}`

    return (
      <div key={tokenName} className="grid gap-2">
        <Label htmlFor={inputId}>{prettifyTokenName(tokenName)}</Label>
        <Input
          id={inputId}
          value={tokenState.values[mode][tokenName] ?? ""}
          onChange={(event) => setThemeToken(tokenName, event.target.value)}
        />
      </div>
    )
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 text-foreground md:p-7">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Visual Token Playground</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            One preview canvas with save-to-apply token editing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-border bg-muted/30 p-1">
            <Button
              size="sm"
              variant={mode === "light" ? "secondary" : "ghost"}
              onClick={() => setMode("light")}
              className="h-8"
            >
              <SunIcon />
              Light
            </Button>
            <Button
              size="sm"
              variant={mode === "dark" ? "secondary" : "ghost"}
              onClick={() => setMode("dark")}
              className="h-8"
            >
              <MoonIcon />
              Dark
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={copyPayload}
          >
            <CopyIcon />
            Copy Settings
          </Button>

          <Button
            variant={isEditorOpen ? "secondary" : "outline"}
            onClick={() => setIsEditorOpen((prev) => !prev)}
          >
            {isEditorOpen ? "Hide Editor" : "Customize Tokens"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-background p-4 text-foreground">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Live Preview ({mode})
          </p>
          <div className={mode === "dark" ? "dark" : ""}>
            <ComponentPreview
              slug={slug}
              mode="page"
              previewStyle={previewStyle}
              previewConfig={previewConfig}
            />
          </div>
        </div>

        {isEditorOpen ? (
          <div className="space-y-4 rounded-xl border border-border bg-background p-4">
            <p className="text-xs text-muted-foreground">
              Editing <span className="font-semibold text-foreground">{mode}</span> mode values. Preview updates only after you click save.
            </p>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Component Role Mapping</h3>
            <p className="text-xs text-muted-foreground">
              Choose foundational color tokens for each role used in this component preview.
            </p>

            <div className="space-y-3">
              {roleControls.map((role) => {
                const selectId = `role-${slug}-${role.id}`
                const options = role.kind === "radius" ? RADIUS_SEMANTIC_ORDER : foundationColorTokenNames
                const selected = roleMapping[role.id] ?? role.targetToken
                const normalizedValue =
                  options.length > 0 && options.some((option) => option === selected) ? selected : (options[0] ?? "")

                return (
                  <div key={role.id} className="grid gap-2">
                    <Label htmlFor={selectId}>{role.label}</Label>
                    <select
                      id={selectId}
                      value={normalizedValue}
                      onChange={(event) =>
                        {
                          setHasDraftChanges(true)
                          setRoleMapping((prev) => ({
                            ...prev,
                            [role.id]: event.target.value,
                          }))
                        }
                      }
                      className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none"
                    >
                      {options.map((option) => (
                        <option key={option} value={option} className="bg-background text-foreground">
                          {prettifyTokenName(option)}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-muted-foreground">
                      Applied to <code>--{role.targetToken}</code>
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          <details open className="rounded-lg border border-border p-3">
            <summary className="cursor-pointer text-xs font-medium uppercase tracking-[0.08em] text-foreground">
              Radius Waterfall Mapping
            </summary>

            <div className="mt-3 space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">1) Raw Radius Values</p>
                <div className="space-y-2">
                  {RADIUS_RAW_ORDER.map((rawToken) => {
                    const id = `raw-${mode}-${rawToken}`
                    return (
                      <div key={rawToken} className="grid gap-1.5">
                        <Label htmlFor={id}>{prettifyTokenName(rawToken)}</Label>
                        <Input
                          id={id}
                          value={(radiusRawState.values[mode] as Record<RadiusRawToken, string>)[rawToken]}
                          onChange={(event) => setRadiusRawValue(rawToken, event.target.value)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">2) Foundation Radius Tokens</p>
                <div className="space-y-2">
                  {RADIUS_FOUNDATION_ORDER.map((foundationToken) => {
                    const id = `foundation-radius-${foundationToken}`
                    return (
                      <div key={foundationToken} className="grid gap-1.5">
                        <Label htmlFor={id}>{prettifyTokenName(foundationToken)}</Label>
                        <select
                          id={id}
                          value={radiusFoundationMap[foundationToken]}
                          onChange={(event) =>
                            {
                              setHasDraftChanges(true)
                              setRadiusFoundationMap((prev) => ({
                                ...prev,
                                [foundationToken]: event.target.value as RadiusRawToken,
                              }))
                            }
                          }
                          className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none"
                        >
                          {RADIUS_RAW_ORDER.map((rawToken) => (
                            <option key={rawToken} value={rawToken} className="bg-background text-foreground">
                              {prettifyTokenName(rawToken)}
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-muted-foreground">
                          Value: <code>{radiusFoundationValues[foundationToken]}</code>
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">3) Semantic Radius Tokens</p>
                <div className="space-y-2">
                  {RADIUS_SEMANTIC_ORDER.map((semanticToken) => {
                    const id = `semantic-radius-${semanticToken}`
                    return (
                      <div key={semanticToken} className="grid gap-1.5">
                        <Label htmlFor={id}>{prettifyTokenName(semanticToken)}</Label>
                        <select
                          id={id}
                          value={radiusSemanticMap[semanticToken]}
                          onChange={(event) =>
                            {
                              setHasDraftChanges(true)
                              setRadiusSemanticMap((prev) => ({
                                ...prev,
                                [semanticToken]: event.target.value as RadiusFoundationToken,
                              }))
                            }
                          }
                          className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none"
                        >
                          {RADIUS_FOUNDATION_ORDER.map((foundationToken) => (
                            <option
                              key={foundationToken}
                              value={foundationToken}
                              className="bg-background text-foreground"
                            >
                              {prettifyTokenName(foundationToken)}
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-muted-foreground">
                          Value: <code>{radiusSemanticValues[semanticToken]}</code>
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </details>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Foundational Tokens</h3>

            <details open className="rounded-lg border border-border p-3">
              <summary className="cursor-pointer text-xs font-medium uppercase tracking-[0.08em] text-foreground">
                Colors
              </summary>
              <div className="mt-3 space-y-3">
                {FOUNDATION_COLOR_TOKENS.map((tokenName) => renderTokenInput(tokenName))}
              </div>
            </details>

            <details open className="rounded-lg border border-border p-3">
              <summary className="cursor-pointer text-xs font-medium uppercase tracking-[0.08em] text-foreground">
                Spacing
              </summary>
              <div className="mt-3 grid gap-2">
                <Label htmlFor={`foundation-${mode}-spacing`}>Base Spacing Unit (--spacing)</Label>
                <Input
                  id={`foundation-${mode}-spacing`}
                  value={foundationState.values[mode].spacing}
                  onChange={(event) => setFoundationValue("spacing", event.target.value)}
                />
              </div>
            </details>

            <details open className="rounded-lg border border-border p-3">
              <summary className="cursor-pointer text-xs font-medium uppercase tracking-[0.08em] text-foreground">
                Fonts
              </summary>
              <div className="mt-3 grid gap-2">
                <Label htmlFor={`foundation-${mode}-font-sans`}>Sans Font Family (--font-sans)</Label>
                <Input
                  id={`foundation-${mode}-font-sans`}
                  value={foundationState.values[mode]["font-sans"]}
                  onChange={(event) => setFoundationValue("font-sans", event.target.value)}
                />
              </div>
            </details>

            <details open className="rounded-lg border border-border p-3">
              <summary className="cursor-pointer text-xs font-medium uppercase tracking-[0.08em] text-foreground">
                Typography
              </summary>
              <div className="mt-3 space-y-3">
                {Object.keys(TYPOGRAPHY_VAR_DEFAULTS).map((tokenName) => {
                  const inputId = `foundation-${mode}-${tokenName}`

                  return (
                    <div key={tokenName} className="grid gap-2">
                      <Label htmlFor={inputId}>{prettifyTokenName(tokenName)}</Label>
                      <Input
                        id={inputId}
                        value={foundationState.values[mode][tokenName]}
                        onChange={(event) => setFoundationValue(tokenName, event.target.value)}
                      />
                    </div>
                  )
                })}
              </div>
            </details>

            <details open className="rounded-lg border border-border p-3">
              <summary className="cursor-pointer text-xs font-medium uppercase tracking-[0.08em] text-foreground">
                Drop Shadows
              </summary>
              <div className="mt-3 space-y-3">
                {FOUNDATION_SHADOW_TOKENS.map((tokenName) => renderTokenInput(tokenName))}
              </div>
            </details>
          </div>

          {slug === "custom-sheet" ? (
            <details open className="rounded-lg border border-border p-3">
              <summary className="cursor-pointer text-xs font-medium uppercase tracking-[0.08em] text-foreground">
                Side Panel States
              </summary>
              <div className="mt-3 space-y-3">
                <div className="grid gap-2">
                  <Label htmlFor="sheet-sections">How many sections to show</Label>
                  <select
                    id="sheet-sections"
                    value={String(customSheetConfig.sectionCount)}
                    onChange={(event) =>
                      {
                        setHasDraftChanges(true)
                        setCustomSheetConfig((prev) => ({
                          ...prev,
                          sectionCount: Number(event.target.value),
                        }))
                      }
                    }
                    className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none"
                  >
                    {[2, 3, 4, 5, 6].map((count) => (
                      <option key={count} value={count} className="bg-background text-foreground">
                        {count} sections
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sheet-collapse">Collapse after section</Label>
                  <select
                    id="sheet-collapse"
                    value={String(customSheetConfig.collapseAfter)}
                    onChange={(event) =>
                      {
                        setHasDraftChanges(true)
                        setCustomSheetConfig((prev) => ({
                          ...prev,
                          collapseAfter: Number(event.target.value),
                        }))
                      }
                    }
                    className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none"
                  >
                    {[0, 1, 2, 3, 4, 5].map((count) => (
                      <option key={count} value={count} className="bg-background text-foreground">
                        {count === 0 ? "Show all" : `After ${count}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sheet-left-cta">Left side CTAs</Label>
                  <select
                    id="sheet-left-cta"
                    value={String(customSheetConfig.leftCtaCount)}
                    onChange={(event) =>
                      {
                        setHasDraftChanges(true)
                        setCustomSheetConfig((prev) => ({
                          ...prev,
                          leftCtaCount: Number(event.target.value),
                        }))
                      }
                    }
                    className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none"
                  >
                    {[0, 1, 2, 3].map((count) => (
                      <option key={count} value={count} className="bg-background text-foreground">
                        {count} CTAs
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sheet-right-cta">Right side CTAs</Label>
                  <select
                    id="sheet-right-cta"
                    value={String(customSheetConfig.rightCtaCount)}
                    onChange={(event) =>
                      {
                        setHasDraftChanges(true)
                        setCustomSheetConfig((prev) => ({
                          ...prev,
                          rightCtaCount: Number(event.target.value),
                        }))
                      }
                    }
                    className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none"
                  >
                    {[1, 2, 3].map((count) => (
                      <option key={count} value={count} className="bg-background text-foreground">
                        {count} CTAs
                      </option>
                    ))}
                  </select>
                </div>

                <Label className="justify-between rounded-lg border border-border/60 px-3 py-2">
                  Show segment tabs
                  <input
                    type="checkbox"
                    checked={customSheetConfig.showTabs}
                    onChange={(event) =>
                      {
                        setHasDraftChanges(true)
                        setCustomSheetConfig((prev) => ({
                          ...prev,
                          showTabs: event.target.checked,
                        }))
                      }
                    }
                  />
                </Label>
              </div>
            </details>
          ) : null}
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2">
              <Button
                variant="default"
                onClick={applyDraftChanges}
                disabled={!hasDraftChanges}
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={discardDraftChanges}
              >
                Discard
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
