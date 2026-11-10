"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { validOnlinePan } from "@/lib/online-onboarding"
import { asset, themeClass, OnlineField, OtpVerification, type ProfileProps } from "./fields"

export function Signatory({ profile: p, patch }: ProfileProps) {
  const [newPerson, setNewPerson] = useState(Boolean(p.signatoryName && !p.owners.some((owner) => owner.name === p.signatoryName)))
  return <div className="max-w-[374px] space-y-6"><div className="space-y-2"><label htmlFor="online-signatory" className="text-sm font-medium">Authorised signatory</label><select id="online-signatory" className="h-9 w-full rounded-[10px] border border-input bg-white px-3 text-sm" value={newPerson ? "new" : p.owners.find((owner) => owner.name === p.signatoryName && owner.pan === p.signatoryPan)?.id ?? ""} onChange={(event) => {
    if (event.target.value === "new") { setNewPerson(true); patch({ signatoryName: "", signatoryPan: "" }) }
    else { const owner = p.owners.find((item) => item.id === event.target.value); setNewPerson(false); patch({ signatoryName: owner?.name ?? "", signatoryPan: owner?.pan ?? "", signatoryPanVerified: false }) }
  }}><option value="" disabled>Select a person</option>{p.owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}<option value="new">+ Add new authorised signatory</option></select></div>
    {newPerson ? <OnlineField label="Signatory full name" value={p.signatoryName} onChange={(signatoryName) => patch({ signatoryName })} placeholder="As on PAN" /> : null}
    {p.signatoryName ? <><OnlineField label="Authorised signatory PAN" value={p.signatoryPan} onChange={(signatoryPan) => patch({ signatoryPan: signatoryPan.toUpperCase() })} maxLength={10} placeholder="E.g. ABCDE1234F" action="Verify" actionDisabled={!validOnlinePan(p.signatoryPan)} verified={p.signatoryPanVerified} onAction={() => patch({ signatoryPanVerified: true })} /><OnlineField label="Designation" value={p.designation} onChange={(designation) => patch({ designation })} placeholder="E.g. Director" /></> : null}
  </div>
}

export function PoliticalExposure({ profile: p, patch }: ProfileProps) {
  return <fieldset className="space-y-5"><legend className="mb-5 text-sm font-medium">Is the authorised signatory politically exposed or related to a politically exposed person?</legend>{[{ value: "self", label: "The authorised signatory is politically exposed" }, { value: "related", label: "The authorised signatory is related to a politically exposed person" }, { value: "none", label: "None of the above" }].map((item) => <label key={item.value} className="flex cursor-pointer items-start gap-3 text-sm leading-6"><input className="mt-1.5 accent-primary" type="radio" name="political-exposure" checked={p.politicalExposure === item.value} onChange={() => patch({ politicalExposure: item.value as "self" | "related" | "none" })} />{item.label}</label>)}</fieldset>
}

export function Identity({ profile: p, patch }: ProfileProps) {
  const [open, setOpen] = useState(false)
  return <><div className="max-w-[500px] rounded-xl border border-input p-5"><div className="flex items-center gap-3"><h2 className="font-semibold">DigiLocker</h2><span className="rounded-md bg-secondary px-2 py-1 text-xs">Recommended</span></div><p className="mt-3 text-sm">Using PAN registered mobile number & OTP</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Verify the signatory’s identity and retrieve their details securely.</p><Button className="mt-5" disabled={p.identityVerified} onClick={() => setOpen(true)}>{p.identityVerified ? "Identity verified" : "Verify via OTP"}</Button><p className="mt-3 text-xs text-muted-foreground">Demo verification. No DigiLocker connection is made.</p></div><Dialog open={open} onOpenChange={setOpen}><DialogContent className={themeClass}><DialogTitle>Verify signatory identity</DialogTitle><DialogDescription>Simulate DigiLocker verification for {p.signatoryName}.</DialogDescription><OtpVerification phone={p.phone} onVerified={() => { patch({ identityVerified: true }); setOpen(false) }} /></DialogContent></Dialog></>
}

const VIDEO_PREP = [
  ["95f7aff8ae4b28d8158ad3973d56f61304e1ffcb.png", "Be in a space without disturbance"],
  ["98be35cb8be9da65cd801db48891f320e6f84124.png", "Keep your PAN ready"],
  ["1d65ce7319284e5adf8c8ebaeb9491dbf75e571c.png", "Be in good lighting"],
  ["20a4348d464f49cee7608e8f4b5204746081bead.png", "Have good connection"],
]

export function VideoKyc({ profile: p, patch, onComplete }: ProfileProps & { onComplete: () => void }) {
  const [open, setOpen] = useState(false)
  return <><div className="grid gap-x-11 gap-y-5 sm:grid-cols-2">{VIDEO_PREP.map(([src, caption]) => <figure key={src}><img alt="" src={asset(src)} className="aspect-[360/202] w-full rounded-lg object-cover" /><figcaption className="mt-2 text-center text-sm">{caption}</figcaption></figure>)}</div><div className="mt-7 space-y-2 text-center"><p className="flex items-center justify-center gap-2 text-sm"><img src={asset("ab7bd7294a6d04e45737e75da643246a5d5974a4.svg")} alt="" />Available now</p><p className="text-sm text-muted-foreground">Operating hours: Mon - Sat, 10 AM to 7 PM</p><Button onClick={() => p.videoKycVerified ? onComplete() : setOpen(true)}>{p.videoKycVerified ? "Continue to review" : "Start Video KYC"}</Button></div><Dialog open={open} onOpenChange={setOpen}><DialogContent className={`${themeClass} sm:max-w-[560px]`}><DialogTitle>Video KYC window</DialogTitle><DialogDescription>This is a simulated video verification for {p.signatoryName}. No camera or microphone is accessed.</DialogDescription><div className="flex aspect-video items-center justify-center rounded-xl bg-[#f4f4f0] text-sm text-muted-foreground">Demo verification session</div><Button onClick={() => { patch({ videoKycVerified: true }); setOpen(false); onComplete() }}>Complete demo Video KYC</Button></DialogContent></Dialog></>
}
