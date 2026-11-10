import assert from "node:assert/strict"
import { test } from "node:test"
import * as environment from "../lib/onboarding-environment.js"
import { readDummyAuthSession, writeDummyAuthSession, clearDummyAuthSession } from "../lib/dummy-auth.ts"
import { readGettingStarted, updateJourney } from "../lib/getting-started.ts"

test("main app ignores the new-merchant profile left by earlier prototype tests", () => {
  assert.equal(environment.resolveBusinessProfileId("new-merchant", false), null)
  assert.equal(environment.resolveBusinessProfileId("single-store", false), "single-store")
})

test("prototype links stay under one same-app URL including signup, home, selection and setup", () => {
  for (const href of ["/", "/signup/phone", "/signup/verify-phone?phone=9876543210", "/signup/set-password", "/payment-links", "/checkout", "/offline-payments/manage-devices", "/onboarding/products/in-store", "/transactions", "/settlements", "/support"]) {
    const scoped = environment.onboardingDemoHref(href)
    assert.ok(scoped.startsWith("/onboarding-demo"), href)
    assert.equal(environment.onboardingDemoHref(scoped), scoped)
    assert.equal(environment.originalOnboardingPath(scoped.split("?")[0]), href.split("?")[0])
  }
})

test("demo storage cannot share the main app's authentication or progress keys", () => {
  for (const key of ["pine-one-dummy-auth", "pine-one-business-profile", "pine-one-getting-started.v1"]) {
    assert.equal(environment.onboardingStorageKey(key, "/"), key)
    assert.notEqual(environment.onboardingStorageKey(key, "/onboarding-demo/home"), key)
  }
  assert.equal(environment.isOnboardingDemoPath("/onboarding-demo-other"), false)
})

test("demo signup, setup and logout leave main-app session and progress untouched", () => {
  const storage = new Map()
  const browser = new EventTarget()
  browser.location = { pathname: "/" }
  browser.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  }
  globalThis.window = browser
  writeDummyAuthSession({ email: "main@example.test", name: "Main user", role: "Admin", loggedInAt: "2026-11-10" })
  updateJourney("checkout", { stage: "setup", step: 2 })
  const before = new Map(storage)
  browser.location.pathname = "/onboarding-demo/set-password"
  assert.equal(readDummyAuthSession(), null)
  assert.equal(readGettingStarted().journeys.checkout.stage, "intro")
  writeDummyAuthSession({ email: "demo@example.test", name: "Demo user", role: "Owner", loggedInAt: "2026-11-10" })
  updateJourney("in-store", { stage: "setup", step: 1 })
  clearDummyAuthSession()
  for (const [key, value] of before) assert.equal(storage.get(key), value)
  browser.location.pathname = "/"
  assert.equal(readDummyAuthSession().name, "Main user")
  assert.equal(readGettingStarted().journeys.checkout.step, 2)
  assert.equal(readGettingStarted().journeys["in-store"].stage, "intro")
})

test("isolated prototype defaults to a new merchant without changing main-app preferences", () => {
  assert.equal(environment.resolveBusinessProfileId(null, true), "new-merchant")
  assert.equal(environment.resolveBusinessProfileId("new-merchant", true), "new-merchant")
  assert.equal(environment.resolveBusinessProfileId(null, false), null)
  assert.equal(environment.resolveBusinessProfileId("omnichannel-admin", true), "new-merchant")
})
