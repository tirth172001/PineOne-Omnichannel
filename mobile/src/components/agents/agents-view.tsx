import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { LocalSvg } from 'react-native-svg/css';

import { AppIcon } from '@/components/icons';
import { Tabs } from '@/components/material3/tabs';
import { SearchField } from '@/components/search-field';
import { DotStatusBadge } from '@/components/shared/status';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import {
  AGENT_CATEGORY_LABELS,
  AGENT_OF_THE_WEEK_ID,
  DISCOVER_FILTERS,
  type DiscoverFilter,
  getMarketplaceAgent,
  MARKETPLACE_AGENTS,
  type MarketplaceAgent,
  MY_AGENTS,
  PENDING_APPROVALS,
  pendingApprovals,
} from '@/data/agents';
import { useToast } from '@/hooks/use-toast';

import { AGENT_ROW_RADIUS, AgentMarketplaceRow, AgentsHeading, AgentStatusBadge, agentStyles } from './agent-parts';
import { AgentThumbnail, HalftoneBackdrop, HeroShade } from './agent-visuals';

const AGENTS_GLYPH = require('../../../assets/images/nav/agents-outline.svg');

export const AGENT_TABS = [
  { key: 'my', label: 'My agents' },
  { key: 'discover', label: 'Discover agents' },
];

/** The page header's figures (web: PageHeaderMeta), in a card above the tab's content. */
export function AgentsSummary() {
  const theme = useTheme();
  const live = MY_AGENTS.filter((agent) => agent.status === 'Live').length;
  const waiting = PENDING_APPROVALS.length;
  const muted = theme.colors.onSurfaceVariant;
  return (
    <View style={[agentStyles.card, styles.summary, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.meta}>
        <LocalSvg asset={AGENTS_GLYPH} width={16} height={16} color={muted} />
        <Text style={[agentStyles.body, agentStyles.numbers, { color: muted }]}>
          {MY_AGENTS.length} agents set up · {live} live
        </Text>
      </View>
      <View style={styles.meta}>
        <AppIcon name="clock" size={16} color={muted} />
        <Text style={[agentStyles.body, agentStyles.numbers, { color: muted }]}>
          {waiting > 0 ? `${waiting} action${waiting > 1 ? 's' : ''} waiting on you` : 'Nothing waiting on you'}
        </Text>
      </View>
    </View>
  );
}

/** Discover agents (web: DiscoverAgents): the agent of the week, then the catalogue by filter, searchable. */
export function DiscoverAgents() {
  const theme = useTheme();
  const [filter, setFilter] = useState<DiscoverFilter>('all');
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const matches = MARKETPLACE_AGENTS.filter((agent) => !query || `${agent.name} ${agent.cardDescription}`.toLowerCase().includes(query));
  const filterLabel = DISCOVER_FILTERS.find((entry) => entry.value === filter)?.label ?? '';
  const sections: { title: string; agents: MarketplaceAgent[] }[] = query
    ? [{ title: `Results for “${search.trim()}”`, agents: matches }]
    : filter === 'all'
      ? [
          { title: 'Recommended for your business', agents: matches.filter((agent) => agent.section === 'recommended') },
          { title: 'Featured', agents: matches.filter((agent) => agent.section === 'featured') },
        ]
      : filter === 'recommended'
        ? [{ title: 'Recommended for your business', agents: matches.filter((agent) => agent.section === 'recommended') }]
        : [{ title: filterLabel, agents: matches.filter((agent) => agent.categories.includes(filter)) }];
  const empty = sections.every((section) => section.agents.length === 0);
  const agentOfTheWeek = getMarketplaceAgent(AGENT_OF_THE_WEEK_ID);

  return (
    <>
      {agentOfTheWeek && !query ? <AgentOfTheWeek agent={agentOfTheWeek} /> : null}
      <View style={[styles.listCard, { backgroundColor: theme.colors.surface }]}>
        <Tabs
          variant="card"
          scrollable
          tabs={DISCOVER_FILTERS.map((entry) => ({ key: entry.value, label: entry.label }))}
          activeKey={filter}
          onChange={(key) => setFilter(key as DiscoverFilter)}
          tabRadius={concentric(Shape.max, 0)}
        />
        <View style={styles.listBody}>
          <SearchField value={search} onChangeText={setSearch} placeholder="Search agents" radius={concentric(Shape.max, 12)} />
          {empty ? (
            <Text style={[agentStyles.body, styles.empty, { color: theme.colors.onSurfaceVariant }]}>No agents match “{search.trim()}”.</Text>
          ) : (
            sections
              .filter((section) => section.agents.length > 0)
              .map((section) => (
                <View key={section.title} style={styles.section}>
                  <AgentsHeading>{section.title}</AgentsHeading>
                  <View style={styles.rows}>
                    {section.agents.map((agent) => (
                      <AgentMarketplaceRow key={agent.id} agent={agent} radius={AGENT_ROW_RADIUS} />
                    ))}
                  </View>
                </View>
              ))
          )}
        </View>
      </View>
    </>
  );
}

/** The featured hero (web: AgentOfTheWeek): the agent's wash, its tags, name and pitch, actions and a short chat. */
function AgentOfTheWeek({ agent }: { agent: MarketplaceAgent }) {
  const toast = useToast();
  const open = () => router.push(`/agents/${agent.id}`);
  // On a phone the web shows the chat's first two messages.
  const chat = (agent.detail.previewChat ?? agent.detail.preview.map((text) => ({ from: 'agent' as const, text }))).slice(0, 2);
  return (
    <View style={styles.hero}>
      <HalftoneBackdrop agentId={agent.id} />
      <HeroShade />
      <View style={styles.heroBadge}>
        <Text style={styles.heroBadgeText}>Agent of the week</Text>
      </View>
      <View style={styles.heroBody}>
        <View style={styles.heroText}>
          <AgentHeroTags agent={agent} />
          <Text onPress={open} accessibilityRole="link" style={styles.heroTitle}>
            {agent.name}
          </Text>
          <Text style={[agentStyles.body, styles.heroDescription]}>{agent.cardDescription}</Text>
          <View style={styles.heroActions}>
            <HeroButton label="Set up agent" icon="caret-down" filled onPress={open} />
            <HeroButton label="Watch demo" icon="play-fill" onPress={() => toast('A demo video isn’t available in this prototype yet')} />
          </View>
        </View>
        <View style={styles.chat}>
          {chat.map((message, index) => {
            const fromAgent = message.from === 'agent';
            const first = index === 0 || chat[index - 1].from !== message.from;
            return (
              <Text
                key={message.text}
                style={[
                  agentStyles.body,
                  styles.bubble,
                  fromAgent ? styles.agentBubble : styles.userBubble,
                  first && (fromAgent ? styles.agentBubbleFirst : styles.userBubbleFirst),
                  first && index > 0 && styles.bubbleGap,
                ]}>
                {message.text}
              </Text>
            );
          })}
        </View>
      </View>
    </View>
  );
}

/** The agent's categories as frosted tags on its hero (web: AgentHeroTags). */
export function AgentHeroTags({ agent }: { agent: MarketplaceAgent }) {
  return (
    <View style={styles.tags}>
      {agent.categories.map((category) => (
        <View key={category} style={styles.tag}>
          <Text style={styles.tagText}>{AGENT_CATEGORY_LABELS[category]}</Text>
        </View>
      ))}
    </View>
  );
}

/** A hero button: white (primary) or white-outlined, 36dp (web: Button on the hero). */
function HeroButton({ label, icon, filled = false, onPress }: { label: string; icon: 'caret-down' | 'play-fill'; filled?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.heroButton, filled ? styles.heroButtonFilled : styles.heroButtonOutline, pressed && { opacity: 0.85 }]}>
      <Text style={[styles.heroButtonLabel, { color: filled ? '#0c0c09' : '#ffffff' }]}>{label}</Text>
      <AppIcon name={icon} size={16} color={filled ? '#0c0c09' : '#ffffff'} />
    </Pressable>
  );
}

/** My agents (web: MyAgents): the set-up agents, each with its state and what's waiting on the merchant. */
export function MyAgents() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const agents = MY_AGENTS.flatMap((entry) => {
    const agent = getMarketplaceAgent(entry.id);
    return agent && (!query || `${agent.name} ${agent.cardDescription}`.toLowerCase().includes(query)) ? [{ agent, status: entry.status }] : [];
  });
  return (
    <>
      <View style={[agentStyles.card, { backgroundColor: theme.colors.surface }]}>
        <AgentsHeading>My agents</AgentsHeading>
        <SearchField value={search} onChangeText={setSearch} placeholder="Search agents" radius={concentric(Shape.max, 12)} />
      </View>
      {agents.length === 0 ? (
        <View style={[agentStyles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[agentStyles.body, styles.empty, { color: theme.colors.onSurfaceVariant }]}>
            {query ? `No agents match “${search.trim()}”.` : 'No agents set up yet. Find one in Discover agents.'}
          </Text>
        </View>
      ) : (
        agents.map(({ agent, status }) => <MyAgentCard key={agent.id} agent={agent} status={status} />)
      )}
    </>
  );
}

function MyAgentCard({ agent, status }: { agent: MarketplaceAgent; status: (typeof MY_AGENTS)[number]['status'] }) {
  const theme = useTheme();
  const waiting = pendingApprovals(agent.id);
  return (
    <Pressable
      onPress={() => router.push(`/agents/${agent.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${agent.name}, ${status}${waiting.length ? `, ${waiting.length} waiting` : ''}`}
      style={({ pressed }) => [styles.myCard, { backgroundColor: pressed ? theme.colors.surfaceVariant : theme.colors.surface }]}>
      <AgentThumbnail agentId={agent.id} size={78} radius={concentric(Shape.max, 12)} glyphSize={28} />
      <View style={styles.myText}>
        <View style={styles.myTop}>
          <Text style={[styles.myName, { color: theme.colors.onSurface }]}>{agent.name}</Text>
          <AgentStatusBadge status={status} />
        </View>
        <Text numberOfLines={2} style={[agentStyles.body, { color: theme.colors.onSurfaceVariant }]}>
          {agent.cardDescription}
        </Text>
        {waiting.length > 0 ? (
          <View style={styles.waiting}>
            <DotStatusBadge label={`${waiting.length} waiting`} tone="warning" />
            <Text numberOfLines={1} style={[agentStyles.body, agentStyles.numbers, styles.waitingText, { color: theme.colors.onSurface }]}>
              {waiting[0].title}
              {waiting.length > 1 ? <Text style={{ color: theme.colors.onSurfaceVariant }}> + {waiting.length - 1} more</Text> : null}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const WHITE_90 = 'rgba(255, 255, 255, 0.9)';

const styles = StyleSheet.create({
  summary: { gap: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  listCard: { borderRadius: Shape.max, overflow: 'hidden' },
  listBody: { padding: 12, gap: 24 },
  section: { gap: 16 },
  rows: { gap: 20 },
  empty: { paddingVertical: 32, textAlign: 'center' },
  hero: { borderRadius: Shape.max, overflow: 'hidden' },
  heroBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomRightRadius: Shape.max,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  heroBadgeText: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16, color: '#ffffff' },
  heroBody: { position: 'relative', paddingHorizontal: 20, paddingTop: 48, paddingBottom: 20, gap: 24 },
  heroText: { gap: 16 },
  heroTitle: { fontFamily: Fonts.semiBold, fontSize: 30, lineHeight: 36, letterSpacing: -0.4, color: '#ffffff' },
  heroDescription: { color: WHITE_90 },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 8 },
  heroButton: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 12, borderRadius: concentric(Shape.max, 4), borderWidth: 1 },
  heroButtonFilled: { backgroundColor: '#ffffff', borderColor: '#ffffff' },
  heroButtonOutline: { borderColor: 'rgba(255, 255, 255, 0.8)' },
  heroButtonLabel: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  chat: { gap: 8 },
  bubble: { maxWidth: '85%', paddingHorizontal: 16, paddingVertical: 10, borderRadius: Shape.max, overflow: 'hidden' },
  agentBubble: {
    alignSelf: 'flex-start',
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userBubble: { alignSelf: 'flex-end', color: '#0c0c09', backgroundColor: '#ffffff' },
  agentBubbleFirst: { borderTopLeftRadius: Shape.extraSmall },
  userBubbleFirst: { borderTopRightRadius: Shape.extraSmall },
  bubbleGap: { marginTop: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { height: 24, justifyContent: 'center', paddingHorizontal: 10, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.15)' },
  tagText: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16, color: '#ffffff' },
  myCard: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: Shape.max },
  myText: { flex: 1, minWidth: 0, gap: 6 },
  myTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  myName: { flex: 1, fontFamily: Fonts.medium, fontSize: 16, lineHeight: 24 },
  waiting: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4 },
  waitingText: { flex: 1, minWidth: 0 },
});
