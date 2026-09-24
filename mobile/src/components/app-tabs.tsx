import { router, Slot, usePathname } from 'expo-router';
import { createContext, type ReactNode, useContext, useState } from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppHeader } from '@/components/app-header';
import { ScopeSwitcherProvider, useOpenScopeSwitcher } from '@/components/scope-switcher';
import { ScreenTabs } from '@/components/screen-tabs';
import { ShellTabsProvider, useShellTabsConfig } from '@/components/shell-tabs';
import { ShellTopBar } from '@/components/shell-top-bar';
import { NavigationBar, type NavigationBarDestination } from '@/components/material3/navigation-bar';
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

/**
 * A tab's root screen chrome: the rounded top bar (the page name — or the
 * business on Overview — with the store / channel scope and switcher, plus any
 * sub-tabs registered via useShellTabs), the page, and the navigation bar.
 */
export function TabChrome({ tab, children }: { tab: TabKey; children: ReactNode }) {
  const theme = useTheme();
  const business = useBusiness();
  const openScopeSwitcher = useOpenScopeSwitcher();
  const screenTabs = useShellTabsConfig();
  const reportNavBarHeight = useContext(NavBarHeightContext);
  const item = TAB_ITEMS.find((entry) => entry.key === tab) ?? TAB_ITEMS[0];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ShellTopBar>
        <AppHeader
          organisationName={business.organisation.name}
          // Overview is titled with the business; the other tabs with their page name.
          title={tab === 'index' ? undefined : item.label}
          shopName={business.scopeText(tab === 'index')}
          organisationLogo={business.organisation.logo}
          onPressSwitcher={openScopeSwitcher}
        />
        {screenTabs ? <ScreenTabs {...screenTabs} /> : null}
      </ShellTopBar>
      <View style={{ flex: 1 }}>{children}</View>
      <View onLayout={(event) => reportNavBarHeight(event.nativeEvent.layout.height)}>
        <NavigationBar
          destinations={[...TAB_ITEMS]}
          activeKey={tab}
          onChange={(key) => router.navigate(TAB_ITEMS.find((entry) => entry.key === key)?.href ?? '/')}
        />
      </View>
    </View>
  );
}
