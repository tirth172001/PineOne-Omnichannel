import { SettlementsView } from '@/components/payments/settlements-view';
import { TabScreen } from '@/components/tab-screen';

/** Settlements tab (web: /settlements). */
export default function SettlementsScreen() {
  return (
    <TabScreen>
      <SettlementsView />
    </TabScreen>
  );
}
