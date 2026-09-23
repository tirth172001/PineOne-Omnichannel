import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Icon, Text, useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';

type Trend = {
  label: string;
  direction: 'up' | 'down';
  tone: 'success' | 'error';
};

type StatCardProps = {
  label: string;
  amount: string;
  caption?: string;
  trend?: Trend;
  linkLabel?: string;
  onPressLink?: () => void;
};

/**
 * Rounded stat card — Paper's Card (Material 3), themed on top per the Overview
 * screen's decisions, but structured to match the web version's actual layout
 * (components/home/business-health-card.tsx) exactly: a bordered header block
 * with the uppercase muted label, then a content block with the number, trend/
 * caption, and an inline text link — not a separate header-less card or a
 * Card.Actions footer bar, which the web version doesn't use either.
 */
export function StatCard({ label, amount, caption, trend, linkLabel, onPressLink }: StatCardProps) {
  const theme = useTheme();
  const trendColor = trend?.tone === 'error' ? theme.colors.error : theme.colors.tertiary;

  return (
    // elevation={0}: per the Figma app reference (node 63:11572), cards are flat
    // white against a grey page background — separation comes from that color
    // contrast alone, not a shadow/tonal-elevation overlay.
    <Card mode="elevated" elevation={0} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.outlineVariant }]}>
        <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
          {label.toUpperCase()}
        </Text>
      </View>
      <Card.Content style={styles.content}>
        <Text variant="headlineMedium">{amount}</Text>
        {trend ? (
          <View style={styles.trendRow}>
            <Icon source={trend.direction === 'up' ? 'trend-up' : 'trend-down'} size={14} color={trendColor} />
            <Text variant="bodySmall" style={{ color: trendColor }}>
              {trend.label}
            </Text>
          </View>
        ) : null}
        {caption ? (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {caption}
          </Text>
        ) : null}
        {linkLabel ? (
          <Pressable style={styles.link} onPress={onPressLink}>
            <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
              {linkLabel}
            </Text>
            <Icon source="arrow-up-right" size={14} color={theme.colors.primary} />
          </Pressable>
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Shape.max,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: {
    letterSpacing: 0.6,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
});
