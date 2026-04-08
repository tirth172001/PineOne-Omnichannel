"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, QrCode, Smartphone, Wallet } from "lucide-react"

const paymentMethods = [
  {
    name: "Cards",
    icon: CreditCard,
    volume: "₹28.5K",
    transactions: 89,
    percentage: 57,
    successRate: 96.8,
    color: "bg-primary",
  },
  {
    name: "UPI",
    icon: QrCode,
    volume: "₹12.2K",
    transactions: 52,
    percentage: 33,
    successRate: 91.8,
    color: "bg-chart-2",
  },
  {
    name: "Wallets",
    icon: Wallet,
    volume: "₹1.8K",
    transactions: 15,
    percentage: 10,
    successRate: 94.2,
    color: "bg-chart-3",
  },
]

export function PaymentMethodsBreakdown() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Payment Methods</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Visual breakdown bar */}
        <div className="flex h-3 w-full overflow-hidden rounded-full mb-6">
          {paymentMethods.map((method) => (
            <div
              key={method.name}
              className={`${method.color} transition-all`}
              style={{ width: `${method.percentage}%` }}
            />
          ))}
        </div>

        {/* Method details */}
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.name}
              className="flex items-center gap-4 rounded-lg border border-border bg-secondary/30 p-4"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${method.color}/10`}>
                <method.icon className={`h-5 w-5 text-foreground`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-foreground">{method.name}</p>
                  <p className="font-semibold text-foreground">{method.volume}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {method.transactions} transactions • {method.percentage}%
                  </span>
                  <span
                    className={
                      method.successRate >= 95 ? "text-success" : "text-warning"
                    }
                  >
                    {method.successRate}% success
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
