import { MoreMenu } from '@/components/more/more-menu';
import { TabScreen } from '@/components/tab-screen';

export default function MoreScreen() {
  return (
    <TabScreen tab="more">
      <MoreMenu />
    </TabScreen>
  );
}
