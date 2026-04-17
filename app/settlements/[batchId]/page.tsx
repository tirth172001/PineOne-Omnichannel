import { V2DashboardLayout } from "@/components/dashboard/v2-dashboard-layout"
import { SettlementsRouteContent } from "@/components/settlements/settlements-route-content"

export default async function SettlementBatchPage({
  params,
}: {
  params: Promise<{ batchId: string }>
}) {
  const { batchId } = await params

  return (
    <V2DashboardLayout>
      <SettlementsRouteContent batchId={batchId} />
    </V2DashboardLayout>
  )
}

