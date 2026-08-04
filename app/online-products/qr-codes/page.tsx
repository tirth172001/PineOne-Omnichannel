import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { OnlineProductEmptyContent } from "@/components/products/online-product-empty-content"

export default function QrCodesPage() {
  return (
    <TransactionsPlatformShell>
      <OnlineProductEmptyContent
        title="QR codes"
        description="Manage QR collections, mapping, and distribution controls."
      />
    </TransactionsPlatformShell>
  )
}
