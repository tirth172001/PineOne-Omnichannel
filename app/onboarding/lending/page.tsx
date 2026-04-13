"use client"

import { V2DashboardLayout } from "@/components/dashboard/v2-dashboard-layout"
import { LendingApplicationFlow } from "@/components/onboarding/lending-application-flow"

export default function LendingOnboardingPage() {
  return (
    <V2DashboardLayout>
      <LendingApplicationFlow />
    </V2DashboardLayout>
  )
}
