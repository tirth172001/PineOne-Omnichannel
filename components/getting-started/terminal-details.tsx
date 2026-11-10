"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getInstallationGuide, type GettingStartedState } from "@/lib/getting-started"
import { getDevice, INR } from "./catalog"
import { OrderTimeline } from "./terminal-journey"

export function TerminalDetails({ state }: { state: GettingStartedState }) {
  const order = state.order
  if (!order) return null
  return <div className="flex flex-wrap gap-2">
    <Dialog>
      <DialogTrigger asChild><Button variant="outline">View order</Button></DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[520px] p-6">
        <DialogHeader>
          <DialogTitle>Order {order.id}</DialogTitle>
          <DialogDescription>{INR.format(order.amountPaid)} paid by {order.paidWith} · {order.courier}</DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 border-b border-border pb-4 text-sm">{order.lines.map((line) => <li key={`${line.deviceId}-${line.plan}`}>{getDevice(line.deviceId).name} × {line.qty} · {line.plan === "rental" ? "Rent" : "Buy"}</li>)}</ul>
        <OrderTimeline order={order} />
        {state.delivery ? <p className="border-t border-border pt-4 text-sm text-muted-foreground">Delivered to {state.delivery.storeName}, {state.delivery.address}, {state.delivery.city} {state.delivery.pincode}</p> : null}
      </DialogContent>
    </Dialog>
    <Dialog>
      <DialogTrigger asChild><Button variant="ghost">View setup guide</Button></DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[520px] p-6">
        <DialogHeader><DialogTitle>Terminal setup guide</DialogTitle><DialogDescription>Find this guide in In-store whenever you need it.</DialogDescription></DialogHeader>
        <ol className="divide-y divide-border">{getInstallationGuide(order.lines).map((item, index) => <li key={item.id} className="py-4"><p className="text-sm font-medium">{index + 1}. {item.title}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p></li>)}</ol>
      </DialogContent>
    </Dialog>
  </div>
}
