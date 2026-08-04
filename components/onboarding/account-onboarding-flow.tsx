"use client"

import Link from "next/link"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/ui/panels"
import { cn } from "@/lib/utils"
import { readDummyAuthSession, writeDummyAuthSession } from "@/lib/dummy-auth"
import {
  Bot,
  Building2,
  CheckCircle2,
  Circle,
  FileText,
  Landmark,
  MapPin,
  MessageSquare,
  SendHorizontal,
  User,
} from "lucide-react"

type AccountStepId = "account" | "business" | "kyc" | "payout" | "activate"

type ChatMessage = {
  id: string
  role: "assistant" | "user"
  text: string
}

type DemoMode = "show" | "skip" | null

type AccountFormData = {
  fullName: string
  workEmail: string
  mobile: string
  teamRole: string
  businessName: string
  website: string
  legalEntity: string
  category: string
  businessAddress: string
  companyDescription: string
  panNumber: string
  gstNumber: string
  accountHolder: string
  accountNumber: string
  ifscCode: string
  settlementPreference: string
  selectedProducts: string[]
  acceptedTerms: boolean
}

const accountSteps: Array<{ id: AccountStepId; title: string; caption: string }> = [
  { id: "account", title: "Account owner", caption: "Primary signatory and login owner details" },
  { id: "business", title: "Business details", caption: "Entity profile, category, and website details" },
  { id: "kyc", title: "KYC verification", caption: "Required documents based on selected products" },
  { id: "payout", title: "Bank settlement", caption: "Settlement account and payout configuration" },
  { id: "activate", title: "Activation", caption: "Final review and onboarding consent" },
]

const kycSections = [
  { id: "company-info", label: "Company info", icon: Building2 },
  { id: "company-address", label: "Company address", icon: MapPin },
  { id: "ownership", label: "Ownership details", icon: User },
  { id: "documents", label: "Company documents", icon: FileText },
  { id: "expected", label: "Expected activity", icon: Landmark },
]

const productOptions = ["Checkout", "POS Terminal", "Payment Links", "Merchant Lending"]
const postBasicDetailsSteps = ["business", "kyc", "payout", "activate"] as const
type PostBasicDetailsStepId = (typeof postBasicDetailsSteps)[number]
const kycSectionByStep: Record<PostBasicDetailsStepId, (typeof kycSections)[number]["id"]> = {
  business: "company-info",
  kyc: "documents",
  payout: "ownership",
  activate: "expected",
}

type KycRequirements = {
  panRequired: boolean
  gstRequired: boolean
  addressRequired: boolean
}

function getKycRequirements(products: string[]): KycRequirements {
  const needsPan = products.some((product) => ["Checkout", "Payment Links", "Merchant Lending"].includes(product))
  const needsGst = products.some((product) => ["Checkout", "POS Terminal", "Merchant Lending"].includes(product))
  const needsAddress = products.some((product) => ["POS Terminal", "Merchant Lending"].includes(product))

  return {
    panRequired: needsPan,
    gstRequired: needsGst,
    addressRequired: needsAddress,
  }
}

export function AccountOnboardingFlow({
  initialEmail,
  initialMobile,
  initialCompany,
  initialProducts,
  initialName,
}: {
  initialEmail?: string
  initialMobile?: string
  initialCompany?: string
  initialProducts?: string[]
  initialName?: string
}) {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [chatInput, setChatInput] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [demoMode, setDemoMode] = useState<DemoMode>(null)
  const [demoProgress, setDemoProgress] = useState(0)
  const [formData, setFormData] = useState<AccountFormData>(() => ({
    fullName: initialName || "Tirth Trivedi",
    workEmail: initialEmail || "tirth@pinelabs.com",
    mobile: initialMobile || "9876543210",
    teamRole: "Admin",
    businessName: initialCompany || "Pine Labs Partner",
    website: "https://www.pineone.in",
    legalEntity: "Private Limited",
    category: "Retail",
    businessAddress: "",
    companyDescription: "",
    panNumber: "",
    gstNumber: "",
    accountHolder: initialName || "Tirth Trivedi",
    accountNumber: "",
    ifscCode: "",
    settlementPreference: "T+1",
    selectedProducts:
      initialProducts && initialProducts.length > 0
        ? initialProducts.filter((product) => productOptions.includes(product))
        : ["Checkout"],
    acceptedTerms: false,
  }))
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      role: "assistant",
      text: "Welcome. You can update fields with commands like `gst: 27ABCDE1234F1Z5` or `website: https://example.com`.",
    },
  ])

  useEffect(() => {
    if (readDummyAuthSession()) {
      router.replace("/")
    }
  }, [router])

  useEffect(() => {
    if (!demoMode) return

    setDemoProgress(6)
    let value = 6
    const timer = window.setInterval(() => {
      value = Math.min(100, value + Math.floor(Math.random() * 14) + 8)
      setDemoProgress(value)

      if (value >= 100) {
        window.clearInterval(timer)
        writeDummyAuthSession({
          email: formData.workEmail.trim(),
          name: formData.fullName.trim(),
          role: formData.teamRole.trim() || "Admin",
          loggedInAt: new Date().toISOString(),
        })

        try {
          window.localStorage.setItem("pine-demo-dashboard-ready", "1")
          window.localStorage.setItem("pine-demo-kyc-progress", demoMode === "skip" ? "20" : "35")
        } catch {
          // Ignore storage failures in private mode.
        }

        router.replace(`/?demo=1&kycProgress=${demoMode === "skip" ? 20 : 35}`)
      }
    }, 240)

    return () => window.clearInterval(timer)
  }, [demoMode, formData, router])

  const currentStep = accountSteps[stepIndex]
  const kycRequirements = useMemo(() => getKycRequirements(formData.selectedProducts), [formData.selectedProducts])
  const completionPercent = Math.round(((stepIndex + 1) / accountSteps.length) * 100)
  const isPostBasicDetailsStep = postBasicDetailsSteps.includes(currentStep.id as PostBasicDetailsStepId)
  const activeKycSectionId = isPostBasicDetailsStep
    ? kycSectionByStep[currentStep.id as PostBasicDetailsStepId]
    : "company-info"
  const activeKycSectionIndex = Math.max(
    0,
    kycSections.findIndex((section) => section.id === activeKycSectionId),
  )

  const canContinue = useMemo(() => {
    if (currentStep.id === "account") {
      return Boolean(formData.fullName.trim() && formData.workEmail.trim() && formData.mobile.trim().length >= 10)
    }
    if (currentStep.id === "business") {
      return Boolean(formData.businessName.trim() && formData.website.trim() && formData.category.trim())
    }
    if (currentStep.id === "kyc") {
      const panValid = !kycRequirements.panRequired || formData.panNumber.trim().length === 10
      const gstValid = !kycRequirements.gstRequired || formData.gstNumber.trim().length === 15
      const addressValid = !kycRequirements.addressRequired || formData.businessAddress.trim().length > 0
      return panValid && gstValid && addressValid
    }
    if (currentStep.id === "payout") {
      return Boolean(
        formData.accountHolder.trim() &&
          formData.accountNumber.trim() &&
          formData.ifscCode.trim().length >= 11 &&
          formData.settlementPreference.trim(),
      )
    }
    return formData.selectedProducts.length > 0 && formData.acceptedTerms
  }, [currentStep.id, formData, kycRequirements])

  function updateFormField<K extends keyof AccountFormData>(key: K, value: AccountFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  function toggleProduct(product: string) {
    setFormData((prev) => {
      const exists = prev.selectedProducts.includes(product)
      return {
        ...prev,
        selectedProducts: exists
          ? prev.selectedProducts.filter((entry) => entry !== product)
          : [...prev.selectedProducts, product],
      }
    })
  }

  function moveNext() {
    if (!canContinue) return
    setStepIndex((prev) => Math.min(prev + 1, accountSteps.length - 1))
  }

  function moveBack() {
    setStepIndex((prev) => Math.max(prev - 1, 0))
  }

  function addAssistantMessage(text: string) {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", text }])
  }

  function applyChatCommand(rawMessage: string) {
    const text = rawMessage.trim()
    const lower = text.toLowerCase()
    if (!text) return

    if (lower === "next") {
      if (canContinue) {
        moveNext()
        addAssistantMessage("Moved to next step.")
      } else {
        addAssistantMessage("Current step has required fields pending.")
      }
      return
    }

    if (lower === "back") {
      moveBack()
      addAssistantMessage("Moved to previous step.")
      return
    }

    const enableMatch = lower.match(/^enable\s+(.+)$/)
    if (enableMatch) {
      const product = productOptions.find((entry) => entry.toLowerCase() === enableMatch[1].trim())
      if (product) {
        toggleProduct(product)
        addAssistantMessage(`Updated product selection: ${product}.`)
        return
      }
    }

    const fieldMatch = text.match(/^([a-zA-Z ]+)\s*:\s*(.+)$/)
    if (!fieldMatch) {
      addAssistantMessage("Try format: `field: value`. Example: `business name: Pine One Store`.")
      return
    }

    const rawField = fieldMatch[1].toLowerCase().trim()
    const value = fieldMatch[2].trim()
    const fieldMap: Record<string, keyof AccountFormData> = {
      "full name": "fullName",
      name: "fullName",
      email: "workEmail",
      "work email": "workEmail",
      mobile: "mobile",
      "mobile number": "mobile",
      "team role": "teamRole",
      "business name": "businessName",
      "company name": "businessName",
      website: "website",
      "legal entity": "legalEntity",
      category: "category",
      address: "businessAddress",
      "business address": "businessAddress",
      description: "companyDescription",
      "company description": "companyDescription",
      pan: "panNumber",
      "pan number": "panNumber",
      gst: "gstNumber",
      gstin: "gstNumber",
      "gst number": "gstNumber",
      "account holder": "accountHolder",
      "account number": "accountNumber",
      ifsc: "ifscCode",
      "ifsc code": "ifscCode",
      settlement: "settlementPreference",
      "settlement preference": "settlementPreference",
    }

    const mappedField = fieldMap[rawField]
    if (!mappedField) {
      addAssistantMessage(`Field '${rawField}' is not supported yet.`)
      return
    }

    const normalizedValue =
      mappedField === "ifscCode" || mappedField === "panNumber" || mappedField === "gstNumber"
        ? value.toUpperCase()
        : value
    updateFormField(mappedField, normalizedValue as AccountFormData[typeof mappedField])
    addAssistantMessage(`Updated ${rawField}.`)
  }

  function onSendChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = chatInput.trim()
    if (!text) return
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text }])
    setChatInput("")
    applyChatCommand(text)
  }

  function completeOnboarding() {
    if (!canContinue || submitting) return
    setSubmitting(true)
    writeDummyAuthSession({
      email: formData.workEmail.trim(),
      name: formData.fullName.trim(),
      role: formData.teamRole.trim() || "Admin",
      loggedInAt: new Date().toISOString(),
    })
    router.replace("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 h-14 border-b border-border/60 bg-sidebar px-3">
        <div className="flex h-full items-center justify-between">
          <Link
            href="/"
            className="flex items-center rounded-md px-2 py-1.5 transition-colors hover:bg-primary/10"
            aria-label="PineLabs home"
          >
            <img
              src="/brand/pine-labs-icon.ico"
              alt="PineLabs"
              className="h-6 w-6 rounded-sm object-contain grayscale brightness-0 contrast-200 dark:invert"
            />
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setDemoMode("skip")} disabled={Boolean(demoMode)}>
              Skip for now
            </Button>
            <Button onClick={() => setDemoMode("show")} disabled={Boolean(demoMode)}>
              Show demo dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid h-[calc(100vh-3.5rem)] w-full max-w-[1440px] gap-4 p-4 lg:grid-cols-[220px_minmax(0,1fr)_360px]">
        <aside className="hidden pt-4 lg:flex lg:flex-col">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Step {stepIndex + 1} of {accountSteps.length}</p>
          <div className="mt-5 space-y-3">
            {accountSteps.map((step, index) => {
              const active = index === stepIndex
              const completed = index < stepIndex
              return (
                <div key={step.id} className="flex items-center gap-2.5">
                  {completed ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                  )}
                  <p className={cn("text-sm", active ? "font-medium text-foreground" : "text-muted-foreground")}>{step.title}</p>
                </div>
              )
            })}
          </div>
        </aside>

        <main className="min-h-0 min-w-0 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl space-y-4 pb-6">
            <div className="rounded-xl border border-border/70 bg-card">
              <PageHeader
                title={currentStep.title}
                description={currentStep.caption}
                className="mt-0"
                actions={
                  <Badge variant="outline" className="text-xs">
                    KYC readiness {completionPercent}%
                  </Badge>
                }
              />
            </div>

            {currentStep.id === "account" && (
              <Card>
                <CardContent className="space-y-4 p-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input id="fullName" value={formData.fullName} onChange={(e) => updateFormField("fullName", e.target.value)} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="workEmail">Work email</Label>
                      <Input id="workEmail" value={formData.workEmail} onChange={(e) => updateFormField("workEmail", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile number</Label>
                      <Input
                        id="mobile"
                        value={formData.mobile}
                        maxLength={10}
                        onChange={(e) => updateFormField("mobile", e.target.value.replace(/[^\d]/g, ""))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teamRole">Role</Label>
                    <Input id="teamRole" value={formData.teamRole} onChange={(e) => updateFormField("teamRole", e.target.value)} />
                  </div>
                </CardContent>
              </Card>
            )}

            {isPostBasicDetailsStep && (
              <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
                <Card className="h-fit">
                  <CardContent className="p-4">
                    <p className="text-[40px] leading-none text-muted-foreground">
                      <span className="font-medium text-primary">{activeKycSectionIndex + 1}</span> / {kycSections.length}
                    </p>
                    <div className="mt-5 space-y-2">
                      {kycSections.map((section, idx) => {
                        const Icon = section.icon
                        const active = section.id === activeKycSectionId
                        const completed = idx < activeKycSectionIndex
                        return (
                          <div
                            key={section.id}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm",
                              active
                                ? "bg-muted font-medium text-foreground"
                                : completed
                                  ? "text-foreground"
                                  : "text-muted-foreground",
                            )}
                          >
                            <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                            <span>{section.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {(currentStep.id === "business" || currentStep.id === "kyc") && (
                    <Card>
                      <CardContent className="space-y-4 p-5">
                        <h3 className="text-xl font-medium text-foreground">Company info</h3>
                        <div className="space-y-2">
                          <Label htmlFor="businessNameKyc">Legal business name</Label>
                          <Input
                            id="businessNameKyc"
                            value={formData.businessName}
                            onChange={(e) => updateFormField("businessName", e.target.value)}
                          />
                        </div>
                        <label className="flex items-start gap-2 rounded-md border border-border px-3 py-2.5">
                          <Checkbox
                            checked={Boolean(formData.companyDescription)}
                            onCheckedChange={(v) => updateFormField("companyDescription", v ? "DBA enabled" : "")}
                          />
                          <span className="text-sm text-muted-foreground">
                            My company has an official name variation (DBA).
                          </span>
                        </label>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="country">Country of incorporation</Label>
                            <Input id="country" defaultValue="India" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone number (with country code)</Label>
                            <Input id="phoneNumber" value={`+91 ${formData.mobile}`} readOnly />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {currentStep.id === "business" && (
                    <>
                      <Card>
                        <CardContent className="space-y-4 p-5">
                          <h4 className="text-base font-medium text-foreground">Expected activity</h4>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="websiteKyc">Company website</Label>
                              <Input id="websiteKyc" value={formData.website} onChange={(e) => updateFormField("website", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="industry">Industry</Label>
                              <Input id="industry" value={formData.category} onChange={(e) => updateFormField("category", e.target.value)} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="companyType">Company type</Label>
                            <Input id="companyType" value={formData.legalEntity} onChange={(e) => updateFormField("legalEntity", e.target.value)} />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="space-y-2 p-5">
                          <Label htmlFor="companyDescription">Company description</Label>
                          <Textarea
                            id="companyDescription"
                            value={formData.companyDescription}
                            onChange={(e) => updateFormField("companyDescription", e.target.value)}
                            className="min-h-[92px]"
                          />
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {currentStep.id === "kyc" && (
                    <>
                      {(kycRequirements.panRequired || kycRequirements.gstRequired) && (
                        <Card>
                          <CardContent className="space-y-4 p-5">
                            <h4 className="text-base font-medium text-foreground">Company documents</h4>
                            <div className="grid gap-4 md:grid-cols-2">
                              {kycRequirements.panRequired && (
                                <div className="space-y-2">
                                  <Label htmlFor="panNumber">PAN number</Label>
                                  <Input
                                    id="panNumber"
                                    maxLength={10}
                                    value={formData.panNumber}
                                    onChange={(e) => updateFormField("panNumber", e.target.value.toUpperCase())}
                                  />
                                </div>
                              )}
                              {kycRequirements.gstRequired && (
                                <div className="space-y-2">
                                  <Label htmlFor="gstNumber">GSTIN</Label>
                                  <Input
                                    id="gstNumber"
                                    maxLength={15}
                                    value={formData.gstNumber}
                                    onChange={(e) => updateFormField("gstNumber", e.target.value.toUpperCase())}
                                  />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {kycRequirements.addressRequired && (
                        <Card>
                          <CardContent className="space-y-2 p-5">
                            <h4 className="text-base font-medium text-foreground">Company address</h4>
                            <Label htmlFor="businessAddress">Registered business address</Label>
                            <Textarea
                              id="businessAddress"
                              value={formData.businessAddress}
                              onChange={(e) => updateFormField("businessAddress", e.target.value)}
                              className="min-h-[100px]"
                            />
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}

                  {currentStep.id === "payout" && (
                    <>
                      <Card>
                        <CardContent className="space-y-4 p-5">
                          <h4 className="text-base font-medium text-foreground">Ownership details</h4>
                          <div className="space-y-2">
                            <Label htmlFor="ownerName">Authorised signatory</Label>
                            <Input id="ownerName" value={formData.fullName} onChange={(e) => updateFormField("fullName", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ownerRole">Role in business</Label>
                            <Input id="ownerRole" value={formData.teamRole} onChange={(e) => updateFormField("teamRole", e.target.value)} />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="space-y-4 p-5">
                          <h4 className="text-base font-medium text-foreground">Bank settlement</h4>
                          <div className="space-y-2">
                            <Label htmlFor="accountHolder">Account holder name</Label>
                            <Input id="accountHolder" value={formData.accountHolder} onChange={(e) => updateFormField("accountHolder", e.target.value)} />
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="accountNumber">Account number</Label>
                              <Input
                                id="accountNumber"
                                value={formData.accountNumber}
                                onChange={(e) => updateFormField("accountNumber", e.target.value.replace(/[^\d]/g, ""))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="ifscCode">IFSC code</Label>
                              <Input
                                id="ifscCode"
                                maxLength={11}
                                value={formData.ifscCode}
                                onChange={(e) => updateFormField("ifscCode", e.target.value.toUpperCase())}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="settlementPreference">Settlement preference</Label>
                            <Input
                              id="settlementPreference"
                              value={formData.settlementPreference}
                              onChange={(e) => updateFormField("settlementPreference", e.target.value)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {currentStep.id === "activate" && (
                    <>
                      <Card>
                        <CardContent className="space-y-5 p-5">
                          <div>
                            <p className="text-sm font-medium text-foreground">Products selected for activation</p>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                              {productOptions.map((product) => {
                                const checked = formData.selectedProducts.includes(product)
                                return (
                                  <label
                                    key={product}
                                    className={cn(
                                      "flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm",
                                      checked ? "border-primary/30 bg-primary/10 text-foreground" : "border-border text-muted-foreground",
                                    )}
                                  >
                                    <Checkbox checked={checked} onCheckedChange={() => toggleProduct(product)} />
                                    <span>{product}</span>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="space-y-3 p-5">
                          <label className="flex items-start gap-2 rounded-md border border-border px-3 py-3">
                            <Checkbox
                              checked={formData.acceptedTerms}
                              onCheckedChange={(checked) => updateFormField("acceptedTerms", Boolean(checked))}
                            />
                            <span className="text-xs text-muted-foreground">I confirm details and accept onboarding terms.</span>
                          </label>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-1">
              <Button variant="outline" onClick={moveBack} disabled={stepIndex === 0 || Boolean(demoMode)}>
                Back
              </Button>
              {stepIndex < accountSteps.length - 1 ? (
                <Button onClick={moveNext} disabled={!canContinue || Boolean(demoMode)}>
                  Continue
                </Button>
              ) : (
                <Button onClick={completeOnboarding} disabled={!canContinue || submitting || Boolean(demoMode)}>
                  {submitting ? "Creating account..." : "Complete setup"}
                </Button>
              )}
            </div>
          </div>
        </main>

        <aside className="hidden min-h-0 overflow-hidden rounded-xl border border-border/70 bg-card lg:flex lg:flex-col">
          <div className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Assistant</p>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[92%] rounded-lg border px-3 py-2 text-xs leading-relaxed",
                  message.role === "assistant"
                    ? "mr-auto border-border bg-background text-foreground"
                    : "ml-auto border-primary/25 bg-primary/15 text-foreground",
                )}
              >
                <div className="mb-1 flex items-center gap-1.5">
                  {message.role === "assistant" ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {message.role === "assistant" ? "Assistant" : "You"}
                  </span>
                </div>
                <p>{message.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={onSendChat} className="space-y-2 border-t border-border/70 p-3">
            <Textarea
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Type updates like: gst: 27ABCDE1234F1Z5"
              className="min-h-[88px] text-xs"
            />
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" type="submit" className="h-8 gap-1.5 text-xs" disabled={Boolean(demoMode)}>
                <SendHorizontal className="h-3.5 w-3.5" />
                Send
              </Button>
            </div>
          </form>
        </aside>
      </div>

      {demoMode ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <Card className="w-full max-w-[520px]">
            <CardContent className="space-y-4 p-6">
              <h3 className="text-lg font-medium text-foreground">
                {demoMode === "show" ? "Populating demo data" : "Skipping setup for now"}
              </h3>
              <p className="text-sm text-muted-foreground">
                We are preparing your dashboard and setting KYC progress so you can start exploring products immediately.
              </p>
              <Progress value={demoProgress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Demo data setup</span>
                <span>{demoProgress}%</span>
              </div>
              <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                KYC progress initialized: <span className="font-medium text-foreground">{demoMode === "skip" ? "20%" : "35%"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
