import { RefundsView } from '@/components/payments/refunds-view';
import { TabScreen } from '@/components/tab-screen';

/** Refunds tab (web: /refunds). */
export default function RefundsScreen() {
  return (
    <TabScreen>
      <RefundsView />
    </TabScreen>
  );
}
