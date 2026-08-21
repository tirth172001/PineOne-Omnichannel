"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowSquareOutIcon,
  CheckIcon,
  CreditCardIcon,
  DeviceMobileIcon,
  QrCodeIcon,
} from "@phosphor-icons/react"
const activeProducts = [
  {
    name: "POS terminal",
    status: "Active",
    icon: DeviceMobileIcon,
    description: "Pine Labs Android POS",
  },
  {
    name: "Checkout",
    status: "Live",
    icon: CreditCardIcon,
    description: "Cards, UPI, wallets, and netbanking",
  },
  {
    name: "Payment links",
    status: "Live",
    icon: QrCodeIcon,
    description: "Shared collections across channels",
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
                {product.isExternal && <ArrowSquareOutIcon className="h-3 w-3 text-muted-foreground" />}
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
          Need to adjust your payment setup?{" "}
          <a href="/products/online-payments" className="text-primary hover:underline">
            Open online payment products
          </a>
        </p>
      </CardContent>
    </Card>
  )
}
