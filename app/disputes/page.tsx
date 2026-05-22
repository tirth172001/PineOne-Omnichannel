import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { DisputesRouteContent } from "@/components/disputes/disputes-route-content"

export default function DisputesPage() {
  return (
    <TransactionsPlatformShell>
      <DisputesRouteContent />
    </TransactionsPlatformShell>
  )
}
