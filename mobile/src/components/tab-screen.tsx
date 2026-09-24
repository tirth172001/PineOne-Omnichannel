import type { ComponentProps, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { TabChrome } from '@/components/app-tabs';
import { FloatingLayerHost, FloatingLayerProvider, FloatingLayerSpacer, useFloatingLayer } from '@/components/shared/floating-layer';
import { EndReachedProvider, useEndReached } from '@/components/shared/lazy-list';

/**
 * A tab's root screen (Payments, Settlements, Refunds, More): the tab chrome
 * (header and navigation bar) around scrolling content, where lazy lists load
 * their next rows as the end of the page comes into view, and a floating
 * layer just above the navigation bar (e.g. a listing's search and exports).
 */
export function TabScreen({ tab, children }: { tab: ComponentProps<typeof TabChrome>['tab']; children: ReactNode }) {
  const endReached = useEndReached();
  const floating = useFloatingLayer();
  return (
    <TabChrome tab={tab}>
      <View style={styles.area}>
        <ScrollView {...endReached.scrollProps} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <FloatingLayerProvider store={floating}>
            <EndReachedProvider value={endReached.value}>{children}</EndReachedProvider>
          </FloatingLayerProvider>
          <FloatingLayerSpacer store={floating} />
        </ScrollView>
        <FloatingLayerHost store={floating} />
      </View>
    </TabChrome>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
});
