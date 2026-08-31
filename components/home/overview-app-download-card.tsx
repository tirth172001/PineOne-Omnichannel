"use client"

import { AppleLogoIcon, GooglePlayLogoIcon } from "@phosphor-icons/react"
import { QrCodeGrid } from "@/components/shared/qr-matrix-preview"

export function OverviewAppDownloadCard() {
  return (
    <article className="overflow-hidden rounded-[8px] border border-border/60 bg-background">
      <div className="flex flex-col gap-6 p-6">
        <div>
          <p className="text-xl font-semibold leading-tight text-foreground">
            Empower your business with the PineOne app!
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Track transactions, settlements and reports on the go — scan to download.
          </p>
          <div className="mt-4 flex items-center gap-3 text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium">
              <GooglePlayLogoIcon className="h-4 w-4" weight="fill" />
              Google Play
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium">
              <AppleLogoIcon className="h-4 w-4" weight="fill" />
              App Store
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-3 rounded-[8px] px-6 pt-6">
          <QrCodeGrid seed="pineone-app-download" size={260} />
          <p className="text-center text-xs text-muted-foreground">Scan to download</p>
        </div>
      </div>
    </article>
  )
}
