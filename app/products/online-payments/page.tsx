import { V2DashboardLayout } from "@/components/dashboard/v2-dashboard-layout"
import { ManageProductListContent } from "@/components/products/manage-product-list-content"

const onlinePaymentProducts = [
  {
    id: "checkout",
    name: "Checkout",
    description: "Whitelabeled checkout configuration, payment methods, and smart routing controls.",
    configured: true,
    imageIconName: "checkout",
    actions: [
      { label: "Configure", href: "/online-payments/configuration", variant: "default", showArrow: false },
      { label: "View transactions", href: "/online-payments/transactions?product=checkout", variant: "outline", showArrow: false },
    ],
  },
  {
    id: "smart-routing",
    name: "Smart routing",
    description: "Fallback and priority rules across acquirers to optimize online payment success.",
    configured: false,
    imageIconName: "routing",
    actions: [
      { label: "Configure", href: "/online-payments/configuration?feature=smart-routing", variant: "default", showArrow: false },
      { label: "View transactions", href: "/online-payments/transactions?product=smart-routing", variant: "outline", showArrow: false },
    ],
  },
  {
    id: "payment-links",
    name: "Payment links",
    description: "Create, manage, and configure payment-link journeys across channels.",
    configured: true,
    imageIconName: "links",
    actions: [
      { label: "Configure", href: "/online-payments/configuration?feature=payment-links", variant: "default", showArrow: false },
      { label: "Manage links", href: "/payment-links/all", variant: "outline", showArrow: false },
    ],
  },
]

export default function OnlinePaymentsProductsPage() {
  return (
    <V2DashboardLayout>
      <ManageProductListContent
        title="Online payment products"
        subtitle="Configure checkout, smart routing, and payment links from one place."
        products={onlinePaymentProducts}
        primaryAction={{ label: "Configure product", href: "/online-payments/configuration", showArrow: false }}
      />
    </V2DashboardLayout>
  )
}
