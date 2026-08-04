import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { OnlineProductEmptyContent } from "@/components/products/online-product-empty-content"

export default function SmartRoutingPage() {
  return (
    <TransactionsPlatformShell>
      <OnlineProductEmptyContent
        title="Smart routing"
        description="Configure gateway orchestration and success-first route policies."
      />
    </TransactionsPlatformShell>
  )
}
