"use client"

import { type FormEvent, useState } from "react"
import { JourneyLink as Link } from "@/components/getting-started/navigation"
import { useJourneyRouter as useRouter } from "@/components/getting-started/navigation"
import { StaggerField, StaggerFields } from "@/components/onboarding/stagger-fields"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * Quick signup, step 1 of 3: phone → OTP → password → straight to the
 * dashboard. Business and KYC details are asked later, inside whichever
 * product the merchant sets up first.
 */
export function SignupPhoneClient() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const digits = phone.replace(/\D/g, "")
  const valid = /^[6-9]\d{9}$/.test(digits)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid) return
    router.push(`/signup/verify-phone?phone=${digits}`)
  }

  return (
    <form onSubmit={onSubmit}>
      <StaggerFields className="space-y-8">
        <StaggerField className="space-y-2">
          <h1 className="text-2xl font-semibold leading-8 text-card-foreground">Let&apos;s create your account</h1>
          <p className="text-sm font-medium leading-5 text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline underline-offset-2">
              Log in
            </Link>
          </p>
        </StaggerField>

        <StaggerField className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="signup-phone" className="text-sm font-medium">
              Mobile number
            </Label>
            <div className="flex h-9 items-center rounded-[8px] border border-input bg-input/30 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              <span className="border-r border-input px-3 text-sm text-muted-foreground">+91</span>
              <Input
                id="signup-phone"
                type="tel"
                inputMode="numeric"
                autoFocus
                autoComplete="tel-national"
                aria-describedby="signup-phone-hint"
                className="h-full border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
                placeholder="98765 43210"
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/[^\d ]/g, "").slice(0, 11))}
              />
            </div>
            <p id="signup-phone-hint" className="text-xs text-muted-foreground">We&apos;ll send a 6-digit code to check it&apos;s yours. This demo uses 123456.</p>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={!valid}>
            Send code
          </Button>
        </StaggerField>
      </StaggerFields>
    </form>
  )
}
