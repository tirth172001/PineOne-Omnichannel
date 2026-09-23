import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { buildAxisTicks, CHART_ACCENT_COLOR, formatAxisValue, type MetricMode } from '@/data/overview';

import { HatchedFill } from './hatch';

const PLOT_HEIGHT = 220;
/** Headroom above the tallest bar for its value label (web: topPadding). */
const TOP_PADDING = 32;
const BAR_WIDTH = 16;
const AXIS_WIDTH = 40;

type TrendBarChartProps = {
  categories: string[];
  data: number[];
  metricMode: MetricMode;
  accentColor?: string;
};

/**
 * Vertical bar trend shared by Payment volume / Failed payments / Refunds /
 * Disputes (web: TrendBarChart): y-axis ticks, gridlines, one hatched bar per
 * day or 2-hour slot. The web shows a bar's value on hover; here a tap shows
 * it. With 12 hourly bars on a phone, every other x label is shown so they
 * don't collide.
 */
export function TrendBarChart({ categories, data, metricMode, accentColor = CHART_ACCENT_COLOR }: TrendBarChartProps) {
  const theme = useTheme();
  const [selected, setSelected] = useState<number | null>(null);
  const ticks = buildAxisTicks(Math.max(...data, 1));
  const axisMax = ticks[ticks.length - 1] || 1;
  const barArea = PLOT_HEIGHT - TOP_PADDING;
  const labelEvery = categories.length > 7 ? 2 : 1;

  return (
    <View style={styles.row}>
      <View style={[styles.axis, { height: PLOT_HEIGHT, paddingTop: TOP_PADDING }]}>
        {[...ticks].reverse().map((tick) => (
          <Text key={tick} style={[styles.tick, { color: theme.colors.onSurfaceVariant }]}>
            {formatAxisValue(tick, metricMode)}
          </Text>
        ))}
      </View>

      <View style={styles.plotColumn}>
        <View style={{ height: PLOT_HEIGHT }}>
          <View pointerEvents="none" style={[styles.grid, { top: TOP_PADDING }]}>
            {ticks.map((tick) => (
              <View key={tick} style={[styles.gridLine, { borderTopColor: theme.colors.outlineVariant }]} />
            ))}
          </View>
          <View style={styles.bars}>
            {data.map((value, index) => {
              const height = Math.max(2, Math.round((value / axisMax) * barArea));
              const active = selected === index;
              return (
                <Pressable
                  key={`${categories[index]}-${index}`}
                  onPress={() => setSelected(active ? null : index)}
                  accessibilityRole="button"
                  accessibilityLabel={`${categories[index]}: ${formatAxisValue(value, metricMode)}`}
                  style={styles.barSlot}>
                  {active ? (
                    <View style={[styles.valueLabel, { backgroundColor: theme.colors.inverseSurface }]}>
                      <Text style={[styles.valueLabelText, { color: theme.colors.inverseOnSurface }]}>
                        {formatAxisValue(value, metricMode)}
                      </Text>
                    </View>
                  ) : null}
                  <View style={[styles.bar, { height, opacity: selected === null || active ? 1 : 0.55 }]}>
                    <HatchedFill color={accentColor} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.xLabels}>
          {categories.map((category, index) => (
            <Text key={`${category}-${index}`} style={[styles.xLabel, { color: theme.colors.onSurfaceVariant }]}>
              {index % labelEvery === 0 ? category : ''}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  axis: { width: AXIS_WIDTH, justifyContent: 'space-between' },
  tick: { fontFamily: Fonts.regular, fontSize: 10, lineHeight: 12, textAlign: 'right', fontVariant: ['tabular-nums'] },
  plotColumn: { flex: 1 },
  grid: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'column-reverse', justifyContent: 'space-between' },
  gridLine: { borderTopWidth: StyleSheet.hairlineWidth },
  bars: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  barSlot: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  // Data mark, not a container: rounded top like the web's bars, at the minimum radius.
  bar: {
    width: BAR_WIDTH,
    borderTopLeftRadius: Shape.extraSmall,
    borderTopRightRadius: Shape.extraSmall,
    overflow: 'hidden',
  },
  valueLabel: { borderRadius: Shape.extraSmall, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 },
  valueLabelText: { fontFamily: Fonts.medium, fontSize: 10, lineHeight: 12 },
  xLabels: { flexDirection: 'row', gap: 4, marginTop: 6 },
  xLabel: { flex: 1, fontFamily: Fonts.regular, fontSize: 10, lineHeight: 12, textAlign: 'center' },
});
