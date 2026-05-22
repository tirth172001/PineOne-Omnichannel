import { AccountRouteContent } from "@/components/account/account-route-content"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"

export default function AccountBusinessDetailsPage() {
  return (
    <TransactionsPlatformShell>
      <AccountRouteContent tab="business-details" />
    </TransactionsPlatformShell>
  )
}
