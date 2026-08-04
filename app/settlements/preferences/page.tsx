import { V3SettlementPreferencesContent } from "@/components/settlements/v3-settlements-content"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"

export default function SettlementPreferencesPage() {
  return (
    <TransactionsPlatformShell>
      <V3SettlementPreferencesContent />
    </TransactionsPlatformShell>
  )
}
