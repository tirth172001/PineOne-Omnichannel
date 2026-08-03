import { notFound } from "next/navigation"

import { OnHoldDetailContent } from "@/components/on-hold-disputes/on-hold-detail-content"
import { findOnHoldById } from "@/components/on-hold-disputes/on-hold-disputes-data"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function OnHoldDetailPage({ params }: PageProps) {
  const { id } = await params
  const record = findOnHoldById(id)

  if (!record) {
    notFound()
  }

  return (
    <TransactionsPlatformShell>
      <OnHoldDetailContent record={record} />
    </TransactionsPlatformShell>
  )
}
