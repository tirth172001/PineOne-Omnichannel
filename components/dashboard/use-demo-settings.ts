"use client"

import { useEffect, useState } from "react"
import {
  DEFAULT_DEMO_SETTINGS,
  DEMO_SETTINGS_CHANGED_EVENT,
  getResolvedMaxWidth,
  readDemoSettings,
  type DemoSettings,
} from "@/lib/demo-settings"

export function useDemoSettingsState() {
  // Start from a deterministic snapshot so SSR and first client render match.
  const [settings, setSettings] = useState<DemoSettings>(DEFAULT_DEMO_SETTINGS)

  useEffect(() => {
    const sync = () => setSettings(readDemoSettings())
    sync()
    window.addEventListener(DEMO_SETTINGS_CHANGED_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(DEMO_SETTINGS_CHANGED_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  return settings
}
export function useResolvedDemoMaxWidth() {
  const settings = useDemoSettingsState()
  return getResolvedMaxWidth(settings)
}
