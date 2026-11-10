import assert from "node:assert/strict"
import { test } from "node:test"
import * as catalog from "../components/getting-started/catalog.ts"

test("every unfinished onboarding stage has a dedicated destination for each product", () => {
  for (const product of ["in-store", "payment-links", "checkout"]) {
    for (const stage of ["setup", "payment", "shipping", "install"]) {
      assert.equal(catalog.productJourneyHref(product, stage, 1), `/onboarding/products/${product}`)
    }
  }
})

test("In-store device selection happens on its product page before dedicated onboarding", () => {
  assert.equal(catalog.productJourneyHref("in-store", "intro", 0), catalog.PRODUCTS["in-store"].href)
  assert.equal(catalog.productJourneyHref("in-store", "setup", 0), catalog.PRODUCTS["in-store"].href)
  assert.equal(catalog.productJourneyHref("in-store", "setup", 1), "/onboarding/products/in-store")
})

test("the In-store onboarding rail starts at delivery after device selection", () => {
  const progress = catalog.productSetupProgress("in-store", 1)
  assert.equal(progress.index, 0)
  assert.equal(progress.steps[0], "Delivery address")
  assert.equal(progress.steps.length, 4)
  assert.equal(catalog.productSetupProgress("payment-links", 0).steps[0], "About business")
  assert.equal(catalog.productSetupProgress("checkout", 9).index, 2)
})

test("education and activated products return to their normal product pages", () => {
  for (const product of ["in-store", "payment-links", "checkout"]) {
    for (const stage of ["intro", "live"]) {
      assert.equal(catalog.productJourneyHref(product, stage), catalog.PRODUCTS[product].href)
    }
  }
})
