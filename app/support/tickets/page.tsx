import { SupportTicketsListingContent } from "@/components/support/support-tickets-listing-content"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"

export default function SupportTicketsPage() {
  return (
    <TransactionsPlatformShell>
      <SupportTicketsListingContent />
    </TransactionsPlatformShell>
  )
}
