"use client"

import Link from "next/link"
import { ArrowUpRightIcon, TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnimatedNumberText } from "@/components/ui/animated-number-text"
import { HighchartsPanelChart } from "@/components/ui/highcharts"

const transactionData = [120000, 80000, 150000, 180000, 280000, 320000, 250000, 180000, 300000, 280000, 220000, 150000]
const refundsData = [45000, 52000, 38000, 65000, 48000, 72000, 58000]

export function BusinessHealthCard() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      <Card className="py-0 gap-0">
        <CardHeader className="px-5 py-4 border-b border-border">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Transactions</CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-4">
          <AnimatedNumberText value="₹2,34,86,400.54" className="text-2xl font-bold text-foreground" />
          <div className="flex items-center gap-1 text-xs text-success mt-1">
            <TrendUpIcon className="h-3 w-3" /> <AnimatedNumberText value="+5.2%" />
          </div>
          <div className="h-28 mt-2">
            <HighchartsPanelChart
              options={{
                chart: { type: "line" },
                legend: { enabled: false },
                xAxis: { categories: ["12a","2a","4a","6a","8a","10a","12p","2p","4p","6p","8p","10p"] },
                series: [{ type: "line", data: transactionData, color: "var(--color-primary)" }],
              }}
            />
          </div>
          <Button variant="link" className="p-0 h-auto text-xs text-primary mt-2" asChild>
            <Link href="/online-payments">View payment details <ArrowUpRightIcon className="h-3.5 w-3.5" /></Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="py-0 gap-0">
        <CardHeader className="px-5 py-4 border-b border-border">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Total Payout</CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-4">
          <AnimatedNumberText value="₹10,00,000" className="text-2xl font-bold text-foreground" />
          <p className="text-xs text-muted-foreground">Net after deductions</p>
          <div className="h-28 mt-2">
            <HighchartsPanelChart
              options={{
                chart: { type: "pie" },
                legend: { enabled: false },
                series: [{ type: "pie", innerSize: "62%", data: [{ name: "Payout", y: 90, color: "var(--color-primary)" }, { name: "Deductions", y: 10, color: "var(--color-warning)" }] }],
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="py-0 gap-0 md:col-span-2 xl:col-span-1">
        <CardHeader className="px-5 py-4 border-b border-border">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Refunds</CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-4">
          <AnimatedNumberText value="₹86,400" className="text-2xl font-bold text-foreground" />
          <div className="flex items-center gap-1 text-xs text-destructive mt-1">
            <TrendDownIcon className="h-3 w-3" /> <AnimatedNumberText value="234" /> txns
          </div>
          <div className="h-28 mt-2">
            <HighchartsPanelChart
              options={{
                chart: { type: "line" },
                legend: { enabled: false },
                xAxis: { categories: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] },
                series: [{ type: "line", data: refundsData, color: "var(--color-destructive)" }],
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
