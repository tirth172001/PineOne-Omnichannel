import { NewMerchantProductGate } from "@/components/getting-started/product-page"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { PaymentLinksListingContent } from "@/components/payment-links/payment-links-listing-content"

export default function PaymentLinksPage() {
  return (
    <TransactionsPlatformShell>
      <NewMerchantProductGate product="payment-links">
        <PaymentLinksListingContent />
      </NewMerchantProductGate>
    </TransactionsPlatformShell>
  )
}
