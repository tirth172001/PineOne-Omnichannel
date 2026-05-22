import { notFound } from "next/navigation"
import { TransactionDetailContent } from "@/components/transactions/transaction-detail-content"
import { findTransactionById } from "@/components/transactions/transactions-data"

type PageProps = {
  params: Promise<{ transactionId: string }>
  searchParams: Promise<{ channel?: string }>
}

export default async function TransactionDetailPage({ params, searchParams }: PageProps) {
  const { transactionId } = await params
  const query = await searchParams
  const transaction = findTransactionById(transactionId)

  if (!transaction) {
    notFound()
  }

  const detailChannel = query.channel === "online" ? "online" : "in-store"

  return <TransactionDetailContent transaction={transaction} detailChannel={detailChannel} />
}
