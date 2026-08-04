export const DEMO_SETTINGS_KEY = "pine-one-demo-settings"
export const DEMO_SETTINGS_CHANGED_EVENT = "demo-settings-changed"

export type DemoSettings = {
  maxWidth: number | "custom"
  customMaxWidth: number
}

export const DEFAULT_DEMO_SETTINGS: DemoSettings = {
  maxWidth: 1440,
  customMaxWidth: 1440,
}

export function readDemoSettings(): DemoSettings {
  if (typeof window === "undefined") return DEFAULT_DEMO_SETTINGS
  try {
    const raw = window.localStorage.getItem(DEMO_SETTINGS_KEY)
    if (!raw) return DEFAULT_DEMO_SETTINGS
    return { ...DEFAULT_DEMO_SETTINGS, ...JSON.parse(raw) } as DemoSettings
  } catch {
    return DEFAULT_DEMO_SETTINGS
  }
}

export function writeDemoSettings(settings: DemoSettings) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(DEMO_SETTINGS_KEY, JSON.stringify(settings))
}

export function notifyDemoSettingsChanged() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(DEMO_SETTINGS_CHANGED_EVENT))
}

export function getResolvedMaxWidth(settings: DemoSettings): number {
  if (settings.maxWidth === "custom") return settings.customMaxWidth
  return settings.maxWidth
}
