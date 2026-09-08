"use client"

import Image from "next/image"
import Link from "next/link"
import { CaretRightIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

type ExploreProductBanner = {
  id: string
  alt: string
  src: string
  href: string
}

const PRODUCT_BANNERS: ExploreProductBanner[] = [
  {
    id: "growthhub",
    alt: "Drive more walk-ins to your store with GrowthHub",
    src: "/images/overview-products/growthhub.png",
    href: "/products",
  },
  {
    id: "smartbill",
    alt: "SmartBill for smarter business",
    src: "/images/overview-products/smartbill.png",
    href: "/products",
  },
  {
    id: "myemi",
    alt: "myEMI — no-cost EMIs on purchases as low as ₹3,000",
    src: "/images/overview-products/myemi.png",
    href: "/products",
  },
  {
    id: "contactless",
    alt: "Contactless payments made quicker",
    src: "/images/overview-products/contactless.png",
    href: "/products",
  },
]

export function OverviewExploreProducts() {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-heading text-2xl font-semibold text-foreground">Explore products</h3>
        <Button asChild type="button" variant="outline" size="sm" className="h-8 gap-1.5 px-3 text-sm">
          <Link href="/products">
            View all
            <CaretRightIcon className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-1">
          {PRODUCT_BANNERS.map((banner) => (
            <Link
              key={banner.id}
              href={banner.href}
              className="relative h-[136px] w-[306px] shrink-0 overflow-hidden rounded-xl"
            >
              <Image src={banner.src} alt={banner.alt} fill className="object-cover" sizes="306px" />
            </Link>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  )
}
