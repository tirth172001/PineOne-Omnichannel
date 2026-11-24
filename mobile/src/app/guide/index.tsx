import { GuideLanding } from '@/components/guide/guide-landing';
import { TabScreen } from '@/components/tab-screen';

/** /guide: the Guide assistant's landing, the bar's default fourth tab. */
export default function GuideScreen() {
  return (
    <TabScreen tab="guide">
      <GuideLanding />
    </TabScreen>
  );
}
