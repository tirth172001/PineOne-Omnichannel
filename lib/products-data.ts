import {
  AudioLines,
  Cloud,
  CreditCard,
  FileText,
  Fuel,
  Gift,
  GraduationCap,
  HandCoins,
  HeartPulse,
  LayoutGrid,
  MonitorSmartphone,
  Route,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Wifi,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface Product {
  id: string
  name: string
  description: string
  icon: LucideIcon
  status: "enabled" | "available" | "coming-soon"
  href: string
  whyUseful?: string
}

export interface ProductCategory {
  id: string
  name: string
  description: string
  products: Product[]
}

export interface PartnerProduct {
  id: string
  name: string
  description: string
  icon: LucideIcon
  partnerName: string
  partnerLogo?: string
  discount: string
  benefits: string[]
  href: string
  category: string
}

export const configuredProductNames = ["Checkout", "POS terminal", "Payment links"] as const

export const productCategories: ProductCategory[] = [
  {
    id: "core-products",
    name: "Core products",
    description: "Primary payment surfaces available in the V3 workspace",
    products: [
      {
        id: "online-payments",
        name: "Online payment",
        description: "Checkout, smart routing, and payment-link product surfaces.",
        icon: CreditCard,
        status: "enabled",
        href: "/products/online-payments",
      },
      {
        id: "in-store-payments",
        name: "In-store payment",
        description: "Device portfolio, store operations, and in-person acceptance.",
        icon: Store,
        status: "enabled",
        href: "/products/in-store-payments",
      },
      {
        id: "gift-cards",
        name: "Gift cards",
        description: "Gift-card issuing and redemption workflows for merchants.",
        icon: Gift,
        status: "coming-soon",
        href: "/products/gift-cards-coming-soon",
      },
    ],
  },
  {
    id: "extensions",
    name: "Extensions",
    description: "Additional product surfaces and bundled merchant add-ons",
    products: [
      {
        id: "other-products",
        name: "Other products",
        description: "3rd-party products, partner offers, and adjacent merchant tools.",
        icon: LayoutGrid,
        status: "available",
        href: "/products/other-products",
      },
      {
        id: "offer-engine",
        name: "Offer engine",
        description: "Rule-driven offer orchestration across payment and merchant journeys.",
        icon: Sparkles,
        status: "coming-soon",
        href: "/products/offer-engine-coming-soon",
      },
      {
        id: "growthx",
        name: "GrowthX",
        description: "Growth-focused cross-sell and merchant acceleration programs.",
        icon: Route,
        status: "coming-soon",
        href: "/products/growthx-coming-soon",
      },
    ],
  },
]

export const partnerProducts: PartnerProduct[] = [
  {
    id: "jio-wifi",
    name: "Jio Business WiFi",
    description: "High-speed enterprise WiFi for your business premises with dedicated bandwidth",
    icon: Wifi,
    partnerName: "Jio",
    discount: "Up to 30% off",
    benefits: [
      "Dedicated business bandwidth",
      "Free installation worth ₹2,999",
      "24/7 priority support",
      "Static IP included",
    ],
    href: "/partners/jio-wifi",
    category: "Connectivity",
  },
  {
    id: "icici-lombard-insurance",
    name: "Business Insurance",
    description: "Comprehensive business insurance covering fire, theft, and natural disasters",
    icon: ShieldCheck,
    partnerName: "ICICI Lombard",
    discount: "15% lower premium",
    benefits: [
      "Shop & office coverage",
      "Stock & inventory protection",
      "Business interruption cover",
      "Quick claim settlement",
    ],
    href: "/partners/business-insurance",
    category: "Insurance",
  },
  {
    id: "delhivery-shipping",
    name: "Business Shipping",
    description: "Discounted shipping rates for e-commerce and retail businesses",
    icon: Truck,
    partnerName: "Delhivery",
    discount: "20% off shipping",
    benefits: [
      "Pan-India coverage",
      "Same-day pickup",
      "Real-time tracking",
      "COD remittance in 2 days",
    ],
    href: "/partners/delhivery-shipping",
    category: "Logistics",
  },
  {
    id: "zoho-accounting",
    name: "Accounting Software",
    description: "Cloud-based GST-compliant accounting and invoicing software",
    icon: FileText,
    partnerName: "Zoho Books",
    discount: "40% off annual plan",
    benefits: [
      "Auto GST calculation",
      "Bank reconciliation",
      "Inventory management",
      "Pine Labs integration",
    ],
    href: "/partners/zoho-accounting",
    category: "Software",
  },
  {
    id: "upgrad-courses",
    name: "Business Courses",
    description: "Upskill with certified courses in digital marketing, finance, and management",
    icon: GraduationCap,
    partnerName: "upGrad",
    discount: "25% scholarship",
    benefits: [
      "Industry-recognized certificates",
      "Flexible learning",
      "1:1 mentorship",
      "Career assistance",
    ],
    href: "/partners/upgrad-courses",
    category: "Learning",
  },
  {
    id: "hdfc-ergo-health",
    name: "Group Health Insurance",
    description: "Affordable health insurance for you and your employees",
    icon: HeartPulse,
    partnerName: "HDFC ERGO",
    discount: "10% group discount",
    benefits: [
      "Cashless hospitalization",
      "Pre-existing disease cover",
      "Family floater option",
      "Annual health checkup",
    ],
    href: "/partners/group-health",
    category: "Insurance",
  },
  {
    id: "awfis-coworking",
    name: "Co-working Space",
    description: "Flexible office spaces and meeting rooms across major cities",
    icon: MonitorSmartphone,
    partnerName: "Awfis",
    discount: "First month free",
    benefits: [
      "50+ locations pan-India",
      "High-speed internet",
      "Meeting room credits",
      "Business address service",
    ],
    href: "/partners/awfis-coworking",
    category: "Workspace",
  },
  {
    id: "indian-oil-fuel",
    name: "Fleet Fuel Card",
    description: "Fuel cards with discounts and expense tracking for business vehicles",
    icon: Fuel,
    partnerName: "Indian Oil",
    discount: "₹2.50/litre savings",
    benefits: [
      "Accepted at 30,000+ pumps",
      "Monthly expense reports",
      "Driver-wise tracking",
      "No transaction fees",
    ],
    href: "/partners/fuel-card",
    category: "Fleet",
  },
  {
    id: "aws-cloud",
    name: "Cloud Credits",
    description: "AWS cloud credits for startups and growing businesses",
    icon: Cloud,
    partnerName: "Amazon Web Services",
    discount: "Up to $5,000 credits",
    benefits: [
      "Free tier services",
      "Technical support",
      "Training resources",
      "Startup program access",
    ],
    href: "/partners/aws-cloud",
    category: "Technology",
  },
]
