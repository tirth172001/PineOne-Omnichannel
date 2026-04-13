import { V2DashboardLayout } from "@/components/dashboard/v2-dashboard-layout"
import { OfflinePaymentsContent } from "@/components/offline-payments/offline-payments-content"

export default function Page() {
  return (
    <V2DashboardLayout>
      <OfflinePaymentsContent initialSection="settlements" />
    </V2DashboardLayout>
  )
}
