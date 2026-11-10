"use client"

import { useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { validateOnlineFile, type OnlineFile, type OnlineProfile } from "@/lib/online-onboarding"
import styles from "./online-theme.module.css"

export const themeClass = styles.theme

export type ProfileProps = { profile: OnlineProfile; patch: (value: Partial<OnlineProfile>) => void }
export const asset = (name: string) => `/onboarding/online/${name}`

export function OnlineField({ label, value, onChange, placeholder, action, onAction, actionDisabled, verified, inputMode, maxLength, hint, type = "text" }: {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string; action?: string; onAction?: () => void; actionDisabled?: boolean; verified?: boolean; inputMode?: "numeric" | "tel" | "url"; maxLength?: number; hint?: string; type?: string
}) {
  const id = useId()
  return <div className="space-y-2">
    <label htmlFor={id} className="text-sm font-medium">{label}</label>
    <div className="flex h-9 items-center gap-1 rounded-[10px] border border-input bg-white p-1 focus-within:ring-2 focus-within:ring-ring/50">
      <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} inputMode={inputMode} maxLength={maxLength} type={type} aria-describedby={hint ? `${id}-hint` : undefined} className="h-7 min-w-0 border-0 bg-transparent px-1.5 shadow-none focus-visible:ring-0" />
      {verified ? <span className="shrink-0 pr-2 text-xs text-success" role="status">✓ Verified</span> : action ? <Button type="button" variant="secondary" size="sm" className="h-7 shrink-0 rounded-lg px-2.5 text-xs" onClick={onAction} disabled={actionDisabled}>{action}</Button> : null}
    </div>
    {hint ? <p id={`${id}-hint`} className="text-xs leading-5 text-muted-foreground">{hint}</p> : null}
  </div>
}

export function CheckField({ checked, onChange, children }: { checked: boolean; onChange: (value: boolean) => void; children: React.ReactNode }) {
  return <label className="flex cursor-pointer items-start gap-2 text-sm leading-5"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 size-4 shrink-0 accent-primary" />{children}</label>
}

export function UploadField({ label, file, onChange, optional = false }: { label: string; file?: OnlineFile | null; onChange: (file: OnlineFile | null) => void; optional?: boolean }) {
  const id = useId()
  const [error, setError] = useState("")
  return <div className="space-y-2">
    <label htmlFor={id} className="text-sm font-medium">{label}{optional ? <span className="ml-1 font-normal text-muted-foreground">(optional)</span> : null}</label>
    {file ? <div className="flex min-h-10 items-center justify-between gap-3 rounded-lg border border-input px-3"><span className="truncate text-sm">{file.name}</span><Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)} aria-label={`Remove ${label}`}>Remove</Button></div> : <div className="rounded-lg border border-dashed border-input p-4">
      <input id={id} type="file" accept=".pdf,.jpeg,.jpg,.png,.csv" aria-invalid={Boolean(error)} aria-describedby={`${id}-help`} className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-white file:px-3 file:py-1.5 file:text-sm" onChange={(event) => {
        const next = event.target.files?.[0]
        if (!next) return
        const metadata = { name: next.name, size: next.size, type: next.type }
        const message = validateOnlineFile(metadata)
        setError(message ?? "")
        if (!message) onChange(metadata)
        event.target.value = ""
      }} />
    </div>}
    <p id={`${id}-help`} role={error ? "alert" : undefined} className={`text-xs ${error ? "text-destructive" : "text-muted-foreground"}`}>{error || "PDF, JPEG, PNG or CSV · Max 5 MB. Demo stores the filename only."}</p>
  </div>
}

export function OtpVerification({ phone, onVerified, title = "Enter OTP" }: { phone: string; onVerified: () => void; title?: string }) {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const id = useId()
  return <div className="space-y-3">
    <label htmlFor={id} className="block text-sm font-medium">{title}</label>
    <p className="text-sm text-muted-foreground">Sent to +91 {phone}. Use <span className="font-medium text-foreground">123456</span> in this demo.</p>
    <InputOTP id={id} aria-describedby={`${id}-message`} aria-invalid={Boolean(error)} maxLength={6} value={code} onChange={(value) => { setCode(value); setError("") }} inputMode="numeric"><InputOTPGroup>{Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} className="size-10" />)}</InputOTPGroup></InputOTP>
    <p id={`${id}-message`} className="text-xs text-destructive" role={error ? "alert" : undefined}>{error}</p>
    <div className="flex gap-3"><Button type="button" size="sm" disabled={code.length !== 6} onClick={() => code === "123456" ? onVerified() : setError("Incorrect OTP. Use 123456 in this demo.")}>Verify OTP</Button><Button type="button" size="sm" variant="link" onClick={() => { setCode(""); setError("A new demo OTP is ready: 123456.") }}>Resend OTP</Button></div>
  </div>
}
