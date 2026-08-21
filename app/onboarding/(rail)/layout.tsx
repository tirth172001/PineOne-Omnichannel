import type { ReactNode } from "react"
import { OnboardingRailShell } from "@/components/onboarding/onboarding-rail-shell"

// Mounted once for the whole post-business-name rail sequence, so OnboardingRailShell (and the
// persistent preview panel it renders) survives step-to-step navigation instead of being torn
// down and rebuilt on every route change — that remount was why sub-step moves felt like a full
// page refresh instead of a transition. Route group (rail) keeps this scoped to the rail steps
// only; request-access-existing-merchant uses its own shell and stays outside this group.
export default function OnboardingRailLayout({ children }: { children: ReactNode }) {
  return <OnboardingRailShell>{children}</OnboardingRailShell>
}
