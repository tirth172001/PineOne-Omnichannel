import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { EndReachedProvider, useEndReached } from '@/components/shared/lazy-list';

/**
 * A top-level tab's scrolling content (Payments, Settlements, Refunds): the
 * shell draws the header and navigation bar around it, and lazy lists inside
 * load their next rows as the end of the page comes into view.
 */
export function TabScreen({ children }: { children: ReactNode }) {
  const endReached = useEndReached();
  return (
    <ScrollView {...endReached.scrollProps} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <EndReachedProvider value={endReached.value}>{children}</EndReachedProvider>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
});
