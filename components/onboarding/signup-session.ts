"use client"

import { useSyncExternalStore } from "react"

import type { ProductCategoryId } from "./product-catalog"

// Carries the email forward across the /signup/* routes (e.g. so /signup/otp can say "We sent a
// code to x@y.com") — same module-scoped-store pattern as onboarding-profile.ts. Resets on a hard
// reload; nothing in this sequence redirect-gates on it, matching how the rest of the onboarding
// routes stay directly reachable rather than enforcing step order.
//
// `selectedCategories` (ticket 06, .scratch/onboarding-experience-v3/issues/06-product-intent-capture-ui.md)
// carries the business-name step's product-intent selection forward the same way — plain
// module-scoped state, readable from anywhere in the app during client-side navigation (including
// from inside app/onboarding/* once the sequence starts), since Next.js App Router doesn't remount
// the JS runtime between routes. Ticket 07 reads this to decide whether store-verification runs.
// `businessName` (ticket 06) is read live by the preview panel (see onboarding-preview.tsx) as the
// user types on the business-name step — the same module-scoped store, not local component state,
// so a sibling component can reflect it without prop drilling.
export type SignupSession = { email: string | null; businessName: string | null; selectedCategories: ProductCategoryId[] }

const EMPTY: SignupSession = { email: null, businessName: null, selectedCategories: [] }
let session: SignupSession = EMPTY
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

export function getSignupSession() {
  return session
}

export function setSignupEmail(email: string) {
  session = { ...session, email }
  notify()
}

export function setSignupBusinessName(businessName: string) {
  session = { ...session, businessName: businessName.trim() ? businessName : null }
  notify()
}

export function toggleProductCategory(id: ProductCategoryId) {
  const selectedCategories = session.selectedCategories.includes(id)
    ? session.selectedCategories.filter((categoryId) => categoryId !== id)
    : [...session.selectedCategories, id]
  session = { ...session, selectedCategories }
  notify()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useSignupSession() {
  return useSyncExternalStore(subscribe, getSignupSession, () => EMPTY)
}
