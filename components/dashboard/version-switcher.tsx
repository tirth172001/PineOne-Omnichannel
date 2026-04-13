"use client"

import { usePathname } from "next/navigation"

const versions = [
  { label: "V1", port: 3000 },
  { label: "V2", port: 3001 },
]

// Top-level routes that exist in V1
const v1Routes = [
  "/",
  "/online-payments",
  "/offline-payments",
  "/payment-links",
  "/card-payments",
  "/international-payments",
  "/products",
  "/use-cases",
  "/settings",
  "/support",
  "/configure-products",
  "/pos-device",
]

function resolvePathForPort(pathname: string, targetPort: number) {
  if (targetPort === 3001) return pathname // V2 accepts any path
  // For V1, use exact route if it exists, otherwise use the first matching segment
  if (v1Routes.includes(pathname)) return pathname
  const topLevel = "/" + pathname.split("/").filter(Boolean)[0]
  return v1Routes.includes(topLevel) ? topLevel : "/"
}

export function VersionSwitcher() {
  const pathname = usePathname()

  function switchTo(port: number) {
    const resolvedPath = resolvePathForPort(pathname, port)
    const { protocol, hostname } = window.location
    window.location.href = `${protocol}//${hostname}:${port}${resolvedPath}`
  }

  const currentPort =
    typeof window !== "undefined" ? Number(window.location.port) || 3000 : 3000

  return (
    <div className="flex items-center gap-0.5 rounded-md bg-muted p-0.5">
      {versions.map((v) => {
        const active = currentPort === v.port
        return (
          <button
            key={v.port}
            onClick={() => !active && switchTo(v.port)}
            className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {v.label}
          </button>
        )
      })}
    </div>
  )
}
