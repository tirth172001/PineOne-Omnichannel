import { useLocalSearchParams } from 'expo-router';

import { AgentDetail } from '@/components/agents/agent-detail';
import { NotFound } from '@/components/shared/not-found';
import { getMarketplaceAgent } from '@/data/agents';

/** /agents/[agentId] (web: /pine-ai/agents/[id]). */
export default function AgentDetailScreen() {
  const { agentId } = useLocalSearchParams<{ agentId: string }>();
  const agent = getMarketplaceAgent(agentId);
  if (!agent) return <NotFound title="Agent" message={`No agent with ID ${agentId}.`} fallbackHref="/agents" />;
  return <AgentDetail key={agent.id} agent={agent} />;
}
