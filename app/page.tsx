import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { HomeContent } from "@/components/home/home-content"

export default function HomePage() {
  return (
    <TransactionsPlatformShell>
      <HomeContent />
    </TransactionsPlatformShell>
  )
}
