import { notFound } from "next/navigation"

import { DisputeDetailContent } from "@/components/disputes/dispute-detail-content"
import { findDisputeById } from "@/components/disputes/disputes-data"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function DisputeDetailPage({ params }: PageProps) {
  const { id } = await params
  const record = findDisputeById(id)

  if (!record) {
    notFound()
  }

  return (
    <TransactionsPlatformShell>
      <DisputeDetailContent record={record} />
    </TransactionsPlatformShell>
  )
}
