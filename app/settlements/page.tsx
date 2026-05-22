import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { SettlementsRouteContent } from "@/components/settlements/settlements-route-content"

export default function SettlementsPage() {
  return (
    <TransactionsPlatformShell>
      <SettlementsRouteContent />
    </TransactionsPlatformShell>
  )
}
