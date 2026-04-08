"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface UseCaseDetailProps {
  useCase: {
    id: string
    title: string
    description: string
    icon: LucideIcon
    color: string
    stats: string
    products: Array<{
      id: string
      name: string
      impact: string
    }>
  }
  onClose: () => void
}

export function UseCaseDetail({ useCase, onClose }: UseCaseDetailProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <Card className="relative w-full max-w-lg border-border bg-card animate-in fade-in zoom-in-95 duration-200">
        <CardHeader className="flex flex-row items-start justify-between pb-4">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${useCase.color}`}>
              <useCase.icon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">{useCase.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{useCase.description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
            <p className="text-sm text-foreground">
              <span className="font-semibold text-primary">{useCase.stats}</span>
              {" "}when merchants use these products together
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">
              Recommended products for this goal
            </h4>
            <div className="space-y-2">
              {useCase.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3 transition-all hover:border-primary/30 hover:bg-secondary/50"
                  onClick={onClose}
                >
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.impact}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <Button className="flex-1" asChild>
              <Link href={`/products/${useCase.products[0]?.id}`} onClick={onClose}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" onClick={onClose}>
              Maybe Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
