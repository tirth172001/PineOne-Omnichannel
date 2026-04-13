import { V2DashboardLayout } from "@/components/dashboard/v2-dashboard-layout"
import { OnlinePaymentsContent } from "@/components/online-payments/online-payments-content"

export default function Page() {
  return (
    <V2DashboardLayout>
      <OnlinePaymentsContent initialSection="reports" />
    </V2DashboardLayout>
  )
}
