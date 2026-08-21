"use client"

/**
 * Design settled via wayfinder ticket 02-design-dispute-detail-page (variant A —
 * "Receipt style", matches on-hold-detail-content.tsx for consistency across the
 * module).
 */

import Link from "next/link"
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CircleIcon,
  ClockIcon,
  CopyIcon,
  GavelIcon,
  ShieldWarningIcon,
  XCircleIcon,
} from "@phosphor-icons/react"
import { StatusPill } from "@/components/shared/status-pill"
import { Button } from "@/components/ui/button"
import {
  disputeStatusLabel,
  disputeStatusTone,
  type DisputeRecord,
} from "@/components/on-hold-disputes/on-hold-disputes-data"

export type DisputeDetailRecord = DisputeRecord

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  )
}

export function DisputeDetailContent({ record }: { record: DisputeDetailRecord }) {
  const timeline = [
    { id: "dispute-raised", title: "Dispute raised", timestamp: record.createdOn, icon: <ShieldWarningIcon className="h-4 w-4 text-amber-600" /> },
    { id: "evidence-due", title: `Evidence due ${record.dueDate}`, timestamp: record.createdOn, icon: <ClockIcon className="h-4 w-4 text-amber-600" /> },
    {
      id: "current-status",
      title: disputeStatusLabel(record),
      timestamp: record.createdOn,
      icon:
        record.status === "Closed" ? (
          record.outcome === "Won" ? (
            <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
          ) : (
            <XCircleIcon className="h-4 w-4 text-red-600" />
          )
        ) : (
          <CircleIcon className="h-4 w-4 text-chart-4" />
        ),
    },
  ]

  return (
    <div className="relative p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[301px] bg-gradient-to-b from-amber-500/20 via-amber-500/8 to-background" />
      <div className="relative z-10 mx-auto w-full max-w-[1440px]">
        <div className="flex h-8 w-full items-center justify-between">
          <Button asChild variant="ghost" className="h-8 rounded-md px-2 text-xs text-foreground hover:bg-background/20">
            <Link href="/on-hold-disputes">
              <ArrowLeftIcon className="mr-1 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        <div className="mt-8 h-[140px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <GavelIcon className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <p className="text-[36px] font-semibold leading-9 text-foreground">{record.amount}</p>
            <StatusPill label={disputeStatusLabel(record)} tone={disputeStatusTone(record)} />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Dispute raised: {record.createdOn} <span className="mx-2 text-border">|</span> Due: {record.dueDate}
          </p>
        </div>

        <div className="mt-6 h-px w-full bg-border/70" />

        <div className="mt-6 flex items-start gap-12">
          <div className="w-[744px] shrink-0 space-y-8">
            <section className="space-y-6">
              <h3 className="text-xl font-medium leading-6 text-foreground">Dispute details</h3>
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-3">
                <DetailField
                  label="Dispute ID"
                  value={
                    <span className="inline-flex items-center gap-2">
                      {record.id}
                      <CopyIcon className="h-4 w-4 text-muted-foreground" />
                    </span>
                  }
                />
                <DetailField
                  label="Transaction ID"
                  value={
                    <span className="inline-flex items-center gap-2">
                      {record.transactionId}
                      <CopyIcon className="h-4 w-4 text-muted-foreground" />
                    </span>
                  }
                />
                <DetailField label="Channel" value={record.channel === "in-store" ? "In-store payment" : "Online payment"} />
                <DetailField label="Category" value={record.category} />
                <DetailField label="Reason" value={record.reason} />
              </div>
            </section>

            <div className="h-px w-full bg-border/70" />

            <section className="space-y-6">
              <h3 className="text-xl font-medium leading-6 text-foreground">Merchant details</h3>
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-3">
                <DetailField label="Merchant name" value="PineLabs Private limited" />
                <DetailField label="Merchant store" value="PineLabs - Noida branch" />
                <DetailField
                  label="MID"
                  value={
                    <span className="inline-flex items-center gap-2">
                      6352699747
                      <CopyIcon className="h-4 w-4 text-muted-foreground" />
                    </span>
                  }
                />
              </div>
            </section>
          </div>

          <div className="h-[400px] w-px shrink-0 bg-border/70" />

          <div className="w-[328px] shrink-0 px-2 py-2">
            <h2 className="text-xl font-medium leading-6 text-foreground">Activity</h2>
            <div className="relative mt-4 space-y-6">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border/70" />
              {timeline.map((event) => (
                <div key={event.id} className="relative pl-8">
                  <div className="absolute left-0 top-0.5">{event.icon}</div>
                  <p className="text-sm text-foreground">{event.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{event.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
