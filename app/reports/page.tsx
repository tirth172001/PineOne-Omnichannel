import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { ReportsRouteContent } from "@/components/reports/reports-route-content"

export default function ReportsPage() {
  return (
    <TransactionsPlatformShell>
      <ReportsRouteContent />
    </TransactionsPlatformShell>
  )
}
