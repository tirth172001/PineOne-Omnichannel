import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { DisputesContent } from "@/components/disputes/disputes-content"

export default function DisputesPage() {
  return (
    <TransactionsPlatformShell>
      <DisputesContent />
    </TransactionsPlatformShell>
  )
}
