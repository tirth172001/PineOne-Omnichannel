"use client"

import {
  ArrowLeftRight,
  BadgeIndianRupee,
  FileChartColumn,
  MonitorCog,
  RotateCcw,
  Settings2,
  ShieldAlert,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export type ProductWorkspaceSection =
  | "transactions"
  | "settlements"
  | "disputes"
  | "refunds"
  | "reports"
  | "manage-devices"
  | "configurations"
  | "vas"

const baseSectionItems: Array<{
  key: ProductWorkspaceSection
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { key: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { key: "settlements", label: "Settlements", icon: BadgeIndianRupee },
  { key: "disputes", label: "Disputes", icon: ShieldAlert },
  { key: "refunds", label: "Refunds", icon: RotateCcw },
  { key: "reports", label: "Reports", icon: FileChartColumn },
]

const configurationSectionItem: {
  key: ProductWorkspaceSection
  label: string
  icon: React.ComponentType<{ className?: string }>
} = { key: "configurations", label: "Configurations", icon: Settings2 }

const manageDevicesSectionItem: {
  key: ProductWorkspaceSection
  label: string
  icon: React.ComponentType<{ className?: string }>
} = { key: "manage-devices", label: "Manage Devices", icon: MonitorCog }

const tailSectionItems: Array<{
  key: ProductWorkspaceSection
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { key: "vas", label: "Value Added Services", icon: Sparkles },
]

interface ProductWorkspaceNavProps {
  title: string
  value: ProductWorkspaceSection
  onChange: (value: ProductWorkspaceSection) => void
  showConfigurations?: boolean
  showManageDevices?: boolean
  configurationsLabel?: string
}

export function ProductWorkspaceNav({
  title,
  value,
  onChange,
  showConfigurations = false,
  showManageDevices = false,
  configurationsLabel = "Configurations",
}: ProductWorkspaceNavProps) {
  const configurationItem = { ...configurationSectionItem, label: configurationsLabel }
  const sectionItems = [
    ...baseSectionItems,
    ...(showManageDevices ? [manageDevicesSectionItem] : []),
    ...(showConfigurations ? [configurationItem] : []),
    ...tailSectionItems,
  ]

  return (
    <div className="left-panel-content">
      <p className="left-panel-label">{title}</p>
      <div className="left-panel-stack">
        {sectionItems.map((item) => {
          const active = value === item.key
          const Icon = item.icon
          return (
            <Button
              variant="ghost"
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`left-panel-item !justify-start gap-2 ${active ? "left-panel-item-active" : "left-panel-item-inactive"}`}
            >
              <Icon className="size-3.5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
