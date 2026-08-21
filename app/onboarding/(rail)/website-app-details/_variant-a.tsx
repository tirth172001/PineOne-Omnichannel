"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { OnboardingTopBar } from "@/components/onboarding/onboarding-top-bar"
import { updateProfile } from "@/components/onboarding/onboarding-profile"
import { StaggerField, StaggerFields } from "@/components/onboarding/stagger-fields"
import { StepProgressBar } from "@/components/onboarding/step-progress-bar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

// Variant A — the Business Profile document continues. The preview itself now lives in the
// persistent OnboardingPreview (ticket 15) — this file just syncs its local state into the
// shared profile store as it changes.
export function VariantA() {
  const router = useRouter()
  const [hasWebsite, setHasWebsite] = useState(false)
  const [website, setWebsite] = useState("")
  const [hasApp, setHasApp] = useState(false)
  const [appLink, setAppLink] = useState("")

  useEffect(() => {
    updateProfile({
      webApp: { website: hasWebsite && website ? website : null, appLink: hasApp && appLink ? appLink : null },
    })
  }, [hasWebsite, website, hasApp, appLink])

  return (
    <section className="relative flex h-full flex-col overflow-y-auto rounded-md bg-background p-6 sm:p-10">
      <OnboardingTopBar className="left-6 right-6 top-6 sm:left-10 sm:right-10 sm:top-10" />
      <StaggerFields className="mx-auto flex w-full max-w-[420px] flex-1 flex-col gap-7 pt-24 pb-8 sm:pt-28">
        <StepProgressBar />

        <StaggerField className="space-y-2">
          <h1 className="text-balance text-2xl font-semibold leading-8 text-foreground">
            Do you accept payments online?
          </h1>
          <p className="text-sm leading-5 text-muted-foreground">
            Optional — skip this if you only sell in person.
          </p>
        </StaggerField>

        <StaggerField className="space-y-3 rounded-xl border border-border p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Checkbox checked={hasWebsite} onCheckedChange={(checked) => setHasWebsite(checked === true)} />
            I have a website
          </label>
          {hasWebsite ? (
            <Input
              placeholder="https://example.com"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          ) : null}
        </StaggerField>

        <StaggerField className="space-y-3 rounded-xl border border-border p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Checkbox checked={hasApp} onCheckedChange={(checked) => setHasApp(checked === true)} />
            I have a mobile app
          </label>
          {hasApp ? (
            <Input
              placeholder="https://apps.apple.com/…"
              value={appLink}
              onChange={(event) => setAppLink(event.target.value)}
            />
          ) : null}
        </StaggerField>

        <StaggerField>
          <Button type="button" size="lg" className="w-full" onClick={() => router.push("/onboarding/banking-details")}>
            Continue
          </Button>
        </StaggerField>
      </StaggerFields>
    </section>
  )
}
