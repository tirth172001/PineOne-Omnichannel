import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import type { StatusTone } from '@/data/common';

const PILL_HEIGHT = 24;

// Same tone colors as the web's StatusPill (Tailwind amber/emerald/sky/red 600).
const STATUS_TONE: Record<StatusTone, { icon: string; color: string }> = {
  processing: { icon: 'clock', color: '#d97706' },
  success: { icon: 'check-circle', color: '#059669' },
  initiated: { icon: 'record', color: '#0284c7' },
  failed: { icon: 'x-circle', color: '#dc2626' },
};

/** Tone colors for dot badges (web: bg-success / bg-warning / bg-destructive / bg-status-info / muted). */
export const DOT_COLORS = {
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  neutral: '#737373',
} as const;
export type DotTone = keyof typeof DOT_COLORS;

/** Outlined status label with a tone icon (web: StatusPill). */
export function StatusPill({ label, tone, radius }: { label: string; tone: StatusTone; radius: number }) {
  const theme = useTheme();
  const { icon, color } = STATUS_TONE[tone];
  return (
    <View
      style={[
        styles.pill,
        {
          borderRadius: Math.min(radius, PILL_HEIGHT / 2),
          borderColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.surface,
        },
      ]}>
      <Icon source={icon} size={12} color={color} />
      <Text variant="labelMedium" style={{ fontFamily: Fonts.regular, color: theme.colors.onSurface }}>
        {label}
      </Text>
    </View>
  );
}

/** Outlined status label with a coloured dot (web: RefundStatusBadge / settlement StatusBadge). */
export function DotStatusBadge({ label, tone, radius }: { label: string; tone: DotTone; radius: number }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.pill,
        styles.dotPill,
        {
          borderRadius: Math.min(radius, PILL_HEIGHT / 2),
          borderColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.surface,
        },
      ]}>
      <View style={[styles.dot, { backgroundColor: DOT_COLORS[tone] }]} />
      <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
        {label}
      </Text>
    </View>
  );
}

/** Outlined label without a status icon, e.g. the greeting's role badge (web: Badge variant="outline"). */
export function OutlineTag({ label, radius = Shape.small, muted = false }: { label: string; radius?: number; muted?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.pill,
        styles.tag,
        {
          borderRadius: Math.min(radius, PILL_HEIGHT / 2),
          borderColor: muted ? 'transparent' : theme.colors.outlineVariant,
          backgroundColor: muted ? theme.colors.surfaceVariant : 'transparent',
        },
      ]}>
      <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: PILL_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingLeft: 8,
    paddingRight: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dotPill: { gap: 6, paddingHorizontal: 10 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  tag: { paddingRight: 8 },
});
