"use client"

import { useSyncExternalStore } from "react"

// Unified Owner/Signatory model — one person can be a business owner, the authorised signatory,
// or both. Resolved by ticket 14
// (.scratch/onboarding-experience/issues/14-unify-person-model-and-card.md).
export type VerificationStatus = "unverified" | "verifying" | "verified"

export type Person = {
  id: string
  name: string
  designation: string
  ownershipPercent: number
  isSignatory: boolean
  verificationStatus: VerificationStatus
}

// Shared client-side store, module-scoped so it survives Next.js App Router client-side
// navigation between /onboarding/business-owners -> /onboarding/authorised-signatory ->
// /onboarding/face-authentication (no full page reload happens between these routes). This is
// the "local shared module" fallback ticket 14 allows ahead of ticket 15's real state-threading
// architecture — swap for whatever ticket 15 establishes once it resolves.
const EMPTY: Person[] = []
let people: Person[] = EMPTY
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

export function getPeople() {
  return people
}

export function setPeople(next: Person[]) {
  people = next
  notify()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function usePeople() {
  return useSyncExternalStore(subscribe, getPeople, () => EMPTY)
}

export function getSignatory() {
  return people.find((person) => person.isSignatory) ?? null
}

export function useSignatory() {
  const list = usePeople()
  return list.find((person) => person.isSignatory) ?? null
}

export function setSignatory(id: string) {
  setPeople(people.map((person) => ({ ...person, isSignatory: person.id === id })))
}

export function setVerificationStatus(id: string, status: VerificationStatus) {
  setPeople(people.map((person) => (person.id === id ? { ...person, verificationStatus: status } : person)))
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}
