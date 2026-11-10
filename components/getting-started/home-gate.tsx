"use client"

import type { ReactNode } from "react"
import { GettingStartedHome } from "./getting-started-home"
import { useIsNewMerchant } from "./product-page"

export function NewMerchantHomeGate({ children }: { children: ReactNode }) {
  return useIsNewMerchant() ? <GettingStartedHome /> : <>{children}</>
}
