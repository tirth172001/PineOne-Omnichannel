import Link from "next/link"
import { notFound } from "next/navigation"
import { STEP_VARIANTS } from "../_variants"

export function generateStaticParams() {
  return Object.keys(STEP_VARIANTS).map((step) => ({ step }))
}

// One archived variant at a time, with a pill to switch between them or jump to the live step.
export default async function StepVariantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ step: string }>
  searchParams: Promise<{ variant?: string }>
}) {
  const { step } = await params
  const { variant } = await searchParams
  const entry = STEP_VARIANTS[step]
  if (!entry) notFound()
  const current = entry.variants.find((v) => v.key === variant) ?? entry.variants[0]
  const { Component } = current

  return (
    <>
      <Component />
      <nav
        aria-label={`${entry.title} variants`}
        className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4"
      >
        <div className="flex flex-wrap items-center gap-1 rounded-full border border-border bg-popover/95 p-1 text-sm text-popover-foreground shadow-lg backdrop-blur">
          <span className="px-3 font-medium">{entry.title}</span>
          {entry.variants.map((v) => (
            <Link
              key={v.key}
              href={`?variant=${v.key}`}
              aria-current={v.key === current.key ? "page" : undefined}
              className="rounded-full px-3 py-1.5 aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground hover:bg-muted"
            >
              {v.label}
            </Link>
          ))}
          <Link href={entry.live} className="rounded-full px-3 py-1.5 text-muted-foreground hover:bg-muted">
            Live step ↗
          </Link>
        </div>
      </nav>
    </>
  )
}
