"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { computeAccessScope, DEFAULT_ROLE_CATALOG } from "@/lib/role-permissions"
import { MONTHS, formatTime, type RosterEntry } from "@/lib/user-roster-data"

/** Store-detail adds are always in-store users — only offline-system roles apply here. */
const STORE_ROLE_OPTIONS = DEFAULT_ROLE_CATALOG.filter((role) => role.system === "offline")

function nowStamp() {
  const now = new Date()
  return {
    date: `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
    time: formatTime(now.getHours(), now.getMinutes()),
  }
}

export function AddUserPanel({
  open,
  onOpenChange,
  store,
  roster,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  store: { storeId: string; name: string } | null
  /** Used to catch inviting an email that's already on this store's roster. */
  roster: RosterEntry[]
  onAdd: (user: RosterEntry) => void
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [roleName, setRoleName] = useState(STORE_ROLE_OPTIONS[0]?.name ?? "")

  useEffect(() => {
    if (!open) return
    setName("")
    setEmail("")
    setPhone("")
    setRoleName(STORE_ROLE_OPTIONS[0]?.name ?? "")
  }, [open])

  const nameValid = name.trim().length > 0
  const normalizedEmail = email.trim().toLowerCase()
  const emailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  const existingEntry = emailFormatValid ? roster.find((entry) => entry.email.trim().toLowerCase() === normalizedEmail) : undefined
  const emailError = existingEntry ? "This email is already on this store's roster." : null
  const canAdd = nameValid && emailFormatValid && Boolean(roleName) && !emailError

  function handleAdd() {
    if (!canAdd || !store) return
    const { date, time } = nowStamp()
    const role = STORE_ROLE_OPTIONS.find((entry) => entry.name === roleName)
    onAdd({
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      addedOnDate: date,
      addedOnTime: time,
      scope: role ? computeAccessScope(role.permissionKeys) : "In-store",
      role: roleName,
      status: "Invited",
      storeIds: [store.storeId],
    })
    onOpenChange(false)
    toast.success(`Invite sent to ${email.trim()}`)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-base font-medium text-foreground">Add user</SheetTitle>
          <SheetDescription>{store ? `Invite a teammate to ${store.name}.` : "Invite a teammate to this store."}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="add-user-name">Full name</Label>
            <Input id="add-user-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Priya Singh" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-user-email">Email</Label>
            <Input
              id="add-user-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teammate@company.com"
              aria-invalid={Boolean(emailError)}
              className={emailError ? "border-destructive focus-visible:ring-destructive/40" : undefined}
            />
            {emailError ? <p className="text-xs text-destructive">{emailError}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-user-phone">Phone number</Label>
            <Input
              id="add-user-phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="9876543210"
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={roleName} onValueChange={setRoleName}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STORE_ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t border-border/70">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!canAdd}>
            Send invite
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
