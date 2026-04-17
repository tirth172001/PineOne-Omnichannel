import { V2DashboardLayout } from "@/components/dashboard/v2-dashboard-layout"
import { OfflinePaymentsContent } from "@/components/offline-payments/offline-payments-content"

export default function OfflinePaymentsManageDevicesPage({
  searchParams,
}: {
  searchParams?: { model?: string | string[] }
}) {
  const model = Array.isArray(searchParams?.model) ? searchParams?.model[0] : searchParams?.model

  return (
    <V2DashboardLayout>
      <OfflinePaymentsContent initialSection="manage-devices" initialModel={model} />
    </V2DashboardLayout>
  )
}
