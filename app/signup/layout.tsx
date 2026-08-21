import type { ReactNode } from "react"
import { SignupShell } from "@/components/onboarding/signup-shell"

// Mounted once for the whole /signup/* sequence, so SignupShell (and the decorative right panel
// it renders) survives step-to-step navigation instead of being torn down and rebuilt on every
// route change — that remount was why moving between signup steps felt like a full page refresh
// instead of a transition.
export default function SignupLayout({ children }: { children: ReactNode }) {
  return <SignupShell>{children}</SignupShell>
}
