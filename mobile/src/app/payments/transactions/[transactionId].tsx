import { useLocalSearchParams } from 'expo-router';

import { TransactionDetail } from '@/components/payments/transaction-detail';
import { NotFound } from '@/components/shared/not-found';
import { findTransaction } from '@/data/transactions';

/** /payments/transactions/[transactionId]?channel=online|in-store (web: /transactions/[transactionId]). */
export default function TransactionDetailScreen() {
  const { transactionId, channel } = useLocalSearchParams<{ transactionId: string; channel?: string }>();
  const transaction = findTransaction(transactionId);
  if (!transaction) {
    return <NotFound title="Transaction details" message={`No transaction with ID ${transactionId}.`} fallbackHref="/payments?tab=transactions" />;
  }
  return <TransactionDetail transaction={transaction} channel={channel === 'online' ? 'online' : 'in-store'} />;
}
