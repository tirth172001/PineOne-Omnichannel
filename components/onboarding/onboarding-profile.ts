"use client"

import { useSyncExternalStore } from "react"

// Shared accumulated form state for the whole post-business-name preview (ticket 15,
// .scratch/onboarding-experience/issues/15-architect-persistent-preview-panel.md). Same
// module-scoped store pattern as onboarding-person.ts — survives Next.js App Router client-side
// navigation between routes in this sequence, resets on a hard reload.
//
// `store`'s address can come from exactly one of three methods (ticket 08,
// .scratch/onboarding-experience-v3/issues/08-store-address-capture-methods.md) — only the field
// for the method actually used is populated, the other two stay null.
export type StoreManualAddress = {
  addressLine1: string
  addressLine2: string
  landmark: string
  district: string
  city: string
  state: string
  country: string
  pincode: string
}

export type StoreCoordinates = { latitude: number; longitude: number }

export type OnboardingProfile = {
  verification: { method: "singpass" | "manual" | null; verified: boolean; fileName: string | null }
  basics: { categoryId: string | null }
  store: {
    mapsLink: string | null
    currentLocation: StoreCoordinates | null
    manualAddress: StoreManualAddress | null
    photoUrl: string | null
    skipPhoto: boolean
  }
  webApp: { website: string | null; appLink: string | null }
  banking: { step: "upload" | "reading" | "confirm"; fileName: string | null }
  verifying: boolean
}

const EMPTY_PROFILE: OnboardingProfile = {
  verification: { method: null, verified: false, fileName: null },
  basics: { categoryId: null },
  store: { mapsLink: null, currentLocation: null, manualAddress: null, photoUrl: null, skipPhoto: false },
  webApp: { website: null, appLink: null },
  banking: { step: "upload", fileName: null },
  verifying: false,
}

let profile: OnboardingProfile = EMPTY_PROFILE
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

export function getProfile() {
  return profile
}

export function updateProfile(patch: Partial<OnboardingProfile>) {
  profile = { ...profile, ...patch }
  notify()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useProfile() {
  return useSyncExternalStore(subscribe, getProfile, () => EMPTY_PROFILE)
}
