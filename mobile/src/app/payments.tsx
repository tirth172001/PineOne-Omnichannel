import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { PlaceholderScreen } from '@/components/placeholder-screen';
import { useShellTabs } from '@/components/shell-tabs';

const PAYMENT_TABS = [
  { key: 'transactions', label: 'Transactions', description: 'Every payment across channels, filterable by status and mode.' },
  { key: 'settlements', label: 'Settlements', description: 'Payouts to your bank account and their deductions.' },
  { key: 'refunds', label: 'Refunds', description: 'Refunds raised against transactions and their status.' },
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
  const active = PAYMENT_TABS.find((tab) => tab.key === activeKey) ?? PAYMENT_TABS[0];
  // Sub-tabs render inside the shell's top bar, under the header.
  useShellTabs({ tabs: PAYMENT_TABS, activeKey, onChange: setActiveKey });

  return <PlaceholderScreen title={active.label} description={active.description} />;
}
