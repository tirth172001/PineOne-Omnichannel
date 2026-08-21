"use client"

import {
  ArrowCounterClockwiseIcon,
  ArrowsLeftRightIcon,
  CurrencyInrIcon,
  FileTextIcon,
  MonitorIcon,
  ShieldWarningIcon,
  SlidersIcon,
  SparkleIcon,
  SquaresFourIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

export type ProductWorkspaceSection =
  | "overview"
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
  { key: "overview", label: "Overview", icon: SquaresFourIcon },
  { key: "transactions", label: "Transactions", icon: ArrowsLeftRightIcon },
  { key: "settlements", label: "Settlements", icon: CurrencyInrIcon },
  { key: "disputes", label: "Disputes", icon: ShieldWarningIcon },
  { key: "refunds", label: "Refunds", icon: ArrowCounterClockwiseIcon },
  { key: "reports", label: "Reports", icon: FileTextIcon },
]

const configurationSectionItem: {
  key: ProductWorkspaceSection
  label: string
  icon: React.ComponentType<{ className?: string }>
} = { key: "configurations", label: "Configurations", icon: SlidersIcon }

const manageDevicesSectionItem: {
  key: ProductWorkspaceSection
  label: string
  icon: React.ComponentType<{ className?: string }>
} = { key: "manage-devices", label: "Manage Devices", icon: MonitorIcon }

const tailSectionItems: Array<{
  key: ProductWorkspaceSection
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { key: "vas", label: "Value Added Services", icon: SparkleIcon },
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
