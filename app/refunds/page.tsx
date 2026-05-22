import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { RefundsRouteContent } from "@/components/refunds/refunds-route-content"

export default function RefundsPage() {
  return (
    <TransactionsPlatformShell>
      <RefundsRouteContent />
    </TransactionsPlatformShell>
  )
}
