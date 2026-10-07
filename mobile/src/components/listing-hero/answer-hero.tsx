import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, type LayoutChangeEvent, LayoutAnimation, StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { useTabLayout } from '@/components/app-tabs';
import { useAppColors } from '@/constants/app-colors';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { formatCount } from '@/data/common';

import { TIME_CONTROL_HEIGHT, TimeControl, type TimeScope } from './time-scope';

/** How far the records card rides up over the hero's foot. */
export const HERO_OVERLAP = 28;

/**
 * The one row under the number, leading with its figure: e.g. "Deductions
 * −₹4,41,000 ▾" (unfolds `breakdown`) or "⚡ Get some of it today ·
 * On-Demand ›" (runs `onPress`).
 */
export type AnswerDetail = {
  key: string;
  icon?: string;
  label: string;
  /** The figure, at the row's end (e.g. "−₹4,41,000"). */
  value?: string;
  tone?: 'negative' | 'accent';
  /** Lines that make up the figure, unfolded in place under the row. */
  breakdown?: { label: string; value: string; tone?: 'negative' | 'total' }[];
  /** For an action row: what it does, at the row's end (e.g. "On-Demand"). */
  actionLabel?: string;
  onPress?: () => void;
};

export type AnswerView = {
  key: string;
  /** The switch's label (two views), or the title over the number (one view). */
  label: string;
  amount: number;
  /** Shown instead of the amount when the answer isn't money (e.g. 12 of 14 devices). */
  count?: { value: number; of?: number };
  /** One plain line under the number: what it covers ("20 batches reached your bank in the last 7 days"). */
  line: string;
  /** A limit worth seeing, under the line (e.g. "Settled totals go back 7 days · the list shows the full 30 days"). */
  note?: string;
  /** How the number keeps time: dates to pick, or live. */
  time: TimeScope;
  /** At most one row, leading with a figure or an action. */
  details?: AnswerDetail[];
};

type AnswerHeroProps = {
  /** One view, or two that keep time differently (shown one at a time). */
  views: [AnswerView] | [AnswerView, AnswerView];
  activeKey?: string;
  onActiveChange?: (key: string) => void;
};

const animateLayout = () => LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'));

/**
 * The answer at the top of a listing page (experiment, see
 * constants/experiments.ts): calm, with no decoration — type and space do the
 * work, and colour appears only where it carries meaning.
 *
 *   [ what — a switch, or a title ]             [ when — date button / Live ]
 *
 *   ₹ 30,05,200 .00          ← the number (or a count, e.g. 12 of 14)
 *   one plain line of what it covers
 *
 *   ┌ one detail row, leading with its figure ┐
 *
 * Sized to its content, on the page itself; the records card rides up over
 * its foot and slides over it as the page scrolls.
 */
export function AnswerHero({ views, activeKey, onActiveChange }: AnswerHeroProps) {
  const theme = useTheme();
  const view = views.find((item) => item.key === activeKey) ?? views[0];
  const { scrollY } = useTabLayout();
  const [canvasHeight, setCanvasHeight] = useState(0);
  const fadeOut = Math.max(canvasHeight * 0.75, 1);

  return (
    <View onLayout={(event) => setCanvasHeight(event.nativeEvent.layout.height)} style={styles.hero}>
      {/* The answer scrolls at about 60% of the page's speed and fades as the records card slides up over it. */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: scrollY.interpolate({ inputRange: [0, fadeOut], outputRange: [1, 0], extrapolate: 'clamp' }),
            transform: [{ translateY: scrollY.interpolate({ inputRange: [0, fadeOut], outputRange: [0, fadeOut * 0.4], extrapolate: 'clamp' }) }],
          },
        ]}>
        <View style={styles.topRow}>
          {views.length > 1 ? (
            <ViewSwitch
              views={views}
              activeKey={view.key}
              onChange={(key) => {
                animateLayout();
                onActiveChange?.(key);
              }}
            />
          ) : (
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>{view.label}</Text>
          )}
          <TimeControl scope={view.time} />
        </View>

        <View style={styles.answer}>
          {view.count ? <HeroCount {...view.count} /> : <HeroAmount value={view.amount} />}
          <Text style={[styles.line, { color: theme.colors.onSurfaceVariant }]}>{view.line}</Text>
          {view.note ? (
            <View style={styles.noteRow}>
              <Icon source="info" size={14} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.note, { color: theme.colors.onSurfaceVariant }]}>{view.note}</Text>
            </View>
          ) : null}
        </View>

        {view.details?.length ? (
          <View style={[styles.details, { backgroundColor: theme.colors.surface }]}>
            {view.details.map((detail, index) => (
              <DetailRow key={`${view.key}-${detail.key}`} detail={detail} first={index === 0} />
            ))}
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}

/**
 * The number, set like a figure on a statement: the ₹ small and light, the
 * rupees large with tight spacing and lining figures, the paise faint.
 */
function HeroAmount({ value }: { value: number }) {
  const theme = useTheme();
  const rupees = Math.floor(Math.abs(value));
  const paise = Math.round((Math.abs(value) - rupees) * 100);
  return (
    <View accessible accessibilityLabel={`₹${formatCount(rupees)}.${String(paise).padStart(2, '0')}`} style={styles.amount}>
      <Text style={[styles.currency, { color: theme.colors.onSurfaceVariant }]}>{value < 0 ? '−₹' : '₹'}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.rupees, { color: theme.colors.onSurface }]}>
        {formatCount(rupees)}
      </Text>
      <Text style={[styles.paise, { color: theme.colors.onSurfaceVariant }]}>.{String(paise).padStart(2, '0')}</Text>
    </View>
  );
}

/** A count in the amount's place: "12" with "of 14" lighter, for answers that aren't money. */
function HeroCount({ value, of }: { value: number; of?: number }) {
  const theme = useTheme();
  return (
    <View accessible accessibilityLabel={of !== undefined ? `${value} of ${of}` : String(value)} style={styles.amount}>
      <Text style={[styles.rupees, { color: theme.colors.onSurface }]}>{formatCount(value)}</Text>
      {of !== undefined ? <Text style={[styles.countOf, { color: theme.colors.onSurfaceVariant }]}> of {formatCount(of)}</Text> : null}
    </View>
  );
}

function DetailRow({ detail, first }: { detail: AnswerDetail; first: boolean }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const expandable = !!detail.breakdown?.length;
  const valueColor = detail.tone === 'negative' ? theme.colors.error : detail.tone === 'accent' ? theme.colors.primary : theme.colors.onSurface;
  const onPress = expandable
    ? () => {
        animateLayout();
        setOpen((value) => !value);
      }
    : detail.onPress;

  return (
    <View>
      {first ? null : <View style={[styles.hairline, { backgroundColor: theme.colors.surfaceVariant }]} />}
      <TouchableRipple
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={expandable ? { expanded: open } : undefined}
        accessibilityLabel={[detail.label, detail.value, detail.actionLabel].filter(Boolean).join(', ')}>
        <View style={styles.detailRow}>
          {detail.icon ? <Icon source={detail.icon} size={18} color={detail.tone === 'accent' ? '#4f46e5' : theme.colors.onSurfaceVariant} /> : null}
          <Text style={[styles.detailLabel, { color: theme.colors.onSurface }]}>{detail.label}</Text>
          {detail.value ? <Text style={[styles.detailValue, { color: valueColor }]}>{detail.value}</Text> : null}
          {detail.actionLabel ? <Text style={[styles.detailAction, { color: theme.colors.primary }]}>{detail.actionLabel}</Text> : null}
          <Icon
            source={expandable ? (open ? 'caret-up' : 'caret-down') : 'caret-right'}
            size={16}
            color={detail.actionLabel ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
        </View>
      </TouchableRipple>
      {expandable && open ? (
        <View style={styles.breakdown}>
          {detail.breakdown!.map((row) => (
            <View key={row.label} style={[styles.breakdownRow, row.tone === 'total' && [styles.breakdownTotal, { borderTopColor: theme.colors.surfaceVariant }]]}>
              <Text style={[styles.breakdownLabel, { color: row.tone === 'total' ? theme.colors.onSurface : theme.colors.onSurfaceVariant }]}>{row.label}</Text>
              <Text
                style={[
                  styles.breakdownValue,
                  { color: row.tone === 'negative' ? theme.colors.error : theme.colors.onSurface },
                  row.tone === 'total' && { fontFamily: Fonts.semiBold },
                ]}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/**
 * Two answers as a switch: a white track with the chosen one filled in the
 * navigation bar's lime, sliding between them — unmistakably something to tap.
 */
function ViewSwitch({ views, activeKey, onChange }: { views: AnswerView[]; activeKey: string; onChange: (key: string) => void }) {
  const theme = useTheme();
  const appColors = useAppColors();
  const [layouts, setLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const [thumbX] = useState(() => new Animated.Value(0));
  const [thumbWidth] = useState(() => new Animated.Value(0));
  // Set once the thumb is under the first choice, so it never slides in from the edge.
  const placed = useRef(false);
  const current = layouts[activeKey];

  useEffect(() => {
    if (!current) return;
    if (!placed.current) {
      thumbX.setValue(current.x);
      thumbWidth.setValue(current.width);
      placed.current = true;
      return;
    }
    const timing = { duration: 240, easing: Easing.bezier(0.2, 0, 0, 1), useNativeDriver: false };
    Animated.parallel([Animated.timing(thumbX, { toValue: current.x, ...timing }), Animated.timing(thumbWidth, { toValue: current.width, ...timing })]).start();
  }, [current, thumbX, thumbWidth]);

  return (
    <View accessibilityRole="tablist" style={[styles.switch, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      {current ? <Animated.View style={[styles.thumb, { backgroundColor: appColors.highlight, left: thumbX, width: thumbWidth }]} /> : null}
      {views.map((item) => {
        const active = item.key === activeKey;
        return (
          <TouchableRipple
            key={item.key}
            onPress={() => !active && onChange(item.key)}
            onLayout={(event: LayoutChangeEvent) => {
              const { x, width } = event.nativeEvent.layout;
              setLayouts((all) => ({ ...all, [item.key]: { x, width } }));
            }}
            borderless
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={styles.segment}>
            <Text style={[styles.segmentLabel, { color: active ? theme.colors.onSurface : theme.colors.onSurfaceVariant, fontFamily: active ? Fonts.semiBold : Fonts.medium }]}>
              {item.label}
            </Text>
          </TouchableRipple>
        );
      })}
    </View>
  );
}

/** The tab page's side padding and its gap under the header (tab-screen.tsx), which the hero bleeds through. */
const PAGE_PADDING = 16;
const PAGE_TOP_GAP = 24;

const styles = StyleSheet.create({
  hero: { marginHorizontal: -PAGE_PADDING, marginTop: -PAGE_TOP_GAP },
  content: { paddingHorizontal: PAGE_PADDING, paddingTop: 16, paddingBottom: 20 + HERO_OVERLAP, gap: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: TIME_CONTROL_HEIGHT },
  title: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 22 },
  switch: { flexDirection: 'row', borderRadius: Shape.small, borderWidth: 1, padding: 3, height: TIME_CONTROL_HEIGHT },
  thumb: { position: 'absolute', top: 3, bottom: 3, borderRadius: Shape.small - 3 },
  segment: { justifyContent: 'center', paddingHorizontal: 14, borderRadius: Shape.small - 3 },
  segmentLabel: { fontSize: 13, lineHeight: 16 },
  answer: { gap: 4 },
  // Baseline-aligned: the ₹ and paise sit on the rupees' baseline.
  amount: { flexDirection: 'row', alignItems: 'baseline' },
  currency: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 22, marginRight: 2 },
  rupees: { flexShrink: 1, fontFamily: Fonts.semiBold, fontSize: 24, lineHeight: 30, letterSpacing: -0.2, fontVariant: ['tabular-nums', 'lining-nums'] },
  countOf: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 22 },
  paise: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, marginLeft: 1, opacity: 0.6 },
  line: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  note: { flexShrink: 1, fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16 },
  details: { borderRadius: Shape.max, overflow: 'hidden' },
  hairline: { height: 1, marginLeft: 14 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, paddingHorizontal: 14 },
  detailLabel: { flex: 1, fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  detailValue: { fontFamily: Fonts.semiBold, fontSize: 14, lineHeight: 20, fontVariant: ['tabular-nums'] },
  detailAction: { fontFamily: Fonts.semiBold, fontSize: 14, lineHeight: 20 },
  breakdown: { paddingHorizontal: 14, paddingBottom: 12 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  breakdownTotal: { borderTopWidth: 1, marginTop: 6, paddingTop: 10 },
  breakdownLabel: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18 },
  breakdownValue: { fontFamily: Fonts.medium, fontSize: 13, lineHeight: 18, fontVariant: ['tabular-nums'] },
});
