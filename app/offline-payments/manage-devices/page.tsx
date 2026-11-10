import { NewMerchantProductGate } from "@/components/getting-started/product-page"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { PosTerminalsListingContent } from "@/components/offline-payments/pos-terminals-listing-content"

export default async function OfflinePaymentsManageDevicesPage() {
  return (
    <TransactionsPlatformShell>
      <NewMerchantProductGate product="in-store">
        <PosTerminalsListingContent />
      </NewMerchantProductGate>
    </TransactionsPlatformShell>
  )
}
