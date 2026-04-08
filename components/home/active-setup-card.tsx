"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ExternalLink, Smartphone, CreditCard, QrCode } from "lucide-react"

const activeProducts = [
  {
    name: "POS Device",
    status: "Active",
    icon: Smartphone,
    description: "Pine Labs Android POS",
  },
  {
    name: "Card Payments",
    status: "Live",
    icon: CreditCard,
    description: "Visa, Mastercard, RuPay",
  },
  {
    name: "UPI",
    status: "External",
    icon: QrCode,
    description: "Third-party provider",
    isExternal: true,
  },
]

export function ActiveSetupCard() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Active Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeProducts.map((product) => (
          <div
            key={product.name}
            className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <product.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">{product.name}</p>
                {product.isExternal && (
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{product.description}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={`h-2 w-2 rounded-full ${
                  product.isExternal ? "bg-warning" : "bg-success"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  product.isExternal ? "text-warning" : "text-success"
                }`}
              >
                {product.status}
              </span>
            </div>
          </div>
        ))}

        <p className="text-xs text-muted-foreground pt-2">
          Using external UPI?{" "}
          <a href="/products/pine-labs-upi" className="text-primary hover:underline">
            See how Pine Labs UPI compares
          </a>
        </p>
      </CardContent>
    </Card>
  )
}
