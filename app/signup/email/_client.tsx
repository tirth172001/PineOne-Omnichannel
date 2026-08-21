"use client"

import { type FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { setSignupEmail } from "@/components/onboarding/signup-session"
import { StaggerField, StaggerFields } from "@/components/onboarding/stagger-fields"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function SignupEmailClient() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = email.trim()
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError("Enter a valid email address.")
      return
    }
    setSignupEmail(trimmed)
    router.push("/signup/password")
  }

  return (
    <form onSubmit={onSubmit}>
      <StaggerFields className="space-y-8">
        <StaggerField className="space-y-2">
          <h1 className="text-2xl font-semibold leading-8 text-card-foreground">What&apos;s your work email?</h1>
          <p className="text-sm font-medium leading-5 text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline underline-offset-2">
              Log in
            </Link>
          </p>
        </StaggerField>

        <StaggerField className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="signup-email" className="sr-only">
              Work email
            </Label>
            <Input
              id="signup-email"
              type="email"
              autoFocus
              className="h-8 bg-input/30"
              placeholder="Enter your work email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (error) setError("")
              }}
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={!email.trim()}>
            Continue
          </Button>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </StaggerField>
      </StaggerFields>
    </form>
  )
}
