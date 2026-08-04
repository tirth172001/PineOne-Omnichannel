"use client"

export type MerchantMode = "live" | "test"

export const MERCHANT_MODE_STORAGE_KEY = "pine-one-merchant-mode"
export const MERCHANT_ONBOARDING_DONE_KEY = "pine-one-merchant-onboarding-complete"

export const DEFAULT_MERCHANT_MODE: MerchantMode = "live"

const TEST_MODE_SUPPORTED_PREFIXES = ["/online-payments", "/payment-links", "/cross-border"]

export function supportsTestModeForPath(pathname: string) {
  return TEST_MODE_SUPPORTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export function readMerchantMode() {
  if (typeof window === "undefined") return DEFAULT_MERCHANT_MODE
  const mode = window.localStorage.getItem(MERCHANT_MODE_STORAGE_KEY)
  return mode === "test" ? "test" : DEFAULT_MERCHANT_MODE
}

export function writeMerchantMode(mode: MerchantMode) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(MERCHANT_MODE_STORAGE_KEY, mode)
}

export function getEffectiveMerchantMode(pathname: string) {
  if (!supportsTestModeForPath(pathname)) return "live" as const
  return readMerchantMode()
}

export function readMerchantOnboardingComplete() {
  if (typeof window === "undefined") return false
  return window.localStorage.getItem(MERCHANT_ONBOARDING_DONE_KEY) === "1"
}

export function writeMerchantOnboardingComplete(completed: boolean) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(MERCHANT_ONBOARDING_DONE_KEY, completed ? "1" : "0")
}
