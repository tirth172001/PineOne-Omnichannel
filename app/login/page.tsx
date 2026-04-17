"use client"

import Link from "next/link"
import { type FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthFlowActions, AuthFlowCard, AuthFlowFieldGroup, AuthFlowFieldList, AuthFlowHeader } from "@/components/auth/auth-flow-card"
import { readDummyAuthSession, writeDummyAuthSession } from "@/lib/dummy-auth"

function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "merchant"
  const cleaned = local.replace(/[._-]+/g, " ").trim()
  if (!cleaned) return "Merchant User"
  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("tirth@pinelabs.com")
  const [password, setPassword] = useState("pine@1234")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (readDummyAuthSession()) {
      router.replace("/")
    }
  }, [router])

  const canSubmit = useMemo(() => email.trim().length > 0 && password.trim().length > 0, [email, password])

  function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) {
      setError("Enter email and password to continue.")
      return
    }

    writeDummyAuthSession({
      email: email.trim(),
      name: nameFromEmail(email.trim()),
      role: "Admin",
      loggedInAt: new Date().toISOString(),
    })
    router.replace("/")
  }

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
            <Link href="/signup">Create account</Link>
          </Button>
        </div>
      </header>

      <main className="flex min-h-[calc(100dvh-3.5rem)] items-start justify-center px-4 pb-8 pt-14">
        <AuthFlowCard>
          <AuthFlowHeader title="Log in to your account" description="Use your work credentials to continue." />

          <form className="mt-10" onSubmit={onLogin}>
            <AuthFlowFieldList>
              <AuthFlowFieldGroup>
              <Label htmlFor="email">Work email</Label>
              <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-10" />
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              </AuthFlowFieldGroup>
            </AuthFlowFieldList>

            {error ? <p className="text-xs text-destructive">{error}</p> : null}

            <AuthFlowActions>
              <Button size="lg" type="submit">
                Log in
              </Button>
            </AuthFlowActions>
          </form>
        </AuthFlowCard>
      </main>
    </div>
  )
}
