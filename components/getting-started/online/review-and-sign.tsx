"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useRef } from "react"
import { type OnlineProfile } from "@/lib/online-onboarding"
import { DOCUMENTS } from "./about-business"
import { asset, CheckField, type ProfileProps } from "./fields"

export function ReviewDetails({ profile: p, onEdit }: { profile: OnlineProfile; onEdit: (index: number) => void }) {
  const groups: Array<{ title: string; index: number; rows: Array<[string, string]> }> = [
    { title: "Business details", index: 0, rows: [["Business PAN", p.pan], ["PAN-linked mobile", `+91 ${p.phone}`], ["Legal name", p.legalName]] },
    { title: "GST & registered address", index: 1, rows: [["GSTIN", p.gstin], ["Registered address", p.registeredAddress]] },
    { title: "Website and app", index: 2, rows: [["Website", p.noWebsite ? "No website" : p.website], ["Appstore link", p.noApp ? "No app" : p.appLink]] },
    { title: "Business documents", index: 3, rows: DOCUMENTS.filter((doc) => p.documents[doc.id]).map((doc) => [doc.label, p.documents[doc.id]!.name]) },
    { title: "Banking details", index: 4, rows: p.bankMethod === "cheque" ? [["Cancelled cheque", p.cheque?.name ?? "—"]] : [["Account number", p.accountNumber], ["IFSC", p.ifsc]] },
    { title: "Beneficial owners", index: 5, rows: p.hasOwners === "no" ? [["Declaration", "No beneficial owners declared"]] : p.owners.map((owner) => [owner.name, `${owner.pan} · ${owner.percentage}%`]) },
    { title: "Authorised signatory", index: 6, rows: [["Name", p.signatoryName], ["PAN", p.signatoryPan], ["Designation", p.designation]] },
    { title: "KYC", index: 7, rows: [["Political exposure", p.politicalExposure === "none" ? "None of the above" : p.politicalExposure === "self" ? "Politically exposed" : "Related to a politically exposed person"], ["Identity", p.identityVerified ? "Verified via demo OTP" : "Pending"], ["Video KYC", p.videoKycVerified ? "Completed in demo" : "Pending"]] },
  ]
  return <div className="divide-y divide-border rounded-xl border border-input px-5">{groups.map((group) => <section key={group.title} className="py-4"><div className="mb-3 flex items-center justify-between"><h2 className="text-base font-semibold">{group.title}</h2><Button variant="link" size="sm" className="h-auto p-0" onClick={() => onEdit(group.index)}>Edit<span className="sr-only"> {group.title}</span></Button></div><dl className="space-y-3">{group.rows.map(([label, value]) => <div key={label} className="grid gap-1 text-sm sm:grid-cols-[180px_1fr]"><dt className="text-muted-foreground">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl></section>)}</div>
}

export function Agreement({ profile: p, patch }: ProfileProps) {
  return <div className="space-y-4"><article aria-label="Merchant Signing agreement" className="max-h-[430px] overflow-y-auto rounded-2xl border border-input p-6 text-sm leading-6"><h2 className="mb-5 text-center text-lg font-semibold">Merchant Signing agreement ‘MSA’</h2><p className="mb-4 rounded-lg bg-muted p-3 text-xs">Demo agreement preview. Accepting this document simulates signing and does not create a binding contract.</p><p>This Merchant Signing Agreement ("Agreement") is a sample between {p.legalName || "[Merchant Name]"}, located at {p.registeredAddress || "[Merchant Address]"} ("Merchant"), and [Company Name], located at [Company Address] ("Company").</p><p className="mt-4">1. <strong>Purpose:</strong> The purpose of this Agreement is to outline the terms under which the Merchant will provide goods and/or services to customers through the Company’s platform.</p><p className="mt-4">2. <strong>Obligations of the Merchant:</strong> The Merchant agrees to provide accurate information about their products and services, maintain compliance with all applicable laws, and ensure timely delivery of services or goods.</p><p className="mt-4">3. <strong>Payment Terms:</strong> The Company will process payments on behalf of the Merchant and will remit funds to the Merchant within [X] days after the sale is completed.</p><p className="mt-4">4. <strong>Termination:</strong> Either party may terminate this Agreement with [X] days written notice to the other party.</p><p className="mt-4">5. <strong>Governing Law:</strong> This Agreement shall be governed by the laws of [State/Country].</p><p className="mt-4">IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first above written.</p></article><div className="rounded-xl border border-input p-4"><CheckField checked={p.agreementAccepted} onChange={(agreementAccepted) => patch({ agreementAccepted })}>I agree to the terms of the above document</CheckField></div></div>
}

export function Submitted({ onContinue }: { onContinue: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [])
  return <div className="mx-auto flex min-h-[500px] max-w-[540px] flex-col items-center justify-center py-12 text-center"><img src={asset("4afe16ff859f7404d6ff1e3b9565d30491a6dce9.svg")} alt="" /><h1 ref={heading} tabIndex={-1} className="mt-6 text-2xl font-semibold leading-8 outline-none">Your KYC is submitted, you can start accepting payments</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Your demo onboarding is complete. Explore what comes next.</p><ul className="my-6 space-y-3 text-left text-sm">{["Access your dashboard", "Get live integration credentials", "Accept UPI and Card payments"].map((text) => <li key={text} className="flex items-center gap-3"><span className="text-success">✓</span>{text}</li>)}</ul><Button onClick={onContinue}>Continue to dashboard</Button><p className="mt-4 text-xs text-muted-foreground">Simulation only. No live account or payment credentials are created.</p></div>
}
