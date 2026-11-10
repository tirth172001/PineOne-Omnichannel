"use client"

import { useState } from "react"
import { validOnlinePan, validOnlinePhone, validOnlineUrl, type OnlineDocumentKind } from "@/lib/online-onboarding"
import { CheckField, OnlineField, OtpVerification, UploadField, type ProfileProps } from "./fields"

export function PanDetails({ profile: p, patch }: ProfileProps) {
  const [otpPhone, setOtpPhone] = useState("")
  return <div className="max-w-[374px] space-y-6">
    <OnlineField label="PAN" value={p.pan} onChange={(pan) => patch({ pan: pan.toUpperCase() })} placeholder="E.g. ABCDE1234F" maxLength={10} action="Fetch details" actionDisabled={!validOnlinePan(p.pan)} onAction={() => patch({ panVerified: true, legalName: "Demo Business Private Limited" })} verified={p.panVerified} />
    {p.panVerified ? <><div className="rounded-lg bg-muted/50 p-3 text-sm"><p className="text-xs text-muted-foreground">Belongs to</p><p className="mt-1 font-medium">{p.legalName}</p><p className="mt-1 text-xs text-muted-foreground">Sample registry response for this demo</p></div><OnlineField label="PAN-linked mobile number" value={p.phone} onChange={(phone) => patch({ phone: phone.replace(/\D/g, "") })} maxLength={10} inputMode="tel" placeholder="Enter 10-digit mobile number" action="Send OTP" actionDisabled={!validOnlinePhone(p.phone)} onAction={() => setOtpPhone(p.phone)} verified={p.phoneVerified} />{Boolean(otpPhone) && otpPhone === p.phone && !p.phoneVerified ? <OtpVerification phone={p.phone} onVerified={() => { patch({ phoneVerified: true }); setOtpPhone("") }} /> : null}</> : null}
  </div>
}

export function GstDetails({ profile: p, patch }: ProfileProps) {
  const retrieved = ["27", "29", "07", "36"].map((prefix) => `${prefix}${p.pan}1Z5`)
  const [manual, setManual] = useState(Boolean(p.gstin && !retrieved.includes(p.gstin)))
  const fetch = (gstin: string) => patch({ gstin, gstVerified: true, registeredAddress: "12, Business Park, MG Road, Bengaluru, Karnataka 560001" })
  return <div className="grid gap-8 lg:grid-cols-2">
    <div className="space-y-4"><fieldset className="space-y-3"><legend className="sr-only">GSTINs linked to your PAN</legend>{retrieved.map((gstin) => <label key={gstin} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${p.gstin === gstin && p.gstVerified ? "border-primary bg-muted/40" : "border-input"}`}><input type="radio" name="gstin" checked={p.gstin === gstin && p.gstVerified && !manual} onChange={() => { setManual(false); fetch(gstin) }} className="accent-primary" />{gstin}</label>)}</fieldset><div className="flex items-center gap-4 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />Or<span className="h-px flex-1 bg-border" /></div><OnlineField label="Enter GSTIN manually" value={manual ? p.gstin : ""} onChange={(gstin) => { setManual(true); patch({ gstin: gstin.toUpperCase() }) }} placeholder="E.g. 27ABCDE1234F1Z5" maxLength={15} action="Fetch details" actionDisabled={!manual || !/^[0-9]{2}[A-Z0-9]{13}$/.test(p.gstin)} verified={manual && p.gstVerified} onAction={() => fetch(p.gstin)} /><p className="text-xs text-muted-foreground">GSTINs and addresses shown here are sample data.</p></div>
    <div className="min-h-60 rounded-xl bg-[#f4f4f0] p-5">{p.gstVerified ? <dl className="space-y-4 text-sm"><div><dt className="text-xs text-muted-foreground">Registered business</dt><dd className="mt-1 font-medium">{p.legalName}</dd></div><div><dt className="text-xs text-muted-foreground">GSTIN</dt><dd className="mt-1">{p.gstin}</dd></div><div><dt className="text-xs text-muted-foreground">Registered address</dt><dd className="mt-1 leading-6">{p.registeredAddress}</dd></div></dl> : <p className="text-sm text-muted-foreground">Select a GSTIN to view the registered business and address.</p>}</div>
  </div>
}

export function WebsiteDetails({ profile: p, patch }: ProfileProps) {
  return <div className="max-w-[374px] space-y-6">
    <div className="space-y-3">{!p.noWebsite ? <OnlineField label="Website link" value={p.website} onChange={(website) => patch({ website })} inputMode="url" placeholder="https://yourwebsite.com" action="Verify" actionDisabled={!validOnlineUrl(p.website)} onAction={() => patch({ websiteVerified: true })} verified={p.websiteVerified} /> : <p className="text-sm font-medium">Website link</p>}<CheckField checked={p.noWebsite} onChange={(noWebsite) => patch({ noWebsite })}>I don’t have a website</CheckField></div>
    <div className="space-y-3">{!p.noApp ? <OnlineField label="Appstore link" value={p.appLink} onChange={(appLink) => patch({ appLink })} inputMode="url" placeholder="https://apps.apple.com/…" action="Verify" actionDisabled={!validOnlineUrl(p.appLink)} onAction={() => patch({ appVerified: true })} verified={p.appVerified} /> : <p className="text-sm font-medium">Appstore link</p>}<CheckField checked={p.noApp} onChange={(noApp) => patch({ noApp })}>I don’t have an app</CheckField></div>
  </div>
}

export const DOCUMENTS: Array<{ id: OnlineDocumentKind; label: string; optional?: boolean }> = [{ id: "moa", label: "Memorandum of Association (MoA)" }, { id: "aoa", label: "Articles of Association (AoA)" }, { id: "board", label: "Board resolution", optional: true }, { id: "coi", label: "Certificate of Incorporation (CoI)", optional: true }]

export function BusinessDocuments({ profile: p, patch }: ProfileProps) {
  return <div className="space-y-6"><div className="grid gap-6 sm:grid-cols-2">{DOCUMENTS.map((doc) => <UploadField key={doc.id} label={doc.label} optional={doc.optional} file={p.documents[doc.id]} onChange={(file) => { const documents = { ...p.documents }; if (file) documents[doc.id] = file; else delete documents[doc.id]; patch({ documents }) }} />)}</div><CheckField checked={p.documentsAuthentic} onChange={(documentsAuthentic) => patch({ documentsAuthentic })}>I confirm that the uploaded documents are authentic and belong to my business.</CheckField></div>
}
