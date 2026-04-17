import { V2DashboardLayout } from "@/components/dashboard/v2-dashboard-layout"
import { PaymentLinksContent } from "@/components/payment-links/payment-links-content"

export default function PaymentLinksRefundsPage() {
  return (
    <V2DashboardLayout>
      <PaymentLinksContent initialSection="refunds" />
    </V2DashboardLayout>
  )
}
