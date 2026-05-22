import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { MerchantSettingsContent } from "@/components/settings/merchant-settings-content"

export default function SettingsPage() {
  return (
    <TransactionsPlatformShell>
      <MerchantSettingsContent />
    </TransactionsPlatformShell>
  )
}
