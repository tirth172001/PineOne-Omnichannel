import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';
import { CHART_ACCENT_COLOR, type DistributionRow, formatCount, formatInr, type MetricMode } from '@/data/overview';

import { DimmedDecimalAmount } from '../overview-card';

import { HatchedFill } from './hatch';

const BAR_HEIGHT = 16;

type DistributionBarsProps = {
  rows: DistributionRow[];
  metricMode: MetricMode;
  onPressRow?: (key: string) => void;
};

/**
 * Pay-mode breakdown (web: DistributionWidget): per mode, its icon and name,
 * the count or amount, its share of the total, and a hatched bar sized to that
 * share. Rows run edge to edge in the card with dividers between them.
 */
export function DistributionBars({ rows, metricMode, onPressRow }: DistributionBarsProps) {
  const theme = useTheme();
  const values = rows.map((row) => (metricMode === 'count' ? row.count : row.amount));
  const total = Math.max(
    values.reduce((sum, value) => sum + value, 0),
    1
  );

  return (
    <View>
      {rows.map((row, index) => {
        const percentage = Math.round((values[index] / total) * 100);
        return (
          <Fragment key={row.key}>
            {index > 0 ? <Divider /> : null}
            <TouchableRipple
              onPress={onPressRow ? () => onPressRow(row.key) : undefined}
              accessibilityRole="button"
              accessibilityLabel={`${row.label}: ${metricMode === 'count' ? `${row.count} transactions` : formatInr(row.amount)}, ${percentage}%`}
              borderless
              style={styles.row}>
              <View style={styles.rowContent}>
                <View style={styles.rowHeader}>
                  <View style={styles.label}>
                    <Icon source={row.icon} size={20} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodyMedium">{row.label}</Text>
                  </View>
                  <View style={styles.value}>
                    {metricMode === 'count' ? (
                      <Text variant="bodyMedium" style={styles.tabular}>
                        {formatCount(row.count)} Transactions
                      </Text>
                    ) : (
                      <DimmedDecimalAmount value={formatInr(row.amount)} size="inline" />
                    )}
                    <Text variant="labelMedium" style={[styles.tabular, { color: theme.colors.onSurfaceVariant }]}>
                      {percentage}%
                    </Text>
                    <Icon source="caret-right" size={16} color={theme.colors.onSurfaceVariant} />
                  </View>
                </View>
                <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <View style={[styles.fill, { width: `${Math.max(2, percentage)}%` }]}>
                    <HatchedFill color={CHART_ACCENT_COLOR} />
                  </View>
                </View>
              </View>
            </TouchableRipple>
          </Fragment>
        );
      })}
    </View>
  );
}

// Rows span the card's full width (gap 0), so they share its radius; the bar
// track sits 16dp inside a row.
const ROW_RADIUS = concentric(Shape.max, 0);
const TRACK_RADIUS = concentric(ROW_RADIUS, 16, BAR_HEIGHT);

const styles = StyleSheet.create({
  row: { borderRadius: ROW_RADIUS },
  rowContent: { gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  rowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  label: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  value: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tabular: { fontVariant: ['tabular-nums'] },
  track: { height: BAR_HEIGHT, borderRadius: TRACK_RADIUS, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: TRACK_RADIUS, overflow: 'hidden' },
});
