"use client"

/**
 * Progressive onboarding for a merchant who has just signed up (phone → OTP →
 * password → dashboard). Nothing is set up yet, so the platform starts small —
 * Overview plus the three products — and grows as each product goes live.
 *
 * Each product moves through stages. In-store needs hardware, so it adds a
 * payment, an order to track and a setup guide before it can go live:
 *
 *   in-store:       intro → setup → payment → shipping → install → live
 *   payment-links:  intro → setup → live
 *   checkout:       intro → setup → live
 *
 * Business and bank details are shared: whichever product collects them first
 * fills them in for the others. Demo-only, kept in localStorage with the same
 * event pattern as business-profiles.ts.
 */

import { useState, useSyncExternalStore } from "react"
import { onboardingStorageKey } from "./onboarding-environment.js"
import type { OnlineProfile } from "./online-onboarding"

export const NEW_MERCHANT_PROFILE_ID = "new-merchant"

export type ProductId = "in-store" | "payment-links" | "checkout"
export const PRODUCT_IDS: ProductId[] = ["in-store", "payment-links", "checkout"]

export type JourneyStage = "intro" | "setup" | "payment" | "shipping" | "install" | "live"

export type OrderStatus = "placed" | "packed" | "shipped" | "out-for-delivery" | "delivered"
export const ORDER_STATUSES: OrderStatus[] = ["placed", "packed", "shipped", "out-for-delivery", "delivered"]

export type CartLine = { deviceId: string; plan: "lifetime" | "rental"; qty: number }

export type TerminalOrder = {
  id: string
  placedAt: string
  status: OrderStatus
  history: Partial<Record<OrderStatus, string>>
  lines: CartLine[]
  amountPaid: number
  paidWith: string
  courier: string
  awb: string
}

export type ProductJourney = {
  stage: JourneyStage
  /** Index of the current setup step (0-based) while in the "setup" stage. */
  step: number
  /** Setup guide items ticked off while in the "install" stage. */
  guideDone: string[]
  wentLiveAt?: string
  updatedAt?: string
}

export type BusinessDetails = { legalName: string; pan: string; businessType: string; gstin: string }
export type BankDetails = { holder: string; account: string; ifsc: string }
export type DeliveryDetails = { storeName: string; address: string; pincode: string; city: string; contact: string }
export type LinkDefaults = { expiry: string; methods: string[]; reminders: boolean }
export type SetupDrafts = {
  business: BusinessDetails
  bank: BankDetails
  delivery: DeliveryDetails
  linkDefaults: LinkDefaults
  firstLink: { amount: string; purpose: string }
  website: { website: string; platform: string }
  brand: string
}

export type GettingStartedState = {
  onlineProfile: OnlineProfile | null
  journeys: Record<ProductId, ProductJourney>
  business: BusinessDetails | null
  bank: BankDetails | null
  cart: CartLine[]
  delivery: DeliveryDetails | null
  order: TerminalOrder | null
  paymentLinks: Array<{ id: string; amount: number; purpose: string; createdAt: string }>
  checkout: { website: string; platform: string; brandColor: string } | null
  /** Sections the merchant has already opened since they were unlocked (clears the "New" tag). */
  seenSections: string[]
  drafts: Partial<Record<ProductId, Partial<SetupDrafts>>>
  linkDefaults: LinkDefaults
  firstLinkId: string | null
  moreToolsEnabled: boolean
  pendingIntroduction: ProductId | null
}

const EMPTY_JOURNEY: ProductJourney = { stage: "intro", step: 0, guideDone: [] }

export const INITIAL_GETTING_STARTED: GettingStartedState = {
  onlineProfile: null,
  journeys: { "in-store": EMPTY_JOURNEY, "payment-links": EMPTY_JOURNEY, checkout: EMPTY_JOURNEY },
  business: null,
  bank: null,
  cart: [],
  delivery: null,
  order: null,
  paymentLinks: [],
  checkout: null,
  seenSections: [],
  drafts: {},
  linkDefaults: { expiry: "7 days", methods: ["UPI", "Cards", "Netbanking"], reminders: true },
  firstLinkId: null,
  moreToolsEnabled: false,
  pendingIntroduction: null,
}

const STORAGE_KEY = "pine-one-getting-started.v1"
const CHANGED_EVENT = "getting-started-changed"

export function readGettingStarted(): GettingStartedState {
  if (typeof window === "undefined") return INITIAL_GETTING_STARTED
  try {
    const raw = window.localStorage.getItem(onboardingStorageKey(STORAGE_KEY))
    if (!raw) return INITIAL_GETTING_STARTED
    const parsed = JSON.parse(raw) as Partial<GettingStartedState>
    return {
      ...INITIAL_GETTING_STARTED,
      ...parsed,
      journeys: { ...INITIAL_GETTING_STARTED.journeys, ...parsed.journeys },
    }
  } catch {
    return INITIAL_GETTING_STARTED
  }
}

function write(next: GettingStartedState) {
  window.localStorage.setItem(onboardingStorageKey(STORAGE_KEY), JSON.stringify(next))
  window.dispatchEvent(new Event(CHANGED_EVENT))
}

export function updateGettingStarted(update: (state: GettingStartedState) => GettingStartedState) {
  if (typeof window === "undefined") return
  write(update(readGettingStarted()))
}

export function updateJourney(product: ProductId, patch: Partial<ProductJourney>) {
  updateGettingStarted((state) => ({
    ...state,
    journeys: {
      ...state.journeys,
      [product]: { ...state.journeys[product], ...patch, updatedAt: new Date().toISOString() },
    },
  }))
}

export function startProductSetup(product: ProductId, step = 0) {
  updateGettingStarted((state) => ({
    ...state,
    onlineProfile: product !== "in-store" && state.onlineProfile
      ? { ...state.onlineProfile, agreementAccepted: false, submittedAt: null }
      : state.onlineProfile,
    journeys: { ...state.journeys, [product]: { ...state.journeys[product], stage: "setup", step, updatedAt: new Date().toISOString() } },
  }))
}

export function resetGettingStarted() {
  if (typeof window === "undefined") return
  write(INITIAL_GETTING_STARTED)
}

let cachedRaw: string | null | undefined
let cachedKey: string | undefined
let cachedState = INITIAL_GETTING_STARTED

function snapshot() {
  const key = onboardingStorageKey(STORAGE_KEY)
  const raw = window.localStorage.getItem(key)
  if (key !== cachedKey || raw !== cachedRaw) {
    cachedKey = key
    cachedRaw = raw
    cachedState = readGettingStarted()
  }
  return cachedState
}

function subscribe(listener: () => void) {
  window.addEventListener(CHANGED_EVENT, listener)
  window.addEventListener("storage", listener)
  return () => {
    window.removeEventListener(CHANGED_EVENT, listener)
    window.removeEventListener("storage", listener)
  }
}

const emptySubscribe = () => () => {}
export function useGettingStartedHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

export function useGettingStarted(): GettingStartedState {
  return useSyncExternalStore(subscribe, snapshot, () => INITIAL_GETTING_STARTED)
}

export function saveSetupDraft<K extends keyof SetupDrafts>(product: ProductId, key: K, value: SetupDrafts[K]) {
  updateGettingStarted((state) => ({
    ...state,
    drafts: { ...state.drafts, [product]: { ...state.drafts[product], [key]: value } },
    journeys: { ...state.journeys, [product]: { ...state.journeys[product], updatedAt: new Date().toISOString() } },
  }))
}

export function useSetupDraft<K extends keyof SetupDrafts>(product: ProductId, key: K, initial: SetupDrafts[K]) {
  const [value, setValue] = useState<SetupDrafts[K]>(() => readGettingStarted().drafts[product]?.[key] ?? initial)
  return [value, (next: SetupDrafts[K]) => {
    setValue(next)
    saveSetupDraft(product, key, next)
  }] as const
}

export function visibleSectionIds(state: GettingStartedState): string[] {
  if (liveProducts(state).length === 0) return []
  return state.moreToolsEnabled
    ? ["payments", "settlements", "refunds", "disputes", "reports"]
    : ["payments", "settlements"]
}

export function activateProduct(product: ProductId) {
  const now = new Date().toISOString()
  updateGettingStarted((state) => ({
    ...state,
    journeys: { ...state.journeys, [product]: { ...state.journeys[product], stage: "live", wentLiveAt: now, updatedAt: now } },
    pendingIntroduction: product,
  }))
}

export function enableMoreTools() {
  updateGettingStarted((state) => ({ ...state, moreToolsEnabled: true }))
}

export function createFirstPaymentLink(amount: number, purpose: string) {
  const state = readGettingStarted()
  const existing = state.paymentLinks.find((link) => link.id === state.firstLinkId)
  if (existing) return existing
  const link = { id: `plink_${Math.random().toString(36).slice(2, 10)}`, amount, purpose: purpose.trim(), createdAt: new Date().toISOString() }
  updateGettingStarted((current) => ({ ...current, paymentLinks: [...current.paymentLinks, link], firstLinkId: link.id }))
  return link
}

/** Moves the demo order one status along — stands in for courier webhooks. */
export function advanceOrder() {
  updateGettingStarted((state) => {
    if (!state.order) return state
    const index = ORDER_STATUSES.indexOf(state.order.status)
    const status = ORDER_STATUSES[Math.min(index + 1, ORDER_STATUSES.length - 1)]
    const order = { ...state.order, status, history: { ...state.order.history, [status]: new Date().toISOString() } }
    const journeys =
      status === "delivered"
        ? { ...state.journeys, "in-store": { ...state.journeys["in-store"], stage: "install" as const, updatedAt: new Date().toISOString() } }
        : state.journeys
    return { ...state, order, journeys }
  })
}

export function isLive(state: GettingStartedState, product: ProductId) {
  return state.journeys[product].stage === "live"
}

export function liveProducts(state: GettingStartedState) {
  return PRODUCT_IDS.filter((id) => isLive(state, id))
}

/** The product the merchant touched most recently and hasn't finished — drives the Continue banner. */
export function activeJourney(state: GettingStartedState): ProductId | null {
  const open = PRODUCT_IDS.filter((id) => {
    const { stage } = state.journeys[id]
    return stage !== "intro" && stage !== "live"
  })
  if (open.length === 0) return null
  return open.sort((a, b) => (state.journeys[b].updatedAt ?? "").localeCompare(state.journeys[a].updatedAt ?? ""))[0]
}

export function markSectionSeen(section: string) {
  updateGettingStarted((state) =>
    state.seenSections.includes(section) ? state : { ...state, seenSections: [...state.seenSections, section] }
  )
}

export function getInstallationGuide(lines: CartLine[]) {
  const hasQr = lines.some((line) => line.deviceId === "qr-soundbox")
  const hasPos = lines.some((line) => line.deviceId !== "qr-soundbox")
  return [
    { id: "unbox", title: "Unbox and charge", body: "Charge each device using the cable supplied in its box. Keep the device near your payment counter." },
    { id: "connect", title: "Turn on and connect", body: hasPos ? "Turn on each terminal and follow its connection prompts. Use the included SIM or connect to store Wi-Fi where supported." : "Turn on your soundbox and check its network indicator. Keep it where the speaker can be heard at your counter." },
    { id: "activate", title: hasQr ? "Check your store and QR" : "Activate your terminal", body: hasQr
      ? `Check that the supplied QR displays your business name before placing it at the counter.${hasPos ? " Follow the activation prompts on each card terminal as well." : ""}`
      : "Follow the activation prompts on the terminal. Check that its store and settlement account match your details." },
    { id: "test", title: "Check a test payment", body: hasQr
      ? `Scan the supplied QR with a UPI app and confirm that the soundbox announces the payment.${hasPos ? " On card terminals, also try a small test sale." : ""} In this demo, mark this complete to simulate a successful test.`
      : "Use Sale on each terminal to try a small card or UPI payment. In this demo, mark this complete to simulate a successful test." },
  ]
}
