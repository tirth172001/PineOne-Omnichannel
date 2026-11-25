import type { ReactNode } from 'react';
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { LocalSvg } from 'react-native-svg/css';

import { useAppColors } from '@/constants/app-colors';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

import { at } from './storyboard';

/**
 * Building blocks for feature visuals (What's new, empty states, promos):
 * a stage, chat bubbles, typing dots, a tap pulse, frosted chips and a small
 * copy of the bottom bar. They take the storyboard clock (see storyboard.ts)
 * so a scene is just parts timed against one `t`.
 */

/** The visual's frame: a rounded, clipped box with a background layer (a wash, a glow) under its content. */
export function Stage({ height, radius, background, children, style }: { height: number; radius: number; background?: ReactNode; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <View style={[styles.stage, { height, borderRadius: radius, backgroundColor: theme.colors.surfaceVariant }, style]}>
      {background}
      {/* Its own layer, so it paints over the background on web too. */}
      <View style={styles.stageContent}>{children}</View>
    </View>
  );
}

/** A chat bubble: the merchant's (white, right) or Guide's / an agent's (frosted or grey, left). */
export function Bubble({ from, tone = 'light', children, style }: { from: 'user' | 'agent'; tone?: 'light' | 'frosted'; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const user = from === 'user';
  const frosted = tone === 'frosted';
  return (
    <View
      style={[
        styles.bubble,
        user ? styles.userBubble : styles.agentBubble,
        user
          ? { backgroundColor: theme.colors.surface }
          : frosted
            ? styles.frosted
            : { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant, borderWidth: 1 },
        style,
      ]}>
      {typeof children === 'string' ? (
        <Text style={[styles.bubbleText, { color: !user && frosted ? '#ffffff' : theme.colors.onSurface }]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

/** Three dots that pulse in turn between `start` and `end` (Guide thinking). */
export function TypingDots({ t, start, end, color }: { t: Animated.Value; start: number; end: number; color: string }) {
  const step = 180;
  const times: number[] = [];
  for (let time = start; time < end; time += step * 3) times.push(time);
  return (
    <View style={styles.dots}>
      {[0, 1, 2].map((dot) => {
        const input: number[] = [];
        const output: number[] = [];
        times.forEach((time) => {
          const peak = time + dot * step;
          input.push(peak, peak + step, peak + step * 2);
          output.push(0.3, 1, 0.3);
        });
        return <Animated.View key={dot} style={[styles.dot, { backgroundColor: color, opacity: input.length > 1 ? at(t, input, output) : 0.3 }]} />;
      })}
    </View>
  );
}

/** A finger-tap ring that grows and fades at `time`, over whatever it's placed on. */
export function TapPulse({ t, time, color, size = 44, style }: { t: Animated.Value; time: number; color: string; size?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pulse,
        { width: size, height: size, borderRadius: size / 2, marginLeft: -size / 2, marginTop: -size / 2, backgroundColor: color },
        { opacity: at(t, [time - 1, time, time + 500], [0, 0.45, 0]), transform: [{ scale: at(t, [time, time + 500], [0.4, 1.4]) }] },
        style,
      ]}
    />
  );
}

/** A small frosted label with an icon, for things on a coloured wash (e.g. an agent's evidence). */
export function FrostedChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.chip}>
      <Icon source={icon} size={14} color="#ffffff" />
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

export type MiniBarItem = { key: string; label: string; icon: string; svg?: { icon: number; focused: number } };

const MORE_GLYPH = require('../../../assets/images/nav/arrow-up2-outline.svg');

/**
 * A small copy of the bottom bar with one item lit and a tap pulsing on it
 * every `every` ms (or once, with a storyboard `t`): "it's here".
 */
export function MiniNavBar({ items, lit, t, tapAt }: { items: MiniBarItem[]; lit: string; t: Animated.Value; tapAt: number[] }) {
  const theme = useTheme();
  const colors = useAppColors();
  return (
    <View style={[styles.miniBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      {items.map((item) => {
        const on = item.key === lit;
        const color = on ? theme.colors.onSurface : theme.colors.onSurfaceVariant;
        return (
          <View key={item.key} style={[styles.miniItem, { opacity: on ? 1 : 0.5 }]}>
            <View style={[styles.miniIndicator, on && { backgroundColor: colors.highlight }]}>
              {item.key === 'more' ? (
                <LocalSvg asset={MORE_GLYPH} width={18} height={18} color={color} />
              ) : item.svg ? (
                <LocalSvg asset={on ? item.svg.focused : item.svg.icon} width={18} height={18} color={color} />
              ) : (
                <Icon source={item.icon} size={18} color={color} />
              )}
              {on ? tapAt.map((time) => <TapPulse key={time} t={t} time={time} color={colors.brand} size={40} style={styles.miniPulse} />) : null}
            </View>
            <Text numberOfLines={1} style={[styles.miniLabel, { color, fontFamily: on ? Fonts.medium : Fonts.regular }]}>
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { overflow: 'hidden' },
  stageContent: { position: 'relative', flex: 1 },
  bubble: { maxWidth: '86%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: Shape.max },
  userBubble: { alignSelf: 'flex-end', borderTopRightRadius: Shape.extraSmall },
  agentBubble: { alignSelf: 'flex-start', borderTopLeftRadius: Shape.extraSmall },
  frosted: { borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.25)', backgroundColor: 'rgba(255, 255, 255, 0.18)' },
  bubbleText: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  dots: { flexDirection: 'row', gap: 4, paddingVertical: 4 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  pulse: { position: 'absolute', left: '50%', top: '50%' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  chipText: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16, color: '#ffffff' },
  miniBar: { flexDirection: 'row', paddingVertical: 8, borderRadius: concentric(Shape.max, 4), borderWidth: 1 },
  miniItem: { flex: 1, alignItems: 'center', gap: 4 },
  miniIndicator: { width: 40, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  miniPulse: {},
  miniLabel: { fontSize: 10, lineHeight: 12 },
});
