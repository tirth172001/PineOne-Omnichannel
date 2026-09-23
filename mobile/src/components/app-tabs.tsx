import { router, Slot, usePathname } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppHeader } from '@/components/app-header';
import { BusinessSwitcher } from '@/components/business-switcher';
import { ScreenTabs } from '@/components/screen-tabs';
import { ShellTabsProvider, useShellTabsConfig } from '@/components/shell-tabs';
import { ShellTopBar } from '@/components/shell-top-bar';
import { NavigationBar, type NavigationBarDestination } from '@/components/material3/navigation-bar';
import { CURRENT_USER, ORGANISATIONS } from '@/data/businesses';
import { useBusiness } from '@/hooks/use-business';

const TAB_ITEMS = [
  { key: 'index', href: '/', label: 'Overview', icon: 'house', focusedIcon: 'house-fill' },
  { key: 'payments', href: '/payments', label: 'Payments', icon: 'wallet', focusedIcon: 'wallet-fill' },
  { key: 'reports', href: '/reports', label: 'Reports', icon: 'file', focusedIcon: 'file-fill' },
  { key: 'support', href: '/support', label: 'Support', icon: 'chat-centered-text', focusedIcon: 'chat-centered-text-fill' },
  { key: 'more', href: '/more', label: 'More', icon: 'list', focusedIcon: 'list' },
] as const satisfies readonly (NavigationBarDestination & { href: string })[];

/**
 * The app shell (Figma node 47:2153): a rounded top bar (org/shop header plus
 * any sub-tabs the screen registers via useShellTabs), the active tab's screen,
 * and the M3 Expressive navigation bar. Navigation is driven by expo-router's
 * pathname rather than a react-navigation tab navigator.
 */
export default function AppTabs() {
  return (
    <ShellTabsProvider>
      <Shell />
    </ShellTabsProvider>
  );
}

function Shell() {
  const pathname = usePathname();
  const theme = useTheme();
  const business = useBusiness();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const screenTabs = useShellTabsConfig();
  // A tab owns its nested routes too (e.g. /payments/transactions/123 → Payments).
  const active =
    TAB_ITEMS.find((item) => item.href !== '/' && (pathname === item.href || pathname.startsWith(`${item.href}/`))) ??
    TAB_ITEMS[0];
  // Detail screens (anything below a tab's root) draw their own back-button header instead of the org header.
  const isDetailRoute = pathname !== active.href && pathname !== '/';
  // /theme-preview is a dev-only design-system reference, not part of the 5-tab
  // flow — no shell chrome on it.
  const isDevRoute = pathname === '/theme-preview';

  if (isDevRoute) return <Slot />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {isDetailRoute ? null : (
        <ShellTopBar>
          <AppHeader
            organisationName={business.organisation.name}
            shopName={business.scopeLabel}
            organisationLogo={business.organisation.logo}
            avatar={CURRENT_USER.avatar}
            onPressSwitcher={() => setSwitcherOpen(true)}
          />
          {screenTabs ? <ScreenTabs {...screenTabs} /> : null}
        </ShellTopBar>
      )}
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
      <NavigationBar
        destinations={[...TAB_ITEMS]}
        activeKey={active.key}
        onChange={(key) => router.navigate(TAB_ITEMS.find((item) => item.key === key)?.href ?? '/')}
      />
      <BusinessSwitcher
        visible={switcherOpen}
        onDismiss={() => setSwitcherOpen(false)}
        organisations={ORGANISATIONS}
        organisation={business.organisation}
        shopIds={business.shopIds}
        onSelectOrganisation={business.selectOrganisation}
        onSelectShop={business.selectShop}
        onSelectAllShops={() => business.setShopIds([])}
      />
    </View>
  );
}
