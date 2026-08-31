"use client"

import { useState } from "react"
import Link from "next/link"
import { DownloadSimpleIcon } from "@phosphor-icons/react"
import { DetailSidepanelShell } from "@/components/shared/activity-timeline-sidepanel"
import { QrMatrixPreview, qrBackgroundSwatches } from "@/components/shared/qr-matrix-preview"
import { Button } from "@/components/ui/button"

/** Mock VPA shared with every other "merchant details" surface in this app (dispute/transaction
 *  detail pages, the Store QR listing) — keeping it consistent rather than inventing a new one. */
const STORE_UPI_ID = "6352699747@ptyes"

export function StoreQrPanel({
  open,
  onOpenChange,
  store,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  store: { storeId: string; name: string; address: string } | null
}) {
  const [backgroundColor, setBackgroundColor] = useState<string>(qrBackgroundSwatches[0])

  return (
    <DetailSidepanelShell open={open && Boolean(store)} onOpenChange={onOpenChange} title="View & edit store QR" desktopWidth={458}>
      {store ? (
        <div className="flex h-full flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            <section className="space-y-2">
              <p className="text-2xl font-semibold leading-8 tracking-[-0.02em] text-foreground">{store.name}</p>
              <p className="text-sm text-muted-foreground">{store.address}</p>
              <Button variant="link" className="h-8 px-0 text-sm text-primary hover:text-primary/80" asChild>
                <Link href={`/transactions?source=qr&store=${encodeURIComponent(store.name)}`}>View transactions on this QR</Link>
              </Button>
            </section>

            <div className="h-px w-full bg-border/70" />

            <section className="space-y-3">
              <p className="text-sm text-muted-foreground">Select preferred theme</p>
              <div className="flex items-center gap-2">
                {qrBackgroundSwatches.map((swatch) => {
                  const selected = backgroundColor === swatch
                  return (
                    <button
                      key={swatch}
                      type="button"
                      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full"
                      onClick={() => setBackgroundColor(swatch)}
                      aria-label={`Use ${swatch} background`}
                    >
                      <span className="h-8 w-8 rounded-full" style={{ backgroundColor: swatch }} />
                      <span className={`absolute inset-0 rounded-full border-2 ${selected ? "border-primary" : "border-border/70"}`} />
                    </button>
                  )
                })}
              </div>
            </section>

            <QrMatrixPreview seed={`${store.storeId}-${STORE_UPI_ID}-${backgroundColor}`} backgroundColor={backgroundColor} upiId={STORE_UPI_ID} />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border/70 bg-card p-6">
            <Button variant="outline" className="h-9 rounded-md text-sm" asChild>
              <Link href="/products/in-store-payments/upi-qr-sticker?order=true">Order store QR</Link>
            </Button>
            <Button
              className="h-9 gap-1.5 rounded-md text-sm"
              onClick={() => {
                if (typeof window !== "undefined") window.print()
              }}
            >
              <DownloadSimpleIcon className="h-4 w-4" />
              Download QR
            </Button>
          </div>
        </div>
      ) : null}
    </DetailSidepanelShell>
  )
}
