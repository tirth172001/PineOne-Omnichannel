"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { validOnlinePan, validateOnlineOwner, type OnlineOwner } from "@/lib/online-onboarding"
import { OnlineField, UploadField, themeClass, type ProfileProps } from "./fields"

export function BankDetails({ profile: p, patch }: ProfileProps) {
  return <div className="max-w-[374px] space-y-6">
    {p.bankMethod === "manual" ? <><OnlineField label="Account number" value={p.accountNumber} onChange={(accountNumber) => patch({ accountNumber: accountNumber.replace(/\D/g, "") })} inputMode="numeric" placeholder="Enter account number" maxLength={18} /><OnlineField label="Confirm account number" value={p.confirmAccountNumber} onChange={(confirmAccountNumber) => patch({ confirmAccountNumber: confirmAccountNumber.replace(/\D/g, "") })} inputMode="numeric" placeholder="Re-enter account number" maxLength={18} hint={p.confirmAccountNumber && p.accountNumber !== p.confirmAccountNumber ? "Account numbers must match." : undefined} /><OnlineField label="IFSC code" value={p.ifsc} onChange={(ifsc) => patch({ ifsc: ifsc.toUpperCase() })} placeholder="E.g. DEMO0000000" maxLength={11} /><Button variant="link" className="h-auto p-0" onClick={() => patch({ bankMethod: "cheque" })}>Or Upload a cancelled cheque</Button></> : <><UploadField label="Cancelled cheque" file={p.cheque} onChange={(cheque) => patch({ cheque })} /><Button variant="link" className="h-auto p-0" onClick={() => patch({ bankMethod: "manual" })}>Or Enter account details manually</Button></>}
  </div>
}

const blankOwner = (): OnlineOwner => ({ id: crypto.randomUUID(), name: "", pan: "", percentage: 10 })

export function Owners({ profile: p, patch }: ProfileProps) {
  const [owner, setOwner] = useState<OnlineOwner | null>(null)
  const [fetched, setFetched] = useState(false)
  const [error, setError] = useState("")
  function edit(value: OnlineOwner) { setOwner(value); setFetched(Boolean(value.name)); setError("") }
  return <>
    {p.ownersView === "declaration" ? <fieldset className="space-y-5"><legend className="mb-5 text-sm font-medium">Does your business have beneficial owners with more than 10% ownership?</legend>{[{ value: "yes", label: "Yes, my business has beneficial owners" }, { value: "no", label: "No, my business does not have beneficial owners" }].map((item) => <label key={item.value} className="flex cursor-pointer items-center gap-3 text-sm"><input type="radio" name="beneficial-owners" checked={p.hasOwners === item.value} onChange={() => patch({ hasOwners: item.value as "yes" | "no" })} className="accent-primary" />{item.label}</label>)}</fieldset> : <div className="max-w-[374px] space-y-4">
      {p.owners.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-lg border border-input pl-3 text-sm"><span className="min-w-0 flex-1 truncate">{item.name}</span><span className="rounded bg-muted px-1 text-xs text-muted-foreground">{item.percentage}%</span><Button variant="ghost" size="sm" className="border-l" onClick={() => edit(item)}>View</Button></div>)}
      <Button variant="outline" size="sm" onClick={() => edit(blankOwner())}>+ Add a business owner</Button><div><Button variant="link" size="sm" className="p-0" onClick={() => patch({ ownersView: "declaration" })}>Edit declaration</Button></div>
    </div>}
    <Sheet open={Boolean(owner)} onOpenChange={(open) => { if (!open) setOwner(null) }}><SheetContent className={`${themeClass} sm:max-w-[458px]`}><SheetHeader><SheetTitle className="text-foreground">{p.owners.some((item) => item.id === owner?.id) ? "Business owner details" : "Add a business owner"}</SheetTitle><SheetDescription>Provide PAN and ownership details.</SheetDescription></SheetHeader>{owner ? <><div className="space-y-6 overflow-y-auto px-6 py-2"><OnlineField label="Business owner PAN" value={owner.pan} onChange={(pan) => { setOwner({ ...owner, pan: pan.toUpperCase(), name: "" }); setFetched(false) }} placeholder="E.g. ABCDE1234F" maxLength={10} action="Fetch details" actionDisabled={!validOnlinePan(owner.pan)} verified={fetched} onAction={() => { setOwner({ ...owner, name: owner.name || `Demo Owner ${p.owners.length + 1}` }); setFetched(true) }} />{fetched ? <><OnlineField label="Full name" value={owner.name} onChange={(name) => setOwner({ ...owner, name })} /><OnlineField label="Ownership percentage" value={String(owner.percentage)} onChange={(percentage) => setOwner({ ...owner, percentage: Number(percentage) })} inputMode="numeric" hint="Minimum 10%. Total ownership cannot exceed 100%." /></> : null}{error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}</div><SheetFooter>{p.owners.some((item) => item.id === owner.id) ? <Button variant="outline" onClick={() => { patch({ owners: p.owners.filter((item) => item.id !== owner.id) }); setOwner(null) }}>Remove owner</Button> : null}<Button disabled={!fetched} onClick={() => { const message = validateOnlineOwner(p.owners, owner); if (message) { setError(message); return } patch({ owners: [...p.owners.filter((item) => item.id !== owner.id), owner] }); setOwner(null) }}>{p.owners.some((item) => item.id === owner.id) ? "Save owner" : "Add business owner"}</Button></SheetFooter></> : null}</SheetContent></Sheet>
  </>
}
