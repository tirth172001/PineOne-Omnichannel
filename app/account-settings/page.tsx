import { AccountSettingsContent } from "@/components/account/settings-slide-panel"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"

export default function AccountSettingsPage() {
  return (
    <TransactionsPlatformShell>
      <AccountSettingsContent />
    </TransactionsPlatformShell>
  )
}
