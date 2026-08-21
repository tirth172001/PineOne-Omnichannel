import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { DeviceAuditLogContent } from "@/components/offline-payments/device-audit-log-content"

export default async function OfflinePaymentsManageDevicesAuditLogPage() {
  return (
    <TransactionsPlatformShell>
      <DeviceAuditLogContent />
    </TransactionsPlatformShell>
  )
}
