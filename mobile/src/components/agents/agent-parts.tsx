import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { AppIcon, type IconName } from '@/components/icons';
import { DotStatusBadge, type DotTone } from '@/components/shared/status';
import { concentric, Shape } from '@/constants/shape';
import { Fonts, OPEN_DIGITS } from '@/constants/theme';
import type { AgentStatus, MarketplaceAgent } from '@/data/agents';

import { AgentThumbnail } from './agent-visuals';

/** The tinted icon circles beside an agent's figures (web: Tailwind 100 / 600 pairs, 15% washes on dark). */
const TONES = {
  pink: { light: ['#fce7f3', '#db2777'], dark: ['rgba(236, 72, 153, 0.15)', '#f9a8d4'] },
  amber: { light: ['#fef3c7', '#f59e0b'], dark: ['rgba(245, 158, 11, 0.15)', '#fcd34d'] },
  rose: { light: ['#ffe4e6', '#e11d48'], dark: ['rgba(244, 63, 94, 0.15)', '#fda4af'] },
} as const;
export type FigureTone = keyof typeof TONES;

/** A figure's icon in its tinted circle (web: a size-5 rounded-full chip). */
export function ToneIcon({ icon, tone, size = 20 }: { icon: IconName; tone: FigureTone; size?: number }) {
  const theme = useTheme();
  const [background, foreground] = TONES[tone][theme.dark ? 'dark' : 'light'];
  return (
    <View style={[styles.toneIcon, { width: size, height: size, borderRadius: size / 2, backgroundColor: background }]}>
      <AppIcon name={icon} size={size * 0.6} color={foreground} />
    </View>
  );
}

/** Users and rating under an agent's name (web: AgentStats). */
export function AgentStats({ agent }: { agent: MarketplaceAgent }) {
  const theme = useTheme();
  const muted = { color: theme.colors.onSurfaceVariant };
  return (
    <View style={styles.stats}>
      <View style={styles.stat}>
        <ToneIcon icon="users-fill" tone="pink" />
        <Text style={[styles.body, muted]}>{agent.users} users</Text>
      </View>
      <Text style={[styles.body, muted, styles.bullet]}>•</Text>
      <View style={styles.stat}>
        <ToneIcon icon="star-fill" tone="amber" />
        <Text style={[styles.body, muted]}>
          {agent.rating}/5 ({agent.reviewCount})
        </Text>
      </View>
    </View>
  );
}

const TILE = 80;

/** A Discover row (web: AgentMarketplaceCard): the tile, the name, two lines of what it does, then its figures. */
export function AgentMarketplaceRow({ agent, radius }: { agent: MarketplaceAgent; radius: number }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => router.push(`/agents/${agent.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${agent.name}. ${agent.cardDescription}`}
      style={({ pressed }) => [styles.row, { borderRadius: radius }, pressed && { backgroundColor: theme.colors.surfaceVariant }]}>
      <AgentThumbnail agentId={agent.id} size={TILE} radius={radius} glyphSize={36} />
      <View style={styles.rowText}>
        <View style={styles.nameBlock}>
          <Text style={[styles.name, { color: theme.colors.onSurface }]}>{agent.name}</Text>
          <Text numberOfLines={2} style={[styles.body, { color: theme.colors.onSurfaceVariant }]}>
            {agent.cardDescription}
          </Text>
        </View>
        <AgentStats agent={agent} />
      </View>
    </Pressable>
  );
}

const STATUS_TONE: Record<AgentStatus, DotTone> = { Live: 'success', Inactive: 'neutral', Paused: 'warning' };

/** An agent's state as the app's dot badge (web: StatusPill). */
export function AgentStatusBadge({ status }: { status: AgentStatus }) {
  return <DotStatusBadge label={status} tone={STATUS_TONE[status]} />;
}

/** A section heading inside an agents card (web: text-lg semibold). */
export function AgentsHeading({ children, trailing }: { children: ReactNode; trailing?: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.heading}>
      <Text style={[styles.headingText, { color: theme.colors.onSurface }]}>{children}</Text>
      {trailing}
    </View>
  );
}

/** Rows inside a card padded 12dp. */
export const AGENT_ROW_RADIUS = concentric(Shape.max, 12);

export const agentStyles = StyleSheet.create({
  card: { borderRadius: Shape.max, padding: 12, gap: 16 },
  body: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  bodyLong: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 22 },
  medium: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  small: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16 },
  title: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 24 },
  numbers: { fontVariant: OPEN_DIGITS },
});

const styles = StyleSheet.create({
  toneIcon: { alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bullet: { opacity: 0.6 },
  body: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, fontVariant: OPEN_DIGITS },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  rowText: { flex: 1, minWidth: 0, gap: 12 },
  nameBlock: { gap: 4 },
  name: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 24 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  headingText: { flex: 1, fontFamily: Fonts.semiBold, fontSize: 18, lineHeight: 26 },
});
