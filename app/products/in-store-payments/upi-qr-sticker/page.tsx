import { TransactionsPlatformShell } from "@/components/transactions/transactions-platform-shell"
import { StoreQrStickersListingContent } from "@/components/products/store-qr-stickers-listing-content"

export default function UpiQrStickerPage() {
  return (
    <TransactionsPlatformShell>
      <StoreQrStickersListingContent />
    </TransactionsPlatformShell>
  )
}
