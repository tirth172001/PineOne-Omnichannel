"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { LendingApplicationFlow } from "@/components/onboarding/lending-application-flow"

export default function LendingOnboardingPage() {
  return (
    <DashboardLayout>
      <LendingApplicationFlow />
    </DashboardLayout>
  )
}
