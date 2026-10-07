import type { ComponentProps, ReactNode } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { TabChrome, useTabNavBar, useTabScroll } from '@/components/app-tabs';
import { type HeaderAction, type HeaderActionsMenu, useHeaderActions } from '@/components/header-actions';
import { EndReachedProvider, useEndReached } from '@/components/shared/lazy-list';

type TabScreenProps = {
  tab: ComponentProps<typeof TabChrome>['tab'];
  /**
   * The page's own actions in the header (see useHeaderActions), for pages
   * that draw their TabScreen themselves and so can't call the hook inside it.
   */
  actions?: HeaderAction[];
  actionsMenu?: HeaderActionsMenu;
  children: ReactNode;
};

/**
 * A tab's root screen (Payments, Settlements, and every module: Refunds,
 * Disputes, Reports…): the tab chrome (header and navigation bar) around
 * scrolling content, where lazy lists load their next rows as the end of the
 * page comes into view. `actions` is the header's trailing call to action.
 */
export function TabScreen({ tab, actions, actionsMenu, children }: TabScreenProps) {
  return (
    <TabChrome tab={tab}>
      {actions ? <PageHeaderActions actions={actions} menu={actionsMenu} /> : null}
      <TabScrollContent>{children}</TabScrollContent>
    </TabChrome>
  );
}

function PageHeaderActions({ actions, menu }: { actions: HeaderAction[]; menu?: HeaderActionsMenu }) {
  useHeaderActions(actions, menu);
  return null;
}

/** Inside TabChrome, so its scrolling can collapse the large title and hide the navigation bar while scrolling down. */
function TabScrollContent({ children }: { children: ReactNode }) {
  const endReached = useEndReached();
  const navBar = useTabNavBar();
  const tabScroll = useTabScroll(endReached.scrollProps.onScroll);
  return (
    <View style={styles.area}>
      <Animated.ScrollView
        {...endReached.scrollProps}
        {...tabScroll.scrollProps}
        // 24dp clear of the header (or its sub-tabs), as on Overview.
        contentContainerStyle={[styles.content, { paddingTop: tabScroll.contentTop + 24, paddingBottom: 32 + navBar.height }]}
        keyboardShouldPersistTaps="handled">
        <EndReachedProvider value={endReached.value}>
          <View style={styles.stack}>
            {children}
          </View>
        </EndReachedProvider>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1 },
  content: { padding: 16 },
  // Sections of a page (e.g. summary cards, toolbar, listing) are 24dp apart.
  stack: { gap: 24 },
});
