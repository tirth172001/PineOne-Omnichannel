import { InnerPageStack } from '@/components/inner-page-stack';

/** Agents is a stack: My agents / Discover agents at /agents, with an agent's page pushed on top. */
export default function AgentsLayout() {
  return <InnerPageStack />;
}
