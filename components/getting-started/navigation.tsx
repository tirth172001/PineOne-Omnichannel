"use client"

import { forwardRef, useMemo, type ComponentProps } from "react"
import NextLink from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { isOnboardingDemoPath, onboardingDemoHref, originalOnboardingPath } from "@/lib/onboarding-environment.js"

export function useIsOnboardingDemo() {
  return isOnboardingDemoPath(usePathname())
}

export function useJourneyPathname() {
  return originalOnboardingPath(usePathname())
}

export function useJourneyRouter() {
  const router = useRouter()
  const demo = useIsOnboardingDemo()
  return useMemo(() => ({
    ...router,
    push: (href: string, options?: Parameters<typeof router.push>[1]) => router.push(demo ? onboardingDemoHref(href) : href, options),
    replace: (href: string, options?: Parameters<typeof router.replace>[1]) => router.replace(demo ? onboardingDemoHref(href) : href, options),
    prefetch: (href: string, options?: Parameters<typeof router.prefetch>[1]) => router.prefetch(demo ? onboardingDemoHref(href) : href, options),
  }), [router, demo])
}

export const JourneyLink = forwardRef<HTMLAnchorElement, ComponentProps<typeof NextLink>>(function JourneyLink({ href, ...props }, ref) {
  const demo = useIsOnboardingDemo()
  const scopedHref = !demo ? href : typeof href === "string"
    ? onboardingDemoHref(href)
    : { ...href, pathname: onboardingDemoHref(href.pathname ?? "/") }
  return <NextLink {...props} ref={ref} href={scopedHref} />
})
