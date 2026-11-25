import { useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Mask, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

import { AppIcon, type IconName } from '@/components/icons';
import { useSvgId } from '@/components/shared/hatch';
import type { AgentId } from '@/data/agents';

/**
 * Each agent's colours (web: HalftoneBackdrop): a base, and four soft bands
 * blurred across it on a −35° tilt.
 */
const PALETTES: Record<AgentId, { base: string; bands: [string, string, string, string] }> = {
  'local-ads': { base: '#2f6c8f', bands: ['#cfe3f2', '#3f8f6b', '#5d6f8f', '#e3c46a'] },
  'campaign-analyzer': { base: '#3b5b9e', bands: ['#c3d2f2', '#5d78b8', '#6e6f90', '#8fa8e0'] },
  chargeback: { base: '#7a5a42', bands: ['#d8c1a8', '#8c6f3a', '#5b4a44', '#b78a66'] },
  daily_business_snapshot: { base: '#b7678f', bands: ['#d8cbd6', '#8f8a55', '#6e6f80', '#e7a3c4'] },
  payment_failure_spike_alert: { base: '#2f5f93', bands: ['#a9c8ea', '#4c8f9e', '#7d7a9e', '#1f3d66'] },
  settlement_reconciliation_recon: { base: '#2b7f86', bands: ['#b8e6e2', '#6f9f6a', '#5a7a8f', '#9ad4d8'] },
  refund_watchman: { base: '#6f8a3a', bands: ['#d6e3b0', '#9a9a3c', '#6f7f7a', '#c9b8a0'] },
  low_payment_volume_alert: { base: '#5d3f9e', bands: ['#c9b6f0', '#8a6fae', '#6e7aa0', '#d5a6d8'] },
};

/** The bands' boxes (left, top, width, height) as fractions of the tilted layer, as on the web. */
const BANDS = [
  [-0.05, 0.05, 0.65, 0.45],
  [0.3, 0.3, 0.75, 0.32],
  [0.05, 0.58, 0.6, 0.26],
  [0.55, 0.55, 0.6, 0.45],
] as const;

/** The glyph on each agent's tile (web: Reicon fill icons, as the app's Phosphor ones). */
export const AGENT_GLYPHS: Record<AgentId, IconName> = {
  chargeback: 'shield-check-fill',
  'local-ads': 'target-fill',
  'campaign-analyzer': 'chart-line-up-fill',
  daily_business_snapshot: 'chart-line-up-fill',
  payment_failure_spike_alert: 'lightning-fill',
  settlement_reconciliation_recon: 'arrows-left-right-fill',
  refund_watchman: 'receipt-fill',
  low_payment_volume_alert: 'trend-down-fill',
};

/**
 * The agent's halftone wash, filling its parent (web: HalftoneBackdrop). The
 * web blurs solid bands with a CSS filter; here each band is a radial
 * gradient that fades out over the same blur distance. `lg` (heroes) blurs
 * more and fades its dots in from the top-right corner; `sm` (tiles) keeps a
 * finer, even dot grid.
 */
export function HalftoneBackdrop({ agentId, size = 'lg' }: { agentId: AgentId; size?: 'sm' | 'lg' }) {
  const [box, setBox] = useState({ width: 0, height: 0 });
  const id = useSvgId(`halftone-${agentId}-${size}`);
  const palette = PALETTES[agentId] ?? PALETTES.chargeback;
  const small = size === 'sm';
  const blur = small ? 14 : 48;
  const dot = small ? { radius: 0.6, cell: 4, opacity: 0.3 } : { radius: 0.9, cell: 6, opacity: 0.25 };
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== box.width || height !== box.height) setBox({ width, height });
  };
  const { width, height } = box;
  // The tilted layer overhangs the box by 30% on every side (web: -inset-[30%] -rotate-[35deg]).
  const layer = { x: -0.3 * width, y: -0.3 * height, width: 1.6 * width, height: 1.6 * height };

  return (
    <View pointerEvents="none" onLayout={onLayout} style={[StyleSheet.absoluteFill, { backgroundColor: palette.base }]}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            {palette.bands.map((color, index) => {
              const [, , w, h] = BANDS[index];
              // Where the solid core ends inside the faded-out ellipse.
              const core = Math.min((w * layer.width) / 2, (h * layer.height) / 2);
              const solid = core / (core + blur);
              return (
                <RadialGradient key={color + index} id={`${id}-band-${index}`} cx="50%" cy="50%" rx="50%" ry="50%">
                  <Stop offset={0} stopColor={color} stopOpacity={1} />
                  <Stop offset={solid * 0.6} stopColor={color} stopOpacity={0.9} />
                  <Stop offset={1} stopColor={color} stopOpacity={0} />
                </RadialGradient>
              );
            })}
            <Pattern id={`${id}-dots`} width={dot.cell} height={dot.cell} patternUnits="userSpaceOnUse">
              <Circle cx={dot.cell / 2} cy={dot.cell / 2} r={dot.radius} fill="rgb(20, 10, 4)" fillOpacity={0.5} />
            </Pattern>
            {small ? null : (
              <>
                <RadialGradient id={`${id}-fade`} cx="100%" cy="0%" rx="85%" ry="90%">
                  <Stop offset={0} stopColor="#ffffff" stopOpacity={1} />
                  <Stop offset={0.4} stopColor="#ffffff" stopOpacity={0.5} />
                  <Stop offset={0.75} stopColor="#ffffff" stopOpacity={0} />
                </RadialGradient>
                <Mask id={`${id}-mask`}>
                  <Rect width={width} height={height} fill={`url(#${id}-fade)`} />
                </Mask>
              </>
            )}
          </Defs>
          <G transform={`rotate(-35 ${width / 2} ${height / 2})`}>
            {BANDS.map(([left, top, w, h], index) => (
              <Ellipse
                key={index}
                cx={layer.x + (left + w / 2) * layer.width}
                cy={layer.y + (top + h / 2) * layer.height}
                rx={(w * layer.width) / 2 + blur}
                ry={(h * layer.height) / 2 + blur}
                fill={`url(#${id}-band-${index})`}
              />
            ))}
          </G>
          <Rect width={width} height={height} fill={`url(#${id}-dots)`} opacity={dot.opacity} mask={small ? undefined : `url(#${id}-mask)`} />
        </Svg>
      ) : null}
    </View>
  );
}

/** A left-to-right shade over a hero, so its white text reads (web: from-black/35 via-transparent). */
export function HeroShade() {
  const id = useSvgId('hero-shade');
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
            <Stop offset={0} stopColor="#000000" stopOpacity={0.35} />
            <Stop offset={0.5} stopColor="#000000" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/** The agent's tile: its wash with its glyph in soft white (web: AgentThumbnail). */
export function AgentThumbnail({ agentId, size, radius, glyphSize, style }: { agentId: AgentId; size: number; radius: number; glyphSize: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.tile, { width: size, height: size, borderRadius: radius }, style]}>
      <HalftoneBackdrop agentId={agentId} size="sm" />
      {/* Its own layer, so it stays over the wash on web too (positioned elements paint above static ones). */}
      <View style={styles.glyph}>
        <AppIcon name={AGENT_GLYPHS[agentId]} size={glyphSize} color="rgba(255, 255, 255, 0.6)" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  glyph: { position: 'relative', zIndex: 1 },
});
