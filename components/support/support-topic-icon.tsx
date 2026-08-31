import type { ComponentType } from "react"
import {
  ChartBarIcon,
  CreditCardIcon,
  GraduationCapIcon,
  MonitorIcon,
  QrCodeIcon,
  ReceiptIcon,
  StorefrontIcon,
  UserCircleIcon,
} from "@phosphor-icons/react"
import type { SupportTopicSlug } from "@/lib/support-knowledge"

const TOPIC_ICON: Record<SupportTopicSlug, ComponentType<{ className?: string }>> = {
  "device-hardware": MonitorIcon,
  payments: CreditCardIcon,
  upi: QrCodeIcon,
  settlements: ReceiptIcon,
  reports: ChartBarIcon,
  "account-access": UserCircleIcon,
  training: GraduationCapIcon,
  "pine-checkout": StorefrontIcon,
}

export function SupportTopicIcon({ topicSlug, className }: { topicSlug: SupportTopicSlug; className?: string }) {
  const Icon = TOPIC_ICON[topicSlug]
  return <Icon className={className} />
}
