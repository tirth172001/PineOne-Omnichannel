import {
  CreditCard,
  QrCode,
  Repeat,
  Percent,
  Calculator,
  Banknote,
  Send,
  Receipt,
  Gift,
  Users,
  Tag,
  Landmark,
  TrendingUp,
  Smartphone,
  Monitor,
  Cpu,
  Zap,
  Shield,
  Wifi,
  ShieldCheck,
  Truck,
  FileText,
  GraduationCap,
  HeartPulse,
  Building,
  Fuel,
  Cloud,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface Product {
  id: string
  name: string
  description: string
  icon: LucideIcon
  status: "enabled" | "available" | "coming-soon"
  whyUseful?: string
  href: string
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

export interface ProductCategory {
  id: string
  name: string
  description: string
  products: Product[]
}

export const productCategories: ProductCategory[] = [
  {
    id: "payments",
    name: "Payments",
    description: "Accept payments across multiple channels",
    products: [
      {
        id: "card-payments",
        name: "Card Payments",
        description: "Accept Visa, Mastercard, RuPay, and more",
        icon: CreditCard,
        status: "enabled",
        href: "/products/card-payments",
      },
      {
        id: "pine-labs-upi",
        name: "Pine Labs UPI",
        description: "Smart UPI with intelligent routing and higher success rates",
        icon: QrCode,
        status: "available",
        whyUseful: "5% higher success rate during peak hours",
        href: "/products/pine-labs-upi",
      },
      {
        id: "subscriptions",
        name: "Subscriptions",
        description: "Recurring payments with automatic billing",
        icon: Repeat,
        status: "available",
        whyUseful: "Great for memberships and regular services",
        href: "/products/subscriptions",
      },
    ],
  },
  {
    id: "affordability",
    name: "Affordability & Conversion",
    description: "Help customers afford more and increase sales",
    products: [
      {
        id: "emi",
        name: "EMI",
        description: "Enable installment payments on cards",
        icon: Calculator,
        status: "available",
        whyUseful: "Increase average order value by up to 40%",
        href: "/products/emi",
      },
      {
        id: "pay-later",
        name: "Pay Later",
        description: "Buy now, pay later options for customers",
        icon: Percent,
        status: "available",
        whyUseful: "Boost conversion with flexible payment options",
        href: "/products/pay-later",
      },
      {
        id: "credit-line-upi",
        name: "Credit Line on UPI",
        description: "Pre-approved credit limits for UPI transactions",
        icon: Banknote,
        status: "coming-soon",
        href: "/products/credit-line-upi",
      },
    ],
  },
  {
    id: "payouts",
    name: "Payouts & Collections",
    description: "Send money and collect payments efficiently",
    products: [
      {
        id: "payouts",
        name: "Payouts",
        description: "Send money to vendors, partners, or customers",
        icon: Send,
        status: "available",
        href: "/products/payouts",
      },
      {
        id: "invoicing",
        name: "Invoicing",
        description: "Create and send digital invoices with payment links",
        icon: Receipt,
        status: "available",
        href: "/products/invoicing",
      },
    ],
  },
  {
    id: "engagement",
    name: "Prepaid & Engagement",
    description: "Reward and retain your customers",
    products: [
      {
        id: "gift-cards",
        name: "Gift Cards",
        description: "Branded gift cards for your business",
        icon: Gift,
        status: "available",
        href: "/products/gift-cards",
      },
      {
        id: "loyalty",
        name: "Loyalty Programs",
        description: "Points, rewards, and membership programs",
        icon: Users,
        status: "available",
        whyUseful: "Increase repeat purchases by 25%",
        href: "/products/loyalty",
      },
      {
        id: "offers",
        name: "Offers & Promotions",
        description: "Bank and brand offers at checkout",
        icon: Tag,
        status: "available",
        href: "/products/offers",
      },
    ],
  },
  {
    id: "lending",
    name: "Lending & Credit",
    description: "Access capital to grow your business",
    products: [
      {
        id: "merchant-lending",
        name: "Merchant Lending",
        description: "Quick loans based on your transaction history",
        icon: Landmark,
        status: "available",
        whyUseful: "Pre-approved up to ₹5L based on your history",
        href: "/products/merchant-lending",
      },
      {
        id: "working-capital",
        name: "Working Capital",
        description: "Short-term credit for inventory and operations",
        icon: TrendingUp,
        status: "available",
        href: "/products/working-capital",
      },
    ],
  },
  {
    id: "devices",
    name: "Devices",
    description: "Hardware for accepting in-person payments",
    products: [
      {
        id: "android-pos",
        name: "Android POS",
        description: "Smart terminal with app ecosystem",
        icon: Smartphone,
        status: "enabled",
        href: "/products/android-pos",
      },
      {
        id: "countertop-terminal",
        name: "Countertop Terminal",
        description: "Traditional POS terminal for high volume",
        icon: Monitor,
        status: "available",
        href: "/products/countertop-terminal",
      },
    ],
  },
  {
    id: "platform",
    name: "Platform & Infrastructure",
    description: "Advanced tools for developers and large merchants",
    products: [
      {
        id: "apis",
        name: "APIs & SDKs",
        description: "Integrate Pine Labs into your systems",
        icon: Cpu,
        status: "available",
        href: "/products/apis",
      },
      {
        id: "webhooks",
        name: "Webhooks",
        description: "Real-time event notifications",
        icon: Zap,
        status: "available",
        href: "/products/webhooks",
      },
      {
        id: "fraud-protection",
        name: "Fraud Protection",
        description: "AI-powered fraud detection and prevention",
        icon: Shield,
        status: "available",
        href: "/products/fraud-protection",
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
    icon: Building,
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
