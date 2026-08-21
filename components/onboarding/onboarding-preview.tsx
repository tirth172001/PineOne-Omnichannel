"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  BankIcon,
  CheckCircleIcon,
  DeviceMobileIcon,
  FileTextIcon,
  ImageSquareIcon,
  MapPinIcon,
  ShieldCheckIcon,
  SignatureIcon,
  StorefrontIcon,
  TagIcon,
  UploadSimpleIcon,
  UserIcon,
  UsersIcon,
  type Icon,
} from "@phosphor-icons/react"
import { findCategory } from "@/app/onboarding/(rail)/business-basics/_categories"
import { reviewGroups } from "@/app/onboarding/(rail)/review-and-sign/_review-data"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { GrainientBackground } from "./grainient-background"
import { useSignatory, usePeople } from "./onboarding-person"
import { PersonCard } from "./onboarding-person-card"
import { useProfile, type OnboardingProfile } from "./onboarding-profile"
import { getPreviewMode, isInStoreDevicesSelected, SEQUENCE, useOnboardingPosition } from "./onboarding-sequence"
import { PRODUCT_CATEGORIES } from "./product-catalog"
import { RevealField } from "./reveal-field"
import { useSignupSession, type SignupSession } from "./signup-session"

// Single persistent preview panel for the whole numbered journey, starting from business-name
// (step 1 — see onboarding-sequence.ts) through review-and-sign. Mounted once by SignupShell (for
// business-name) and OnboardingRailShell (for everything after) — not remounted per route within
// either — so it genuinely persists rather than being a swapped component there. Content still
// crossfades between "modes" (intent / document / banking / owners / signatory / review) as the
// user moves through macro-sections, but every macro *before* the current one is never thrown
// away: it collapses to a compact summary row instead, so the whole card reads as one accumulating
// "what you've told us so far" document rather than resetting on every macro boundary. That's the
// direct answer to feedback that the old per-macro-only preview "doesn't show what details we have
// collected in previous steps" — the fix isn't showing everything expanded at once (that got noisy
// fast), it's completed-collapses / current-stays-detailed, same rule DocumentBody already used
// within a macro, now applied one level up across macros too.
const STATIC_VERIFIED_FIELDS = {
  name: "Kopi & Co Pte. Ltd.",
  uen: "202312345K",
  address: "21 Tanjong Pagar Road, #03-11, Singapore 088444",
  businessType: "Private Limited Company",
}

const STATIC_BANK = {
  bank: "DBS Bank",
  accountHolder: "Kopi & Co Pte. Ltd.",
  accountNumber: "••• •••• 4471",
}

// Ticket 08 (.scratch/onboarding-experience-v3/issues/08-store-address-capture-methods.md): the
// store address comes from exactly one of three methods — only that method's field is populated
// on the shared profile (see onboarding-profile.ts) — so these two helpers are the single place
// that reads "is there an address" / "what should it say" regardless of which one was used.
function hasStoreAddress(store: OnboardingProfile["store"]) {
  return Boolean(store.mapsLink || store.currentLocation || store.manualAddress)
}

function formatCoordinates(latitude: number, longitude: number) {
  const lat = `${Math.abs(latitude).toFixed(4)}° ${latitude >= 0 ? "N" : "S"}`
  const lng = `${Math.abs(longitude).toFixed(4)}° ${longitude >= 0 ? "E" : "W"}`
  return `${lat}, ${lng}`
}

function storeAddressSummary(store: OnboardingProfile["store"]) {
  if (store.mapsLink) return store.mapsLink
  if (store.currentLocation) return `Current location · ${formatCoordinates(store.currentLocation.latitude, store.currentLocation.longitude)}`
  if (store.manualAddress) {
    const { addressLine1, addressLine2, landmark, city, state, pincode, country } = store.manualAddress
    return [addressLine1, addressLine2, landmark, city, state, pincode, country].filter(Boolean).join(", ")
  }
  return null
}

function countConfirmedDetails(profile: OnboardingProfile, peopleCount: number, hasSignatory: boolean, session: SignupSession) {
  let count = 0
  if (session.businessName) count += 1
  if (session.selectedCategories.length > 0) count += 1
  if (profile.verification.verified) count += 4
  if (profile.basics.categoryId) count += 1
  if (hasStoreAddress(profile.store)) count += 1
  if (profile.store.photoUrl || profile.store.skipPhoto) count += 1
  if (profile.webApp.website) count += 1
  if (profile.webApp.appLink) count += 1
  if (profile.banking.step === "confirm") count += 3
  count += peopleCount
  if (hasSignatory) count += 1
  return count
}

// One-line "what happened in this macro" text for the completed-macros summary block — deliberately
// terse (this is a collapsed row, not the detailed body), and reads null (row still shows, just with
// no second line) if that macro hasn't actually produced anything summarizable yet, e.g. reached via
// a direct URL jump rather than by completing the steps before it.
function getMacroSummary(
  macroIndex: number,
  ctx: {
    session: SignupSession
    profile: OnboardingProfile
    people: ReturnType<typeof usePeople>
    signatory: ReturnType<typeof useSignatory>
  }
): { icon: Icon; label: string; value: string | null } {
  const { session, profile, people, signatory } = ctx
  const macro = SEQUENCE[macroIndex]

  switch (macro?.name) {
    case "Your business": {
      const productCount = session.selectedCategories.length
      const value = [session.businessName, productCount ? `${productCount} product${productCount > 1 ? "s" : ""} selected` : null]
        .filter(Boolean)
        .join(" · ")
      return { icon: StorefrontIcon, label: macro.name, value: value || null }
    }
    case "Business verification": {
      const category = findCategory(profile.basics.categoryId)
      const value = [STATIC_VERIFIED_FIELDS.name, category?.option.label].filter(Boolean).join(" · ")
      return { icon: FileTextIcon, label: macro.name, value: value || null }
    }
    case "Business details": {
      const value = [
        profile.banking.step === "confirm" ? STATIC_BANK.bank : null,
        people.length ? `${people.length} owner${people.length > 1 ? "s" : ""}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
      return { icon: BankIcon, label: macro.name, value: value || null }
    }
    case "KYC":
      return { icon: ShieldCheckIcon, label: macro.name, value: signatory ? signatory.name : null }
    default:
      return { icon: FileTextIcon, label: macro?.name ?? "", value: null }
  }
}

function MacroSummaryRow({ icon: SectionIcon, label, value }: { icon: Icon; label: string; value: string | null }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircleIcon size={13} weight="fill" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-xs font-medium text-foreground">{label}</span>
        {value ? (
          <span className="truncate text-[11px] text-muted-foreground" title={value}>
            {value}
          </span>
        ) : null}
      </span>
      <SectionIcon size={13} className="ml-auto shrink-0 text-muted-foreground/50" />
    </div>
  )
}

export function OnboardingPreview() {
  const position = useOnboardingPosition()
  const mode = getPreviewMode(position.slug)
  const profile = useProfile()
  const people = usePeople()
  const signatory = useSignatory()
  const session = useSignupSession()

  if (mode === "none") return null

  const confirmedCount = countConfirmedDetails(profile, people.length, Boolean(signatory), session)
  const headerStatus = profile.verifying ? "Verifying…" : confirmedCount > 0 ? `${confirmedCount} details confirmed` : "Getting started"
  const pastMacros = SEQUENCE.slice(0, position.macroIndex)

  return (
    <div className="relative hidden flex-col items-center overflow-hidden rounded-md p-10 pt-16 lg:flex">
      <GrainientBackground />
      <style>{`
        @keyframes onboardingPreviewSweep {
          from { transform: translateX(-120%); }
          to { transform: translateX(220%); }
        }
      `}</style>

      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        {profile.verifying ? (
          <div
            aria-hidden
            className="motion-safe:animate-[onboardingPreviewSweep_1.4s_ease-in-out_infinite] pointer-events-none absolute inset-y-0 left-0 z-10 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-foreground/10 to-transparent will-change-transform"
          />
        ) : null}

        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon size={16} weight="fill" className={confirmedCount > 0 ? "text-success" : "text-muted-foreground"} />
            <span className="text-sm font-medium text-foreground">Business Profile</span>
          </div>
          <span
            role="status"
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              confirmedCount > 0 && !profile.verifying && "bg-success/10 text-success",
              profile.verifying && "bg-primary/10 text-primary",
              confirmedCount === 0 && !profile.verifying && "bg-muted text-muted-foreground"
            )}
          >
            {headerStatus}
          </span>
        </div>

        <div className="max-h-[min(60vh,32rem)] overflow-y-auto">
          {pastMacros.length > 0 ? (
            <div className="flex flex-col divide-y divide-border border-b border-border px-4">
              {pastMacros.map((macro, macroIndex) => {
                const summary = getMacroSummary(macroIndex, { session, profile, people, signatory })
                return <MacroSummaryRow key={macro.name} icon={summary.icon} label={summary.label} value={summary.value} />
              })}
            </div>
          ) : null}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              {mode === "intent" ? <IntentBody session={session} /> : null}
              {mode === "document" ? <DocumentBody profile={profile} subIndex={position.subIndex} /> : null}
              {mode === "details" ? <BusinessDetailsBody profile={profile} people={people} subIndex={position.subIndex} /> : null}
              {mode === "signatory" ? <SignatoryBody signatory={signatory} /> : null}
              {mode === "review" ? <ReviewBody /> : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// Step 1's mode — mirrors the icon-circle-plus-label header grammar BankingBody/OwnersBody
// established, reading straight from signup-session.ts (the module store business-name/_client.tsx
// syncs into as the user types) since there's no onboarding-profile.ts entry yet at this point in
// the journey — that store only exists from business-verification onward.
function IntentBody({ session }: { session: SignupSession }) {
  const hasName = Boolean(session.businessName)
  const categories = session.selectedCategories
  const complete = hasName && categories.length > 0
  const active = hasName || categories.length > 0

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className={cn("flex items-center gap-2 rounded-lg p-1.5", active && !complete && "bg-primary/5 ring-1 ring-primary/20")}>
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full",
            complete ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
          )}
        >
          {complete ? <CheckCircleIcon size={13} weight="fill" /> : <StorefrontIcon size={13} />}
        </span>
        <span className="text-xs font-medium text-foreground">Business name &amp; intent</span>
      </div>

      <div>
        <p className="text-[11px] text-muted-foreground">Business name</p>
        <RevealField show={hasName} skeleton={<Skeleton className="mt-1 h-4 w-2/3" />}>
          <p className="text-sm font-medium text-foreground">{session.businessName}</p>
        </RevealField>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[11px] text-muted-foreground">What you&apos;re looking to do</p>
        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {categories.map((id) => {
              const category = PRODUCT_CATEGORIES.find((entry) => entry.id === id)
              if (!category) return null
              return (
                <span
                  key={id}
                  className="flex items-center gap-1.5 rounded-full bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-foreground ring-1 ring-primary/20"
                >
                  <category.icon size={12} className="text-primary" />
                  {category.label}
                </span>
              )
            })}
          </div>
        ) : (
          <div className="flex h-10 items-center rounded-sm bg-muted px-3 text-xs text-muted-foreground">Nothing selected yet</div>
        )}
      </div>
    </div>
  )
}

type DocSectionKey = "identity" | "category" | "store" | "website"

const ALL_DOC_SECTIONS: Array<{
  key: DocSectionKey
  label: string
  icon: Icon
  isComplete: (profile: OnboardingProfile) => boolean
  summary: (profile: OnboardingProfile) => string | null
}> = [
  {
    key: "identity",
    label: "Business identity",
    icon: FileTextIcon,
    isComplete: (profile) => profile.verification.verified,
    summary: () => STATIC_VERIFIED_FIELDS.name,
  },
  {
    key: "category",
    label: "Category",
    icon: TagIcon,
    isComplete: (profile) => Boolean(profile.basics.categoryId),
    summary: (profile) => findCategory(profile.basics.categoryId)?.option.label ?? null,
  },
  {
    key: "store",
    label: "Store details",
    icon: MapPinIcon,
    isComplete: (profile) => hasStoreAddress(profile.store) && (Boolean(profile.store.photoUrl) || profile.store.skipPhoto),
    summary: (profile) => storeAddressSummary(profile.store),
  },
  {
    key: "website",
    label: "Online presence",
    icon: DeviceMobileIcon,
    isComplete: (profile) => Boolean(profile.webApp.website),
    summary: (profile) => profile.webApp.website,
  },
]

// Ticket 07 (.scratch/onboarding-experience-v3/issues/07-conditional-store-address-requirement.md):
// mirrors onboarding-sequence.ts's getActiveRoutes — the "store" section only appears when
// store-verification is actually in the active route sequence, so DOC_SECTIONS indices stay in
// lockstep with the subIndex values getPosition() computes against the active routes.
function getDocSections() {
  return isInStoreDevicesSelected() ? ALL_DOC_SECTIONS : ALL_DOC_SECTIONS.filter((section) => section.key !== "store")
}

// Ticket 02 (.scratch/onboarding-experience-v2/issues/02-establish-preview-panel-redesign.md)
// established completed-sections-collapse-to-summary; revised per direct user feedback to drop
// the locked/faded rows this used to show for sections the user hasn't reached yet — a section
// simply doesn't exist in the preview until the user is on it, and its full field breakdown is
// what materializes when the step is completed, not before. Revised again, also per direct
// feedback, to drop the click-to-expand Accordion entirely — a passive preview panel pretending
// to be an interactive settings list read as broken rather than useful, since there was nothing
// to actually toggle: the active section is always the one worth seeing in full, and completed
// ones only ever need their one-line summary. A vertical timeline rail (icon-circle + connecting
// line) replaces it, so progress through the section list reads visually rather than as a plain
// text stack, echoing the "Step X of 5" rail on the left. Newly-revealed sections still animate in
// (and every sibling reflows) via layout animation.
function DocumentBody({ profile, subIndex }: { profile: OnboardingProfile; subIndex: number }) {
  const sections = getDocSections()
  const visibleSections = sections.slice(0, Math.min(subIndex, sections.length - 1) + 1)

  return (
    <motion.div layout className="flex flex-col px-4 py-3">
      <AnimatePresence initial={false}>
        {visibleSections.map((section, index) => {
          // Position, not raw data, decides the checkmark treatment — a section the user has
          // already passed should always read as done even if its demo data happens to be empty
          // (e.g. reached via a direct URL jump rather than actually completing it).
          const complete = index < subIndex || (index === subIndex && section.isComplete(profile))
          const active = index === subIndex
          const summary = complete ? section.summary(profile) : null
          const isLast = index === visibleSections.length - 1

          return (
            <motion.div
              key={section.key}
              layout
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex gap-3"
            >
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full",
                    complete ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                  )}
                >
                  {complete ? <CheckCircleIcon size={13} weight="fill" /> : <section.icon size={13} />}
                </span>
                {!isLast ? <span className="my-1 w-px flex-1 bg-border" /> : null}
              </div>

              <div className={cn("min-w-0 flex-1 pb-4", active && "-mx-2 rounded-xl bg-primary/5 px-2 pt-1 ring-1 ring-primary/20")}>
                <p className="pt-0.5 text-xs font-medium text-foreground">{section.label}</p>
                {!active && summary ? (
                  <p className="truncate text-[11px] text-muted-foreground" title={summary}>
                    {summary}
                  </p>
                ) : null}

                {active && section.key === "identity" ? (
                  <div className="mt-3 flex flex-col gap-4">
                    {(["name", "uen", "address", "businessType"] as const).map((key, fieldIndex) => (
                      <div key={key}>
                        <p className="text-[11px] text-muted-foreground">
                          {{ name: "Legal business name", uen: "UEN / registration number", address: "Registered address", businessType: "Business type" }[key]}
                        </p>
                        <RevealField
                          show={profile.verification.verified}
                          skeleton={<Skeleton className={cn("mt-1 h-4", fieldIndex % 2 === 0 ? "w-3/4" : "w-1/2")} />}
                        >
                          <p className="text-sm font-medium text-foreground">{STATIC_VERIFIED_FIELDS[key]}</p>
                        </RevealField>
                      </div>
                    ))}
                    {profile.verification.method === "manual" ? (
                      <div className="-mx-2 -mb-1 flex items-center gap-2 border-t border-border bg-muted/40 px-2 py-2.5 text-xs text-muted-foreground">
                        <UploadSimpleIcon size={14} />
                        {profile.verification.fileName ?? "acra-business-profile.pdf"}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {active && section.key === "category" ? (
                  <div className="mt-3">
                    <p className="text-[11px] text-muted-foreground">Business category</p>
                    {(() => {
                      const category = findCategory(profile.basics.categoryId)
                      return (
                        <RevealField show={Boolean(category)} skeleton={<Skeleton className="mt-1 h-4 w-2/3" />}>
                          {category ? (
                            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                              <category.group.icon size={14} className="text-primary" />
                              {category.option.label}
                            </p>
                          ) : null}
                        </RevealField>
                      )
                    })()}
                  </div>
                ) : null}

                {active && section.key === "store" ? (
                  <div className="mt-3 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <p className="text-[11px] text-muted-foreground">Store location</p>
                      <RevealField show={hasStoreAddress(profile.store)} skeleton={<Skeleton className="h-10 w-full" />}>
                        <div className="flex items-center gap-2 rounded-sm border border-border bg-muted/40 px-3 py-2.5">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <MapPinIcon size={14} weight="fill" />
                          </span>
                          <span className="truncate text-xs font-medium text-foreground">{storeAddressSummary(profile.store)}</span>
                        </div>
                      </RevealField>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-[11px] text-muted-foreground">Storefront photo</p>
                      {profile.store.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profile.store.photoUrl}
                          alt=""
                          className="h-24 w-full rounded-sm object-cover ring-1 ring-inset ring-black/8 dark:ring-white/8"
                        />
                      ) : profile.store.skipPhoto ? (
                        <div className="flex items-center gap-2 rounded-sm border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
                          <StorefrontIcon size={16} />
                          Pending — add this later
                        </div>
                      ) : (
                        <div className="flex h-20 w-full items-center justify-center rounded-sm bg-muted">
                          <ImageSquareIcon size={20} className="text-muted-foreground/60" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {active && section.key === "website" ? (
                  <div className="mt-3 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <p className="text-[11px] text-muted-foreground">Where customers pay you online</p>
                      <div className="overflow-hidden rounded-sm border border-border">
                        <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-2.5 py-2">
                          <span className="size-2 rounded-full bg-destructive/50" />
                          <span className="size-2 rounded-full bg-warning/60" />
                          <span className="size-2 rounded-full bg-success/60" />
                          <span className="ml-2 flex h-5 flex-1 items-center truncate rounded-md bg-background px-2 text-[11px] text-foreground">
                            {profile.webApp.website || <span className="text-muted-foreground">No website added</span>}
                          </span>
                        </div>
                      </div>
                    </div>
                    {profile.webApp.appLink ? (
                      <div className="flex items-center gap-2.5 rounded-sm border border-border bg-muted/40 px-3 py-2">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <DeviceMobileIcon size={16} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground">Mobile app linked</p>
                          <p className="truncate text-[11px] text-muted-foreground">{profile.webApp.appLink}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </motion.div>
  )
}

// Tickets 10/11 (.scratch/onboarding-experience-v2/issues/10-*.md, 11-*.md) originally gave banking
// and owners separate preview modes, each borrowing just the icon-circle-plus-label header grammar
// DocumentBody established rather than a full section timeline, since neither had sub-steps of its
// own to collapse against. Unified per direct feedback that moving from banking-details to
// business-owners made the settlement bank account vanish outright instead of collapsing — the
// same "completed collapses / active stays detailed" timeline DocumentBody uses within
// business-verification now spans this macro's two sub-steps too.
function BusinessDetailsBody({
  profile,
  people,
  subIndex,
}: {
  profile: OnboardingProfile
  people: ReturnType<typeof usePeople>
  subIndex: number
}) {
  const total = people.reduce((sum, person) => sum + person.ownershipPercent, 0)
  const bankingComplete = profile.banking.step === "confirm"
  const ownersComplete = people.length > 0 && total >= 100

  const sections = [
    {
      key: "banking" as const,
      label: "Settlement bank account",
      icon: BankIcon,
      complete: bankingComplete,
      summary: bankingComplete ? STATIC_BANK.bank : null,
    },
    {
      key: "owners" as const,
      label: "Business owners",
      icon: UsersIcon,
      complete: ownersComplete,
      summary: people.length > 0 ? `${people.length} owner${people.length > 1 ? "s" : ""} · ${total}% allocated` : null,
    },
  ]
  const visibleSections = sections.slice(0, Math.min(subIndex, sections.length - 1) + 1)

  return (
    <motion.div layout className="flex flex-col px-4 py-3">
      <AnimatePresence initial={false}>
        {visibleSections.map((section, index) => {
          const complete = index < subIndex || (index === subIndex && section.complete)
          const active = index === subIndex
          const isLast = index === visibleSections.length - 1

          return (
            <motion.div
              key={section.key}
              layout
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex gap-3"
            >
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full",
                    complete ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                  )}
                >
                  {complete ? <CheckCircleIcon size={13} weight="fill" /> : <section.icon size={13} />}
                </span>
                {!isLast ? <span className="my-1 w-px flex-1 bg-border" /> : null}
              </div>

              <div className={cn("min-w-0 flex-1 pb-4", active && "-mx-2 rounded-xl bg-primary/5 px-2 pt-1 ring-1 ring-primary/20")}>
                <p className="pt-0.5 text-xs font-medium text-foreground">{section.label}</p>
                {!active && section.summary ? (
                  <p className="truncate text-[11px] text-muted-foreground" title={section.summary}>
                    {section.summary}
                  </p>
                ) : null}

                {active && section.key === "banking" ? (
                  bankingComplete ? (
                    <div className="mt-3 flex items-center gap-2.5 rounded-sm border border-border bg-muted/40 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-foreground">{STATIC_BANK.bank}</p>
                        <p className="text-[11px] text-muted-foreground">{STATIC_BANK.accountNumber}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex h-16 items-center justify-center gap-2 rounded-sm bg-muted text-xs text-muted-foreground">
                      <FileTextIcon size={16} />
                      {profile.banking.step === "reading" ? "Extracting details…" : "Awaiting statement"}
                    </div>
                  )
                ) : null}

                {active && section.key === "owners" ? (
                  people.length > 0 ? (
                    <div className="mt-3 flex flex-col gap-2">
                      {people.map((person) => (
                        <PersonCard key={person.id} person={person} />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <UserIcon size={14} />
                      No owners added yet
                    </div>
                  )
                ) : null}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </motion.div>
  )
}

// Ticket 02 (.scratch/onboarding-experience-v2/issues/02-establish-preview-panel-redesign.md):
// the signatory's PersonCard is the primary visual (the user's explicit ask — "the card of that
// signatory could appear there"), with the Letter of Authorisation as a static document preview
// beneath it. Previously tucked behind a click-to-expand accordion row — dropped per the same
// feedback that removed DocumentBody's accordion above, since there was only ever one row to
// toggle and it read as a settings control rather than a document. Ticket 03 reuses this same
// PersonCard treatment on the KYC screen and marks it verified via the existing badge on
// PersonCard itself.
function SignatoryBody({ signatory }: { signatory: ReturnType<typeof useSignatory> }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      {signatory ? (
        <PersonCard person={signatory} />
      ) : (
        <div className="flex items-center gap-2 rounded-sm border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
          <UserIcon size={14} />
          No signatory selected yet
        </div>
      )}

      <div className="rounded-lg border border-border px-3 py-3">
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <SignatureIcon size={13} />
          Letter of Authorisation
        </span>
        <p className="mt-3 text-sm leading-6 text-foreground">
          I,{" "}
          <span className={cn("font-semibold", !signatory && "text-muted-foreground italic")}>
            {signatory ? signatory.name : "[ signatory name ]"}
          </span>
          ,{" "}
          <span className={cn(!signatory && "text-muted-foreground italic")}>
            {signatory ? signatory.designation : "[ designation ]"}
          </span>{" "}
          of Kopi &amp; Co Pte. Ltd., am authorised to sign contracts and legal documents on behalf of the company.
        </p>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <div className="h-8 w-32 border-b border-foreground/40" />
            <p className="mt-1 text-[10px] text-muted-foreground">Signature</p>
          </div>
          {signatory?.verificationStatus === "verified" ? (
            <span className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
              <SignatureIcon size={13} weight="fill" />
              Signed
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// Review-and-sign's mode — the same reviewGroups summary previously drawn inline by that route's
// own bespoke two-column layout, now rendered inside the shared persistent panel like every other
// step's mode, since reviewGroups is static mock data (see _review-data.ts) with no dependency on
// the profile store the other modes read from.
function ReviewBody() {
  return (
    <div className="flex flex-col divide-y divide-border">
      {reviewGroups.map((group) => (
        <div key={group.id} className="px-4 py-4">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group.title}</p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            {group.fields.map((field) => (
              <div key={field.id} className="min-w-0">
                <dt className="text-[11px] text-muted-foreground">{field.label}</dt>
                <dd className="truncate text-sm font-medium text-foreground" title={field.value}>
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  )
}
