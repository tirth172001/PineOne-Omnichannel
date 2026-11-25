import { useState } from 'react';

import { AGENT_TABS, AgentsSummary, DiscoverAgents, MyAgents } from '@/components/agents/agents-view';
import { useShellTabs } from '@/components/shell-tabs';
import { TabScreen } from '@/components/tab-screen';

/**
 * /agents (web: /pine-ai?view=tasks): Pine AI agents, as on the web's Agents
 * page. My agents / Discover agents dock under the header as the app's
 * sub-tabs; the header's figures sit in the first card.
 */
export default function AgentsScreen() {
  const [activeKey, setActiveKey] = useState('discover');
  useShellTabs({ tabs: AGENT_TABS, activeKey, onChange: setActiveKey });
  return (
    <TabScreen tab="agents">
      <AgentsSummary />
      {activeKey === 'my' ? <MyAgents /> : <DiscoverAgents />}
    </TabScreen>
  );
}
