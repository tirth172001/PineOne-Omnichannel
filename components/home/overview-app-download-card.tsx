"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function OverviewAppDownloadCard({
  variant = "vertical",
}: {
  variant?: "vertical" | "horizontal"
}) {
  const horizontal = variant === "horizontal"

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[8px] border border-overview-border bg-gradient-to-r from-[#e8f7d4] via-background to-background",
        horizontal ? "flex flex-col items-center gap-6 p-6 sm:flex-row sm:justify-between" : "flex flex-col gap-6 p-6"
      )}
    >
      <div className="relative z-10 flex flex-col gap-4">
        <div>
          <p className="font-heading text-2xl font-semibold leading-tight text-foreground">
            Empower your business with the PineOne app!
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Track transactions, settlements and reports on the go — scan to download.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button type="button" size="sm" className="h-8">
            Send link on mobile
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-8">
            I have the app
          </Button>
        </div>
      </div>

      <div className={cn("relative shrink-0", horizontal ? "h-[180px] w-[127px]" : "mx-auto h-[220px] w-[155px]")}>
        <Image
          src="/images/overview-app-download/phone-mockup.png"
          alt="PineOne app on a phone"
          fill
          className="object-contain object-bottom"
          sizes="200px"
        />
        <div
          className="absolute overflow-hidden rounded-[10px] bg-muted p-[3%]"
          style={{ left: "10.4%", top: "1.5%", width: "41.5%", height: "65%" }}
        >
          <div className="flex flex-col overflow-hidden rounded-[8px] bg-white text-foreground">
            <div className="flex items-center justify-between px-[10%] pt-[10%]">
              <span className="text-[6px] font-medium leading-none text-foreground">Settled</span>
              <span className="rounded-full bg-muted px-[5%] py-[2.5%] text-[4.5px] font-medium leading-none text-foreground">
                Today
              </span>
            </div>
            <div className="flex flex-col items-center px-[10%] pt-[8%]">
              <span className="text-[9px] font-bold leading-none tabular-nums text-foreground">₹1,84,567.72</span>
              <span className="mt-[6%] text-center text-[4.5px] leading-none text-muted-foreground">
                324 Transactions · 8 Settlements
              </span>
            </div>
            <div className="mt-[10%] flex flex-col gap-[8%] border-t border-overview-border px-[10%] py-[8%]">
              <div className="flex items-center justify-between text-[4.5px] leading-none">
                <span className="text-foreground">No. of settlements</span>
                <span className="font-semibold text-foreground">8</span>
              </div>
              <div className="flex items-center justify-between text-[4.5px] leading-none">
                <span className="text-foreground">Deductions</span>
                <span className="font-semibold text-foreground">₹14,234.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
