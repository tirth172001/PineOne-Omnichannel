import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { PaymentGatewayListingContent } from "@/components/online-payments/payment-gateway-listing-content"

export default function OnlinePaymentsPage() {
  return (
    <TransactionsPlatformShell>
      <PaymentGatewayListingContent />
    </TransactionsPlatformShell>
  )
}
