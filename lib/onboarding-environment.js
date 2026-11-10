export const ONBOARDING_DEMO_BASE = "/onboarding-demo"

/** @param {string} pathname */
export function isOnboardingDemoPath(pathname) {
  return pathname === ONBOARDING_DEMO_BASE || pathname.startsWith(`${ONBOARDING_DEMO_BASE}/`)
}

/** @param {string | null} storedId @param {boolean} demo */
export function resolveBusinessProfileId(storedId, demo) {
  if (demo) return "new-merchant"
  return storedId === "new-merchant" ? null : storedId
}

const ROUTES = [
  ["/signup/phone", ""],
  ["/signup/verify-phone", "/verify-phone"],
  ["/signup/set-password", "/set-password"],
  ["/offline-payments/manage-devices", "/products/in-store"],
  ["/payment-links", "/products/payment-links"],
  ["/checkout", "/products/checkout"],
  ["/onboarding/products", "/setup"],
  ["/transactions", "/payments"],
]

/** @param {string} href */
export function onboardingDemoHref(href) {
  if (!href.startsWith("/") || href.startsWith("//") || isOnboardingDemoPath(href.split(/[?#]/)[0])) return href
  const suffixIndex = href.search(/[?#]/)
  const pathname = suffixIndex === -1 ? href : href.slice(0, suffixIndex)
  const suffix = suffixIndex === -1 ? "" : href.slice(suffixIndex)
  if (pathname === "/") return `${ONBOARDING_DEMO_BASE}/home${suffix}`
  for (const [original, scoped] of ROUTES) {
    if (pathname === original || pathname.startsWith(`${original}/`)) return `${ONBOARDING_DEMO_BASE}${scoped}${pathname.slice(original.length)}${suffix}`
  }
  return `${ONBOARDING_DEMO_BASE}${pathname}${suffix}`
}

/** @param {string} pathname */
export function originalOnboardingPath(pathname) {
  if (!isOnboardingDemoPath(pathname)) return pathname
  const local = pathname.slice(ONBOARDING_DEMO_BASE.length).replace(/\/$/, "")
  if (!local) return "/signup/phone"
  if (local === "/home") return "/"
  for (const [original, scoped] of ROUTES) {
    if (scoped && (local === scoped || local.startsWith(`${scoped}/`))) return `${original}${local.slice(scoped.length)}`
  }
  return local
}

/** @param {string} key @param {string} [pathname] */
export function onboardingStorageKey(key, pathname = typeof window === "undefined" ? "/" : window.location?.pathname ?? "/") {
  return isOnboardingDemoPath(pathname) ? `onboarding-demo:${key}` : key
}
