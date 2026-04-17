import { V2DashboardLayout } from "@/components/dashboard/v2-dashboard-layout"
import { ManageProductListContent } from "@/components/products/manage-product-list-content"

const inStoreDevices = [
  {
    id: "a891",
    name: "A891",
    description: "Advanced Android smart POS terminal for high-volume counters.",
    configured: true,
    metricText: "34 devices added",
    imageIconName: "tablet",
    actions: [
      { label: "Add device", href: "/offline-payments/order-devices?model=a891", variant: "default", showArrow: false },
      { label: "View added devices", href: "/offline-payments/manage-devices?model=a891", variant: "outline", showArrow: false },
    ],
  },
  {
    id: "mini",
    name: "Mini",
    description: "Compact terminal for mobile sales teams and quick checkout.",
    configured: true,
    metricText: "22 devices added",
    imageIconName: "phone",
    actions: [
      { label: "Add device", href: "/offline-payments/order-devices?model=mini", variant: "default", showArrow: false },
      { label: "View added devices", href: "/offline-payments/manage-devices?model=mini", variant: "outline", showArrow: false },
    ],
  },
  {
    id: "go",
    name: "Go",
    description: "Portable in-store terminal for queue-busting and assisted payments.",
    configured: false,
    metricText: "0 devices added",
    imageIconName: "handheld",
    actions: [
      { label: "Add device", href: "/offline-payments/order-devices?model=go", variant: "default", showArrow: false },
      { label: "View details", href: "/offline-payments/manage-devices?model=go", variant: "outline", showArrow: false },
    ],
  },
  {
    id: "duo",
    name: "Duo",
    description: "Dual-screen POS for cashier plus customer interaction workflows.",
    configured: false,
    metricText: "0 devices added",
    imageIconName: "duo",
    actions: [
      { label: "Add device", href: "/offline-payments/order-devices?model=duo", variant: "default", showArrow: false },
      { label: "View details", href: "/offline-payments/manage-devices?model=duo", variant: "outline", showArrow: false },
    ],
  },
  {
    id: "voice-pod",
    name: "Voice POD",
    description: "Audio-confirmation payment pod for lightweight in-store acceptance.",
    configured: true,
    metricText: "9 devices added",
    imageIconName: "audio",
    actions: [
      { label: "Add device", href: "/offline-payments/order-devices?model=voice-pod", variant: "default", showArrow: false },
      { label: "View added devices", href: "/offline-payments/manage-devices?model=voice-pod", variant: "outline", showArrow: false },
    ],
  },
  {
    id: "upi-qr-sticker",
    name: "UPI QR sticker",
    description: "Store-linked UPI QR acceptance with branded design controls and transaction visibility.",
    configured: true,
    metricText: "17 QRs linked",
    imageIconName: "qr",
    actions: [
      { label: "Configure QR", href: "/products/in-store-payments/upi-qr-sticker", variant: "default", showArrow: false },
      { label: "View transactions", href: "/offline-payments/transactions?source=upi-qr", variant: "outline", showArrow: false },
    ],
  },
]

export default function InStorePaymentsProductsPage() {
  return (
    <V2DashboardLayout>
      <ManageProductListContent
        title="In-store payment products"
        subtitle="Manage in-store products, terminal variants, and UPI QR acceptance."
        products={inStoreDevices}
        headerActions={[
          { label: "Manage devices", href: "/offline-payments/manage-devices", variant: "outline", showArrow: false },
          { label: "Manage store", href: "/offline-payments/manage-stores", variant: "outline", showArrow: false },
          { label: "Buy new device", href: "/offline-payments/order-devices", variant: "default", showArrow: false },
        ]}
      />
    </V2DashboardLayout>
  )
}
