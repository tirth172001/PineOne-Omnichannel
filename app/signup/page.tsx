"use client"

import Link from "next/link"
import { type FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { readDummyAuthSession, writeDummyAuthSession } from "@/lib/dummy-auth"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("Animesh Mandal")
  const [company, setCompany] = useState("Pine Labs Partner")
  const [email, setEmail] = useState("tirth@pinelabs.com")
  const [password, setPassword] = useState("pine@1234")
  const [error, setError] = useState("")

  useEffect(() => {
    if (readDummyAuthSession()) {
      router.replace("/")
    }
  }, [router])

  const canSubmit = useMemo(
    () => name.trim().length > 0 && company.trim().length > 0 && email.trim().length > 0 && password.trim().length > 0,
    [name, company, email, password],
  )

  function onSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) {
      setError("Fill all fields to continue.")
      return
    }

    writeDummyAuthSession({
      email: email.trim(),
      name: name.trim(),
      role: "Admin",
      loggedInAt: new Date().toISOString(),
    })
    router.replace("/")
  }

  return (
    <AuthShell title="Create your account" subtitle="Set up your dummy account to access the dashboard.">
      <form className="space-y-4" onSubmit={onSignup}>
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company name</Label>
          <Input id="company" value={company} onChange={(event) => setCompany(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>

        {error ? <p className="text-xs text-destructive">{error}</p> : null}

        <Button className="w-full" type="submit">
          Create account
        </Button>
      </form>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs uppercase text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Already have an account? Log in</Link>
        </Button>
      </div>
    </AuthShell>
  )
}
