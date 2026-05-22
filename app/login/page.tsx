"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { type FormEvent, useEffect, useMemo, useState } from "react"
import { CaretDown, Moon, Sun } from "@phosphor-icons/react"
import { useTheme } from "next-themes"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DEFAULT_LANGUAGE,
  readLanguagePreference,
  writeLanguagePreference,
} from "@/lib/language-settings"
import { readDummyAuthSession, writeDummyAuthSession } from "@/lib/dummy-auth"

const imgLine = "https://www.figma.com/api/mcp/asset/1c3d4486-78bf-42f4-bc1e-1a5ece78800e"
const imgVector3 = "https://www.figma.com/api/mcp/asset/7964ee79-a0f1-4c95-b33b-37968f22bfb5"
const imgVector4 = "https://www.figma.com/api/mcp/asset/d3e31bb0-de0f-4534-956b-21f94f744993"
const imgVector5 = "https://www.figma.com/api/mcp/asset/9cefef26-dec3-4f3d-99d9-48e45ef80641"

const Grainient = dynamic(() => import("@/components/Grainient"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[linear-gradient(165deg,#365314_0%,#D9F99D_50%,#365314_100%)]" />,
})

const LOGIN_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "mr", label: "मराठी" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "bn", label: "বাংলা" },
  { code: "ml", label: "മലയാളം" },
] as const

function displayNameFromIdentifier(identifier: string) {
  const localPart = identifier.includes("@") ? (identifier.split("@")[0] ?? "") : identifier
  const cleaned = localPart.replace(/[._-]+/g, " ").trim()
  if (!cleaned) return "Merchant User"

  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((token) => token[0]?.toUpperCase() + token.slice(1))
    .join(" ")
}

function normalizedEmail(identifier: string) {
  const trimmed = identifier.trim()
  if (trimmed.includes("@")) return trimmed
  return `${trimmed.replace(/\s+/g, "").toLowerCase()}@pinelabs.com`
}

export default function LoginPage() {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()

  const [identifier, setIdentifier] = useState("")
  const [error, setError] = useState("")
  const [showVisualPanel, setShowVisualPanel] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [languageCode, setLanguageCode] = useState(DEFAULT_LANGUAGE.code)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)

  useEffect(() => {
    if (readDummyAuthSession()) {
      router.replace("/")
    }
  }, [router])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const update = () => setShowVisualPanel(mediaQuery.matches)
    update()
    mediaQuery.addEventListener("change", update)
    return () => mediaQuery.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    setMounted(true)
    setLanguageCode(readLanguagePreference().code)
  }, [])

  const canSubmit = useMemo(() => identifier.trim().length > 0, [identifier])
  const isDark = mounted ? resolvedTheme !== "light" : true
  const selectedLanguage = LOGIN_LANGUAGES.find((language) => language.code === languageCode) ?? LOGIN_LANGUAGES[0]

  function onContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) {
      setError("Enter email ID, username, or mobile number.")
      return
    }

    const value = identifier.trim()
    writeDummyAuthSession({
      email: normalizedEmail(value),
      name: displayNameFromIdentifier(value),
      role: "Admin",
      loggedInAt: new Date().toISOString(),
    })
    router.replace("/")
  }

  return (
    <div className="min-h-screen bg-sidebar p-2">
      <div className="grid h-[calc(100vh-1rem)] w-full items-stretch grid-cols-1 gap-2 lg:grid-cols-2">
        <div className="relative hidden h-full overflow-hidden rounded-md bg-[linear-gradient(165deg,#365314_0%,#D9F99D_50%,#365314_100%)] lg:block">
          {showVisualPanel ? (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-1/2 top-1/2 h-[1080px] w-[1080px] -translate-x-1/2 -translate-y-1/2">
                <Grainient
                  className="h-full w-full"
                  color1="#365314"
                  color2="#D9F99D"
                  color3="#365314"
                  timeSpeed={0.25}
                  colorBalance={0}
                  warpStrength={1}
                  warpFrequency={5}
                  warpSpeed={2}
                  warpAmplitude={50}
                  blendAngle={0}
                  blendSoftness={0.05}
                  rotationAmount={500}
                  noiseScale={2}
                  grainAmount={0.1}
                  grainScale={2}
                  grainAnimated={false}
                  contrast={1.5}
                  gamma={1}
                  saturation={1}
                  centerX={0}
                  centerY={0}
                  zoom={0.9}
                />
              </div>
            </div>
          ) : null}
          <div className="pointer-events-none absolute inset-0">
            <img alt="" className="size-full object-cover" src="/brand/login-left-overlay.svg" />
          </div>
        </div>

        <section className="relative flex h-full rounded-md bg-background p-5 sm:p-8 lg:p-10">
          <div className="absolute left-5 right-5 top-5 flex items-center justify-between sm:left-8 sm:right-8 sm:top-8 lg:left-10 lg:right-10 lg:top-10">
            <div className="p-1">
              <img
                alt="Pine One"
                className="h-10 w-auto"
                src={isDark ? "/brand/pineone-omni-logo.svg" : "/brand/pineone-omni-logo-light.svg"}
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent"
                type="button"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <Sun size={16} weight="regular" /> : <Moon size={16} weight="regular" />}
              </button>

              <DropdownMenu open={languageMenuOpen} onOpenChange={setLanguageMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-input bg-input/30 px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-input/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:border-ring data-[state=open]:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_50%,transparent)]"
                    type="button"
                  >
                    {selectedLanguage.label}
                    <CaretDown size={16} weight="regular" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-44 rounded-[10px] border border-border bg-popover p-1 text-popover-foreground shadow-md"
                >
                  <DropdownMenuLabel className="px-1.5 py-1 text-xs text-muted-foreground">
                    Select language
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={languageCode}
                    onValueChange={(value) => {
                      setLanguageCode(value)
                      writeLanguagePreference(value)
                    }}
                  >
                    {LOGIN_LANGUAGES.map((language) => (
                      <DropdownMenuRadioItem
                        key={language.code}
                        value={language.code}
                        className="h-7 max-h-7 rounded-md py-1 pr-8 pl-1.5 text-sm"
                      >
                        {language.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[320px] items-center justify-center">
            <form className="w-full space-y-8" onSubmit={onContinue}>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold leading-8 text-card-foreground">Login to your account</h1>
                <p className="text-sm font-medium leading-5 text-muted-foreground">
                  Don’t have an account?{" "}
                  <Link href="/signup" className="text-primary underline underline-offset-2">
                    Sign up
                  </Link>
                </p>
              </div>

              <div className="space-y-4">
                <input
                  className="h-8 w-full rounded-lg border border-input bg-input/30 px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                  placeholder="Enter email ID, user name, mobile number..."
                  value={identifier}
                  onChange={(event) => {
                    setIdentifier(event.target.value)
                    if (error) setError("")
                  }}
                />

                <button
                  className="h-8 w-full cursor-pointer rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                  type="submit"
                  disabled={!canSubmit}
                >
                  Continue
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2">
                    <img alt="" className="block h-full w-full" src={imgLine} />
                  </div>
                  <span className="relative bg-background px-2 text-sm font-medium text-muted-foreground">OR</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    aria-label="Continue with Google"
                    className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-input bg-input/30 hover:bg-input/50"
                    type="button"
                  >
                    <img alt="" className="size-4" src={imgVector3} />
                  </button>
                  <button
                    aria-label="Continue with Facebook"
                    className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-input bg-input/30 hover:bg-input/50"
                    type="button"
                  >
                    <img alt="" className="size-4" src={imgVector4} />
                  </button>
                  <button
                    aria-label="Continue with Apple"
                    className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-input bg-input/30 hover:bg-input/50"
                    type="button"
                  >
                    <img alt="" className="size-4" src={imgVector5} />
                  </button>
                </div>

                {error ? <p className="text-sm text-destructive">{error}</p> : null}
              </div>

              <p className="text-sm font-medium leading-5 text-muted-foreground">
                By signing in, you agree to the{" "}
                <a className="text-primary underline underline-offset-2" href="#">
                  Privacy policy
                </a>{" "}
                and{" "}
                <a className="text-primary underline underline-offset-2" href="#">
                  T&amp;C PineLabs grievance policy
                </a>{" "}
                for reference.
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
