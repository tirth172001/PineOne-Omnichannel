import type { Icon } from "@phosphor-icons/react"
import { BriefcaseIcon, CoffeeIcon, StorefrontIcon, WrenchIcon } from "@phosphor-icons/react"

export type CategoryOption = { id: string; label: string }
export type CategoryGroup = { id: string; label: string; icon: Icon; options: CategoryOption[] }

export const categoryGroups: CategoryGroup[] = [
  {
    id: "food",
    label: "Food & beverage",
    icon: CoffeeIcon,
    options: [
      { id: "cafe", label: "Cafe / coffee shop" },
      { id: "restaurant", label: "Restaurant" },
      { id: "food-truck", label: "Food truck / mobile catering" },
      { id: "bakery", label: "Bakery" },
    ],
  },
  {
    id: "retail",
    label: "Retail",
    icon: StorefrontIcon,
    options: [
      { id: "grocery", label: "Grocery store" },
      { id: "apparel", label: "Clothing & apparel" },
      { id: "electronics", label: "Electronics store" },
      { id: "convenience", label: "Convenience store" },
    ],
  },
  {
    id: "services",
    label: "Services",
    icon: WrenchIcon,
    options: [
      { id: "salon", label: "Salon & spa" },
      { id: "laundry", label: "Laundry services" },
      { id: "repair", label: "Repair services" },
    ],
  },
  {
    id: "professional",
    label: "Professional",
    icon: BriefcaseIcon,
    options: [
      { id: "consulting", label: "Consulting" },
      { id: "legal", label: "Legal services" },
      { id: "accounting", label: "Accounting" },
    ],
  },
]

export function findCategory(id: string | null): { group: CategoryGroup; option: CategoryOption } | null {
  if (!id) return null
  for (const group of categoryGroups) {
    const option = group.options.find((item) => item.id === id)
    if (option) return { group, option }
  }
  return null
}
