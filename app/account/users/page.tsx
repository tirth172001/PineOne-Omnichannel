import { AccountRouteContent } from "@/components/account/account-route-content"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"

export default function AccountUsersPage() {
  return (
    <TransactionsPlatformShell>
      <AccountRouteContent tab="users" />
    </TransactionsPlatformShell>
  )
}
