"use client"

import { useEffect } from "react"
import { activateProduct, updateGettingStarted, updateJourney, useGettingStarted, type ProductId } from "@/lib/getting-started"
import { ONLINE_STEPS, canContinueOnline, canSubmitOnline, createOnlineProfile, updateOnlineProfile, type OnlineProfile, type OnlineStepId } from "@/lib/online-onboarding"
import { useJourneyRouter } from "../navigation"
import { PRODUCTS } from "../catalog"
import { OnlineShell } from "./online-shell"
import { PanDetails, GstDetails, WebsiteDetails, BusinessDocuments } from "./about-business"
import { BankDetails, Owners } from "./business-verification"
import { Signatory, PoliticalExposure, Identity, VideoKyc } from "./kyc"
import { ReviewDetails, Agreement, Submitted } from "./review-and-sign"

/** Both online products share merchant verification, with independent product progress. */
export function OnlineOnboarding({ product }: { product: Exclude<ProductId, "in-store"> }) {
  const state = useGettingStarted()
  const router = useJourneyRouter()
  const profile = createOnlineProfile(state.onlineProfile ?? {
    pan: state.business?.pan ?? "", legalName: state.business?.legalName ?? "", gstin: state.business?.gstin ?? "",
    accountNumber: state.bank?.account ?? "", confirmAccountNumber: state.bank?.account ?? "", ifsc: state.bank?.ifsc ?? "",
  })
  const requested = state.onlineProfile ? state.journeys[product].step : 0
  const firstIncomplete = ONLINE_STEPS.findIndex((step) => !canContinueOnline(step.id as OnlineStepId, profile))
  const submitted = requested >= ONLINE_STEPS.length && Boolean(profile.submittedAt) && canSubmitOnline(profile)
  const index = submitted ? ONLINE_STEPS.length : Math.min(requested, firstIncomplete < 0 ? ONLINE_STEPS.length - 1 : firstIncomplete)
  const step = ONLINE_STEPS[Math.min(index, ONLINE_STEPS.length - 1)]

  useEffect(() => {
    // Old four-step drafts cannot silently skip the newly added verification steps.
    if (!state.onlineProfile) updateGettingStarted((current) => ({ ...current, onlineProfile: profile, journeys: { ...current.journeys, [product]: { ...current.journeys[product], step: 0 } } }))
    else if (requested !== index) updateJourney(product, { step: index })
  }, [state.onlineProfile, product, requested, index]) // Profile is seeded only once.

  function patch(value: Partial<OnlineProfile>) {
    updateGettingStarted((current) => ({ ...current,
      onlineProfile: updateOnlineProfile(createOnlineProfile(current.onlineProfile ?? profile), value),
      journeys: { ...current.journeys, [product]: { ...current.journeys[product], updatedAt: new Date().toISOString() } },
    }))
  }
  function goTo(position: number) { updateJourney(product, { step: position }) }
  function next() {
    if (step.id === "owners" && profile.ownersView === "declaration" && profile.hasOwners === "yes") { patch({ ownersView: "list" }); return }
    if (!canContinueOnline(step.id as OnlineStepId, profile)) return
    if (step.id === "agreement") {
      if (!canSubmitOnline(profile)) return
      updateGettingStarted((current) => ({ ...current,
        onlineProfile: { ...createOnlineProfile(current.onlineProfile ?? profile), submittedAt: new Date().toISOString() },
        business: { legalName: profile.legalName, pan: profile.pan, gstin: profile.gstin, businessType: "Private limited" },
        bank: profile.bankMethod === "manual" ? { holder: profile.legalName, account: profile.accountNumber, ifsc: profile.ifsc } : current.bank,
        checkout: product === "checkout" ? { website: profile.noWebsite ? profile.appLink : profile.website, platform: "custom", brandColor: "#3b5615" } : current.checkout,
        journeys: { ...current.journeys, [product]: { ...current.journeys[product], step: ONLINE_STEPS.length, updatedAt: new Date().toISOString() } },
      }))
    } else goTo(index + 1)
  }
  function previous() {
    if (index === 0) { updateJourney(product, { stage: "intro", step: 0 }); router.replace(PRODUCTS[product].href) }
    else if (step.id === "owners" && profile.ownersView === "list") patch({ ownersView: "declaration" })
    else goTo(index - 1)
  }
  const props = { profile, patch }
  const content = submitted ? <Submitted onContinue={() => { activateProduct(product); router.replace("/") }} />
    : step.id === "pan" ? <PanDetails {...props} />
    : step.id === "gst" ? <GstDetails {...props} />
    : step.id === "website" ? <WebsiteDetails {...props} />
    : step.id === "documents" ? <BusinessDocuments {...props} />
    : step.id === "bank" ? <BankDetails {...props} />
    : step.id === "owners" ? <Owners {...props} />
    : step.id === "signatory" ? <Signatory {...props} />
    : step.id === "political-exposure" ? <PoliticalExposure {...props} />
    : step.id === "identity" ? <Identity {...props} />
    : step.id === "video-kyc" ? <VideoKyc {...props} onComplete={() => goTo(index + 1)} />
    : step.id === "review" ? <ReviewDetails profile={profile} onEdit={goTo} />
    : <Agreement {...props} />
  const ready = step.id === "owners" && profile.ownersView === "declaration" ? profile.hasOwners !== null : canContinueOnline(step.id as OnlineStepId, profile)
  return <OnlineShell index={index} profile={profile} product={product} onStep={goTo} onPrevious={previous} onContinue={next} canContinue={ready} success={submitted}>{content}</OnlineShell>
}
