import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { AppIcon } from '@/components/icons';
import { SummaryCard } from '@/components/listing-hero/answer-hero';
import { ListingCard, ListingRows } from '@/components/listing-hero/listing-card';
import { DayGroupedList, groupByDay } from '@/components/shared/day-groups';
import { ListRow, ListRowLine, selectFilter, StatusStack } from '@/components/shared/listing';
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

import { AgentStatusBadge, agentStyles } from './agent-parts';
import { AgentThumbnail, HalftoneBackdrop, HeroShade } from './agent-visuals';

export const AGENT_TABS = [
  { key: 'my', label: 'My agents' },
  { key: 'discover', label: 'Discover agents' },
];

/** The page's summary card, as on the other pages: agents set up (of all on offer), then what's live and waiting. */
export function AgentsSummary() {
  const live = MY_AGENTS.filter((agent) => agent.status === 'Live').length;
  const waiting = PENDING_APPROVALS.length;
  return (
    <SummaryCard
      icon="squares-four"
      title="Agents set up"
      count={{ value: MY_AGENTS.length, of: MARKETPLACE_AGENTS.length }}
      line={`${live} live · ${waiting > 0 ? `${waiting} action${waiting > 1 ? 's' : ''} waiting on you` : 'nothing waiting on you'}`}
    />
  );
}

const CATEGORY_OPTIONS = DISCOVER_FILTERS.map((entry) => ({ value: entry.value, label: entry.label }));
const AGENT_NOUN = { one: 'agent', other: 'agents' };
const SECTION_LABELS = { recommended: 'Recommended for your business', featured: 'Featured' } as const;

/**
 * Discover agents (web: DiscoverAgents): the agent of the week, then the
 * catalogue as the app's listings are — search and Filters (Category), bands
 * for Recommended and Featured, and rows (the agent's tile, its name, users
 * and rating; its state when it's already yours).
 */
export function DiscoverAgents() {
  const theme = useTheme();
  const [filter, setFilter] = useState<DiscoverFilter>('all');
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const rows = MARKETPLACE_AGENTS.filter(
    (agent) =>
      (!query || `${agent.name} ${agent.cardDescription}`.toLowerCase().includes(query)) &&
      (filter === 'all' || (filter === 'recommended' ? agent.section === 'recommended' : agent.categories.includes(filter))),
  ).sort((a, b) => (a.section === b.section ? 0 : a.section === 'recommended' ? -1 : 1));
  const agentOfTheWeek = getMarketplaceAgent(AGENT_OF_THE_WEEK_ID);
  const muted = { color: theme.colors.onSurfaceVariant };

  return (
    <>
      {agentOfTheWeek && !query ? <AgentOfTheWeek agent={agentOfTheWeek} /> : null}
      <ListingCard
        belowHero
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search agents"
        filters={[selectFilter({ label: 'Category', options: CATEGORY_OPTIONS, value: filter, onApply: (value) => setFilter(value as DiscoverFilter) })]}
        totals={{ all: MARKETPLACE_AGENTS.length, shown: rows.length }}
        noun={AGENT_NOUN}>
        <DayGroupedList
          flat
          groups={groupByDay(rows, (agent) => SECTION_LABELS[agent.section])}
          noun={AGENT_NOUN}
          empty="No agents match. Try clearing the search or filters."
          renderRow={(agent) => {
            const mine = MY_AGENTS.find((entry) => entry.id === agent.id);
            return (
              <ListRow key={agent.id} icon={<AgentThumbnail agentId={agent.id} size={40} radius={20} glyphSize={18} />} onPress={() => router.push(`/agents/${agent.id}`)} accessibilityLabel={`${agent.name}, ${agent.users} users, rated ${agent.rating} of 5`}>
                <ListRowLine
                  left={
                    <>
                      <Text numberOfLines={1} style={[styles.rowTitle, { color: theme.colors.onSurface }]}>
                        {agent.name}
                      </Text>
                      <Text variant="bodySmall" numberOfLines={1} style={[muted, agentStyles.numbers]}>
                        {agent.users} users · ★ {agent.rating}/5 ({agent.reviewCount})
                      </Text>
                    </>
                  }
                  right={mine ? <AgentStatusBadge status={mine.status} /> : undefined}
                  centered
                />
              </ListRow>
            );
          }}
        />
      </ListingCard>
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

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Live', label: 'Live' },
  { value: 'Inactive', label: 'Inactive' },
] as const;

/**
 * My agents (web: MyAgents) as the app's listings are: search and Filters
 * (Status), then rows — the agent's tile, its name and what's waiting on you
 * (or what it does), and its state with the waiting count under it.
 */
export function MyAgents() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const query = search.trim().toLowerCase();
  const rows = MY_AGENTS.flatMap((entry) => {
    const agent = getMarketplaceAgent(entry.id);
    return agent && (!query || `${agent.name} ${agent.cardDescription}`.toLowerCase().includes(query)) && (status === 'all' || entry.status === status) ? [{ agent, status: entry.status }] : [];
  });
  const muted = { color: theme.colors.onSurfaceVariant };
  return (
    <ListingCard
      belowHero
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search my agents"
      filters={[selectFilter({ label: 'Status', options: STATUS_OPTIONS, value: status, onApply: setStatus })]}
      totals={{ all: MY_AGENTS.length, shown: rows.length }}
      noun={AGENT_NOUN}>
      <ListingRows empty={MY_AGENTS.length ? 'No agents match. Try clearing the search or filters.' : 'No agents set up yet. Find one in Discover agents.'}>
        {rows.map(({ agent, status: state }) => {
          const waiting = pendingApprovals(agent.id);
          return (
            <ListRow
              key={agent.id}
              icon={<AgentThumbnail agentId={agent.id} size={40} radius={20} glyphSize={18} />}
              onPress={() => router.push(`/agents/${agent.id}`)}
              accessibilityLabel={`${agent.name}, ${state}${waiting.length ? `, ${waiting.length} waiting` : ''}`}>
              <ListRowLine
                left={
                  <>
                    <Text numberOfLines={1} style={[styles.rowTitle, { color: theme.colors.onSurface }]}>
                      {agent.name}
                    </Text>
                    <Text variant="bodySmall" numberOfLines={1} style={[muted, agentStyles.numbers]}>
                      {waiting.length ? `${waiting[0].title}${waiting.length > 1 ? ` + ${waiting.length - 1} more` : ''}` : agent.cardDescription}
                    </Text>
                  </>
                }
                right={<StatusStack status={<AgentStatusBadge status={state} />} note={waiting.length ? `${waiting.length} waiting` : undefined} />}
                centered
              />
            </ListRow>
          );
        })}
      </ListingRows>
    </ListingCard>
  );
}

const WHITE_90 = 'rgba(255, 255, 255, 0.9)';

const styles = StyleSheet.create({
  rowTitle: { fontFamily: Fonts.medium, fontSize: 16, lineHeight: 22 },
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
