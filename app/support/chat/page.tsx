import { SupportChatContent } from "@/components/support/support-chat-content"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"

export default function SupportChatPage() {
  return (
    <TransactionsPlatformShell>
      <SupportChatContent />
    </TransactionsPlatformShell>
  )
}
