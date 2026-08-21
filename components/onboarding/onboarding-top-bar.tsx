// Shared top bar for every screen outside the authenticated dashboard shell — login, signup, and
// onboarding all render this identically: logo, language switcher, three-dot account menu. Ticket 09
// (.scratch/onboarding-experience-v3/issues/09-account-menu-scope-beyond-login.md) extended it from
// login-only to signup/onboarding too, at the user's direct request. Extracted from app/login/page.tsx
// rather than duplicated, so the language list and dropdown behavior stay in one place. Replaces
// onboarding-panel-logo.tsx, which rendered only the bare logo.
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CaretDownIcon, DotsThreeIcon, SignOutIcon } from "@phosphor-icons/react/ssr"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { clearDummyAuthSession } from "@/lib/dummy-auth"
import { DEFAULT_LANGUAGE, readLanguagePreference, writeLanguagePreference } from "@/lib/language-settings"
import { cn } from "@/lib/utils"

const TOP_BAR_LANGUAGES = [
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

// `className` positions the bar against the caller's own padding box — login (p-5/sm:p-8/lg:p-10)
// and signup/onboarding (p-6/sm:p-10) use different insets, so this stays a prop rather than baked in.
export function OnboardingTopBar({ className }: { className?: string }) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [languageCode, setLanguageCode] = useState(DEFAULT_LANGUAGE.code)

  useEffect(() => {
    setMounted(true)
    setLanguageCode(readLanguagePreference().code)
  }, [])

  const isDark = mounted ? resolvedTheme !== "light" : true
  const selectedLanguage = TOP_BAR_LANGUAGES.find((language) => language.code === languageCode) ?? TOP_BAR_LANGUAGES[0]

  return (
    <div className={cn("absolute flex items-center justify-between", className)}>
      <img
        alt="Pine One"
        className="h-7 w-auto"
        src={isDark ? "/brand/pineone-omni-logo.svg" : "/brand/pineone-omni-logo-light.svg"}
      />

      <div className="flex items-center gap-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-input bg-input/30 px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-input/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:border-ring data-[state=open]:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_50%,transparent)]"
              type="button"
            >
              {selectedLanguage.label}
              <CaretDownIcon size={16} weight="regular" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-44 rounded-[10px] border border-border bg-popover p-1 text-popover-foreground shadow-md"
          >
            <DropdownMenuLabel className="px-1.5 py-1 text-xs text-muted-foreground">Select language</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={languageCode}
              onValueChange={(value) => {
                setLanguageCode(value)
                writeLanguagePreference(value)
              }}
            >
              {TOP_BAR_LANGUAGES.map((language) => (
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-accent"
              type="button"
              aria-label="Account menu"
            >
              <DotsThreeIcon size={20} weight="bold" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-44 rounded-[10px] border border-border bg-popover p-1 text-popover-foreground shadow-md"
          >
            <DropdownMenuItem
              onSelect={() => {
                clearDummyAuthSession()
                router.replace("/login")
              }}
            >
              <SignOutIcon className="h-3.5 w-3.5" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
