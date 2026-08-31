import { Suspense } from "react"
import { SupportFaqsContent } from "@/components/support/support-faqs-content"
import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"

export default function SupportFaqsPage() {
  return (
    <TransactionsPlatformShell>
      <Suspense fallback={null}>
        <SupportFaqsContent />
      </Suspense>
    </TransactionsPlatformShell>
  )
}
