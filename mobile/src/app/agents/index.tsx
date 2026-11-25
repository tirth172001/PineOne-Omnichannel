import { router } from 'expo-router';
import { useState } from 'react';

import { AGENT_TABS, AgentsSummary, DiscoverAgents, MyAgents } from '@/components/agents/agents-view';
import { useShellTabs } from '@/components/shell-tabs';
import { TabScreen } from '@/components/tab-screen';
import { formatCredits, useWallet } from '@/data/wallet';

/**
 * /agents (web: /pine-ai?view=tasks): Pine AI agents, as on the web's Agents
 * page. My agents / Discover agents dock under the header as the app's
 * sub-tabs; the header's figures sit in the first card, and the credits
 * balance (top right) opens the wallet.
 */
export default function AgentsScreen() {
  const [activeKey, setActiveKey] = useState('discover');
  useShellTabs({ tabs: AGENT_TABS, activeKey, onChange: setActiveKey });
  const { balance } = useWallet();
  return (
    <TabScreen
      tab="agents"
      // The credits wallet: the balance with a coin, top right (opens /agents/wallet).
      actions={[{ label: `Wallet, ${formatCredits(balance)} credits`, shortLabel: formatCredits(balance), icon: 'coins', onPress: () => router.push('/agents/wallet') }]}>
      <AgentsSummary />
      {activeKey === 'my' ? <MyAgents /> : <DiscoverAgents />}
    </TabScreen>
  );
}
