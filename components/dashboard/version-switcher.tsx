"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const versions = [
  { label: "V1", envKey: "NEXT_PUBLIC_V1_URL" as const },
  { label: "V2", envKey: "NEXT_PUBLIC_V2_URL" as const },
]

export function VersionSwitcher() {
  const pathname = usePathname()
  const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? "v1"

  function switchTo(targetVersion: "v1" | "v2") {
    const urlEnvKey =
      targetVersion === "v1"
        ? process.env.NEXT_PUBLIC_V1_URL
        : process.env.NEXT_PUBLIC_V2_URL

    if (!urlEnvKey) return

    const v1Routes = [
      "/", "/online-payments", "/offline-payments", "/payment-links",
      "/card-payments", "/international-payments", "/products",
      "/use-cases", "/settings", "/support", "/configure-products", "/pos-device",
    ]

    let resolvedPath = pathname
    if (targetVersion === "v1" && !v1Routes.includes(pathname)) {
      const topLevel = "/" + pathname.split("/").filter(Boolean)[0]
      resolvedPath = v1Routes.includes(topLevel) ? topLevel : "/"
    }

    window.location.href = urlEnvKey.replace(/\/$/, "") + resolvedPath
  }

  return (
    <div className="flex items-center gap-0.5 rounded-md bg-muted p-0.5">
      {versions.map((v) => {
        const vKey = v.label.toLowerCase() as "v1" | "v2"
        const active = currentVersion === vKey
        return (
          <button
            key={v.label}
            onClick={() => !active && switchTo(vKey)}
            className={cn(
              "rounded px-2.5 py-1 text-[11px] font-semibold transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {v.label}
          </button>
        )
      })}
    </div>
  )
}
