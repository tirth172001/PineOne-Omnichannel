import { useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Polyline, Rect, Stop } from 'react-native-svg';

import { Fonts } from '@/constants/theme';
import { buildAxisTicks } from '@/data/common';

import { useSvgId } from './hatch';

const CHART_HEIGHT = 200;
const AXIS_WIDTH = 40;
const LABEL_HEIGHT = 18;

/** Compact axis labels (12.7K, 1.9L-style for large values) so ticks fit a phone width. */
function compact(value: number) {
  if (Math.abs(value) >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function useWidth() {
  const [width, setWidth] = useState(0);
  return { width, onLayout: (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width) };
}

type XYChartProps = {
  type: 'line' | 'area' | 'column';
  categories: string[];
  data: number[];
  /** Dashed comparison series (web: the "Compare" line). */
  compare?: number[];
  /** Tight y-range for small-variation series such as rates or minutes. */
  fitRange?: boolean;
};

/**
 * Line / area / column chart with an optional dashed comparison line — the
 * web draws these with Highcharts (web-only), so they're drawn here with SVG:
 * y-axis ticks and gridlines, primary series in the brand colour, comparison
 * in muted grey.
 */
export function XYChart({ type, categories, data, compare, fitRange = false }: XYChartProps) {
  const theme = useTheme();
  const gradientId = useSvgId('area');
  const { width, onLayout } = useWidth();
  const all = [...data, ...(compare ?? [])];
  const rawMax = Math.max(...all, 1);
  const rawMin = fitRange ? Math.min(...all) : 0;
  const ticks = fitRange
    ? [0, 1, 2, 3].map((index) => rawMin + ((rawMax - rawMin) * index) / 3)
    : buildAxisTicks(rawMax);
  const minValue = fitRange ? rawMin : 0;
  const maxValue = fitRange ? rawMax : ticks[ticks.length - 1] || 1;
  const plotWidth = Math.max(width - AXIS_WIDTH, 1);
  const step = plotWidth / categories.length;
  const x = (index: number) => AXIS_WIDTH + step * index + step / 2;
  const y = (value: number) => CHART_HEIGHT - ((value - minValue) / (maxValue - minValue || 1)) * (CHART_HEIGHT - 8);
  const points = (series: number[]) => series.map((value, index) => `${x(index)},${y(value)}`).join(' ');
  const primary = theme.colors.primary;

  return (
    <View onLayout={onLayout}>
      {width > 0 ? (
        <Svg width={width} height={CHART_HEIGHT + LABEL_HEIGHT}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={primary} stopOpacity={0.18} />
              <Stop offset="1" stopColor={primary} stopOpacity={0.02} />
            </LinearGradient>
          </Defs>
          {ticks.map((tick) => (
            <G key={tick}>
              <Line x1={AXIS_WIDTH} x2={width} y1={y(tick)} y2={y(tick)} stroke={theme.colors.outlineVariant} strokeWidth={1} />
            </G>
          ))}
          {type === 'column'
            ? data.map((value, index) => {
                const barWidth = Math.min(step * 0.5, 24);
                return (
                  <Rect
                    key={index}
                    x={x(index) - barWidth / 2}
                    y={y(value)}
                    width={barWidth}
                    height={CHART_HEIGHT - y(value)}
                    rx={3}
                    fill={primary}
                  />
                );
              })
            : null}
          {type === 'area' ? (
            <Path
              d={`M${x(0)},${CHART_HEIGHT} L${points(data).split(' ').join(' L')} L${x(data.length - 1)},${CHART_HEIGHT} Z`}
              fill={`url(#${gradientId})`}
            />
          ) : null}
          {type !== 'column' ? <Polyline points={points(data)} fill="none" stroke={primary} strokeWidth={1.8} /> : null}
          {compare ? (
            <Polyline points={points(compare)} fill="none" stroke={theme.colors.onSurfaceVariant} strokeWidth={1.6} strokeDasharray="2,4" />
          ) : null}
          {type !== 'column' ? data.map((value, index) => <Circle key={index} cx={x(index)} cy={y(value)} r={2.5} fill={primary} />) : null}
        </Svg>
      ) : (
        <View style={{ height: CHART_HEIGHT + LABEL_HEIGHT }} />
      )}
      {/* Axis and category labels as Text, so they use the app font. */}
      <View pointerEvents="none" style={[styles.axis, { height: CHART_HEIGHT }]}>
        {ticks.map((tick) => (
          <Text key={tick} style={[styles.tick, { top: y(tick) - 6, color: theme.colors.onSurfaceVariant }]}>
            {compact(tick)}
          </Text>
        ))}
      </View>
      <View pointerEvents="none" style={[styles.categories, { left: AXIS_WIDTH }]}>
        {categories.map((category) => (
          <Text key={category} style={[styles.category, { color: theme.colors.onSurfaceVariant }]}>
            {category}
          </Text>
        ))}
      </View>
    </View>
  );
}

/** Horizontal bar chart with category labels (web: Highcharts type "bar"). */
export function BarChart({ labels, data, unit = '%' }: { labels: string[]; data: number[]; unit?: string }) {
  const theme = useTheme();
  const max = Math.max(...data, 0.0001);
  return (
    <View style={styles.bars}>
      {labels.map((label, index) => (
        <View key={label} style={styles.barRow}>
          <View style={styles.barHeader}>
            <Text variant="bodySmall" style={styles.barLabel} numberOfLines={1}>
              {label}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {data[index]}
              {unit}
            </Text>
          </View>
          <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View style={[styles.fill, { width: `${Math.max(2, (data[index] / max) * 100)}%`, backgroundColor: theme.colors.primary }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const polar = (angle: number) => [cx + r * Math.cos(angle - Math.PI / 2), cy + r * Math.sin(angle - Math.PI / 2)];
  const [x1, y1] = polar(start);
  const [x2, y2] = polar(end);
  const large = end - start > Math.PI ? 1 : 0;
  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
}

/** Pie chart with a legend underneath (web: Highcharts type "pie"). */
export function PieChart({ labels, data }: { labels: string[]; data: number[] }) {
  const theme = useTheme();
  const colors = [theme.colors.primary, '#a9d977', theme.colors.tertiary, theme.colors.secondary, '#d9f99d', theme.colors.outline];
  const total = data.reduce((sum, value) => sum + value, 0) || 1;
  const size = 160;
  const slices = data.map((value, index) => {
    const start = (data.slice(0, index).reduce((sum, item) => sum + item, 0) / total) * Math.PI * 2;
    const end = start + (value / total) * Math.PI * 2;
    return { start, end, color: colors[index % colors.length] };
  });

  return (
    <View style={styles.pie}>
      <Svg width={size} height={size}>
        {slices.map((slice, index) =>
          slice.end - slice.start >= Math.PI * 2 - 0.0001 ? (
            <Circle key={index} cx={size / 2} cy={size / 2} r={size / 2} fill={slice.color} />
          ) : (
            <Path key={index} d={arcPath(size / 2, size / 2, size / 2, slice.start, slice.end)} fill={slice.color} stroke={theme.colors.surface} strokeWidth={1} />
          )
        )}
      </Svg>
      <View style={styles.legend}>
        {labels.map((label, index) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors[index % colors.length] }]} />
            <Text variant="bodySmall">
              {label} <Text style={{ color: theme.colors.onSurfaceVariant }}>{data[index]}%</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  axis: { position: 'absolute', left: 0, top: 0, width: AXIS_WIDTH - 6 },
  tick: { position: 'absolute', right: 0, fontSize: 10, lineHeight: 12, fontFamily: Fonts.regular },
  categories: { position: 'absolute', right: 0, bottom: 0, height: LABEL_HEIGHT, flexDirection: 'row' },
  category: { flex: 1, textAlign: 'center', fontSize: 10, lineHeight: 14, fontFamily: Fonts.regular },
  bars: { gap: 12 },
  barRow: { gap: 4 },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  barLabel: { flex: 1, fontFamily: Fonts.medium },
  track: { height: 12, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  pie: { alignItems: 'center', gap: 16 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 16, rowGap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
});
