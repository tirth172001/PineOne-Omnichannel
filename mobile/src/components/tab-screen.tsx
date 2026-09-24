import type { ComponentProps, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { TabChrome, useTabNavBar } from '@/components/app-tabs';
import { FloatingLayerHost, FloatingLayerProvider, FloatingLayerSpacer, useFloatingLayer } from '@/components/shared/floating-layer';
import { EndReachedProvider, useEndReached } from '@/components/shared/lazy-list';

/**
 * A tab's root screen (Payments, Settlements, Refunds, More): the tab chrome
 * (header and navigation bar) around scrolling content, where lazy lists load
 * their next rows as the end of the page comes into view, and a floating
 * layer just above the navigation bar (e.g. a listing's search and exports).
 */
export function TabScreen({ tab, children }: { tab: ComponentProps<typeof TabChrome>['tab']; children: ReactNode }) {
  return (
    <TabChrome tab={tab}>
      <TabScrollContent>{children}</TabScrollContent>
    </TabChrome>
  );
}

/** Inside TabChrome, so it can hide the navigation bar while scrolling down and ride the floating layer above it. */
function TabScrollContent({ children }: { children: ReactNode }) {
  const endReached = useEndReached();
  const floating = useFloatingLayer();
  const navBar = useTabNavBar();
  return (
    <View style={styles.area}>
      <ScrollView
        {...endReached.scrollProps}
        onScroll={(event) => {
          endReached.scrollProps.onScroll(event);
          navBar.onScroll(event.nativeEvent.contentOffset.y);
        }}
        contentContainerStyle={[styles.content, { paddingBottom: 32 + navBar.height }]}
        keyboardShouldPersistTaps="handled">
        <FloatingLayerProvider store={floating}>
          <EndReachedProvider value={endReached.value}>{children}</EndReachedProvider>
        </FloatingLayerProvider>
        <FloatingLayerSpacer store={floating} />
      </ScrollView>
      {/* Sits above the navigation bar, and follows it down when it slides away. */}
      <FloatingLayerHost store={floating} offsetY={navBar.hidden.interpolate({ inputRange: [0, 1], outputRange: [-navBar.height, 0] })} />
    </View>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1 },
  content: { padding: 16 },
});
