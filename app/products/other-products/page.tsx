import { V2DashboardLayout } from "@/components/dashboard/v2-dashboard-layout"
import { ThirdPartyOffersContent } from "@/components/products/third-party-offers-content"

export default function OtherProductsPage() {
  return (
    <V2DashboardLayout>
      <ThirdPartyOffersContent
        title="Other products"
        subtitle="Explore 3rd-party products and add-on services for your business."
      />
    </V2DashboardLayout>
  )
}
