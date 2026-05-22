import type { ComponentType } from "react"
import {
  Activity,
  ArrowLeftRight,
  BadgeIndianRupee,
  Braces,
  BookOpen,
  CreditCard,
  FileUp,
  FileChartColumn,
  Gift,
  Globe,
  Home,
  LayoutGrid,
  MoreHorizontal,
  MessageSquareText,
  QrCode,
  RefreshCcw,
  RotateCcw,
  ShieldAlert,
  Store,
  Link2,
  KeyRound,
  Settings2,
  Webhook,
} from "lucide-react"
import { ROUTES } from "@/lib/navigation/routes"
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

export type SidebarProduct = "payments" | "cross-border" | "cards" | "fintech-apis"

export type BottomNavItem = {
  label: string
  icon: ComponentType<{ className?: string }>
  href: string
  matcher: (pathname: string) => boolean
}

const sharedSupportSection: NavSection = {
  label: "Help & support",
  items: [
    {
      label: "Knowledge hub",
      icon: BookOpen,
      href: ROUTES.support.knowledgeHub,
      matcher: (p) =>
        p.startsWith(ROUTES.support.knowledgeHub) ||
        p.startsWith(ROUTES.support.faqs) ||
        p.startsWith(ROUTES.support.trainingVideos),
    },
    {
      label: "Support queries",
      icon: MessageSquareText,
      href: ROUTES.support.supportQueries,
      matcher: (p) =>
        p.startsWith(ROUTES.support.supportQueries) ||
        p.startsWith(ROUTES.support.ticketHistory) ||
        p === ROUTES.support.root,
    },
  ],
}

const paymentsNavSections: NavSection[] = [
  {
    items: [
      {
        label: "Overview",
        icon: LayoutGrid,
        href: ROUTES.home,
        matcher: (p) => p === ROUTES.home,
      },
      {
        label: "Transaction",
        icon: ArrowLeftRight,
        href: ROUTES.transactions.root,
        matcher: (p) =>
          p === ROUTES.transactions.root ||
          p.startsWith(ROUTES.onlinePayments.transactions) ||
          p.startsWith(ROUTES.offlinePayments.transactions) ||
          p.startsWith(ROUTES.paymentLinks.transactions),
      },
      {
        label: "Settlement",
        icon: BadgeIndianRupee,
        href: ROUTES.settlements.root,
        matcher: (p) =>
          p === ROUTES.settlements.root ||
          p.startsWith(ROUTES.onlinePayments.settlements) ||
          p.startsWith(ROUTES.offlinePayments.settlements) ||
          p.startsWith(ROUTES.paymentLinks.settlements),
      },
      {
        label: "Dispute cases",
        icon: ShieldAlert,
        href: ROUTES.disputes.root,
        matcher: (p) =>
          p === ROUTES.disputes.root ||
          p.startsWith(ROUTES.onlinePayments.disputes) ||
          p.startsWith(ROUTES.offlinePayments.disputes) ||
          p.startsWith(ROUTES.paymentLinks.disputes),
      },
      {
        label: "Refunds",
        icon: RotateCcw,
        href: ROUTES.refunds.root,
        matcher: (p) =>
          p === ROUTES.refunds.root ||
          p.startsWith(ROUTES.onlinePayments.refunds) ||
          p.startsWith(ROUTES.offlinePayments.refunds) ||
          p.startsWith(ROUTES.paymentLinks.refunds),
      },
      {
        label: "Reports",
        icon: FileChartColumn,
        href: ROUTES.reports.root,
        matcher: (p) =>
          p === ROUTES.reports.root ||
          p.startsWith(ROUTES.onlinePayments.reports) ||
          p.startsWith(ROUTES.offlinePayments.reports) ||
          p.startsWith(ROUTES.paymentLinks.reports),
      },
    ],
  },
  {
    label: "In-store payment",
    items: [
      {
        label: "POS terminals",
        icon: Store,
        href: ROUTES.offlinePayments.manageDevices,
        matcher: (p) =>
          p.startsWith(ROUTES.offlinePayments.manageDevices) ||
          p.startsWith(ROUTES.offlinePayments.orderDevices) ||
          p.startsWith(ROUTES.offlinePayments.manageStores) ||
          p === ROUTES.offlinePayments.root ||
          (p.startsWith(ROUTES.products.inStorePayments) && !p.startsWith(ROUTES.products.inStoreQrSticker)),
      },
      {
        label: "Store QR codes",
        icon: QrCode,
        href: ROUTES.products.inStoreQrSticker,
        matcher: (p) => p.startsWith(ROUTES.products.inStoreQrSticker),
      },
    ],
  },
  {
    label: "Online payment",
    items: [
      {
        label: "Checkout for website",
        icon: Globe,
        href: ROUTES.products.onlinePayments,
        matcher: (p) => p.startsWith(ROUTES.products.onlinePayments) || p.startsWith(ROUTES.onlinePayments.root),
      },
      {
        label: "Payment links or QR codes",
        icon: Link2,
        href: ROUTES.paymentLinks.all,
        matcher: (p) => p.startsWith(ROUTES.paymentLinks.root),
      },
      {
        label: "Subscriptions",
        icon: RefreshCcw,
        href: `${ROUTES.onlinePayments.configuration}?feature=subscription`,
        matcher: (p) => p.startsWith(ROUTES.onlinePayments.configuration),
      },
      {
        label: "More",
        icon: MoreHorizontal,
        href: ROUTES.products.otherProducts,
        matcher: (p) =>
          p.startsWith(ROUTES.products.otherProducts) ||
          p.startsWith(ROUTES.products.thirdPartyOffers) ||
          p.startsWith(ROUTES.products.offerEngineComingSoon) ||
          p.startsWith(ROUTES.products.growthxComingSoon),
      },
    ],
  },
  sharedSupportSection,
]

const cardsNavSections: NavSection[] = [
  {
    items: [
      {
        label: "Overview",
        icon: LayoutGrid,
        href: ROUTES.products.giftCardsComingSoon,
        matcher: (p) => p.startsWith(ROUTES.products.giftCardsComingSoon),
        comingSoon: true,
      },
      {
        label: "Card Programs",
        icon: ArrowLeftRight,
        href: ROUTES.products.giftCardsComingSoon,
        matcher: (p) => p.startsWith(ROUTES.products.giftCardsComingSoon),
        comingSoon: true,
      },
      {
        label: "Issuance",
        icon: BadgeIndianRupee,
        href: ROUTES.products.giftCardsComingSoon,
        matcher: (p) => p.startsWith(ROUTES.products.giftCardsComingSoon),
        comingSoon: true,
      },
      {
        label: "Disputes",
        icon: ShieldAlert,
        href: ROUTES.products.giftCardsComingSoon,
        matcher: (p) => p.startsWith(ROUTES.products.giftCardsComingSoon),
        comingSoon: true,
      },
      {
        label: "Reports",
        icon: FileChartColumn,
        href: ROUTES.products.giftCardsComingSoon,
        matcher: (p) => p.startsWith(ROUTES.products.giftCardsComingSoon),
        comingSoon: true,
      },
    ],
  },
  {
    label: "Cards",
    items: [
      {
        label: "Gift cards",
        icon: Gift,
        href: ROUTES.products.giftCardsComingSoon,
        matcher: (p) => p.startsWith(ROUTES.products.giftCardsComingSoon),
      },
      {
        label: "Card controls",
        icon: ShieldAlert,
        href: ROUTES.products.giftCardsComingSoon,
        matcher: (p) => p.startsWith(ROUTES.products.giftCardsComingSoon),
        comingSoon: true,
      },
    ],
  },
  sharedSupportSection,
]

const crossBorderNavSections: NavSection[] = [
  {
    items: [
      {
        label: "Overview",
        icon: LayoutGrid,
        href: ROUTES.crossBorder.root,
        matcher: (p) => p === ROUTES.crossBorder.root,
      },
      {
        label: "Transactions",
        icon: ArrowLeftRight,
        href: ROUTES.crossBorder.transactions,
        matcher: (p) => p.startsWith(ROUTES.crossBorder.transactions),
      },
      {
        label: "Settlement",
        icon: BadgeIndianRupee,
        href: ROUTES.crossBorder.settlements,
        matcher: (p) => p.startsWith(ROUTES.crossBorder.settlements),
      },
      {
        label: "Disputes",
        icon: ShieldAlert,
        href: ROUTES.crossBorder.disputes,
        matcher: (p) => p.startsWith(ROUTES.crossBorder.disputes),
      },
      {
        label: "Refunds",
        icon: RotateCcw,
        href: ROUTES.crossBorder.refunds,
        matcher: (p) => p.startsWith(ROUTES.crossBorder.refunds),
      },
      {
        label: "Reports",
        icon: FileChartColumn,
        href: ROUTES.crossBorder.reports,
        matcher: (p) => p.startsWith(ROUTES.crossBorder.reports),
      },
      {
        label: "Uploads",
        icon: FileUp,
        href: ROUTES.crossBorder.uploads,
        matcher: (p) => p.startsWith(ROUTES.crossBorder.uploads),
      },
      {
        label: "Configurations",
        icon: Settings2,
        href: ROUTES.crossBorder.configurations,
        matcher: (p) => p.startsWith(ROUTES.crossBorder.configurations),
      },
    ],
  },
  {
    label: "Products",
    items: [
      {
        label: "Cross Border",
        icon: Globe,
        href: ROUTES.crossBorder.root,
        matcher: (p) => p.startsWith(ROUTES.crossBorder.root),
      },
    ],
  },
  sharedSupportSection,
]

const fintechApisNavSections: NavSection[] = [
  {
    items: [
      {
        label: "Overview",
        icon: Braces,
        href: ROUTES.products.fintechApisComingSoon,
        matcher: (p) => p.startsWith(ROUTES.products.fintechApisComingSoon),
        comingSoon: true,
      },
      {
        label: "API keys",
        icon: KeyRound,
        href: ROUTES.products.fintechApisComingSoon,
        matcher: (p) => p.startsWith(ROUTES.products.fintechApisComingSoon),
        comingSoon: true,
      },
      {
        label: "Webhooks",
        icon: Webhook,
        href: ROUTES.products.fintechApisComingSoon,
        matcher: (p) => p.startsWith(ROUTES.products.fintechApisComingSoon),
        comingSoon: true,
      },
      {
        label: "SDKs",
        icon: Activity,
        href: ROUTES.products.fintechApisComingSoon,
        matcher: (p) => p.startsWith(ROUTES.products.fintechApisComingSoon),
        comingSoon: true,
      },
      {
        label: "API logs",
        icon: FileChartColumn,
        href: ROUTES.products.fintechApisComingSoon,
        matcher: (p) => p.startsWith(ROUTES.products.fintechApisComingSoon),
        comingSoon: true,
      },
    ],
  },
  {
    label: "Developer",
    items: [
      {
        label: "Fintech APIs",
        icon: Globe,
        href: ROUTES.products.fintechApisComingSoon,
        matcher: (p) => p.startsWith(ROUTES.products.fintechApisComingSoon),
      },
    ],
  },
  sharedSupportSection,
]

const bottomNavItemsV3: BottomNavItem[] = [
  {
    label: "Overview",
    icon: Home,
    href: ROUTES.home,
    matcher: (pathname) => pathname === ROUTES.home,
  },
  {
    label: "Txn",
    icon: ArrowLeftRight,
    href: ROUTES.transactions.root,
    matcher: (pathname) => pathname.startsWith(ROUTES.transactions.root),
  },
  {
    label: "Settle",
    icon: BadgeIndianRupee,
    href: ROUTES.settlements.root,
    matcher: (pathname) => pathname.startsWith(ROUTES.settlements.root),
  },
  {
    label: "Reports",
    icon: FileChartColumn,
    href: ROUTES.reports.root,
    matcher: (pathname) => pathname.startsWith(ROUTES.reports.root),
  },
]

export function inferSidebarProductFromPathname(pathname: string): SidebarProduct {
  if (pathname.startsWith(ROUTES.crossBorder.root)) return "cross-border"
  if (pathname.startsWith(ROUTES.products.giftCardsComingSoon)) return "cards"
  if (pathname.startsWith(ROUTES.products.fintechApisComingSoon)) return "fintech-apis"
  return "payments"
}

export function getSidebarSections(product: SidebarProduct = "payments"): NavSection[] {
  if (product === "cross-border") return crossBorderNavSections
  if (product === "cards") return cardsNavSections
  if (product === "fintech-apis") return fintechApisNavSections
  return paymentsNavSections
}

export function getBottomNavItems(): BottomNavItem[] {
  return bottomNavItemsV3
}
