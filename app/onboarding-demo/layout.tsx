"use client"

import { useEffect, useState, type ReactNode } from "react"
import Script from "next/script"

// Load the export helper only for an explicitly requested Figma capture URL.
export default function FigmaCaptureLayout({ children }: { children: ReactNode }) {
  const [capture, setCapture] = useState(false)
  useEffect(() => { setCapture(window.location.hash.includes("figmacapture=")) }, [])
  return <>{children}{capture ? <Script src="https://mcp.figma.com/mcp/html-to-design/capture.js" strategy="afterInteractive" /> : null}</>
}
