"use client"

import Link from "next/link"
import { type FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
    <AuthShell title="Log in to your account">
      <form className="space-y-4" onSubmit={onLogin}>
        <div className="space-y-2">
          <Label htmlFor="email">Username or Email</Label>
          <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pr-10"
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
        </div>

        {error ? <p className="text-xs text-destructive">{error}</p> : null}

        <Button className="w-full" type="submit">
          Log in
        </Button>
      </form>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs uppercase text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/signup">Create account</Link>
        </Button>
      </div>
    </AuthShell>
  )
}
