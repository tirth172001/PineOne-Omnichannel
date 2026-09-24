import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { RefundsView } from '@/components/payments/refunds-view';
import { SettlementsView } from '@/components/payments/settlements-view';
import { TransactionsView } from '@/components/payments/transactions-view';
import { EndReachedProvider, useEndReached } from '@/components/shared/lazy-list';
import { useShellTabs } from '@/components/shell-tabs';

const PAYMENT_TABS = [
  { key: 'transactions', label: 'Transactions' },
  { key: 'settlements', label: 'Settlements' },
  { key: 'refunds', label: 'Refunds' },
];

export default function PaymentsScreen() {
  // `?tab=settlements` etc. lets other screens (e.g. Overview's card links) open a specific sub-tab.
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const requestedKey = PAYMENT_TABS.some((t) => t.key === tab) ? tab : undefined;
  const [activeKey, setActiveKey] = useState(requestedKey ?? PAYMENT_TABS[0].key);
  // Follow a newly requested tab (adjusting state during render, not in an effect).
  const [lastRequestedKey, setLastRequestedKey] = useState(requestedKey);
  if (requestedKey !== lastRequestedKey) {
    setLastRequestedKey(requestedKey);
    if (requestedKey) setActiveKey(requestedKey);
  }
  // Sub-tabs render inside the shell's top bar, under the header.
  useShellTabs({ tabs: PAYMENT_TABS, activeKey, onChange: setActiveKey });
  const endReached = useEndReached();

  return (
    // Keyed by tab so each sub-tab starts at the top with its own state.
    <ScrollView key={activeKey} {...endReached.scrollProps} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Each list loads its next rows as the end of the page comes into view. */}
      <EndReachedProvider value={endReached.value}>
        {activeKey === 'settlements' ? <SettlementsView /> : activeKey === 'refunds' ? <RefundsView /> : <TransactionsView />}
      </EndReachedProvider>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
});
