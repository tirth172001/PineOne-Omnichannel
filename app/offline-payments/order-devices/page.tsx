import { V2DashboardLayout } from "@/components/dashboard/v2-dashboard-layout"
import { SubPagePlaceholder } from "@/components/dashboard/sub-page-placeholder"

export default function OfflinePaymentsOrderDevicesPage() {
  return (
    <V2DashboardLayout>
      <SubPagePlaceholder
        section="In-store payment"
        page="Order new devices"
        parentHref="/products/in-store-payments"
        parentLabel="Back to In-store payment"
        description="Place a request for additional POS terminals and track provisioning status."
      />
    </V2DashboardLayout>
  )
}
