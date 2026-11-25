import { useState } from 'react';

import { GuideHomeHistory } from '@/components/guide/guide-chat';
import { GuideLanding } from '@/components/guide/guide-landing';
import { TabScreen } from '@/components/tab-screen';

/** /guide: the Guide assistant's landing; its header's clock opens History (past chats, queries and tickets). */
export default function GuideScreen() {
  const [historyOpen, setHistoryOpen] = useState(false);
  return (
    <TabScreen tab="guide" actions={[{ label: 'History', shortLabel: '', icon: 'clock-counter-clockwise', onPress: () => setHistoryOpen(true) }]}>
      <GuideLanding />
      <GuideHomeHistory visible={historyOpen} onDismiss={() => setHistoryOpen(false)} />
    </TabScreen>
  );
}
