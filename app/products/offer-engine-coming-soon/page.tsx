import { Megaphone, Sparkles } from "lucide-react"
import { V2DashboardLayout } from "@/components/dashboard/v2-dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/panels"

export default function OfferEngineComingSoonPage() {
  return (
    <V2DashboardLayout>
      <PageHeader
        title="Products · Offer engine"
        subtitle="Offer engine is coming soon"
        badges={<Badge variant="outline" className="text-[10px]">Coming soon</Badge>}
      />

      <div className="px-4 pb-6 pt-4">
        <div className="mx-auto w-full" style={{ maxWidth: "var(--dashboard-center-max-width, 1440px)" }}>
          <Card className="w-full rounded-lg border-border/70 bg-card/85">
            <CardContent className="p-6 md:p-7">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/12 text-primary">
                  <Megaphone className="h-5 w-5" />
                </div>
                <h2 className="mt-3 text-base font-semibold text-foreground">Offer engine will be available soon</h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  We are preparing campaign rules, eligibility logic, and offer orchestration tools for Pine merchants.
                </p>
                <Button size="sm" className="mt-4 h-8 gap-1.5 text-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  Notify me when live
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </V2DashboardLayout>
  )
}
