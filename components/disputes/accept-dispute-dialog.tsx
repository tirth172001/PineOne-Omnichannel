"use client"

import { QuestionIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function AcceptDisputeDialog({
  open,
  onOpenChange,
  amount,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: string
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-normal text-muted-foreground">Accept dispute</DialogTitle>
          <DialogDescription className="sr-only">
            Confirm you want to accept this dispute and refund the customer.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 px-2 py-4 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <QuestionIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Accept the dispute and refund?</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            By accepting this dispute, {amount} will be adjusted from your upcoming settlement. Please note, once
            confirmed, this action cannot be undone.
          </p>
        </div>

        <DialogFooter className="border-t-0 bg-transparent p-0">
          <Button
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className="w-full"
          >
            Accept dispute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
