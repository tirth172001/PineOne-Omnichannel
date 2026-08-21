"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const Grainient = dynamic(() => import("@/components/Grainient"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[linear-gradient(165deg,#365314_0%,#D9F99D_50%,#365314_100%)]" />,
})

// The decorative left panel from app/login/page.tsx, extracted so app/signup/* (ticket 07,
// .scratch/onboarding-experience-v2/issues/07-consolidate-login-signup-flow.md) can share it
// exactly rather than duplicating the Grainient config — signup has no data preview (there's no
// business yet to preview), so it reuses login's purely-decorative treatment as-is.
export function AuthVisualPanel() {
  const [showVisualPanel, setShowVisualPanel] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const update = () => setShowVisualPanel(mediaQuery.matches)
    update()
    mediaQuery.addEventListener("change", update)
    return () => mediaQuery.removeEventListener("change", update)
  }, [])

  return (
    <div className="relative hidden h-full overflow-hidden rounded-md bg-[linear-gradient(165deg,#365314_0%,#D9F99D_50%,#365314_100%)] lg:block">
      {showVisualPanel ? (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[1080px] w-[1080px] -translate-x-1/2 -translate-y-1/2">
            <Grainient
              className="h-full w-full"
              color1="#365314"
              color2="#D9F99D"
              color3="#365314"
              timeSpeed={0.25}
              colorBalance={0}
              warpStrength={1}
              warpFrequency={5}
              warpSpeed={2}
              warpAmplitude={50}
              blendAngle={0}
              blendSoftness={0.05}
              rotationAmount={500}
              noiseScale={2}
              grainAmount={0.1}
              grainScale={2}
              grainAnimated={false}
              contrast={1.5}
              gamma={1}
              saturation={1}
              centerX={0}
              centerY={0}
              zoom={0.9}
            />
          </div>
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-0">
        <img alt="" className="size-full object-cover" src="/brand/login-left-overlay.svg" />
      </div>
    </div>
  )
}
