"use client"

import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ProductDetailContent } from "@/components/products/product-detail-content"
import { productCategories } from "@/lib/products-data"

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  
  // Find the product
  const product = productCategories
    .flatMap((category) => category.products)
    .find((p) => p.id === slug)

  if (!product) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Product not found</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <ProductDetailContent product={product} />
    </DashboardLayout>
  )
}
