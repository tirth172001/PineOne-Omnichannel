"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { HighchartsPanelChart } from "@/components/ui/highcharts"

const metrics = [
  { metric: "Card Success Rate", yours: 96.8, benchmark: 97.2 },
  { metric: "UPI Success Rate", yours: 91.8, benchmark: 96.1 },
]

export function BenchmarkComparison() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">How You Compare</CardTitle>
        <p className="text-sm text-muted-foreground">vs similar merchants on Pine Labs</p>
      </CardHeader>
      <CardContent>
        <div className="h-40 mb-4">
          <HighchartsPanelChart
            options={{
              chart: { type: "bar" },
              xAxis: { categories: metrics.map((m) => m.metric) },
              yAxis: { min: 85, max: 100, labels: { format: "{value}%" } },
              tooltip: { shared: true, valueSuffix: "%" },
              series: [
                { type: "bar", name: "Benchmark", data: metrics.map((m) => m.benchmark), color: "var(--color-muted)" },
                { type: "bar", name: "Your Rate", data: metrics.map((m) => m.yours), color: "var(--color-primary)" },
              ],
            }}
          />
        </div>
        <div className="space-y-2">
          {metrics.map((item) => {
            const positive = item.yours >= item.benchmark
            return (
              <div key={item.metric} className="flex items-center justify-between text-xs border-b border-border pb-2 last:border-0">
                <span className="text-muted-foreground">{item.metric}</span>
                <span className={`font-medium ${positive ? "text-success" : "text-warning-foreground"}`}>
                  {positive ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />}
                  {item.yours}% vs {item.benchmark}%
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

