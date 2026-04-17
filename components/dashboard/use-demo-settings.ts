"use client"

import { useEffect, useState } from "react"
import {
  DEMO_SETTINGS_CHANGED_EVENT,
  getResolvedMaxWidth,
  readDemoSettings,
  type DemoSettings,
} from "@/lib/demo-settings"

export function useDemoSettingsState() {
  const [settings, setSettings] = useState<DemoSettings>(readDemoSettings)

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
