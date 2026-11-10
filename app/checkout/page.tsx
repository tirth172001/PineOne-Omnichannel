import { NewMerchantProductGate } from "@/components/getting-started/product-page"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { CheckoutContent } from "@/components/checkout/checkout-content"

export default function CheckoutPage() {
  return (
    <TransactionsPlatformShell>
      <NewMerchantProductGate product="checkout">
        <CheckoutContent />
      </NewMerchantProductGate>
    </TransactionsPlatformShell>
  )
}
