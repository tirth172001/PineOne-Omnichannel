import { type Href, router, Slot, usePathname } from 'expo-router';
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { HeaderActionsProvider, HeaderActionsSlot, useHeaderActionsStore } from '@/components/header-actions';
import { HeaderControl, PageTitle, PageTopBar, ScopeSwitcherButton, useCollapsingHeader } from '@/components/page-header';
import { ScopeSwitcherProvider, useOpenScopeSwitcher } from '@/components/scope-switcher';
import { ScreenTabs } from '@/components/screen-tabs';
import { ShellTabsProvider, useShellTabsConfig } from '@/components/shell-tabs';
import { NavigationBar, type NavigationBarDestination } from '@/components/material3/navigation-bar';
import { Shape } from '@/constants/shape';
import { useBusiness } from '@/hooks/use-business';
import { ToastProvider } from '@/hooks/use-toast';

type TabItem = NavigationBarDestination & {
  href: Href & string;
  /** The page's header title, when the nav label is a short form of it. */
  title?: string;
  /** A shorter label for the bar's fourth slot, which is narrower than the expanded grid's cells. */
  slotLabel?: string;
  /** The page's data follows the global store / channel scope, shown under its title. */
  scoped?: boolean;
};

/** Always in the navigation bar. */
const FIXED_TABS = [
  { key: 'index', href: '/', label: 'Overview', icon: 'house', focusedIcon: 'house-fill', scoped: true },
  { key: 'payments', href: '/payments', label: 'Payments', icon: 'wallet', focusedIcon: 'wallet-fill', scoped: true },
  { key: 'settlements', href: '/settlements', label: 'Settlements', icon: 'bank', focusedIcon: 'bank-fill', scoped: true },
] as const satisfies readonly TabItem[];

/**
 * Every other module, in the web sidebar's groups (Payments, Products, Other).
 * They live behind the bar's expand button; whichever was opened last takes
 * the bar's fourth slot (Refunds until then).
 */
const MODULE_TABS = [
  { key: 'refunds', href: '/refunds', label: 'Refunds', icon: 'arrow-u-up-left', focusedIcon: 'arrow-u-up-left-fill', scoped: true },
  { key: 'disputes', href: '/disputes', label: 'Disputes', icon: 'gavel', focusedIcon: 'gavel-fill', scoped: true },
  { key: 'reports', href: '/reports', label: 'Reports', icon: 'file', focusedIcon: 'file-fill', scoped: true },
  { key: 'terminal-devices', href: '/terminal-devices', label: 'In-store devices', slotLabel: 'Devices', icon: 'cash-register', focusedIcon: 'cash-register-fill' },
  { key: 'payment-links', href: '/payment-links', label: 'Payment links', icon: 'link-simple', focusedIcon: 'link-simple-fill' },
  { key: 'checkout', href: '/checkout', label: 'Checkout', icon: 'palette', focusedIcon: 'palette-fill' },
  { key: 'stores', href: '/stores', label: 'Stores', title: 'Manage stores', icon: 'storefront', focusedIcon: 'storefront-fill' },
  { key: 'users', href: '/users', label: 'Users', title: 'Users & roles', icon: 'users', focusedIcon: 'users-fill' },
  { key: 'account-settings', href: '/account-settings', label: 'Settings', title: 'Account settings', icon: 'gear', focusedIcon: 'gear-fill' },
  { key: 'support', href: '/support', label: 'Support', icon: 'chat-centered-text', focusedIcon: 'chat-centered-text-fill' },
] as const satisfies readonly TabItem[];

const ALL_TABS: readonly TabItem[] = [...FIXED_TABS, ...MODULE_TABS];

type TabKey = (typeof FIXED_TABS)[number]['key'] | ModuleKey;
type ModuleKey = (typeof MODULE_TABS)[number]['key'];

const OVERFLOW_TITLE = 'More';

/** Lets the tab chrome report its navigation bar's height, so toasts sit just above it. */
const NavBarHeightContext = createContext<(height: number) => void>(() => {});

/** The module in the navigation bar's fourth slot, shared by every tab's bar. */
const ModuleSlotContext = createContext<{ slot: ModuleKey; setSlot: (key: ModuleKey) => void }>({ slot: 'refunds', setSlot: () => {} });

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

function moduleAt(pathname: string) {
  return MODULE_TABS.find((item) => item.href === pathname)?.key;
}

function Shell() {
  const pathname = usePathname();
  const theme = useTheme();
  const [navBarHeight, setNavBarHeight] = useState(0);
  const [slot, setSlot] = useState<ModuleKey>(() => moduleAt(pathname) ?? 'refunds');
  // Opening a module by any route (e.g. an Overview quick action) also puts it in the slot.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    const opened = moduleAt(pathname);
    if (opened) setSlot(opened);
  }
  // Tab roots show the navigation bar; inner pages (anything below a tab's root) don't.
  const isTabRoot = ALL_TABS.some((item) => item.href === pathname);
  // /theme-preview is a dev-only design-system reference, not part of the tab flow.
  if (pathname === '/theme-preview') return <Slot />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ModuleSlotContext.Provider value={{ slot, setSlot }}>
        <NavBarHeightContext.Provider value={setNavBarHeight}>
          <ToastProvider bottomOffset={isTabRoot ? navBarHeight : 0}>
            <Slot />
          </ToastProvider>
        </NavBarHeightContext.Provider>
      </ModuleSlotContext.Provider>
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
  /** Expands the bar to show every module (e.g. Overview's "View all" products). */
  openModules: () => void;
};

const TabNavBarContext = createContext<TabNavBar>({ height: 0, hidden: new Animated.Value(0), onScroll: () => {}, openModules: () => {} });

/** For a tab's scrolling content: hides the navigation bar on scroll down and brings it back on scroll up. */
export function useTabNavBar() {
  return useContext(TabNavBarContext);
}

type TabHeader = {
  /** The page's scroll offset, driving the large title's collapse. */
  scrollY: Animated.Value;
  /** The header row's height (status bar included), which floats over the page. */
  height: number;
  /** The sub-tabs' height, if the page has any: they rest under the large title. */
  tabsHeight: number;
  titleStyle?: Animated.WithAnimatedObject<object>;
  onTitleLayout: (event: LayoutChangeEvent) => void;
  title: string;
};

const TabHeaderContext = createContext<TabHeader>({
  scrollY: new Animated.Value(0),
  height: 0,
  tabsHeight: 0,
  onTitleLayout: () => {},
  title: '',
});

/**
 * For a tab page's scroll view (an Animated.ScrollView): feeds the scroll
 * offset to the collapsing header and the navigation bar. `contentTop` is the
 * top padding that clears the floating header; put <TabHero /> first.
 */
export function useTabScroll(listener?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void) {
  const navBar = useTabNavBar();
  const header = useContext(TabHeaderContext);
  return {
    contentTop: header.height,
    scrollProps: {
      scrollEventThrottle: 16,
      onScroll: Animated.event([{ nativeEvent: { contentOffset: { y: header.scrollY } } }], {
        useNativeDriver: true,
        listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
          listener?.(event);
          navBar.onScroll(event.nativeEvent.contentOffset.y);
        },
      }),
    },
  };
}

/**
 * For a tab page that draws its own hero instead of TabHero (Overview's
 * collected-today figure): pass these to it so it still collapses into the
 * header's small title as the page scrolls.
 */
export function useTabHeroCollapse() {
  const header = useContext(TabHeaderContext);
  return { style: header.titleStyle, onLayout: header.onTitleLayout };
}

/**
 * The page's large title, first thing in its scrolling content (the page
 * name). As the page scrolls it shrinks
 * and fades while the header's small title fades in, driven continuously by
 * the scroll position.
 */
export function TabHero() {
  const header = useContext(TabHeaderContext);
  return (
    <View>
      <PageTitle title={header.title} style={header.titleStyle} onLayout={header.onTitleLayout} />
      {/* The sub-tabs float here until they dock under the header. */}
      {/* (The title's -8dp bottom margin is given back here, as the docked tabs are placed from its height.) */}
      {header.tabsHeight ? <View style={{ height: header.tabsHeight + 8 }} /> : null}
    </View>
  );
}

/**
 * A tab's root screen chrome: the header, the page, and the navigation bar.
 * The header (see page-header.tsx) leads with the store / channel switcher and
 * ends with search and notifications on Overview, or the page's main action
 * registered via useHeaderActions; the page opens with its large title
 * (TabHero: the page name; Overview draws its own hero, see
 * useTabHeroCollapse). As that scrolls away, the
 * header's rounded surface fades in and the small title (with the scope under
 * it, still opening the switcher) takes the switcher's place, as on inner
 * pages. Sub-tabs registered via useShellTabs rest under the large title and
 * dock under the header. The bar overlays the bottom of the page and slides
 * away while the page scrolls down, returning on scroll up or at the top
 * (user decision). Its last item expands it in place to every module; picking
 * one puts it in the fourth slot, then opens it once the bar has settled.
 */
export function TabChrome({ tab, children }: { tab: TabKey; children: ReactNode }) {
  const theme = useTheme();
  const business = useBusiness();
  const openScopeSwitcher = useOpenScopeSwitcher();
  const screenTabs = useShellTabsConfig();
  const reportNavBarHeight = useContext(NavBarHeightContext);
  const { slot, setSlot } = useContext(ModuleSlotContext);
  const headerActions = useHeaderActionsStore();
  const item: TabItem = ALL_TABS.find((entry) => entry.key === tab) ?? FIXED_TABS[0];
  const [navHeight, setNavHeight] = useState(0);
  const [hidden] = useState(() => new Animated.Value(0));
  const [navHidden, setNavHidden] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);
  const header = useCollapsingHeader();
  const { scrollY } = header;
  const [tabsHeight, setTabsHeight] = useState(0);
  // A module picked from the expanded bar: shown as active right away, opened once the bar has collapsed.
  const [picked, setPicked] = useState<ModuleKey | null>(null);
  const lastOffset = useRef(0);
  useEffect(() => {
    Animated.timing(hidden, { toValue: navHidden ? 1 : 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [hidden, navHidden]);
  // Android Back closes the expanded bar before leaving the page.
  useEffect(() => {
    if (!modulesOpen) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setModulesOpen(false);
      return true;
    });
    return () => subscription.remove();
  }, [modulesOpen]);
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
  const openModules = () => {
    setNavHidden(false);
    setModulesOpen(true);
  };
  const navigateTo = (key: string) => {
    const module = MODULE_TABS.find((entry) => entry.key === key);
    if (modulesOpen && module) {
      setSlot(module.key);
      setModulesOpen(false);
      if (module.key !== tab) setPicked(module.key);
      return;
    }
    setModulesOpen(false);
    if (key !== tab) router.navigate(ALL_TABS.find((entry) => entry.key === key)?.href ?? '/');
  };
  const onModulesCollapsed = () => {
    if (!picked) return;
    setPicked(null);
    router.navigate(ALL_TABS.find((entry) => entry.key === picked)?.href ?? '/');
  };
  const slotModule: TabItem = MODULE_TABS.find((entry) => entry.key === slot) ?? MODULE_TABS[0];
  const slotItem = { ...slotModule, label: slotModule.slotLabel ?? slotModule.label };

  const title = item.title ?? item.label;
  // Only pages whose data follows the channel / stores get the switcher; the others (e.g. Payment links) have nothing to switch.
  const scope = item.scoped ? business.scopeText(tab === 'index') : undefined;
  const hasTabs = screenTabs !== null;
  const collapse = Math.max(header.titleHeight, 1);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1 }}>
        <TabNavBarContext.Provider value={{ height: navHeight, hidden, onScroll, openModules }}>
          <TabHeaderContext.Provider
            value={{
              scrollY,
              height: header.barHeight,
              tabsHeight: hasTabs ? tabsHeight : 0,
              titleStyle: header.titleStyle,
              onTitleLayout: header.onTitleLayout,
              title,
            }}>
            <HeaderActionsProvider store={headerActions}>{children}</HeaderActionsProvider>
          </TabHeaderContext.Provider>
        </TabNavBarContext.Provider>
      </View>

      {/* Floats over the page, so the large title scrolls up under it until its surface fades in. */}
      <PageTopBar
        onLayout={header.onBarLayout}
        leading={scope ? <ScopeSwitcherButton label={scope} onPress={openScopeSwitcher} /> : undefined}
        title={title}
        subtitle={scope}
        onPressTitle={scope ? openScopeSwitcher : undefined}
        titleAccessibilityLabel={scope ? `${title}, ${scope}. Switch store or channel` : undefined}
        replaceLeading
        // Overview: search (find a payment from anywhere, user decision) and notifications; other tabs show their page's main action.
        trailing={
          tab === 'index' ? (
            <>
              <HeaderControl
                icon="magnifying-glass"
                quiet
                accessibilityLabel="Find a payment"
                onPress={() => router.navigate({ pathname: '/payments', params: { search: String(Date.now()) } })}
              />
              <HeaderControl icon="bell" quiet accessibilityLabel="Notifications" />
            </>
          ) : (
            <HeaderActionsSlot store={headerActions} />
          )
        }
        collapsed={header.collapsed}
        surfaceOpacity={header.surfaceOpacity}
        roundedSurface={!hasTabs}
      />
      {screenTabs ? (
        // Rest under the large title, move up with the page, and dock under the header.
        <Animated.View
          onLayout={(event) => setTabsHeight(event.nativeEvent.layout.height)}
          style={[
            styles.tabs,
            {
              transform: [
                {
                  translateY: scrollY.interpolate({
                    inputRange: [0, collapse],
                    outputRange: [header.barHeight + header.titleHeight, header.barHeight],
                    extrapolateRight: 'clamp',
                  }),
                },
              ],
            },
          ]}>
          <Animated.View pointerEvents="none" style={[styles.surface, { backgroundColor: theme.colors.surface, opacity: header.surfaceOpacity }]} />
          <ScreenTabs {...screenTabs} />
        </Animated.View>
      ) : null}
      {/* While expanded, a tap anywhere else closes the bar. */}
      {modulesOpen ? (
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setModulesOpen(false)} accessibilityLabel={`Close ${OVERFLOW_TITLE}`} />
      ) : null}
      <Animated.View
        pointerEvents="box-none"
        style={[styles.navBar, { transform: [{ translateY: hidden.interpolate({ inputRange: [0, 1], outputRange: [0, navHeight] }) }] }]}>
        <NavigationBar
          destinations={[...FIXED_TABS, slotItem]}
          activeKey={picked ?? tab}
          onChange={navigateTo}
          overflow={{
            title: OVERFLOW_TITLE,
            destinations: [...MODULE_TABS],
            expanded: modulesOpen,
            onExpandedChange: setModulesOpen,
            onCollapsed: onModulesCollapsed,
          }}
          onRestingHeightChange={(height) => {
            setNavHeight(height);
            reportNavBarHeight(height);
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Overlays the page so it can slide away without leaving a gap.
  navBar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  tabs: { position: 'absolute', top: 0, left: 0, right: 0 },
  // Attached to the top edge: only the content-facing (bottom) corners are rounded.
  surface: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderBottomLeftRadius: Shape.max, borderBottomRightRadius: Shape.max },
});
