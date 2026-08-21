import {
  ArrowsClockwiseIcon,
  CreditCardIcon,
  GlobeIcon,
  LinkIcon,
  QrCodeIcon,
  StorefrontIcon,
  type Icon,
} from "@phosphor-icons/react"

// Ticket 05 (.scratch/onboarding-experience-v3/issues/05-product-intent-taxonomy-and-field-rules.md):
// four top-level categories are the selection unit for both the business-name teaser row and the
// downstream field-dependency rule (ticket 07) — "in-store-devices" is the only one that gates
// anything. The `catalogGroups` below are illustrative browsing content only, shown in the "View
// more" side panel (ticket 06) — they carry no selection state of their own.
export type ProductCategoryId = "in-store-devices" | "online-checkout" | "payment-links" | "subscriptions"

export type CatalogItem = {
  name: string
  tag?: string
  description: string
}

export type CatalogGroup = {
  title: string
  icon: Icon
  items: CatalogItem[]
}

export type ProductCategory = {
  id: ProductCategoryId
  label: string
  teaser: string
  icon: Icon
  catalogGroups: CatalogGroup[]
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: "in-store-devices",
    label: "In-store devices",
    teaser: "POS terminal, QR stickers, soundbox",
    icon: StorefrontIcon,
    catalogGroups: [
      {
        title: "Swipe machines",
        icon: CreditCardIcon,
        items: [
          {
            name: "A910",
            tag: "Medium & large businesses",
            description: "All payment modes • Compact and portable • Supports 4G and WiFi",
          },
          { name: "A50", description: "All payment modes • Compact and portable • Supports 4G and WiFi" },
          { name: "A920", description: "All payment modes • Compact and portable • Supports 4G and WiFi" },
        ],
      },
      {
        title: "QR devices",
        icon: QrCodeIcon,
        items: [
          {
            name: "Mini Pro",
            tag: "Small businesses",
            description: "All payment modes • Compact and portable • Supports 4G and WiFi",
          },
          { name: "Mini", description: "All payment modes • Compact and portable • Supports 4G and WiFi" },
        ],
      },
    ],
  },
  {
    id: "online-checkout",
    label: "Online checkout",
    teaser: "Accept payments on your website or app",
    icon: GlobeIcon,
    catalogGroups: [
      {
        title: "Online payment solutions",
        icon: GlobeIcon,
        items: [
          {
            name: "Payment gateway",
            tag: "Express checkout",
            description: "All payment modes • Compact and portable • Supports 4G and WiFi",
          },
          {
            name: "Tap to Pay on iPhone",
            description: "Easy, secure and instant • Supported on Phone models XS and above only",
          },
        ],
      },
    ],
  },
  {
    id: "payment-links",
    label: "Payment links",
    teaser: "Get paid over SMS, email or WhatsApp",
    icon: LinkIcon,
    catalogGroups: [
      {
        title: "Payment links",
        icon: LinkIcon,
        items: [
          {
            name: "Standard payment link",
            description: "Share a link via SMS, email or WhatsApp • Get paid instantly",
          },
          {
            name: "WhatsApp payment link",
            tag: "New",
            description: "Send and collect payments directly within WhatsApp chats",
          },
        ],
      },
    ],
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    teaser: "Recurring billing for repeat customers",
    icon: ArrowsClockwiseIcon,
    catalogGroups: [
      {
        title: "Subscriptions",
        icon: ArrowsClockwiseIcon,
        items: [
          {
            name: "Recurring billing",
            description: "Auto-charge customers on a fixed schedule • Weekly, monthly or custom cycles",
          },
          {
            name: "Subscription management portal",
            tag: "Customer self-serve",
            description: "Let customers upgrade, pause or cancel their own plan",
          },
        ],
      },
    ],
  },
]

export function findProductCategory(id: ProductCategoryId) {
  return PRODUCT_CATEGORIES.find((category) => category.id === id)
}
