import { V2DashboardLayout } from "@/components/dashboard/v2-dashboard-layout"
import { SubPagePlaceholder } from "@/components/dashboard/sub-page-placeholder"

export default function OfflinePaymentsManageStoresPage() {
  return (
    <V2DashboardLayout>
      <SubPagePlaceholder
        section="In-store payment"
        page="Manage stores"
        parentHref="/products/in-store-payments"
        parentLabel="Back to In-store payment products"
        description="Configure store profiles, deployment mapping, and store-level operational defaults."
      />
    </V2DashboardLayout>
  )
}
