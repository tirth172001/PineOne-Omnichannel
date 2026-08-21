"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CircleNotchIcon } from "@phosphor-icons/react"
import { useSignupSession } from "@/components/onboarding/signup-session"
import { StaggerField, StaggerFields } from "@/components/onboarding/stagger-fields"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"

const DEMO_CODE = "123456"
const RESEND_SECONDS = 30

export function SignupOtpClient() {
  const router = useRouter()
  const { email } = useSignupSession()
  const [code, setCode] = useState("")
  const [error, setError] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [resendIn, setResendIn] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (resendIn <= 0) return
    const timer = window.setInterval(() => setResendIn((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [resendIn])

  useEffect(() => {
    if (code.length !== 6) return
    if (code !== DEMO_CODE) {
      setError(true)
      const clear = window.setTimeout(() => setCode(""), 400)
      return () => window.clearTimeout(clear)
    }
    setError(false)
    setVerifying(true)
    const timeout = window.setTimeout(() => router.push("/signup/business-name"), 900)
    return () => window.clearTimeout(timeout)
  }, [code, router])

  return (
    <StaggerFields className="space-y-8">
      <StaggerField className="space-y-2">
        <h1 className="text-2xl font-semibold leading-8 text-card-foreground">Confirm your email</h1>
        <p className="text-sm font-medium leading-5 text-muted-foreground">
          Enter the 6-digit code we sent to{" "}
          <span className="text-foreground">{email ?? "your email"}</span>.
        </p>
      </StaggerField>

      <StaggerField className="space-y-4">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={(value) => {
            setCode(value)
            if (error) setError(false)
          }}
          disabled={verifying}
          containerClassName="justify-center"
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        {error ? (
          <p className="text-center text-sm text-destructive">That code isn&apos;t right — try again.</p>
        ) : verifying ? (
          <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <CircleNotchIcon size={14} className="animate-spin" /> Verifying…
          </p>
        ) : null}

        <p className="text-center text-sm text-muted-foreground">
          {resendIn > 0 ? (
            `Resend code in ${resendIn}s`
          ) : (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0 text-sm"
              onClick={() => {
                setResendIn(RESEND_SECONDS)
                setCode("")
                setError(false)
              }}
            >
              Resend code
            </Button>
          )}
        </p>
      </StaggerField>
    </StaggerFields>
  )
}
