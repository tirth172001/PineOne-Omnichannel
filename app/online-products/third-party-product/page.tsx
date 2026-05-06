import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { OnlineProductEmptyContent } from "@/components/products/online-product-empty-content"

export default function ThirdPartyProductPage() {
  return (
    <TransactionsPlatformShell>
      <OnlineProductEmptyContent
        title="3rd party product"
        description="Manage partner product integrations and operational readiness."
      />
    </TransactionsPlatformShell>
  )
}
