import { TransactionsView } from '@/components/payments/transactions-view';
import { TabScreen } from '@/components/tab-screen';

/** Payments tab: the transactions listing (web: /transactions). */
export default function PaymentsScreen() {
  return (
    <TabScreen>
      <TransactionsView />
    </TabScreen>
  );
}
