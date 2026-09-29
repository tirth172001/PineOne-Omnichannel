import { SupportLanding } from '@/components/support/support-landing';
import { TabScreen } from '@/components/tab-screen';

/** /support: the Support landing. */
export default function SupportScreen() {
  return (
    <TabScreen tab="support">
      <SupportLanding />
    </TabScreen>
  );
}
