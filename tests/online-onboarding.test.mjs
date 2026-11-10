import assert from "node:assert/strict"
import { test } from "node:test"
import * as flow from "../lib/online-onboarding.ts"

test("online products follow all four reference sections in order", () => {
  assert.deepEqual(flow.ONLINE_MACROS, ["About business", "Business verification", "KYC", "Review and sign agreement"])
  assert.deepEqual(flow.ONLINE_STEPS.map((step) => step.id), ["pan", "gst", "website", "documents", "bank", "owners", "signatory", "political-exposure", "identity", "video-kyc", "review", "agreement"])
})

test("PAN fetch alone cannot bypass the PAN-linked mobile OTP", () => {
  const p = flow.createOnlineProfile()
  Object.assign(p, { pan: "ABCDE1234F", panVerified: true, phone: "9876543210" })
  assert.equal(flow.canContinueOnline("pan", p), false)
  p.phoneVerified = true
  assert.equal(flow.canContinueOnline("pan", p), true)
})

test("GST must be verified; website and app can each be explicitly skipped", () => {
  const p = flow.createOnlineProfile()
  p.gstin = "27AAAPL1234C1ZV"
  assert.equal(flow.canContinueOnline("gst", p), false)
  p.gstVerified = true
  assert.equal(flow.canContinueOnline("gst", p), true)
  assert.equal(flow.canContinueOnline("website", p), false)
  p.noWebsite = p.noApp = true
  assert.equal(flow.canContinueOnline("website", p), true)
})

test("documents require core files and authenticity declaration, with file-size/type limits", () => {
  const p = flow.createOnlineProfile()
  const file = { name: "sample.pdf", size: 100, type: "application/pdf" }
  p.documents = { moa: file, aoa: file }
  assert.equal(flow.canContinueOnline("documents", p), false)
  p.documentsAuthentic = true
  assert.equal(flow.canContinueOnline("documents", p), true)
  assert.match(flow.validateOnlineFile({ ...file, size: 6 * 1024 * 1024 }), /5 MB/)
  assert.match(flow.validateOnlineFile({ ...file, name: "sample.exe", type: "application/octet-stream" }), /PDF/)
})

test("bank confirmation must match, or a cancelled cheque must be uploaded", () => {
  const p = flow.createOnlineProfile()
  Object.assign(p, { accountNumber: "000000000000", confirmAccountNumber: "111111111111", ifsc: "DEMO0000000" })
  assert.equal(flow.canContinueOnline("bank", p), false)
  p.confirmAccountNumber = p.accountNumber
  assert.equal(flow.canContinueOnline("bank", p), true)
  p.bankMethod = "cheque"
  p.cheque = { name: "sample.pdf", size: 100, type: "application/pdf" }
  assert.equal(flow.canContinueOnline("bank", p), true)
})

test("owners require a declaration, unique PANs and valid total ownership", () => {
  const p = flow.createOnlineProfile()
  p.hasOwners = "yes"
  assert.equal(flow.canContinueOnline("owners", p), false)
  const owner = { id: "one", name: "Demo Owner", pan: "ABCDE1234F", percentage: 60 }
  p.owners = [owner]
  assert.equal(flow.canContinueOnline("owners", p), true)
  assert.match(flow.validateOnlineOwner(p.owners, { ...owner, id: "two" }), /already/)
  assert.match(flow.validateOnlineOwner(p.owners, { ...owner, id: "two", pan: "PQRST1234F", percentage: 50 }), /100/)
  assert.match(flow.validateOnlineOwner([], { ...owner, percentage: 5 }), /10/)
  p.hasOwners = "no"
  assert.equal(flow.canContinueOnline("owners", p), true)
})

test("signatory, political exposure, identity, video and agreement have independent gates", () => {
  const p = flow.createOnlineProfile()
  const steps = ["signatory", "political-exposure", "identity", "video-kyc", "agreement"]
  for (const step of steps) assert.equal(flow.canContinueOnline(step, p), false)
  Object.assign(p, { signatoryName: "Demo Signer", signatoryPan: "ABCDE1234F", signatoryPanVerified: true, designation: "Director", politicalExposure: "none", identityVerified: true, videoKycVerified: true, agreementAccepted: true })
  for (const step of steps) assert.equal(flow.canContinueOnline(step, p), true)
})

test("editing identity fields clears dependent proof and a previous submission", () => {
  const p = flow.createOnlineProfile({ pan: "ABCDE1234F", panVerified: true, phoneVerified: true, gstVerified: true, identityVerified: true, videoKycVerified: true, agreementAccepted: true, submittedAt: "2026-11-10" })
  const changed = flow.updateOnlineProfile(p, { pan: "PQRST1234F" })
  for (const key of ["panVerified", "phoneVerified", "gstVerified", "identityVerified", "videoKycVerified", "agreementAccepted"]) assert.equal(changed[key], false, key)
  assert.equal(changed.submittedAt, null)
  assert.equal(flow.canSubmitOnline(changed), false)
})

test("changing the OTP destination invalidates identity and video proof", () => {
  const p = flow.createOnlineProfile({ phone: "9876543210", phoneVerified: true, identityVerified: true, videoKycVerified: true, agreementAccepted: true, submittedAt: "2026-11-10" })
  const changed = flow.updateOnlineProfile(p, { phone: "9876543211" })
  assert.equal(changed.identityVerified, false)
  assert.equal(changed.videoKycVerified, false)
  assert.equal(changed.phoneVerified, false)
  assert.equal(changed.submittedAt, null)
})

test("submission checks every required section, including after saving and reloading a profile", () => {
  const file = { name: "sample.pdf", size: 100, type: "application/pdf" }
  const p = flow.createOnlineProfile({ pan: "ABCDE1234F", panVerified: true, phone: "9876543210", phoneVerified: true, gstin: "27ABCDE1234F1Z5", gstVerified: true, noWebsite: true, noApp: true, documents: { moa: file, aoa: file }, documentsAuthentic: true, accountNumber: "000000000000", confirmAccountNumber: "000000000000", ifsc: "DEMO0000000", hasOwners: "no", signatoryName: "Demo Signer", signatoryPan: "PQRST1234F", signatoryPanVerified: true, designation: "Director", politicalExposure: "none", identityVerified: true, videoKycVerified: true, agreementAccepted: true })
  assert.equal(flow.canSubmitOnline(JSON.parse(JSON.stringify(p))), true)
  for (const field of ["panVerified", "phoneVerified", "gstVerified", "documentsAuthentic", "signatoryPanVerified", "identityVerified", "videoKycVerified", "agreementAccepted"]) {
    assert.equal(flow.canSubmitOnline({ ...p, [field]: false }), false, field)
  }
  assert.equal(flow.canSubmitOnline({ ...p, confirmAccountNumber: "111111111111" }), false)
  assert.equal(flow.canSubmitOnline({ ...p, hasOwners: "yes", owners: [] }), false)
  assert.equal(flow.canSubmitOnline({ ...p, noWebsite: false }), false)
})
