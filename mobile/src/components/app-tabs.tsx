import { type Href, router, Slot, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, type NativeScrollEvent, type NativeSyntheticEvent, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { HeaderActionsProvider, HeaderActionsSlot, useHeaderActionsStore } from '@/components/header-actions';
import { useAiNudges, WhatsNew } from '@/components/whats-new';
import { AppHeader, BackButton, useCollapsingHeader } from '@/components/page-header';
import { ScopeIntroProvider, useScopeLine } from '@/components/scope-intro';
import { ScopeSwitcherProvider, useOpenScopeSwitcher } from '@/components/scope-switcher';
import { ScreenTabs } from '@/components/screen-tabs';
import { ProfilePanel } from '@/components/profile-panel';
import { ProfileNavContext, useProfileNav } from '@/components/profile-return';
import { ShellTabsProvider, useShellTabsConfig } from '@/components/shell-tabs';
import { NavigationBar, type NavigationBarDestination } from '@/components/material3/navigation-bar';
import { CURRENT_USER } from '@/data/businesses';
import { AI_FIRST_NAV, APP_PAGE_LAYOUT } from '@/constants/experiments';
import { useNotifications } from '@/data/notifications';
import { useBusiness } from '@/hooks/use-business';
import { ToastProvider } from '@/hooks/use-toast';

type TabItem = NavigationBarDestination & {
  href: Href & string;
  /** The page's title, when the nav label is a short form of it. */
  title?: string;
  /** A shorter label for the bar's fourth slot, which is narrower than the expanded grid's cells. */
  slotLabel?: string;
  /** The page's data follows the global store / channel scope, shown under its title. */
  scoped?: boolean;
};

/** The design's nav glyphs (Figma "Reicon", Bottom nav 7110:116411), shown on the app pages (APP_PAGE_LAYOUT). */
const navSvg = (icon: number, focused: number) => (APP_PAGE_LAYOUT ? { icon, focused } : undefined);
const NAV_SVG = {
  home: navSvg(require('../../assets/images/nav/home-outline.svg'), require('../../assets/images/nav/home-filled.svg')),
  wallet: navSvg(require('../../assets/images/nav/wallet-money-outline.svg'), require('../../assets/images/nav/wallet-money-filled.svg')),
  bank: navSvg(require('../../assets/images/nav/bank-outline.svg'), require('../../assets/images/nav/bank-filled.svg')),
  support: navSvg(require('../../assets/images/nav/chat-line-outline.svg'), require('../../assets/images/nav/chat-line-filled.svg')),
  // No filled refunds or reports glyphs in the design yet: they keep the outline ones.
  refunds: navSvg(require('../../assets/images/nav/undo-outline.svg'), require('../../assets/images/nav/undo-outline.svg')),
  disputes: navSvg(require('../../assets/images/nav/judge-outline.svg'), require('../../assets/images/nav/judge-filled.svg')),
  // The Guide mark (the playground's guide-logo), one glyph for both states.
  guide: navSvg(require('../../assets/images/guide/guide-logo.svg'), require('../../assets/images/guide/guide-logo.svg')),
  reports: navSvg(require('../../assets/images/nav/document-text-outline.svg'), require('../../assets/images/nav/document-text-filled.svg')),
  // The web app's Pine AI agents mark (pine-agents-outline / -filled).
  agents: navSvg(require('../../assets/images/nav/agents-outline.svg'), require('../../assets/images/nav/agents-filled.svg')),
};

/** Every tab: the bar's fixed items and the modules, each of which can take the bar's swappable slot. */
const TABS = [
  { key: 'index', href: '/', label: 'Overview', icon: 'house', focusedIcon: 'house-fill', svg: NAV_SVG.home, scoped: true },
  { key: 'payments', href: '/payments', label: 'Payments', icon: 'wallet', focusedIcon: 'wallet-fill', svg: NAV_SVG.wallet, scoped: true },
  { key: 'settlements', href: '/settlements', label: 'Settlement', title: 'Settlements', icon: 'bank', focusedIcon: 'bank-fill', svg: NAV_SVG.bank, scoped: true },
  // Pine AI agents (web: Agents in the phone's bottom bar).
  { key: 'agents', href: '/agents', label: 'Agents', icon: 'squares-four', focusedIcon: 'squares-four-fill', svg: NAV_SVG.agents },
  { key: 'guide', href: '/guide', label: 'Guide', icon: 'sparkle', focusedIcon: 'sparkle-fill', svg: NAV_SVG.guide },
  { key: 'refunds', href: '/refunds', label: 'Refunds', icon: 'arrow-u-up-left', focusedIcon: 'arrow-u-up-left-fill', svg: NAV_SVG.refunds, scoped: true },
  { key: 'disputes', href: '/disputes', label: 'Disputes', icon: 'gavel', focusedIcon: 'gavel-fill', svg: NAV_SVG.disputes, scoped: true },
  { key: 'reports', href: '/reports', label: 'MPR', title: 'Reports', icon: 'file', focusedIcon: 'file-fill', svg: NAV_SVG.reports, scoped: true },
  { key: 'terminal-devices', href: '/terminal-devices', label: 'In-store devices', slotLabel: 'Devices', icon: 'cash-register', focusedIcon: 'cash-register-fill' },
  { key: 'payment-links', href: '/payment-links', label: 'Payment links', icon: 'link-simple', focusedIcon: 'link-simple-fill' },
  { key: 'stores', href: '/stores', label: 'Stores', title: 'Manage stores', icon: 'storefront', focusedIcon: 'storefront-fill' },
  { key: 'users', href: '/users', label: 'Users', title: 'Users & roles', icon: 'users', focusedIcon: 'users-fill' },
  { key: 'support', href: '/support', label: 'Support', icon: 'chat-centered-text', focusedIcon: 'chat-centered-text-fill', svg: NAV_SVG.support },
  // The store's UPI QR (profile → Accept payments), a tab on GD Electronics' floating bar.
  { key: 'upi', href: '/upi', label: 'UPI', icon: 'qr-code', focusedIcon: 'qr-code' },
] as const satisfies readonly TabItem[];

type TabKey = (typeof TABS)[number]['key'];
type ModuleKey = TabKey;

/**
 * The bar: three fixed items, a swappable slot and More (five items at most,
 * user decision). Default (Figma 6470:1236): Overview, Payments, Settlement
 * fixed; the slot is one of Agents (default), Guide, Support, Refunds,
 * Disputes, MPR, and the expanded More shows the rest. With
 * AI_FIRST_NAV, Agents and Guide are fixed instead and Payments and
 * Settlement join the slot's pool (Payments by default), since Overview
 * already leads into both. The modules outside the pool (devices, stores,
 * users, payment links) keep their pages but are reached from the profile.
 */
type NavLayout = {
  /** Pages that always have the bar: its fixed items (and Guide's own button on the floating bar). */
  fixed: readonly TabKey[];
  /** The bar's items in order; 'slot' marks where the swappable module sits. More always ends the bar. */
  order: readonly (TabKey | 'slot')[];
  /** The modules that can take the slot (the first by default); the expanded More shows the rest. Empty: no slot and no More. */
  pool: readonly TabKey[];
  /** The floating bar (the Osmosis app's) instead of the docked one. */
  floating: boolean;
  /** Floating only: Guide on its own round orb beside the bar. */
  guide?: boolean;
  /** Labels this bar shows instead of the tabs' own (e.g. Home for Overview). */
  labels?: Partial<Record<TabKey, string>>;
};

const DOCKED_NAV: NavLayout = AI_FIRST_NAV
  ? {
      fixed: ['index', 'agents', 'guide'],
      order: ['index', 'agents', 'guide', 'slot'],
      pool: ['payments', 'settlements', 'support', 'refunds', 'disputes', 'reports'],
      floating: false,
    }
  : {
      fixed: ['index', 'payments', 'settlements'],
      order: ['index', 'payments', 'settlements', 'slot'],
      pool: ['agents', 'guide', 'support', 'refunds', 'disputes', 'reports'],
      floating: false,
    };

/** Most items the floating bar holds (More included): five across the screen, four beside the Guide orb. */
const FLOATING_CAPACITY = 5;
const FLOATING_CAPACITY_WITH_GUIDE = 4;

/**
 * Trial for merchants with `floatingNav`, after the Osmosis app: a floating
 * bar of Home (Overview), Agents, MPR, UPI and Support, with Guide on its own
 * orb beside the bar. Merchants without Guide or Agents drop them. When the
 * options fit the bar (five, or four beside the orb) they're all shown and
 * there's no More; otherwise the bar leads with the first ones, then the
 * swappable slot and More (an arrow), which grows the bar in place to the
 * slot's other modules, swapping exactly as on the docked bar.
 *   GD Electronics (Guide, Agents): Home, Agents, [MPR], More (UPI, Support) + orb.
 *   Croma (Agents, no Guide): Home, Agents, MPR, UPI, Support.
 *   Sangeetha Mobiles (neither): Home, MPR, UPI, Support.
 *   Poorvika (Guide, no Agents): Home, MPR, UPI, Support + orb.
 */
function floatingLayout({ guide, agents }: { guide: boolean; agents: boolean }): NavLayout {
  const options: TabKey[] = ['index', ...(agents ? (['agents'] as const) : []), 'reports', 'upi', 'support'];
  const capacity = guide ? FLOATING_CAPACITY_WITH_GUIDE : FLOATING_CAPACITY;
  const orb: TabKey[] = guide ? ['guide'] : [];
  // As the Osmosis app's bar.
  const labels = { index: 'Home' };
  if (options.length <= capacity) return { fixed: [...options, ...orb], order: options, pool: [], floating: true, guide, labels };
  // Room for the leading items, the slot and More.
  const lead = options.slice(0, capacity - 2);
  return { fixed: [...lead, ...orb], order: [...lead, 'slot'], pool: options.slice(capacity - 2), floating: true, guide, labels };
}

const FLOATING_LAYOUTS = new Map<string, NavLayout>();

/** The current merchant's bar. */
function useNavLayout() {
  const floating = useBusiness().organisation.floatingNav;
  if (!floating) return DOCKED_NAV;
  const key = `${floating.guide}-${floating.agents}`;
  if (!FLOATING_LAYOUTS.has(key)) FLOATING_LAYOUTS.set(key, floatingLayout(floating));
  return FLOATING_LAYOUTS.get(key)!;
}

/** Whether the current merchant has Agents and Guide (every merchant except some on the floating bar trial). */
export function useAiProducts() {
  const floating = useBusiness().organisation.floatingNav;
  return { agents: floating?.agents ?? true, guide: floating?.guide ?? true };
}

const ALL_TABS: readonly TabItem[] = TABS;
const tabFor = (key: TabKey): TabItem => TABS.find((item) => item.key === key)!;

const inBar = (layout: NavLayout, key: TabKey | undefined): key is TabKey => !!key && layout.pool.includes(key);

/** Modules the bar doesn't offer: reached from the profile, so their header leads with Back (see profile-return). */
const isProfilePage = (layout: NavLayout, key: TabKey) => !layout.fixed.includes(key) && !inBar(layout, key);

const OVERFLOW_TITLE = 'More';

/** Lets the tab chrome report its navigation bar's height, so toasts sit just above it. */
const NavBarHeightContext = createContext<(height: number) => void>(() => {});

/** The module in the navigation bar's fourth slot, shared by every tab's bar. */
const ModuleSlotContext = createContext<{ slot: ModuleKey; setSlot: (key: ModuleKey) => void }>({ slot: DOCKED_NAV.pool[0], setSlot: () => {} });

function moduleAt(pathname: string) {
  return TABS.find((item) => item.href === pathname)?.key;
}

/**
 * The app shell (Figma node 47:2153): the business / scope providers, the
 * active tab's stack and the app-wide toast. The chrome — the app header
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

// M3 emphasized easings, as the profile's own slide.
const PAGE_ENTER = { duration: 380, easing: Easing.bezier(0.05, 0.7, 0.1, 1) };
const PAGE_EXIT = { duration: 220, easing: Easing.bezier(0.3, 0, 0.8, 0.15) };

function Shell() {
  const pathname = usePathname();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [navBarHeight, setNavBarHeight] = useState(0);
  // The profile lives here, above the routes, so a page opened from it can slide in over it (see profile-return).
  const [profileOpen, setProfileOpen] = useState(false);
  const [profilePage, setProfilePage] = useState<string | null>(null);
  const [pageX] = useState(() => new Animated.Value(0));
  const openProfilePage = (href: string) => {
    setProfilePage(href);
    // Off to the right first, so the profile shows until the page comes in.
    pageX.setValue(width);
    router.push(href as never);
    Animated.timing(pageX, { toValue: 0, ...PAGE_ENTER, useNativeDriver: true }).start();
  };
  const backToProfile = () => {
    Animated.timing(pageX, { toValue: width, ...PAGE_EXIT, useNativeDriver: true }).start(() => {
      // The profile goes back on top (still open), then the route underneath returns to Overview.
      setProfilePage(null);
      router.navigate('/');
      pageX.setValue(0);
    });
  };
  const profileNav = {
    open: () => setProfileOpen(true),
    close: () => setProfileOpen(false),
    openPage: openProfilePage,
    page: profilePage,
    back: backToProfile,
  };
  // Whenever no profile page is showing, the routes sit in place (never left off-screen by an interrupted slide).
  useEffect(() => {
    if (profilePage === null) pageX.setValue(0);
  }, [profilePage, pageX]);
  // Android Back on the page opened from the profile slides it back out, as its Back button does.
  const onProfilePage = profilePage !== null && pathname === profilePage;
  useEffect(() => {
    if (!onProfilePage) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      backToProfile();
      return true;
    });
    return () => subscription.remove();
  });
  const navLayout = useNavLayout();
  const [slot, setSlot] = useState<ModuleKey>(() => {
    const opened = moduleAt(pathname);
    return inBar(navLayout, opened) ? opened : (navLayout.pool[0] ?? 'index');
  });
  // Opening a module by any route (e.g. an Overview quick action) also puts it in the slot.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    const opened = moduleAt(pathname);
    if (inBar(navLayout, opened)) setSlot(opened);
    // Left the profile's page some other way (not its Back): the profile is done with too.
    if (profilePage && pathname !== profilePage && !pathname.startsWith(`${profilePage}/`)) {
      setProfilePage(null);
      setProfileOpen(false);
      pageX.setValue(0);
    }
  }
  // Tab roots show the navigation bar; inner pages (anything below a tab's root) don't.
  const isTabRoot = ALL_TABS.some((item) => item.href === pathname);
  // /theme-preview is a dev-only design-system reference, not part of the tab flow.
  if (pathname === '/theme-preview') return <Slot />;
  // Logging in sits outside the shell: no header, no navigation bar, no profile.
  if (pathname === '/login')
    return (
      // Above the login footer (terms + Continue).
      <ToastProvider bottomOffset={104}>
        <Slot />
      </ToastProvider>
    );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ModuleSlotContext.Provider value={{ slot, setSlot }}>
        <NavBarHeightContext.Provider value={setNavBarHeight}>
          <ToastProvider bottomOffset={isTabRoot ? navBarHeight : 0}>
            <ProfileNavContext.Provider value={profileNav}>
              {/* Once a session, the first page that follows the scope opens on it (see scope-intro.tsx). */}
              <ScopeIntroProvider scopedPage={ALL_TABS.some((item) => item.href === pathname && item.scoped)} allowAllChannels={pathname === '/'}>
                <Animated.View style={[styles.page, { transform: [{ translateX: pageX }] }]}>
                  <Slot />
                </Animated.View>
              </ScopeIntroProvider>
              {/* Over the page while open; under the page opened from it, which slides in on top. */}
              <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { zIndex: profilePage ? 0 : 2 }]}>
                <ProfilePanel visible={profileOpen} covered={profilePage !== null} onDismiss={() => setProfileOpen(false)} />
              </View>
            </ProfileNavContext.Provider>
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
  /** The page's scroll offset. */
  scrollY: Animated.Value;
  /** The header's height (status bar included), which sits over the page. */
  height: number;
  /** The sub-tabs' height, if the page has any: they sit under the header. */
  tabsHeight: number;
};

const TabHeaderContext = createContext<TabHeader>({ scrollY: new Animated.Value(0), height: 0, tabsHeight: 0 });

/**
 * For content on a tab page that responds to its layout or scrolling (e.g. a
 * hero sized to half the screen that drifts as the page scrolls): the header's
 * height and the page's scroll offset.
 */
export function useTabLayout() {
  const header = useContext(TabHeaderContext);
  return { headerHeight: header.height + header.tabsHeight, scrollY: header.scrollY };
}

/**
 * For a tab page's scroll view (an Animated.ScrollView): feeds the scroll
 * offset to the navigation bar. `contentTop` is the top padding that clears
 * the header and its sub-tabs, if the page has any.
 */
export function useTabScroll(listener?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void) {
  const navBar = useTabNavBar();
  const header = useContext(TabHeaderContext);
  return {
    contentTop: header.height + header.tabsHeight,
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
 * A tab's root screen chrome: the header, the page, and the navigation bar.
 * The header (AppHeader, Figma 6470:982) leads with the user on Overview and
 * ends with their avatar (the profile panel, where notifications are); on the other tabs, with the page's name, and ends
 * with the page's own actions registered via useHeaderActions. Under either,
 * the store / channel scope opens the switcher (the organisation on pages that
 * don't follow the scope). Sub-tabs registered via useShellTabs sit under the
 * header. The bar overlays the bottom of the
 * page and slides away while the page scrolls down, returning on scroll up or
 * at the top (user decision). Its last item expands it in place to every
 * other module; picking one opens it once the bar has settled.
 */
export function TabChrome({ tab, children }: { tab: TabKey; children: ReactNode }) {
  const theme = useTheme();
  const business = useBusiness();
  const openScopeSwitcher = useOpenScopeSwitcher();
  const notifications = useNotifications();
  const screenTabs = useShellTabsConfig();
  const reportNavBarHeight = useContext(NavBarHeightContext);
  const { slot, setSlot } = useContext(ModuleSlotContext);
  const headerActions = useHeaderActionsStore();
  const item: TabItem = ALL_TABS.find((entry) => entry.key === tab) ?? tabFor('index');
  const navLayout = useNavLayout();
  const aiProducts = useAiProducts();
  const [navHeight, setNavHeight] = useState(0);
  // Pages opened from the profile (devices, stores, users, payment links) are inner pages: Back, no navigation bar.
  const showNav = !isProfilePage(navLayout, tab);
  const bottomInset = useSafeAreaInsets().bottom;
  useEffect(() => {
    if (!showNav) reportNavBarHeight(0);
  }, [showNav, reportNavBarHeight]);
  const [hidden] = useState(() => new Animated.Value(0));
  const [navHidden, setNavHidden] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);
  const profileNav = useProfileNav();
  const nudges = useAiNudges();
  const { markSeen } = nudges;
  useEffect(() => {
    if (tab === 'agents' || tab === 'guide') markSeen(tab);
  }, [tab, markSeen]);
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
    const module = key as TabKey;
    if (modulesOpen && inBar(navLayout, module)) {
      setSlot(module);
      setModulesOpen(false);
      if (module !== tab) setPicked(module);
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
  const slotModule: TabItem = tabFor(inBar(navLayout, slot) ? slot : (navLayout.pool[0] ?? 'index'));
  const slotItem = { ...slotModule, label: slotModule.slotLabel ?? slotModule.label };
  // Agents and Guide carry a dot until they've been opened once (see whats-new.tsx).
  const withDot = <T extends TabItem>(destination: T) => (nudges.isNew(destination.key) ? { ...destination, badge: true } : destination);

  const title = item.title ?? item.label;
  // Only pages whose data follows the channel / stores get the switcher; the others (e.g. Payment links) have nothing to switch.
  const scope = item.scoped ? business.scopeText(tab === 'index').split(' · ').join(' • ') : undefined;
  const hasTabs = screenTabs !== null;
  const scopeLine = useScopeLine(scope);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Without the bar, content only needs to clear the home indicator. */}
        <TabNavBarContext.Provider value={{ height: showNav ? navHeight : bottomInset, hidden, onScroll, openModules }}>
          <TabHeaderContext.Provider
            value={{ scrollY, height: header.barHeight, tabsHeight: hasTabs ? tabsHeight : 0 }}>
            <HeaderActionsProvider store={headerActions}>{children}</HeaderActionsProvider>
          </TabHeaderContext.Provider>
        </TabNavBarContext.Provider>
      </View>

      {/* Over the page, which scrolls up under it. */}
      <AppHeader
        onLayout={header.onBarLayout}
        // Modules outside the bar (devices, stores, users, payment links) are opened from the profile: Back returns there.
        leading={isProfilePage(navLayout, tab) ? <BackButton fallbackHref="/" /> : undefined}
        user={tab === 'index' ? CURRENT_USER : undefined}
        title={title}
        context={scope ?? business.organisation.name}
        onPressContext={scope ? openScopeSwitcher : undefined}
        contextAccessibilityLabel={scope ? `${scope}. Switch store or channel` : undefined}
        onPressAvatar={profileNav.open}
        unreadCount={tab === 'index' ? notifications.unread : 0}
        contextRef={scopeLine.ref}
        onContextLayout={scopeLine.onLayout}
        contextHighlight={scopeLine.highlight}
        // Overview ends with the profile (notifications are inside it); the other tabs show their page's own actions.
        trailing={tab === 'index' ? undefined : <HeaderActionsSlot store={headerActions} tinted />}
        // Support's (and Guide's) lime glow runs up behind the bar (Figma 7228:156447); the white comes in once the page scrolls.
        surfaceOpacity={
          (tab === 'support' || tab === 'guide') && APP_PAGE_LAYOUT ? scrollY.interpolate({ inputRange: [0, 48], outputRange: [0, 1], extrapolate: 'clamp' }) : 1
        }
      />
      {screenTabs ? (
        // Docked under the header, on the same white.
        <View
          onLayout={(event) => setTabsHeight(event.nativeEvent.layout.height)}
          style={[styles.tabs, { top: header.barHeight, backgroundColor: theme.colors.surface }]}>
          <ScreenTabs {...screenTabs} />
        </View>
      ) : null}
      {/* While expanded, a tap anywhere else closes the bar. */}
      {showNav && modulesOpen ? (
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setModulesOpen(false)} accessibilityLabel={`Close ${OVERFLOW_TITLE}`} />
      ) : null}
      {showNav ? (
        <Animated.View
          pointerEvents="box-none"
          style={[styles.navBar, { transform: [{ translateY: hidden.interpolate({ inputRange: [0, 1], outputRange: [0, navHeight] }) }] }]}>
          <NavigationBar
            destinations={navLayout.order.map((key) => (key === 'slot' ? slotItem : { ...tabFor(key), label: navLayout.labels?.[key] ?? tabFor(key).label })).map(withDot)}
            activeKey={picked ?? tab}
            onChange={navigateTo}
            // The floating bar (GD Electronics' trial) keeps Guide on its own round button beside it.
            variant={navLayout.floating ? 'floating' : 'docked'}
            detached={navLayout.guide ? withDot(tabFor('guide')) : undefined}
            // No More when every option fits the bar.
            overflow={navLayout.pool.length === 0 ? undefined : {
              title: OVERFLOW_TITLE,
              // Five to a row, so the grid takes the bar's short labels too (e.g. Devices).
              destinations: navLayout.pool.filter((key) => key !== slotModule.key).map(tabFor).map((module) =>
                withDot({ ...module, label: module.slotLabel ?? module.label }),
              ),
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
      ) : null}
      {/* Each launch, Overview (where the app always opens) announces Agents and Guide (see whats-new.tsx), for merchants that have both. */}
      {showNav && tab === 'index' && aiProducts.agents && aiProducts.guide ? <WhatsNew /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // The routes, over the profile while a page opened from it is showing (see Shell).
  page: { flex: 1, zIndex: 1 },
  // Overlays the page so it can slide away without leaving a gap.
  navBar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  tabs: { position: 'absolute', top: 0, left: 0, right: 0 },
  // Attached to the top edge: only the content-facing (bottom) corners are rounded.
});
