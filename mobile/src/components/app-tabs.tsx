import { router, Slot, usePathname } from 'expo-router';
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppHeader, NotificationsButton } from '@/components/app-header';
import { HeaderActionsProvider, HeaderActionsSlot, useHeaderActionsStore } from '@/components/header-actions';
import { ScopeSwitcherProvider, useOpenScopeSwitcher } from '@/components/scope-switcher';
import { ScreenTabs } from '@/components/screen-tabs';
import { ShellTabsProvider, useShellTabsConfig } from '@/components/shell-tabs';
import { ShellTopBar } from '@/components/shell-top-bar';
import { NavigationBar, type NavigationBarDestination } from '@/components/material3/navigation-bar';
import { CURRENT_USER } from '@/data/businesses';
import { useBusiness } from '@/hooks/use-business';
import { ToastProvider } from '@/hooks/use-toast';

const TAB_ITEMS = [
  { key: 'index', href: '/', label: 'Overview', icon: 'house', focusedIcon: 'house-fill' },
  { key: 'payments', href: '/payments', label: 'Payments', icon: 'wallet', focusedIcon: 'wallet-fill' },
  { key: 'settlements', href: '/settlements', label: 'Settlements', icon: 'bank', focusedIcon: 'bank-fill' },
  { key: 'refunds', href: '/refunds', label: 'Refunds', icon: 'arrow-u-up-left', focusedIcon: 'arrow-u-up-left-fill' },
  { key: 'more', href: '/more', label: 'More', icon: 'list', focusedIcon: 'list' },
] as const satisfies readonly (NavigationBarDestination & { href: string })[];

type TabKey = (typeof TAB_ITEMS)[number]['key'];

/** Lets the tab chrome report its navigation bar's height, so toasts sit just above it. */
const NavBarHeightContext = createContext<(height: number) => void>(() => {});

/**
 * The app shell (Figma node 47:2153): the business / scope providers, the
 * active tab's stack and the app-wide toast. The chrome — the rounded top bar
 * and the M3 Expressive navigation bar — is drawn by each tab's root screen
 * (TabChrome), so it slides away with the tab page when an inner page is
 * pushed. Navigation is driven by expo-router's pathname rather than a
 * react-navigation tab navigator.
 */
export default function AppTabs() {
  return (
    <ShellTabsProvider>
      <ScopeSwitcherProvider>
        <Shell />
      </ScopeSwitcherProvider>
    </ShellTabsProvider>
  );
}

function Shell() {
  const pathname = usePathname();
  const theme = useTheme();
  const [navBarHeight, setNavBarHeight] = useState(0);
  // Tab roots show the navigation bar; inner pages (anything below a tab's root) don't.
  const isTabRoot = TAB_ITEMS.some((item) => item.href === pathname);
  // /theme-preview is a dev-only design-system reference, not part of the tab flow.
  if (pathname === '/theme-preview') return <Slot />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <NavBarHeightContext.Provider value={setNavBarHeight}>
        <ToastProvider bottomOffset={isTabRoot ? navBarHeight : 0}>
          <Slot />
        </ToastProvider>
      </NavBarHeightContext.Provider>
    </View>
  );
}

/** Scroll distance (dp) in one direction before the navigation bar hides or returns. */
const NAV_SCROLL_THRESHOLD = 8;

type TabNavBar = {
  /** The navigation bar's height: pad scrolling content by it so the last rows clear the bar. */
  height: number;
  /** 0 while the bar is shown, 1 while it's hidden (animated). */
  hidden: Animated.Value;
  /** Call from the page's scroll handler with the vertical offset. */
  onScroll: (offsetY: number) => void;
};

const TabNavBarContext = createContext<TabNavBar>({ height: 0, hidden: new Animated.Value(0), onScroll: () => {} });

/** For a tab's scrolling content: hides the navigation bar on scroll down and brings it back on scroll up. */
export function useTabNavBar() {
  return useContext(TabNavBarContext);
}

/**
 * A tab's root screen chrome: the rounded top bar (the page name — or the
 * user and role on Overview — with the store / channel scope and switcher; on
 * the right, notifications on Overview or the page's actions registered via
 * useHeaderActions; plus any sub-tabs registered via useShellTabs), the page,
 * and the navigation bar. The bar overlays the bottom of the page and slides
 * away while the page scrolls down, returning on scroll up or at the top
 * (user decision).
 */
export function TabChrome({ tab, children }: { tab: TabKey; children: ReactNode }) {
  const theme = useTheme();
  const business = useBusiness();
  const openScopeSwitcher = useOpenScopeSwitcher();
  const screenTabs = useShellTabsConfig();
  const reportNavBarHeight = useContext(NavBarHeightContext);
  const headerActions = useHeaderActionsStore();
  const item = TAB_ITEMS.find((entry) => entry.key === tab) ?? TAB_ITEMS[0];
  const [navHeight, setNavHeight] = useState(0);
  const [hidden] = useState(() => new Animated.Value(0));
  const [navHidden, setNavHidden] = useState(false);
  const lastOffset = useRef(0);
  useEffect(() => {
    Animated.timing(hidden, { toValue: navHidden ? 1 : 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [hidden, navHidden]);
  const onScroll = (offsetY: number) => {
    const delta = offsetY - lastOffset.current;
    if (offsetY <= 0) {
      lastOffset.current = 0;
      setNavHidden(false);
      return;
    }
    if (Math.abs(delta) < NAV_SCROLL_THRESHOLD) return;
    lastOffset.current = offsetY;
    setNavHidden(delta > 0);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ShellTopBar>
        {/* Overview is titled with the signed-in user and their role; the other tabs with their page name. */}
        <AppHeader
          title={tab === 'index' ? CURRENT_USER.name : item.label}
          badge={tab === 'index' ? CURRENT_USER.roleLabel : undefined}
          scope={business.scopeText(tab === 'index')}
          onPressSwitcher={openScopeSwitcher}
          // Notifications only on Overview; other tabs show their page's own actions (user decision).
          actions={tab === 'index' ? <NotificationsButton /> : <HeaderActionsSlot store={headerActions} />}
        />
        {screenTabs ? <ScreenTabs {...screenTabs} /> : null}
      </ShellTopBar>
      <View style={{ flex: 1 }}>
        <TabNavBarContext.Provider value={{ height: navHeight, hidden, onScroll }}>
          <HeaderActionsProvider store={headerActions}>{children}</HeaderActionsProvider>
        </TabNavBarContext.Provider>
      </View>
      <Animated.View
        onLayout={(event) => {
          setNavHeight(event.nativeEvent.layout.height);
          reportNavBarHeight(event.nativeEvent.layout.height);
        }}
        style={[styles.navBar, { transform: [{ translateY: hidden.interpolate({ inputRange: [0, 1], outputRange: [0, navHeight] }) }] }]}>
        <NavigationBar
          destinations={[...TAB_ITEMS]}
          activeKey={tab}
          onChange={(key) => router.navigate(TAB_ITEMS.find((entry) => entry.key === key)?.href ?? '/')}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Overlays the page so it can slide away without leaving a gap.
  navBar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
