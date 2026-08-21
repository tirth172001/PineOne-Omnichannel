"use client"

import { ArrowUpRightIcon, CreditCardIcon, DeviceMobileIcon, LinkIcon } from "@phosphor-icons/react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HighchartsPanelChart } from "@/components/ui/highcharts"

const products = [
  { name: "Checkout", href: "/online-payments", icon: CreditCardIcon, color: "var(--color-primary)", series: [145,178,156,198,167,89,67] },
  { name: "POS Terminal", href: "/offline-payments", icon: DeviceMobileIcon, color: "var(--color-chart-2)", series: [245,278,238,312,289,195,168] },
  { name: "Payment Links", href: "/payment-links", icon: LinkIcon, color: "var(--color-chart-4)", series: [22,28,18,35,24,15,14] },
]

export function ProductOverviewCards() {
  return (
    <div className="space-y-3">
      {products.map((p) => {
        const Icon = p.icon
        return (
          <Card key={p.name} className="py-0 gap-0 overflow-hidden">
            <CardHeader className="px-4 py-3 border-b border-border flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-sm">{p.name}</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={p.href}>Open <ArrowUpRightIcon className="h-3.5 w-3.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-24">
                <HighchartsPanelChart
                  options={{
                    chart: { type: "area" },
                    legend: { enabled: false },
                    xAxis: { categories: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], visible: false },
                    yAxis: { visible: false },
                    tooltip: { pointFormat: "<b>{point.y}</b>" },
                    series: [{ type: "area", data: p.series, color: p.color, fillOpacity: 0.18 }],
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
