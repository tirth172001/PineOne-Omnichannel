import type { ComponentType } from "react"
import {
  ArrowLeftRight,
  BadgeIndianRupee,
  BookOpen,
  CreditCard,
  FileChartColumn,
  Gift,
  Globe,
  Home,
  LayoutGrid,
  Megaphone,
  MessageSquareText,
  Package,
  PackageSearch,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Store,
  Link2,
} from "lucide-react"
export type NavSubItem = {
  label: string
  href: string
}

export type NavItem = {
  label: string
  icon: ComponentType<{ className?: string }>
  subItems?: NavSubItem[]
  matcher?: (pathname: string) => boolean
  href?: string
  comingSoon?: boolean
}

export type NavSection = {
  label?: string
  items: NavItem[]
}

export type BottomNavItem = {
  label: string
  icon: ComponentType<{ className?: string }>
  href: string
  matcher: (pathname: string) => boolean
}

const navSectionsV3: NavSection[] = [
  {
    items: [
      {
        label: "Overview",
        icon: LayoutGrid,
        href: "/",
        matcher: (p) => p === "/",
      },
      {
        label: "Transactions",
        icon: ArrowLeftRight,
        href: "/transactions",
        matcher: (p) =>
          p === "/transactions" ||
          p.startsWith("/online-payments/transactions") ||
          p.startsWith("/offline-payments/transactions") ||
          p.startsWith("/payment-links/transactions"),
      },
      {
        label: "Settlement",
        icon: BadgeIndianRupee,
        href: "/settlements",
        matcher: (p) =>
          p === "/settlements" ||
          p.startsWith("/online-payments/settlements") ||
          p.startsWith("/offline-payments/settlements") ||
          p.startsWith("/payment-links/settlements"),
      },
      {
        label: "Disputes",
        icon: ShieldAlert,
        href: "/disputes",
        matcher: (p) =>
          p === "/disputes" ||
          p.startsWith("/online-payments/disputes") ||
          p.startsWith("/offline-payments/disputes") ||
          p.startsWith("/payment-links/disputes"),
      },
      {
        label: "Refunds",
        icon: RotateCcw,
        href: "/refunds",
        matcher: (p) =>
          p === "/refunds" ||
          p.startsWith("/online-payments/refunds") ||
          p.startsWith("/offline-payments/refunds") ||
          p.startsWith("/payment-links/refunds"),
      },
      {
        label: "Reports",
        icon: FileChartColumn,
        href: "/reports",
        matcher: (p) =>
          p === "/reports" ||
          p.startsWith("/online-payments/reports") ||
          p.startsWith("/offline-payments/reports") ||
          p.startsWith("/payment-links/reports"),
      },
    ],
  },
  {
    label: "Products",
    items: [
      {
        label: "Online payment",
        icon: CreditCard,
        href: "/products/online-payments",
        matcher: (p) =>
          p.startsWith("/products/online-payments") ||
          p.startsWith("/online-payments") ||
          p.startsWith("/payment-links"),
      },
      {
        label: "In-store payment",
        icon: Store,
        href: "/products/in-store-payments",
        matcher: (p) =>
          p.startsWith("/products/in-store-payments") ||
          p.startsWith("/offline-payments/manage-devices") ||
          p.startsWith("/offline-payments/order-devices") ||
          p.startsWith("/offline-payments/manage-stores"),
      },
      {
        label: "Other products",
        icon: Package,
        href: "/products/other-products",
        matcher: (p) => p.startsWith("/products/other-products") || p.startsWith("/products/third-party-offers"),
      },
      {
        label: "Offer engine",
        icon: Megaphone,
        href: "/products/offer-engine-coming-soon",
        matcher: (p) => p.startsWith("/products/offer-engine-coming-soon"),
        comingSoon: true,
      },
      {
        label: "GrowthX",
        icon: Sparkles,
        href: "/products/growthx-coming-soon",
        matcher: (p) => p.startsWith("/products/growthx-coming-soon"),
        comingSoon: true,
      },
    ],
  },
  {
    label: "Help and support",
    items: [
      {
        label: "Knowledge hub",
        icon: BookOpen,
        href: "/support/knowledge-hub",
        matcher: (p) =>
          p.startsWith("/support/knowledge-hub") ||
          p.startsWith("/support/faqs") ||
          p.startsWith("/support/training-videos"),
      },
      {
        label: "Support queries",
        icon: MessageSquareText,
        href: "/support/support-queries",
        matcher: (p) =>
          p.startsWith("/support/support-queries") ||
          p.startsWith("/support/ticket-history") ||
          p === "/support",
      },
    ],
  },
]

const bottomNavItemsV3: BottomNavItem[] = [
  {
    label: "Overview",
    icon: Home,
    href: "/",
    matcher: (pathname) => pathname === "/",
  },
  {
    label: "Txn",
    icon: ArrowLeftRight,
    href: "/transactions",
    matcher: (pathname) => pathname.startsWith("/transactions"),
  },
  {
    label: "Settle",
    icon: BadgeIndianRupee,
    href: "/settlements",
    matcher: (pathname) => pathname.startsWith("/settlements"),
  },
  {
    label: "Reports",
    icon: FileChartColumn,
    href: "/reports",
    matcher: (pathname) => pathname.startsWith("/reports"),
  },
]

export function getSidebarSections(): NavSection[] {
  return navSectionsV3
}

export function getBottomNavItems(): BottomNavItem[] {
  return bottomNavItemsV3
}
