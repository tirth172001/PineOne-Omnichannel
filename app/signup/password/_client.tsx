"use client"

import { type FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react"
import { StaggerField, StaggerFields } from "@/components/onboarding/stagger-fields"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const MIN_LENGTH = 8

type Strength = "empty" | "weak" | "fair" | "strong"

function passwordStrength(value: string): Strength {
  if (!value) return "empty"
  if (value.length < MIN_LENGTH) return "weak"
  const variety = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((pattern) => pattern.test(value)).length
  return value.length >= 12 && variety >= 3 ? "strong" : "fair"
}

const STRENGTH_COPY: Record<Strength, { label: string; className: string }> = {
  empty: { label: "", className: "bg-muted" },
  weak: { label: "Too short — use at least 8 characters", className: "bg-destructive" },
  fair: { label: "Good — add a number or symbol to make it stronger", className: "bg-warning" },
  strong: { label: "Strong password", className: "bg-success" },
}

export function SignupPasswordClient() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const strength = passwordStrength(password)
  const canSubmit = password.length >= MIN_LENGTH

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return
    router.push("/signup/otp")
  }

  return (
    <form onSubmit={onSubmit}>
      <StaggerFields className="space-y-8">
        <StaggerField className="space-y-2">
          <h1 className="text-2xl font-semibold leading-8 text-card-foreground">Create a password</h1>
          <p className="text-sm font-medium leading-5 text-muted-foreground">
            Use at least {MIN_LENGTH} characters — you&apos;ll use this to log in from now on.
          </p>
        </StaggerField>

        <StaggerField className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="signup-password" className="sr-only">
              Password
            </Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                autoFocus
                className="h-8 bg-input/30 pr-8"
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeSlashIcon size={15} /> : <EyeIcon size={15} />}
              </button>
            </div>

            <div className="flex gap-1 pt-1">
              {(["weak", "fair", "strong"] as const).map((tier, index) => {
                const reached =
                  strength !== "empty" && ["weak", "fair", "strong"].indexOf(strength) >= index
                return (
                  <span
                    key={tier}
                    className={cn("h-1 flex-1 rounded-full bg-muted", reached && STRENGTH_COPY[strength].className)}
                  />
                )
              })}
            </div>
            {strength !== "empty" ? (
              <p
                className={cn(
                  "text-xs",
                  strength === "weak" ? "text-destructive" : strength === "strong" ? "text-success" : "text-muted-foreground"
                )}
              >
                {STRENGTH_COPY[strength].label}
              </p>
            ) : null}
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
            Continue
          </Button>
        </StaggerField>
      </StaggerFields>
    </form>
  )
}
