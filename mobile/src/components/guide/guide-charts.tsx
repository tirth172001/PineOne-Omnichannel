import { useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import Svg, { G, Line, Path, Text as SvgText, TSpan } from 'react-native-svg';

import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

// Guide's two charts, drawn to match the web Guide's Recharts versions
// (merchant-onboarding-omni components/guide/guide-cards.tsx): the payment
// method donut with labels outside on leader lines, and the monthly income
// trend line. Both scale from the web's own viewBoxes to the card's width.

const MAX_WIDTH = 374;

function useWidth() {
  const [width, setWidth] = useState(0);
  return { width, onLayout: (event: LayoutChangeEvent) => setWidth(Math.min(event.nativeEvent.layout.width, MAX_WIDTH)) };
}

/** The web's chart tile: muted fill, 6dp corners, 8dp padding (12 on top for the trend). */
function ChartTile({ children, topPadding = 8 }: { children: (width: number) => React.ReactNode; topPadding?: number }) {
  const theme = useTheme();
  const { width, onLayout } = useWidth();
  return (
    <View style={styles.frame} onLayout={onLayout}>
      <View style={[styles.tile, { backgroundColor: theme.colors.surface, paddingTop: topPadding, width: width || undefined }]}>
        {width ? children(width - 16) : null}
      </View>
    </View>
  );
}

// ---- Payment method split --------------------------------------------------

const SPLIT = [
  { name: 'UPI', value: 29.2, fill: '#8b8ff4' },
  { name: 'Credit card', value: 26.2, fill: '#4f46e5' },
  { name: 'Debit card', value: 18.5, fill: '#8188f7' },
  { name: 'EMI', value: 13.8, fill: '#3730a3' },
  { name: 'Cash', value: 12.3, fill: '#c7cbfb' },
];

// The web's viewBox (aspect 358 / 264) and margins (24 top and bottom, 56 either side).
const DONUT = { width: 358, height: 264, margin: { top: 24, right: 56, bottom: 24, left: 56 } };

const rad = (degrees: number) => (degrees * Math.PI) / 180;
/** A point at `radius` and `degrees` (counter-clockwise from 3 o'clock, as Recharts measures). */
const polar = (cx: number, cy: number, radius: number, degrees: number) => ({ x: cx + radius * Math.cos(-rad(degrees)), y: cy + radius * Math.sin(-rad(degrees)) });

function ringSlice(cx: number, cy: number, inner: number, outer: number, start: number, end: number) {
  // Clockwise from `start` to `end` (end < start), as the web's startAngle 90 → endAngle -270.
  const large = start - end > 180 ? 1 : 0;
  const a = polar(cx, cy, outer, start);
  const b = polar(cx, cy, outer, end);
  const c = polar(cx, cy, inner, end);
  const d = polar(cx, cy, inner, start);
  return `M${a.x},${a.y} A${outer},${outer} 0 ${large} 1 ${b.x},${b.y} L${c.x},${c.y} A${inner},${inner} 0 ${large} 0 ${d.x},${d.y} Z`;
}

const SPLIT_TOTAL = SPLIT.reduce((sum, slice) => sum + slice.value, 0);
/** Each slice's angles: clockwise from 12 o'clock (90°), as the web's startAngle 90 → endAngle -270. */
const SLICES = SPLIT.map((slice, index) => {
  const before = SPLIT.slice(0, index).reduce((sum, item) => sum + item.value, 0);
  const start = 90 - (before / SPLIT_TOTAL) * 360;
  const end = start - (slice.value / SPLIT_TOTAL) * 360;
  return { ...slice, start, end, mid: (start + end) / 2 };
});

export function GuideDonut() {
  const theme = useTheme();
  const { width: W, height: H, margin } = DONUT;
  const cx = margin.left + (W - margin.left - margin.right) / 2;
  const cy = margin.top + (H - margin.top - margin.bottom) / 2;
  const maxRadius = Math.min(W - margin.left - margin.right, H - margin.top - margin.bottom) / 2;
  const outer = maxRadius * 0.98;
  const inner = maxRadius * 0.58;

  return (
    <ChartTile>
      {(width) => (
        <Svg width={width} height={(width * H) / W} viewBox={`0 0 ${W} ${H}`}>
          {SLICES.map((slice) => (
            <Path key={slice.name} d={ringSlice(cx, cy, inner, outer, slice.start, slice.end)} fill={slice.fill} />
          ))}
          {SLICES.map((slice) => {
            const from = polar(cx, cy, outer, slice.mid);
            const to = polar(cx, cy, outer + 16, slice.mid);
            const angleRad = -rad(slice.mid);
            const x = cx + (outer + 22) * Math.cos(angleRad);
            const y = cy + (outer + 18) * Math.sin(angleRad);
            const anchor = x > cx ? 'start' : 'end';
            return (
              <G key={`${slice.name}-label`}>
                <Line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={theme.colors.onSurfaceVariant} strokeOpacity={0.4} />
                <SvgText x={x} y={y} textAnchor={anchor} fontSize={12} fontFamily={Fonts.regular} fill={theme.colors.onSurfaceVariant}>
                  <TSpan x={x}>{slice.name}</TSpan>
                  <TSpan x={x} dy={14} fontFamily={Fonts.semiBold} fill={theme.colors.onSurface}>
                    {`${slice.value}%`}
                  </TSpan>
                </SvgText>
              </G>
            );
          })}
        </Svg>
      )}
    </ChartTile>
  );
}

// ---- Monthly income trend --------------------------------------------------

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TREND = [7, 11, 12, 13, 13, 14, 15, 16, 16, 17, 17.4, 20];
const Y_TICKS = [0, 5, 10, 15, 20, 25];
const X_TICKS = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'];
const TREND_COLOR = '#2f6fed';

// The web's viewBox (aspect 358 / 250): margins 8 top, 16 right; a 36-wide y axis; the x axis's 30 at the bottom.
const TREND_BOX = { width: 358, height: 250, top: 8, right: 16, axis: 36, xAxis: 30 };

/** Recharts' "monotone" curve (monotone cubic interpolation in x). */
function monotonePath(points: { x: number; y: number }[]) {
  const n = points.length;
  const dx = points.slice(1).map((point, index) => point.x - points[index].x);
  const slope = points.slice(1).map((point, index) => (point.y - points[index].y) / dx[index]);
  const tangent = points.map((_, index) => {
    if (index === 0) return slope[0];
    if (index === n - 1) return slope[n - 2];
    const [a, b] = [slope[index - 1], slope[index]];
    if (a * b <= 0) return 0;
    const [h0, h1] = [dx[index - 1], dx[index]];
    return (3 * (h0 + h1)) / ((2 * h1 + h0) / a + (h1 + 2 * h0) / b);
  });
  let d = `M${points[0].x},${points[0].y}`;
  for (let index = 0; index < n - 1; index += 1) {
    const [p, q, h] = [points[index], points[index + 1], dx[index] / 3];
    d += ` C${p.x + h},${p.y + h * tangent[index]} ${q.x - h},${q.y - h * tangent[index + 1]} ${q.x},${q.y}`;
  }
  return d;
}

export function GuideTrend() {
  const theme = useTheme();
  const { width: W, height: H, top, right, axis, xAxis } = TREND_BOX;
  const left = axis;
  const bottom = H - xAxis;
  const x = (index: number) => left + (index * (W - right - left)) / (MONTHS.length - 1);
  const y = (value: number) => bottom - (value / 25) * (bottom - top);
  const line = monotonePath(TREND.map((value, index) => ({ x: x(index), y: y(value) })));

  return (
    <ChartTile topPadding={12}>
      {(width) => (
        <Svg width={width} height={(width * H) / W} viewBox={`0 0 ${W} ${H}`}>
          {Y_TICKS.map((tick) => (
            <G key={tick}>
              {tick > 0 ? <Line x1={left} x2={W - right} y1={y(tick)} y2={y(tick)} stroke={theme.colors.outlineVariant} /> : null}
              <SvgText x={left - 6} y={y(tick) + 4} textAnchor="end" fontSize={12} fontFamily={Fonts.regular} fill={theme.colors.onSurfaceVariant}>
                {tick === 0 ? '0' : `${tick}L`}
              </SvgText>
            </G>
          ))}
          <Line x1={left} x2={W - right} y1={bottom} y2={bottom} stroke={theme.colors.onSurfaceVariant} strokeOpacity={0.5} />
          {X_TICKS.map((month) => {
            const index = MONTHS.indexOf(month);
            return (
              <SvgText key={month} x={x(index)} y={bottom + 10 + 12} textAnchor="middle" fontSize={12} fontFamily={Fonts.regular} fill={theme.colors.onSurfaceVariant}>
                {month}
              </SvgText>
            );
          })}
          <Path d={line} stroke={TREND_COLOR} strokeWidth={2} fill="none" />
        </Svg>
      )}
    </ChartTile>
  );
}

const styles = StyleSheet.create({
  frame: { alignSelf: 'stretch' },
  tile: { borderRadius: Shape.small, padding: 8 },
});
