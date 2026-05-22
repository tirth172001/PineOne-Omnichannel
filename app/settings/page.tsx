import { Suspense } from "react"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { MerchantSettingsContent } from "@/components/settings/merchant-settings-content"

export default function SettingsPage() {
  return (
    <TransactionsPlatformShell>
      <Suspense fallback={null}>
        <MerchantSettingsContent />
      </Suspense>
    </TransactionsPlatformShell>
  )
}
