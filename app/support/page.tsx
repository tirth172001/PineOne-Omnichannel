import { SupportRouteContent } from "@/components/support/support-route-content"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"

export default function SupportPage() {
  return (
    <TransactionsPlatformShell>
      <SupportRouteContent section="queries" />
    </TransactionsPlatformShell>
  )
}
