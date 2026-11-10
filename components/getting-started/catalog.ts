import type { Icon } from "@phosphor-icons/react"
import {
  ArrowCounterClockwiseIcon,
  CodeIcon,
  CreditCardIcon,
  FileTextIcon,
  GavelIcon,
  LinkIcon,
  StorefrontIcon,
  WalletIcon,
} from "@phosphor-icons/react"
import type { JourneyStage, ProductId } from "@/lib/getting-started"
import { ONLINE_MACROS, ONLINE_STEPS } from "../../lib/online-onboarding-data.js"

export type DeviceId = "touch-a910" | "mini-m50" | "qr-soundbox"

export type Device = {
  id: DeviceId
  name: string
  kind: string
  tag: string
  features: string
  lifetime: number
  rentalMonthly: number
  rentalSetup: number
  sizingHint: string
}

export const DEVICES: Device[] = [
  {
    id: "touch-a910",
    name: "Touch A910",
    kind: "Android POS",
    tag: "Busy counters",
    features: "Cards, UPI and tap • Built-in receipt printer • 4G and Wi-Fi",
    lifetime: 9999,
    rentalMonthly: 499,
    rentalSetup: 999,
    sizingHint: "One terminal per billing counter is usually enough.",
  },
  {
    id: "mini-m50",
    name: "Mini M50",
    kind: "Pocket POS",
    tag: "On the move",
    features: "Cards, UPI and tap • Fits in a pocket • Pairs with your phone for receipts",
    lifetime: 5999,
    rentalMonthly: 299,
    rentalSetup: 499,
    sizingHint: "Good for home delivery, events and tableside payments.",
  },
  {
    id: "qr-soundbox",
    name: "QR Soundbox",
    kind: "UPI QR with voice alerts",
    tag: "Small shops",
    features: "Static UPI QR • Speaks out every payment • Runs a week on one charge",
    lifetime: 1499,
    rentalMonthly: 99,
    rentalSetup: 0,
    sizingHint: "Keep one next to each counter where customers pay by UPI.",
  },
]

export function getDevice(id: string) {
  return DEVICES.find((device) => device.id === id) ?? DEVICES[0]
}

export const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })

export type ProductMeta = {
  id: ProductId
  name: string
  shortName: string
  icon: Icon
  href: string
  tagline: string
  description: string
  bestFor: string
  pricing: string
  time: string
  howItWorks: Array<{ title: string; body: string }>
  youWillNeed: string[]
  whereToFind: Array<{ label: string; body: string }>
  setupSteps: string[]
  /** What payments mean for this product, used when Payments/Settlement unlock. */
  paymentsCopy: string
}

export const PRODUCTS: Record<ProductId, ProductMeta> = {
  "in-store": {
    id: "in-store",
    name: "In-store payments",
    shortName: "In-store",
    icon: StorefrontIcon,
    href: "/offline-payments/manage-devices",
    tagline: "Take card, UPI and tap payments at your counter.",
    description:
      "Pine Labs terminals take every way your customers pay in person: cards, UPI, tap-to-pay and EMI. Pick the devices you need, pay for them here, and we ship them to your store ready to set up.",
    bestFor: "Shops, restaurants and service counters",
    pricing: "From ₹99/month, or buy outright",
    time: "About 5 minutes, then 3 to 5 days delivery",
    howItWorks: [
      { title: "Choose your terminals", body: "Pick devices and a plan: buy once, or rent monthly." },
      { title: "Pay and we ship", body: "Pay for the order here. Track it on your Overview until it arrives." },
      { title: "Set up and go live", body: "Follow the setup guide, run a test payment, and you're ready." },
    ],
    youWillNeed: ["Business PAN", "A bank account for your money", "A delivery address for the terminals"],
    whereToFind: [
      { label: "In-store", body: "Your terminals, their status and orders for more devices." },
      { label: "Overview", body: "Order tracking until your terminals arrive." },
      { label: "Payments and Settlement", body: "Added to the menu once your first terminal is live." },
    ],
    setupSteps: ["Choose terminals", "Delivery address", "Business details", "Bank account", "Review order"],
    paymentsCopy: "card, UPI and tap payments taken on your terminals",
  },
  "payment-links": {
    id: "payment-links",
    name: "Payment links",
    shortName: "Payment links",
    icon: LinkIcon,
    href: "/payment-links",
    tagline: "Get paid by sharing a link on WhatsApp, SMS or email.",
    description:
      "Create a link for any amount and share it with your customer. They pay by UPI, card or netbanking from their phone — no website or hardware needed.",
    bestFor: "Orders over chat or phone, invoices and advance bookings",
    pricing: "2% per successful payment, no setup fee",
    time: "Business verification, then KYC",
    howItWorks: [
      { title: "Tell us about your business", body: "Verify PAN and GST, add website or app details if available, and upload business documents." },
      { title: "Complete verification and KYC", body: "Add your settlement account, declare beneficial owners and verify your authorised signatory." },
      { title: "Review and sign", body: "Review your details and accept the agreement. Then create and manage links in Payment links." },
    ],
    youWillNeed: ["Business PAN and linked mobile number", "GSTIN and business documents", "Settlement account or cancelled cheque", "Authorised signatory available for KYC"],
    whereToFind: [
      { label: "Payment links", body: "Every link you've created, who's paid and who hasn't." },
      { label: "Payments and Settlement", body: "Added to the menu once your first link is live." },
    ],
    setupSteps: ONLINE_STEPS.map((step) => step.label),
    paymentsCopy: "payments made through the links you share",
  },
  checkout: {
    id: "checkout",
    name: "Checkout",
    shortName: "Checkout",
    icon: CodeIcon,
    href: "/checkout",
    tagline: "Accept payments on your website or app.",
    description:
      "A ready-made payment page for your website or app. Plug it into Shopify or WooCommerce in a few clicks, or use our API, and customers pay with UPI, cards, EMI, wallets or netbanking.",
    bestFor: "Online stores, apps and subscriptions",
    pricing: "From 1.9% per successful payment",
    time: "Business verification, then KYC",
    howItWorks: [
      { title: "Tell us about your business", body: "Verify PAN and GST, add website or app details if available, and upload business documents." },
      { title: "Complete verification and KYC", body: "Add your settlement account, declare beneficial owners and verify your authorised signatory." },
      { title: "Review and sign", body: "Review your details and accept the agreement. Then find integration settings and API keys in Checkout." },
    ],
    youWillNeed: ["Business PAN and linked mobile number", "GSTIN and business documents", "Settlement account or cancelled cheque", "Authorised signatory available for KYC"],
    whereToFind: [
      { label: "Checkout", body: "Your payment page look, API keys and integration status." },
      { label: "Payments and Settlement", body: "Added to the menu once your checkout is live." },
    ],
    setupSteps: ONLINE_STEPS.map((step) => step.label),
    paymentsCopy: "payments made on your website or app",
  },
}

/** Setup leaves the platform shell; education and live products stay in their home. */
export function productJourneyHref(product: ProductId, stage: JourneyStage, step = 0) {
  return stage === "intro" || stage === "live" || (product === "in-store" && stage === "setup" && step === 0)
    ? PRODUCTS[product].href
    : `/onboarding/products/${product}`
}

/** Device choice precedes the In-store onboarding; retain saved step indices. */
export function productSetupProgress(product: ProductId, step: number) {
  return product === "in-store"
    ? { steps: PRODUCTS[product].setupSteps.slice(1), index: Math.max(0, step - 1) }
    : { steps: ONLINE_MACROS, index: ONLINE_STEPS[Math.min(step, ONLINE_STEPS.length - 1)].macro }
}

/** Sections that appear in the menu once a product is live, in menu order. */
export const UNLOCKED_SECTIONS: Array<{ id: string; label: string; href: string; icon: Icon; body: string }> = [
  { id: "payments", label: "Payments", href: "/transactions", icon: CreditCardIcon, body: "Every payment you receive, with its status and customer details." },
  { id: "settlements", label: "Settlement", href: "/settlements", icon: WalletIcon, body: "When the money from those payments reaches your bank — usually the next working day." },
  { id: "refunds", label: "Refunds", href: "/refunds", icon: ArrowCounterClockwiseIcon, body: "Send money back to a customer, in full or in part." },
  { id: "disputes", label: "Disputes", href: "/disputes", icon: GavelIcon, body: "Chargebacks raised by a customer's bank, and what you need to respond." },
  { id: "reports", label: "Reports", href: "/reports", icon: FileTextIcon, body: "Download payment and settlement statements for your accounts." },
]
