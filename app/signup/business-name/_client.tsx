"use client"

import { type FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ProductIntentPicker } from "@/components/onboarding/product-intent-picker"
import { getSignupSession, setSignupBusinessName } from "@/components/onboarding/signup-session"
import { StaggerField, StaggerFields } from "@/components/onboarding/stagger-fields"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignupBusinessNameClient() {
  const router = useRouter()
  const [businessName, setBusinessName] = useState(() => getSignupSession().businessName ?? "")

  // Synced into the shared session store (rather than read directly from local state) so the
  // preview panel — a sibling component, not a parent/child of this form — can reflect the name
  // live as the user types, the same way every other step's fields feed onboarding-profile.ts.
  useEffect(() => {
    setSignupBusinessName(businessName)
  }, [businessName])

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!businessName.trim()) return
    router.push("/onboarding/business-verification")
  }

  return (
    <form onSubmit={onSubmit}>
      <StaggerFields className="space-y-8">
        <StaggerField className="space-y-2">
          <h1 className="text-2xl font-semibold leading-8 text-card-foreground">What&apos;s your business called?</h1>
          <p className="text-sm font-medium leading-5 text-muted-foreground">
            This is the name we&apos;ll use across your Pine One account.
          </p>
        </StaggerField>

        <StaggerField className="space-y-1.5">
          <Label htmlFor="signup-business-name" className="sr-only">
            Business name
          </Label>
          <Input
            id="signup-business-name"
            autoFocus
            className="h-8 bg-input/30"
            placeholder="Enter your business name"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
          />
        </StaggerField>

        <StaggerField>
          <ProductIntentPicker />
        </StaggerField>

        <StaggerField className="flex flex-col gap-3">
          <Button type="submit" size="lg" className="w-full" disabled={!businessName.trim()}>
            Continue
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => router.push("/onboarding/request-access-existing-merchant")}
          >
            I&apos;m already registered with Pine Labs
          </Button>
        </StaggerField>
      </StaggerFields>
    </form>
  )
}
