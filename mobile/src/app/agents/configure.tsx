import { useLocalSearchParams } from 'expo-router';

import { AgentConfigure } from '@/components/agents/agent-configure';
import { NotFound } from '@/components/shared/not-found';
import { TASK_CONFIG } from '@/data/agent-tasks';
import { getMarketplaceAgent } from '@/data/agents';

/** /agents/configure?agent=<id>: set a task agent up (stores, schedule, where results go), from its page's Configure task. */
export default function AgentConfigureScreen() {
  const { agent: agentId } = useLocalSearchParams<{ agent: string }>();
  const agent = getMarketplaceAgent(agentId);
  if (!agent || !TASK_CONFIG[agent.id]) return <NotFound title="Configure task" message="This agent doesn’t run as a scheduled task." fallbackHref="/agents" />;
  return <AgentConfigure agent={agent} />;
}
