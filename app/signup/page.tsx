"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { AuthFlowActions, AuthFlowCard, AuthFlowFieldGroup, AuthFlowFieldList, AuthFlowHeader } from "@/components/auth/auth-flow-card"
import { readDummyAuthSession } from "@/lib/dummy-auth"
import { Eye, EyeOff } from "lucide-react"

const productOptions = ["Checkout", "POS Terminal", "Payment Links", "Merchant Lending"]
const screeningOptions = [
  "Registered with the SEC",
  "A publicly-traded company",
  "Majority owned by a public company",
  "An internet gambling business",
  "Dealing with Controlled Substances (THC, other Schedule I drugs)",
  "Involved in sale/distribution/manufacturing of firearms or ammunition",
  "A government organization",
  "Part of a tax anticipation program",
  "An adult entertainment business",
]

const signupSteps = [
  "mobile",
  "email",
  "company",
  "screening",
  "legal",
  "credentials",
  "products",
  "otp",
  "verified",
] as const

type SignupStep = (typeof signupSteps)[number]

export default function SignupPage() {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [mobile, setMobile] = useState("9876543210")
  const [email, setEmail] = useState("tirth@pinelabs.com")
  const [companyName, setCompanyName] = useState("Pine One Technologies")
  const [screeningSelections, setScreeningSelections] = useState<string[]>([])
  const [firstName, setFirstName] = useState("Tirth")
  const [lastName, setLastName] = useState("Trivedi")
  const [password, setPassword] = useState("pineone@123")
  const [showPassword, setShowPassword] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>(["Checkout", "POS Terminal"])
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")

  const currentStep: SignupStep = signupSteps[stepIndex]

  useEffect(() => {
    if (readDummyAuthSession()) {
      router.replace("/")
    }
  }, [router])

  const canProceed = useMemo(() => {
    if (currentStep === "mobile") return mobile.trim().length === 10
    if (currentStep === "email") return /.+@.+\..+/.test(email.trim())
    if (currentStep === "company") return companyName.trim().length >= 2
    if (currentStep === "screening") return true
    if (currentStep === "legal") return firstName.trim().length > 0 && lastName.trim().length > 0
    if (currentStep === "credentials") return /.+@.+\..+/.test(email.trim()) && password.trim().length >= 10
    if (currentStep === "products") return selectedProducts.length > 0
    if (currentStep === "otp") return otp.trim().length === 6
    return true
  }, [companyName, currentStep, email, firstName, lastName, mobile, otp, password, selectedProducts.length])

  function goNext() {
    if (!canProceed) {
      if (currentStep === "mobile") setError("Enter a valid 10-digit mobile number.")
      if (currentStep === "email") setError("Enter a valid email address.")
      if (currentStep === "company") setError("Enter your company name.")
      if (currentStep === "legal") setError("Enter first and last name to continue.")
      if (currentStep === "credentials") setError("Use a valid email and minimum 10-character password.")
      if (currentStep === "products") setError("Select at least one product to continue.")
      if (currentStep === "otp") setError("Enter the 6-digit OTP to continue.")
      return
    }

    setError("")

    if (currentStep === "verified") {
      const query = new URLSearchParams({
        email: email.trim(),
        mobile: mobile.trim(),
        company: companyName.trim(),
        products: selectedProducts.join(","),
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      })
      router.push(`/onboarding/account?${query.toString()}`)
      return
    }

    setStepIndex((prev) => Math.min(prev + 1, signupSteps.length - 1))
  }

  function goBack() {
    setError("")
    setStepIndex((prev) => Math.max(prev - 1, 0))
  }

  function toggleProduct(product: string) {
    setSelectedProducts((prev) =>
      prev.includes(product) ? prev.filter((entry) => entry !== product) : [...prev, product],
    )
  }

  function toggleScreening(option: string) {
    setScreeningSelections((prev) =>
      prev.includes(option) ? prev.filter((entry) => entry !== option) : [...prev, option],
    )
  }

  function renderStep() {
    if (currentStep === "mobile") {
      return (
        <>
          <AuthFlowHeader title="Enter your mobile number" description="We use this for OTP verification." />
          <AuthFlowFieldGroup>
            <Label htmlFor="mobile">Mobile number</Label>
            <Input
              id="mobile"
              inputMode="numeric"
              maxLength={10}
              value={mobile}
              onChange={(event) => setMobile(event.target.value.replace(/[^\d]/g, "").slice(0, 10))}
              className="h-10"
              placeholder="9876543210"
            />
          </AuthFlowFieldGroup>
        </>
      )
    }

    if (currentStep === "email") {
      return (
        <>
          <AuthFlowHeader title="What is your work email?" description="We’ll send onboarding updates here." />
          <AuthFlowFieldGroup>
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-10"
              placeholder="name@company.com"
            />
          </AuthFlowFieldGroup>
        </>
      )
    }

    if (currentStep === "company") {
      return (
        <>
          <AuthFlowHeader title="What is your company&apos;s name?" description="This appears on your account." />
          <AuthFlowFieldGroup>
            <Label htmlFor="companyName">Company name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              className="h-10"
              placeholder="e.g. Mobbin"
            />
          </AuthFlowFieldGroup>
        </>
      )
    }

    if (currentStep === "screening") {
      return (
        <>
          <AuthFlowHeader title="Is your company any of the following?" />
          <div className="space-y-4">
            {screeningOptions.map((option) => (
              <label key={option} className="flex items-start gap-2.5 text-sm text-foreground">
                <Checkbox
                  checked={screeningSelections.includes(option)}
                  onCheckedChange={() => toggleScreening(option)}
                  className="mt-0.5"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </>
      )
    }

    if (currentStep === "legal") {
      return (
        <>
          <AuthFlowHeader title="Create your account" description="What&apos;s your legal name?" />
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthFlowFieldGroup>
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} className="h-10" />
            </AuthFlowFieldGroup>
            <AuthFlowFieldGroup>
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" value={lastName} onChange={(event) => setLastName(event.target.value)} className="h-10" />
            </AuthFlowFieldGroup>
          </div>
        </>
      )
    }

    if (currentStep === "credentials") {
      return (
        <>
          <AuthFlowHeader title="What&apos;s your email and password?" description="Use these credentials to sign in." />
          <AuthFlowFieldList>
            <AuthFlowFieldGroup>
              <Label htmlFor="credentialEmail">Work email</Label>
              <Input id="credentialEmail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-10" />
            </AuthFlowFieldGroup>
            <AuthFlowFieldGroup>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 my-auto flex h-5 w-5 items-center justify-center text-muted-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Minimum 10 characters</p>
            </AuthFlowFieldGroup>
          </AuthFlowFieldList>
        </>
      )
    }

    if (currentStep === "products") {
      return (
        <>
          <AuthFlowHeader title="Choose products to enable" description="KYC checks adapt to selected products." />
          <div className="grid gap-2 sm:grid-cols-2">
            {productOptions.map((product) => (
              <label key={product} className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2">
                <Checkbox checked={selectedProducts.includes(product)} onCheckedChange={() => toggleProduct(product)} />
                <span className="text-sm text-foreground">{product}</span>
              </label>
            ))}
          </div>
        </>
      )
    }

    if (currentStep === "otp") {
      return (
        <>
          <AuthFlowHeader title="Verify OTP" description={`We sent a 6-digit code to +91 ${mobile}.`} />
          <AuthFlowFieldGroup>
            <InputOTP id="otp" maxLength={6} value={otp} onChange={setOtp} containerClassName="w-full justify-start">
              <InputOTPGroup className="gap-2">
                <InputOTPSlot index={0} className="h-10 w-10 !rounded-lg !border !border-input !bg-background first:!rounded-lg last:!rounded-lg" />
                <InputOTPSlot index={1} className="h-10 w-10 !rounded-lg !border !border-input !bg-background first:!rounded-lg last:!rounded-lg" />
                <InputOTPSlot index={2} className="h-10 w-10 !rounded-lg !border !border-input !bg-background first:!rounded-lg last:!rounded-lg" />
                <InputOTPSlot index={3} className="h-10 w-10 !rounded-lg !border !border-input !bg-background first:!rounded-lg last:!rounded-lg" />
                <InputOTPSlot index={4} className="h-10 w-10 !rounded-lg !border !border-input !bg-background first:!rounded-lg last:!rounded-lg" />
                <InputOTPSlot index={5} className="h-10 w-10 !rounded-lg !border !border-input !bg-background first:!rounded-lg last:!rounded-lg" />
              </InputOTPGroup>
            </InputOTP>
          </AuthFlowFieldGroup>
        </>
      )
    }

    return (
      <>
        <AuthFlowHeader title="Email Successfully Verified" description="Continue to the onboarding workspace." />
      </>
    )
  }

  const primaryLabel =
    currentStep === "screening"
      ? screeningSelections.length > 0
        ? "Next"
        : "None of the Above"
      : currentStep === "credentials"
      ? "Start Application"
      : currentStep === "verified"
      ? "Continue"
      : currentStep === "otp"
      ? "Verify"
      : "Next"

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-40 h-14 border-b border-border/60 bg-sidebar px-3">
        <div className="flex h-full items-center justify-between">
          <Link
            href="/"
            className="flex items-center rounded-md px-2 py-1.5 transition-colors hover:bg-primary/10"
            aria-label="PineLabs home"
          >
            <img
              src="/brand/pine-labs-icon.ico"
              alt="PineLabs"
              className="h-6 w-6 rounded-sm object-contain grayscale brightness-0 contrast-200 dark:invert"
            />
          </Link>
          <Button asChild variant="outline" className="h-9 px-3 text-sm font-medium">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </header>

      <main className="flex min-h-[calc(100dvh-3.5rem)] items-start justify-center px-4 pb-8 pt-14">
        <AuthFlowCard>
          <div className="space-y-10">{renderStep()}</div>

          {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}

          <AuthFlowActions>
            <Button type="button" onClick={goNext} size="lg">
              {primaryLabel}
            </Button>
            {stepIndex > 0 && currentStep !== "verified" ? (
              <Button type="button" variant="outline" size="lg" onClick={goBack}>
                Back
              </Button>
            ) : null}
          </AuthFlowActions>

          {currentStep !== "verified" ? (
            <p className="mt-10 text-xs text-muted-foreground">
              By continuing, you confirm you are authorized to create this business account.
            </p>
          ) : null}
        </AuthFlowCard>
      </main>
    </div>
  )
}
