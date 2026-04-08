"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Clock, CreditCard, ShieldX, Wifi } from "lucide-react"

const failureReasons = [
  {
    reason: "Card declined by bank",
    icon: CreditCard,
    count: 8,
    percentage: 42,
    description: "Insufficient funds or bank restrictions",
  },
  {
    reason: "Transaction timeout",
    icon: Clock,
    count: 5,
    percentage: 26,
    description: "Payment took too long to process",
  },
  {
    reason: "Network issues",
    icon: Wifi,
    count: 3,
    percentage: 16,
    description: "Connectivity problems during transaction",
  },
  {
    reason: "Authentication failed",
    icon: ShieldX,
    count: 3,
    percentage: 16,
    description: "OTP or 3DS verification failed",
  },
]

export function FailureReasons() {
  const totalFailures = failureReasons.reduce((sum, r) => sum + r.count, 0)

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Failure Analysis</CardTitle>
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">{totalFailures} failed today</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {failureReasons.map((item) => (
            <div key={item.reason} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                    <item.icon className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.reason}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{item.count}</p>
                  <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-destructive/60 transition-all"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Tip: Many timeout issues can be resolved with better payment routing.{" "}
          <a href="/products/pine-labs-upi" className="text-primary hover:underline">
            Learn how Pine Labs UPI handles retries
          </a>
        </p>
      </CardContent>
    </Card>
  )
}
