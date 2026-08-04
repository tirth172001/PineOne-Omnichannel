import { ManageUserRolesContent } from "@/components/account/manage-user-roles-content"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"

export default function AccountUserRolesPage() {
  return (
    <TransactionsPlatformShell>
      <ManageUserRolesContent />
    </TransactionsPlatformShell>
  )
}
