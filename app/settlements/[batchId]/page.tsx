import { notFound } from "next/navigation"
import { SettlementsRouteContent } from "@/components/settlements/settlements-route-content"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"

type PageProps = {
  params: Promise<{ batchId: string }>
}

export default async function SettlementDetailPage({ params }: PageProps) {
  const { batchId } = await params

  if (!batchId) {
    notFound()
  }

  return (
    <TransactionsPlatformShell>
      <SettlementsRouteContent batchId={batchId} />
    </TransactionsPlatformShell>
  )
}
