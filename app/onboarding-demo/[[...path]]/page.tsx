import { Suspense } from "react"
import { notFound } from "next/navigation"
import { SignupPhoneClient } from "@/app/signup/phone/_client"
import { SignupVerifyPhoneClient } from "@/app/signup/verify-phone/_client"
import { SignupSetPasswordClient } from "@/app/signup/set-password/_client"
import LoginPage from "@/app/login/page"
import { SignupShell } from "@/components/onboarding/signup-shell"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { GettingStartedHome } from "@/components/getting-started/getting-started-home"
import { NewMerchantProductGate } from "@/components/getting-started/product-page"
import { ProductOnboardingPage } from "@/components/getting-started/product-onboarding-page"
import { JourneyLink } from "@/components/getting-started/navigation"

export default async function OnboardingDemoPage({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params
  const route = path.join("/")
  if (route === "") return <SignupShell><SignupPhoneClient /></SignupShell>
  if (route === "verify-phone") return <SignupShell><Suspense><SignupVerifyPhoneClient /></Suspense></SignupShell>
  if (route === "set-password") return <SignupShell><SignupSetPasswordClient /></SignupShell>
  if (route === "login") return <LoginPage />
  if (route === "home") return <TransactionsPlatformShell><GettingStartedHome /></TransactionsPlatformShell>

  const [section, product] = path
  if ((section === "products" || section === "setup") && path.length === 2) {
    if (product !== "in-store" && product !== "payment-links" && product !== "checkout") notFound()
    if (section === "setup") return <ProductOnboardingPage product={product} />
    return <TransactionsPlatformShell><NewMerchantProductGate product={product}>{null}</NewMerchantProductGate></TransactionsPlatformShell>
  }
  if (["payments", "settlements", "refunds", "disputes", "reports"].includes(route)) return <TransactionsPlatformShell>{null}</TransactionsPlatformShell>
  if (route === "support") return <TransactionsPlatformShell>
    <div className="mx-auto max-w-[800px] space-y-6 px-6 py-10">
      <h1 className="text-2xl font-semibold">Setup help</h1>
      <p className="text-sm leading-6 text-muted-foreground">Your progress is saved. Return to Overview to continue a product whenever you're ready.</p>
      <div className="divide-y divide-border">
        <details className="py-4"><summary className="cursor-pointer text-sm font-medium">Where do I find my order?</summary><p className="mt-2 text-sm leading-6 text-muted-foreground">Open In-store from Overview. After the demo payment, you'll see tracking and the latest delivery status there.</p></details>
        <details className="py-4"><summary className="cursor-pointer text-sm font-medium">Do I need to enter my business details again?</summary><p className="mt-2 text-sm leading-6 text-muted-foreground">Business and bank details are shared between the products in this demo.</p></details>
        <details className="py-4"><summary className="cursor-pointer text-sm font-medium">Will this demo charge me?</summary><p className="mt-2 text-sm leading-6 text-muted-foreground">No. Signup, verification, orders, payments and activation are simulated.</p></details>
      </div>
      <JourneyLink href="/" className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Back to Overview</JourneyLink>
    </div>
  </TransactionsPlatformShell>
  notFound()
}
