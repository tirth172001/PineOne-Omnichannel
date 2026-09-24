import type { ComponentProps, ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { TabChrome } from '@/components/app-tabs';
import { EndReachedProvider, useEndReached } from '@/components/shared/lazy-list';

/**
 * A tab's root screen (Payments, Settlements, Refunds, More): the tab chrome
 * (header and navigation bar) around scrolling content, where lazy lists load
 * their next rows as the end of the page comes into view.
 */
export function TabScreen({ tab, children }: { tab: ComponentProps<typeof TabChrome>['tab']; children: ReactNode }) {
  const endReached = useEndReached();
  return (
    <TabChrome tab={tab}>
      <ScrollView {...endReached.scrollProps} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <EndReachedProvider value={endReached.value}>{children}</EndReachedProvider>
      </ScrollView>
    </TabChrome>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
});
