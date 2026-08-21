"use client"

import { useState } from "react"
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react"
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Consent lives inline on the page now (see _variant-a.tsx) — the actual Singpass login (QR scan
// or Corppass ID/password) still happens in a modal, per direct feedback, opened only after
// "Proceed with Singpass" is clicked on the inline consent card. Renders a real scannable QR code
// (react-qr-code, SVG-based) rather than a placeholder icon glyph.
export function SingpassLoginDialog({
  open,
  onLogin,
  onCancel,
}: {
  open: boolean
  onLogin: () => void
  onCancel: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Login to Singpass</DialogTitle>
          <DialogDescription>
            Login as a <span className="font-semibold text-foreground">Corppass</span> user
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
          <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-muted/40 p-5 text-center">
            <span className="flex size-28 items-center justify-center rounded-lg bg-white p-2.5 ring-1 ring-border">
              <QRCode
                value="https://singpass.gov.sg/login-session/kopi-and-co-demo"
                size={256}
                className="h-full w-full"
              />
            </span>
            <p className="text-sm font-semibold text-foreground">Instant login</p>
            <p className="text-xs leading-4 text-muted-foreground">
              Scan QR code with your phone and login to your Singpass account
            </p>
            <span className="mt-1 rounded bg-white px-2 py-1">
              <img src="/brand/singpass-logo.svg" alt="Singpass" className="h-4 w-auto" />
            </span>
          </div>

          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              onLogin()
            }}
          >
            <div className="space-y-1">
              <Label htmlFor="corppass-id" className="text-xs text-muted-foreground">
                Corppass ID
              </Label>
              <Input id="corppass-id" defaultValue="j.tan@kopiandco.com.sg" />
              <button type="button" className="text-xs text-primary underline underline-offset-2">
                Forgot your ID?
              </button>
            </div>

            <div className="space-y-1">
              <Label htmlFor="corppass-password" className="text-xs text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="corppass-password"
                  type={showPassword ? "text" : "password"}
                  defaultValue="pinelabs123"
                  className="pr-8"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeSlashIcon size={15} /> : <EyeIcon size={15} />}
                </button>
              </div>
              <button type="button" className="text-xs text-primary underline underline-offset-2">
                Forgot your password?
              </button>
            </div>

            <div className="mt-1 flex flex-col gap-2">
              <Button type="submit" size="lg" className="w-full">
                Login
              </Button>
              <Button type="button" variant="outline" size="lg" className="w-full" onClick={onLogin}>
                Register with Singpass
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
