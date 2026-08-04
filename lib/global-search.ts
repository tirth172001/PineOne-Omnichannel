import { configuredProductNames } from "@/lib/products-data"
import { ROUTES } from "@/lib/navigation/routes"

export type GlobalSearchItem = {
  id: string
  title: string
  description: string
  href: string
  keywords: string[]
  kind: "page" | "action" | "config"
  priority: number
}

const BASE_SEARCH_ITEMS: GlobalSearchItem[] = [
  {
    id: "home",
    title: "Overview Dashboard",
    description: "Business health and key metrics",
    href: ROUTES.home,
    keywords: ["overview", "home", "dashboard", "summary", "kpi"],
    kind: "page",
    priority: 10,
  },
  {
    id: "online",
    title: "Checkout",
    description: "Transactions, disputes, refunds, and reports",
    href: ROUTES.onlinePayments.root,
    keywords: ["checkout", "online", "gateway", "transaction", "refund", "report"],
    kind: "page",
    priority: 9,
  },
  {
    id: "checkout-configuration",
    title: "Checkout Configuration",
    description: "Whitelabel checkout setup and value-added services",
    href: ROUTES.onlinePayments.configuration,
    keywords: ["checkout", "configuration", "white label", "smart routing", "vas"],
    kind: "config",
    priority: 10,
  },
  {
    id: "offline",
    title: "POS Terminal",
    description: "POS and in-store transaction performance",
    href: ROUTES.offlinePayments.root,
    keywords: ["pos", "terminal", "offline", "store", "devices"],
    kind: "page",
    priority: 9,
  },
  {
    id: "manage-devices",
    title: "Manage Devices",
    description: "Device health, connectivity, and terminal operations",
    href: ROUTES.offlinePayments.manageDevices,
    keywords: ["manage devices", "pos", "terminal", "device", "offline"],
    kind: "page",
    priority: 9,
  },
  {
    id: "payment-links",
    title: "Payment Links",
    description: "Create and track pay-by-link journeys",
    href: ROUTES.paymentLinks.root,
    keywords: ["link", "collect", "invoice", "share"],
    kind: "page",
    priority: 9,
  },
  {
    id: "cross-border",
    title: "Cross Border",
    description: "PACB operations, uploads, and document workflows",
    href: ROUTES.crossBorder.root,
    keywords: ["cross border", "pacb", "invoice", "awb", "customs", "uploads"],
    kind: "page",
    priority: 10,
  },
  {
    id: "cross-border-uploads",
    title: "Cross Border Uploads",
    description: "Invoice and AWB bulk upload center",
    href: ROUTES.crossBorder.uploads,
    keywords: ["cross border uploads", "invoice upload", "awb upload", "bulk operations"],
    kind: "action",
    priority: 10,
  },
  {
    id: "merchant-settings",
    title: "Merchant Settings",
    description: "Credentials, webhooks, checkout styling, and paymodes",
    href: ROUTES.settings.root,
    keywords: ["settings", "credentials", "webhooks", "checkout styling", "paymodes"],
    kind: "config",
    priority: 10,
  },
  {
    id: "account-profile",
    title: "Profile",
    description: "Personal details about the signed-in user",
    href: ROUTES.account.profile,
    keywords: ["profile", "personal", "account", "user"],
    kind: "config",
    priority: 8,
  },
  {
    id: "account-business",
    title: "Business details",
    description: "Business profile, documents, and bank accounts",
    href: ROUTES.account.businessDetails,
    keywords: ["business", "details", "documents", "bank", "kyc"],
    kind: "config",
    priority: 8,
  },
  {
    id: "account-users",
    title: "Users management",
    description: "Team members, roles, and invitations",
    href: ROUTES.account.users,
    keywords: ["users", "team", "roles", "invite", "admin"],
    kind: "config",
    priority: 8,
  },
  {
    id: "account-preferences",
    title: "Preferences",
    description: "Language, notifications, and working defaults",
    href: ROUTES.account.preferences,
    keywords: ["preferences", "language", "notifications", "defaults"],
    kind: "config",
    priority: 8,
  },
  {
    id: "account-security",
    title: "Security",
    description: "Password, sessions, and authentication controls",
    href: ROUTES.account.security,
    keywords: ["security", "password", "sessions", "2fa"],
    kind: "config",
    priority: 8,
  },
  {
    id: "account-feedback",
    title: "Feedback",
    description: "Share platform feedback with the product team",
    href: ROUTES.account.feedback,
    keywords: ["feedback", "share", "product", "request"],
    kind: "config",
    priority: 7,
  },
  {
    id: "products-online-payments",
    title: "Products · Online payment",
    description: "Configure checkout and payment-link products",
    href: ROUTES.products.onlinePayments,
    keywords: ["products", "online payment", "checkout", "payment links", "configure"],
    kind: "config",
    priority: 9,
  },
  {
    id: "products-in-store",
    title: "Products · In-store payment",
    description: "POS device configuration and setup",
    href: ROUTES.products.inStorePayments,
    keywords: ["products", "in-store", "pos", "a891", "mini", "go", "duo", "voice pod"],
    kind: "config",
    priority: 9,
  },
  {
    id: "products-upi-qr-sticker",
    title: "UPI QR Sticker Configuration",
    description: "Store-linked QR design, print controls, and UPI transaction routing.",
    href: ROUTES.products.inStoreQrSticker,
    keywords: ["upi qr", "qr sticker", "qr configuration", "store qr", "print qr", "upi id"],
    kind: "config",
    priority: 9,
  },
  {
    id: "products-other",
    title: "Products · Other products",
    description: "Third-party and additional products",
    href: ROUTES.products.otherProducts,
    keywords: ["products", "other", "third party", "offers", "lending"],
    kind: "page",
    priority: 8,
  },
  {
    id: "support",
    title: "Support Center",
    description: "Tickets, help articles, and escalations",
    href: ROUTES.support.root,
    keywords: ["support", "ticket", "help", "issue"],
    kind: "page",
    priority: 8,
  },
]

function getRouteLabel(pathname: string) {
  if (pathname === ROUTES.home) return "Overview"
  if (pathname.startsWith(ROUTES.onlinePayments.root)) return "Checkout"
  if (pathname.startsWith(ROUTES.offlinePayments.root)) return "POS Terminal"
  if (pathname.startsWith(ROUTES.paymentLinks.root)) return "Payment Links"
  if (pathname.startsWith(ROUTES.crossBorder.root)) return "Cross Border"
  if (pathname.startsWith(ROUTES.products.root)) return "Products"
  if (pathname.startsWith(ROUTES.support.root)) return "Support"
  if (pathname.startsWith(ROUTES.settings.root)) return "Settings"
  if (pathname.startsWith("/account")) return "Account"
  return "Workspace"
}

function getPrimaryAction(pathname: string) {
  if (pathname.startsWith(ROUTES.paymentLinks.root)) {
    return { label: "Create Link", href: ROUTES.paymentLinks.all }
  }
  if (pathname.startsWith(ROUTES.support.root)) {
    return { label: "New Ticket", href: ROUTES.support.root }
  }
  if (pathname.startsWith("/account")) {
    return { label: "Open profile", href: ROUTES.account.profile }
  }
  if (pathname.startsWith(ROUTES.products.root)) {
    return { label: "Open Products", href: ROUTES.products.root }
  }
  if (pathname.startsWith(ROUTES.crossBorder.root)) {
    return { label: "Open Uploads", href: ROUTES.crossBorder.uploads }
  }
  if (pathname.startsWith(ROUTES.settings.root)) {
    return { label: "Open credentials", href: `${ROUTES.settings.root}?module=credentials` }
  }
  if (pathname.startsWith(ROUTES.onlinePayments.root)) {
    return { label: "View Reports", href: ROUTES.onlinePayments.reports }
  }
  if (pathname.startsWith(ROUTES.offlinePayments.root)) {
    return { label: "View Reports", href: ROUTES.offlinePayments.reports }
  }
  return { label: "Open Products", href: ROUTES.products.root }
}

function getSearchScore(item: GlobalSearchItem, query: string, pathname: string, role: string) {
  let score = item.priority
  const q = query.toLowerCase().trim()
  const haystack = `${item.title} ${item.description} ${item.keywords.join(" ")}`.toLowerCase()

  if (item.href === pathname) score += 50
  if (pathname.startsWith(item.href) && item.href !== "/") score += 20
  if (role.toLowerCase() === "admin" && item.kind === "config") score += 6

  if (!q) return score
  if (item.title.toLowerCase().startsWith(q)) score += 40
  if (item.title.toLowerCase().includes(q)) score += 25
  if (item.keywords.some((keyword) => keyword.startsWith(q))) score += 20
  if (haystack.includes(q)) score += 12
  if (item.description.toLowerCase().includes(q)) score += 8
  return score
}

export function getConfiguredProductNames() {
  return [...configuredProductNames]
}

export function getGlobalSearchItems({
  pathname,
  query,
  profileRole,
  configuredProducts = getConfiguredProductNames(),
  limit = 24,
}: {
  pathname: string
  query: string
  profileRole: string
  configuredProducts?: string[]
  limit?: number
}) {
  const routeLabel = getRouteLabel(pathname)
  const primaryAction = getPrimaryAction(pathname)

  const configItems: GlobalSearchItem[] = configuredProducts.map((name) => ({
    id: `configured-${name}`,
    title: `${name} configuration`,
    description: `Shortcuts and setup guidance for ${name}`,
    href: ROUTES.products.root,
    keywords: [name.toLowerCase(), "configuration", "product", "setup"],
    kind: "config",
    priority: 11,
  }))

  const actionItem: GlobalSearchItem = {
    id: "primary-action",
    title: primaryAction.label,
    description: `Main action for ${routeLabel}`,
    href: primaryAction.href,
    keywords: [routeLabel.toLowerCase(), "shortcut", "action", primaryAction.label.toLowerCase()],
    kind: "action",
    priority: 12,
  }

  const merged = [...BASE_SEARCH_ITEMS, ...configItems, actionItem]
  const deduped = new Map(merged.map((item) => [item.id, item]))
  const normalizedQuery = query.toLowerCase().trim()

  return Array.from(deduped.values())
    .map((item) => ({
      item,
      score: getSearchScore(item, normalizedQuery, pathname, profileRole),
    }))
    .filter(({ item }) => {
      if (!normalizedQuery) return true
      const haystack = `${item.title} ${item.description} ${item.keywords.join(" ")}`.toLowerCase()
      return haystack.includes(normalizedQuery)
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item)
}
