"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HighchartsPanelChart } from "@/components/ui/highcharts"

const weeklyData = {
  categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  card: [96.5, 97.1, 96.8, 97.2, 96.9, 95.8, 96.2],
  upi: [91.2, 92.8, 90.5, 93.1, 91.8, 89.2, 91.8],
}

export function SuccessTrends() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Success Rate Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <HighchartsPanelChart
            options={{
              chart: { type: "area" },
              xAxis: { categories: weeklyData.categories },
              yAxis: { min: 85, max: 100, labels: { format: "{value}%" } },
              tooltip: { shared: true, valueSuffix: "%" },
              series: [
                { type: "area", name: "Card", data: weeklyData.card, color: "var(--color-primary)", fillOpacity: 0.16 },
                { type: "area", name: "UPI", data: weeklyData.upi, color: "var(--color-chart-2)", fillOpacity: 0.16 },
              ],
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

