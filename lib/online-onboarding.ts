export { ONLINE_MACROS, ONLINE_STEPS } from "./online-onboarding-data.js"

export type OnlineStepId = "pan" | "gst" | "website" | "documents" | "bank" | "owners" | "signatory" | "political-exposure" | "identity" | "video-kyc" | "review" | "agreement"
export type OnlineDocumentKind = "moa" | "aoa" | "board" | "coi"
export type OnlineFile = { name: string; size: number; type: string }
export type OnlineOwner = { id: string; name: string; pan: string; percentage: number }
export type OnlineProfile = {
  version: 1
  pan: string; panVerified: boolean; legalName: string; phone: string; phoneVerified: boolean
  gstin: string; gstVerified: boolean; registeredAddress: string
  website: string; websiteVerified: boolean; noWebsite: boolean
  appLink: string; appVerified: boolean; noApp: boolean
  documents: Partial<Record<OnlineDocumentKind, OnlineFile>>; documentsAuthentic: boolean
  bankMethod: "manual" | "cheque"; accountNumber: string; confirmAccountNumber: string; ifsc: string; cheque: OnlineFile | null
  hasOwners: "yes" | "no" | null; ownersView: "declaration" | "list"; owners: OnlineOwner[]
  signatoryName: string; signatoryPan: string; signatoryPanVerified: boolean; designation: string
  politicalExposure: "self" | "related" | "none" | null
  identityVerified: boolean; videoKycVerified: boolean; agreementAccepted: boolean; submittedAt: string | null
}

export function createOnlineProfile(seed: Partial<OnlineProfile> = {}): OnlineProfile {
  return {
    version: 1, pan: "", panVerified: false, legalName: "", phone: "", phoneVerified: false,
    gstin: "", gstVerified: false, registeredAddress: "", website: "", websiteVerified: false, noWebsite: false,
    appLink: "", appVerified: false, noApp: false, documents: {}, documentsAuthentic: false,
    bankMethod: "manual", accountNumber: "", confirmAccountNumber: "", ifsc: "", cheque: null,
    hasOwners: null, ownersView: "declaration", owners: [], signatoryName: "", signatoryPan: "", signatoryPanVerified: false,
    designation: "", politicalExposure: null, identityVerified: false, videoKycVerified: false, agreementAccepted: false, submittedAt: null,
    ...seed,
  }
}

export const validOnlinePan = (value: string) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value.trim())
export const validOnlinePhone = (value: string) => /^[6-9][0-9]{9}$/.test(value)
export function validOnlineUrl(value: string) {
  try {
    const url = new URL(value)
    return ["http:", "https:"].includes(url.protocol) && url.hostname.includes(".")
  } catch { return false }
}

export function canContinueOnline(step: OnlineStepId, p: OnlineProfile): boolean {
  switch (step) {
    case "pan": return validOnlinePan(p.pan) && p.panVerified && validOnlinePhone(p.phone) && p.phoneVerified
    case "gst": return /^[0-9]{2}[A-Z0-9]{13}$/.test(p.gstin) && p.gstVerified
    case "website": return (p.noWebsite || (validOnlineUrl(p.website) && p.websiteVerified)) && (p.noApp || (validOnlineUrl(p.appLink) && p.appVerified))
    case "documents": return Boolean(p.documents.moa && p.documents.aoa && p.documentsAuthentic && Object.values(p.documents).every((file) => !validateOnlineFile(file)))
    case "bank": return p.bankMethod === "cheque"
      ? Boolean(p.cheque && !validateOnlineFile(p.cheque))
      : /^[0-9]{9,18}$/.test(p.accountNumber) && p.accountNumber === p.confirmAccountNumber && /^[A-Z]{4}0[A-Z0-9]{6}$/.test(p.ifsc)
    case "owners": return p.hasOwners === "no" || (p.hasOwners === "yes" && p.owners.length > 0 && p.owners.every((owner) => !validateOnlineOwner(p.owners, owner)))
    case "signatory": return p.signatoryName.trim().length > 1 && validOnlinePan(p.signatoryPan) && p.signatoryPanVerified && p.designation.trim().length > 1
    case "political-exposure": return ["self", "related", "none"].includes(p.politicalExposure ?? "")
    case "identity": return p.identityVerified
    case "video-kyc": return p.videoKycVerified
    case "review": return true
    case "agreement": return p.agreementAccepted
  }
}

export function validateOnlineFile(file: OnlineFile): string | null {
  if (file.size > 5 * 1024 * 1024) return "Choose a file of 5 MB or less."
  if (!/\.(pdf|png|jpe?g|csv)$/i.test(file.name)) return "Choose a PDF, PNG, JPEG or CSV file."
  if (file.size <= 0) return "Choose a non-empty file."
  return null
}

export function validateOnlineOwner(owners: OnlineOwner[], owner: OnlineOwner): string | null {
  if (!validOnlinePan(owner.pan) || owner.name.trim().length < 2) return "Fetch a valid PAN before adding this owner."
  if (owners.some((other) => other.id !== owner.id && other.pan === owner.pan)) return "This PAN has already been added."
  if (!Number.isFinite(owner.percentage) || owner.percentage < 10) return "Ownership must be at least 10%."
  if (owner.percentage > 100 || owners.filter((other) => other.id !== owner.id).reduce((sum, other) => sum + other.percentage, owner.percentage) > 100) return "Total ownership cannot exceed 100%."
  return null
}

export function updateOnlineProfile(current: OnlineProfile, patch: Partial<OnlineProfile>): OnlineProfile {
  const next = { ...current, ...patch }
  const changed = (key: keyof OnlineProfile) => key in patch && patch[key] !== current[key]
  if (changed("pan")) {
    next.panVerified = patch.panVerified ?? false
    next.phoneVerified = false
    next.gstVerified = false
    next.identityVerified = false
    next.videoKycVerified = false
  }
  if (changed("phone")) {
    next.phoneVerified = patch.phoneVerified ?? false
    next.identityVerified = false
    next.videoKycVerified = false
  }
  if (changed("gstin")) next.gstVerified = patch.gstVerified ?? false
  if (changed("website")) next.websiteVerified = patch.websiteVerified ?? false
  if (changed("appLink")) next.appVerified = patch.appVerified ?? false
  if (changed("documents")) next.documentsAuthentic = patch.documentsAuthentic ?? false
  if (changed("signatoryName") || changed("signatoryPan")) {
    next.signatoryPanVerified = patch.signatoryPanVerified ?? false
    next.identityVerified = false
    next.videoKycVerified = false
  }
  if (Object.keys(patch).some((key) => key !== "agreementAccepted" && key !== "submittedAt" && key !== "ownersView" && changed(key as keyof OnlineProfile))) {
    next.agreementAccepted = false
    next.submittedAt = null
  }
  return next
}

export function canSubmitOnline(profile: OnlineProfile) {
  const steps: OnlineStepId[] = ["pan", "gst", "website", "documents", "bank", "owners", "signatory", "political-exposure", "identity", "video-kyc", "agreement"]
  return steps.every((step) => canContinueOnline(step, profile))
}
