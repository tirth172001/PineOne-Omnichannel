import { SupportRouteContent } from "@/components/support/support-route-content"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"

export default function SupportKnowledgeHubPage() {
  return (
    <TransactionsPlatformShell>
      <SupportRouteContent section="knowledge" />
    </TransactionsPlatformShell>
  )
}
