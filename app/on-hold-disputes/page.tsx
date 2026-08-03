import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { OnHoldDisputesContent } from "@/components/on-hold-disputes/on-hold-disputes-content"

export default function OnHoldDisputesPage() {
  return (
    <TransactionsPlatformShell>
      <OnHoldDisputesContent />
    </TransactionsPlatformShell>
  )
}
