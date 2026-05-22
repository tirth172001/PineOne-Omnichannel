import { readFile } from "node:fs/promises"
import path from "node:path"

export type ThemeToken = {
  name: string
  light: string
  dark: string
}

const NON_SEMANTIC_TOKEN_PREFIXES = [
  "shadow-x",
  "shadow-y",
  "shadow-blur",
  "shadow-spread",
  "shadow-opacity",
  "shadow-color",
] as const

function isSemanticToken(name: string) {
  return !NON_SEMANTIC_TOKEN_PREFIXES.some((prefix) => name.startsWith(prefix))
}

function parseTokenBlock(content: string) {
  const tokenMap = new Map<string, string>()
  const re = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi
  for (const match of content.matchAll(re)) {
    tokenMap.set(match[1], match[2].trim())
  }
  return tokenMap
}

export async function getThemeTokens(): Promise<ThemeToken[]> {
  const cssPath = path.join(process.cwd(), "app/globals.css")
  const css = await readFile(cssPath, "utf8")

  const rootMatch = css.match(/:root\s*{([\s\S]*?)\n}/)
  const darkMatch = css.match(/\.dark\s*{([\s\S]*?)\n}/)
  const lightMap = parseTokenBlock(rootMatch?.[1] ?? "")
  const darkMap = parseTokenBlock(darkMatch?.[1] ?? "")

  const allNames = Array.from(new Set([...lightMap.keys(), ...darkMap.keys()])).sort((a, b) =>
    a.localeCompare(b)
  )

  return allNames.map((name) => ({
    name,
    light: lightMap.get(name) ?? darkMap.get(name) ?? "-",
    dark: darkMap.get(name) ?? lightMap.get(name) ?? "-",
  }))
}

export async function getSemanticThemeTokens(): Promise<ThemeToken[]> {
  const allTokens = await getThemeTokens()
  return allTokens.filter((token) => isSemanticToken(token.name))
}
