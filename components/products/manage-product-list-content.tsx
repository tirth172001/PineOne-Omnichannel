"use client"

import Link from "next/link"
import Image from "next/image"
import type { ComponentType, ReactNode } from "react"
import {
  ArrowUpRightIcon,
  CheckCircleIcon,
  DeviceMobileIcon,
  DeviceTabletIcon,
  DevicesIcon,
  HandCoinsIcon,
  LinkIcon,
  PackageIcon,
  PathIcon,
  QrCodeIcon,
  WaveformIcon,
} from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/panels"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { ProductCatalogCard, type ProductCatalogCardAction } from "./product-catalog-card"

export type ManagedProductAction = {
  label: string
  href: string
  variant?: "default" | "outline" | "secondary" | "ghost"
  showArrow?: boolean
}

export type ManagedProduct = {
  id: string
  name: string
  description: string
  configured: boolean
  detailHref?: string
  rowActionLabel?: string
  actions?: ManagedProductAction[]
  metricText?: string
  comingSoon?: boolean
  imageSrc?: string
  imageAlt?: string
  imageIconName?:
    | "tablet"
    | "phone"
    | "handheld"
    | "duo"
    | "audio"
    | "qr"
    | "checkout"
    | "routing"
    | "links"
}

export type HeaderAction = ManagedProductAction

interface ManageProductListContentProps {
  title: string
  subtitle: string
  products: ManagedProduct[]
  primaryAction?: HeaderAction
  headerActions?: HeaderAction[]
  rowActionLabel?: string
  topBanner?: ReactNode
}

const IMAGE_ICON_MAP: Record<NonNullable<ManagedProduct["imageIconName"]>, ComponentType<{ className?: string }>> = {
  tablet: DeviceTabletIcon,
  phone: DeviceMobileIcon,
  handheld: HandCoinsIcon,
  duo: DevicesIcon,
  audio: WaveformIcon,
  qr: QrCodeIcon,
  checkout: PackageIcon,
  routing: PathIcon,
  links: LinkIcon,
}

export function ManageProductListContent({
  title,
  subtitle,
  products,
  primaryAction,
  headerActions,
  rowActionLabel = "Configure",
  topBanner,
}: ManageProductListContentProps) {
  const orderedProducts = [...products].sort((a, b) => Number(b.configured) - Number(a.configured))
  const resolvedHeaderActions = headerActions ?? (primaryAction ? [primaryAction] : [])

  function resolveCardActions(product: ManagedProduct): {
    primary: ProductCatalogCardAction
    secondary?: ProductCatalogCardAction
  } {
    const rawActions =
      product.actions ??
      (product.detailHref
        ? [
            {
              label: product.rowActionLabel ?? rowActionLabel,
              href: product.detailHref,
              variant: "default" as const,
              showArrow: true,
            },
          ]
        : [])

    if (rawActions.length === 0) {
      return {
        primary: {
          label: "Open",
          href: "/products",
          variant: "default",
          showArrow: true,
        },
      }
    }

    const primary =
      rawActions.find((action) => action.variant === "default") ??
      rawActions.find((action) => action.variant === "secondary") ??
      rawActions[0]
    const secondary = rawActions.find((action) => action !== primary)

    return {
      primary: { ...primary, variant: primary.variant ?? "default" },
      secondary: secondary ? { ...secondary, variant: secondary.variant ?? "outline" } : undefined,
    }
  }

  const centerMain = (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      {topBanner ? topBanner : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {orderedProducts.map((product) => {
          const ProductImageIcon = product.imageIconName ? IMAGE_ICON_MAP[product.imageIconName] : null
          const icon = product.imageSrc ? (
            <Image
              src={product.imageSrc}
              alt={product.imageAlt ?? product.name}
              width={44}
              height={44}
              className="h-full w-full rounded-sm object-cover"
            />
          ) : ProductImageIcon ? (
            <ProductImageIcon className="h-5 w-5 text-muted-foreground" />
          ) : (
            <div className="h-5 w-5 rounded-sm bg-muted" />
          )

          const badge = product.comingSoon ? (
            <Badge variant="outline" className="text-[10px]">
              Coming soon
            </Badge>
          ) : product.configured ? (
            <Badge variant="outline" className="gap-1 border-success/35 bg-success/15 text-success text-[10px]">
              <CheckCircleIcon className="h-3 w-3" />
              Configured
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px]">
              Not configured
            </Badge>
          )

          const actions = resolveCardActions(product)

          return (
            <ProductCatalogCard
              key={product.id}
              icon={icon}
              title={product.name}
              description={product.description}
              badge={badge}
              metadata={product.metricText}
              primaryAction={actions.primary}
              secondaryAction={actions.secondary}
            />
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      <PageHeader title={title} description={subtitle}>
        {resolvedHeaderActions.map((action) => (
          <Button
            key={`${action.label}-${action.href}`}
            size="sm"
            variant={action.variant ?? "default"}
            className="h-8 gap-1.5 text-xs"
            asChild
          >
            <Link href={action.href}>
              {action.label}
              {action.showArrow === false ? null : <ArrowUpRightIcon className="h-3.5 w-3.5" />}
            </Link>
          </Button>
        ))}
      </PageHeader>

      <WorkspaceShell centerMain={centerMain} />
    </>
  )
}
