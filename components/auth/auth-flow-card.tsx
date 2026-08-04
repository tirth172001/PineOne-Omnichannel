import * as React from "react"
import { cn } from "@/lib/utils"

export function AuthFlowCard({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("w-full max-w-[560px] rounded-xl bg-card p-8 shadow-sm", className)} {...props} />
}

export function AuthFlowHeader({
  title,
  description,
  className,
}: {
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <h1 className="text-2xl font-medium tracking-tight text-foreground">{title}</h1>
      {description ? <p className="text-base font-normal text-muted-foreground">{description}</p> : null}
    </div>
  )
}

export function AuthFlowFieldList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("space-y-6", className)} {...props} />
}

export function AuthFlowFieldGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("space-y-2.5", className)} {...props} />
}

export function AuthFlowActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("mt-10 flex items-center justify-start gap-3", className)} {...props} />
}
