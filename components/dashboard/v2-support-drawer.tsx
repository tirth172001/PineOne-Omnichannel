"use client"

import { Sheet, SheetContent } from "@/components/ui/sheet"
import { SupportRequestChatPanel } from "@/components/support/support-request-chat-panel"

interface V2SupportDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pathname: string
}

export function V2SupportDrawer({ open, onOpenChange, pathname }: V2SupportDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        a11yTitle="Help and Support"
        a11yDescription="Chat-style support request flow with guided troubleshooting."
        className="w-full p-0 sm:max-w-[430px]"
      >
        <SupportRequestChatPanel
          pathname={pathname}
          onClose={() => onOpenChange(false)}
          showOpenSupportCenter
        />
      </SheetContent>
    </Sheet>
  )
}
