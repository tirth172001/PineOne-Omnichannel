import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import Svg, { Circle, Defs } from 'react-native-svg';

import { Fonts } from '@/constants/theme';
import { CHART_ACCENT_COLOR, DEVICE_SECONDARY_COLOR, type DistributionRow, type MetricMode } from '@/data/overview';

import { HatchPattern, useSvgId } from './hatch';

const SIZE = 152;
const STROKE = 16;
const GAP = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Web: the accent green alternating with the brand primary so the two segments read apart. */
const SEGMENT_COLORS = [CHART_ACCENT_COLOR, DEVICE_SECONDARY_COLOR];

/**
 * Devices distribution as a hatched donut (web: DeviceDonutChart) with a
 * legend of each device's share. The web highlights a segment on hover; here
 * tapping a legend entry (or tapping the ring to step through them) highlights
 * it and shows its share in the middle. Taps are handled by React Native
 * pressables, not SVG onPress, which leaks touch props into the DOM on web.
 */
export function DeviceDonut({ rows, metricMode }: { rows: DistributionRow[]; metricMode: MetricMode }) {
  const theme = useTheme();
  const patternPrefix = useSvgId('donut');
  const [active, setActive] = useState<number | null>(null);
  const values = rows.map((row) => (metricMode === 'count' ? row.count : row.amount));
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  const percentages = values.map((value) => Math.round((value / total) * 100));

  const segments = rows.map((row, index) => {
    const fraction = values[index] / total;
    // Arc length of every segment before this one.
    const start = values.slice(0, index).reduce((sum, value) => sum + value, 0) / total;
    return {
      key: row.key,
      dash: Math.max(0, fraction * CIRCUMFERENCE - GAP),
      offset: -start * CIRCUMFERENCE,
      patternId: `${patternPrefix}-${index}`,
    };
  });
  const toggle = (index: number) => setActive((current) => (current === index ? null : index));
  // Tapping the ring steps through the segments, then back to none.
  const cycle = () => setActive((current) => (current === null ? 0 : current + 1 < rows.length ? current + 1 : null));

  return (
    <View style={styles.container}>
      <Pressable
        onPress={cycle}
        accessibilityRole="button"
        accessibilityLabel="Devices donut chart. Tap to step through devices."
        style={{ width: SIZE, height: SIZE }}>
        {/* Start at 12 o'clock, like the web's -rotate-90. */}
        <View style={styles.rotated}>
          <Svg width={SIZE} height={SIZE}>
            <Defs>
              {segments.map((segment, index) => (
                <HatchPattern key={segment.patternId} id={segment.patternId} color={SEGMENT_COLORS[index % SEGMENT_COLORS.length]} />
              ))}
            </Defs>
            <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke={theme.colors.surfaceVariant} strokeWidth={STROKE} />
            {segments.map((segment, index) => (
              <Circle
                key={segment.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={`url(#${segment.patternId})`}
                strokeWidth={STROKE}
                strokeDasharray={`${segment.dash} ${CIRCUMFERENCE - segment.dash}`}
                strokeDashoffset={segment.offset}
                opacity={active === null || active === index ? 1 : 0.45}
              />
            ))}
          </Svg>
        </View>
        <View pointerEvents="none" style={styles.center}>
          {active !== null ? (
            <>
              <Text style={[styles.centerLabel, { color: theme.colors.onSurfaceVariant }]}>{rows[active].label}</Text>
              <Text style={styles.centerValue}>{percentages[active]}%</Text>
            </>
          ) : null}
        </View>
      </Pressable>

      <View style={styles.legend}>
        {rows.map((row, index) => (
          <Pressable
            key={row.key}
            onPress={() => toggle(index)}
            accessibilityRole="button"
            accessibilityLabel={`${row.label} ${percentages[index]}%`}
            style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }]} />
            <Icon source={row.icon} size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium">{row.label}</Text>
            <Text variant="bodyMedium" style={[styles.percent, { color: theme.colors.onSurfaceVariant }]}>
              {percentages[index]}%
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 20, paddingVertical: 8 },
  rotated: { transform: [{ rotate: '-90deg' }] },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: { fontFamily: Fonts.medium, fontSize: 11, lineHeight: 14 },
  centerValue: { fontFamily: Fonts.semiBold, fontSize: 20, lineHeight: 26 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 20, rowGap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  percent: { fontFamily: Fonts.regular, fontVariant: ['tabular-nums'] },
});
