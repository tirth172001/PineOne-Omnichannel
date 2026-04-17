import Link from "next/link"
import { ArrowLeft, ArrowUpRight, Gift } from "lucide-react"
import { V2DashboardLayout } from "@/components/dashboard/v2-dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/panels"
import { partnerProducts } from "@/lib/products-data"
import { notFound } from "next/navigation"

type PartnerOfferPageProps = {
  params: { slug: string }
}

export default function PartnerOfferPage({ params }: PartnerOfferPageProps) {
  const { slug } = params
  const offer = partnerProducts.find((entry) => entry.href === `/partners/${slug}`)

  if (!offer) {
    notFound()
  }

  const OfferIcon = offer.icon

  return (
    <V2DashboardLayout>
      <PageHeader
        title={offer.name}
        subtitle={`Partner offer by ${offer.partnerName}`}
        backHref="/products/other-products"
      >
        <Badge variant="outline" className="text-xs">
          {offer.category}
        </Badge>
      </PageHeader>

      <div className="px-4 pb-6">
        <div className="mx-auto w-full" style={{ maxWidth: "var(--dashboard-center-max-width, 1440px)" }}>
          <Card className="rounded-lg border-border/70 bg-card/85">
            <CardHeader className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <OfferIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base">{offer.name}</CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    {offer.description}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[11px]">
                  {offer.discount}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <section>
                <p className="text-xs font-medium text-foreground">What you get</p>
                <div className="mt-2 space-y-2">
                  {offer.benefits.map((benefit) => (
                    <p key={benefit} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Gift className="h-3.5 w-3.5 text-foreground" />
                      <span>{benefit}</span>
                    </p>
                  ))}
                </div>
              </section>

              <div className="flex flex-wrap items-center gap-2">
                <Button className="h-8 text-xs gap-1.5">
                  Continue with {offer.partnerName}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
                <Button asChild variant="outline" className="h-8 text-xs gap-1.5">
                  <Link href="/products/other-products">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to offers
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </V2DashboardLayout>
  )
}
