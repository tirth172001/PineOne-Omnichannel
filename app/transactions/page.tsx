import { V2DashboardLayout } from "@/components/dashboard/v2-dashboard-layout"
import { TransactionsRouteContent } from "@/components/transactions/transactions-route-content"

export default function TransactionsPage() {
  return (
    <V2DashboardLayout>
      <TransactionsRouteContent />
    </V2DashboardLayout>
  )
}
