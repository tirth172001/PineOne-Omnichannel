import { useEffect, useEffectEvent, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Badge, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useSvgId } from '@/components/shared/hatch';
import { useAppColors } from '@/constants/app-colors';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

export type NavigationBarDestination = {
  key: string;
  label: string;
  icon: string;
  focusedIcon: string;
  badge?: number | boolean;
};

/** Destinations kept behind a trailing expand button, opened in place as a titled grid of the same items. */
export type NavigationBarOverflow = {
  title: string;
  destinations: NavigationBarDestination[];
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  /** Called once the grid has finished collapsing, e.g. to navigate after the bar has settled. */
  onCollapsed?: () => void;
};

type NavigationBarProps = {
  destinations: NavigationBarDestination[];
  activeKey: string;
  /** Called with the key of the destination pressed, in the bar or in the overflow grid. */
  onChange: (key: string) => void;
  overflow?: NavigationBarOverflow;
  /** The bar's height while collapsed (safe-area inset included), for padding content and placing toasts above it. */
  onRestingHeightChange?: (height: number) => void;
  /** Pads the bar over the bottom safe-area inset (gesture bar). On by default. */
  respectSafeArea?: boolean;
};

// While expanded a light dark tint reaches up from the bar, dimming the page just enough that the white panel stands apart.
const EXPANDED_FADE_HEIGHT = 320;
// Five to a row, lined up with the bar's own five items below.
const OVERFLOW_COLUMNS = 5;
// M3 emphasized easing: quick to start, long gentle settle.
const EXPAND_EASING = Easing.bezier(0.2, 0, 0, 1);

/**
 * M3 Expressive navigation bar ("vertical items") — the 64dp bar in the Figma
 * app shell (PineOne - Omni-channel, node 6470:1236). Paper's
 * BottomNavigation.Bar implements the older 80dp M3 bar with its padding
 * hard-coded, so this is built in-house from Paper primitives: equal-width
 * items, a 56×32 indicator, 10dp labels. It runs edge to edge along the bottom
 * of the screen, white with a hairline and a slight shadow on top, padded over
 * the gesture bar.
 *
 * With `overflow`, the last item is an expand button: the bar grows upward in
 * place to show the overflow destinations under a title, five to a row, drawn
 * exactly like the bar's own items.
 */
export function NavigationBar({ destinations, activeKey, onChange, overflow, onRestingHeightChange, respectSafeArea = true }: NavigationBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const fadeId = useSvgId('nav-fade');
  const bottomInset = respectSafeArea ? insets.bottom : 0;
  const expanded = overflow?.expanded ?? false;

  const [progress] = useState(() => new Animated.Value(expanded ? 1 : 0));
  const [panelHeight, setPanelHeight] = useState(0);
  const onCollapsed = useEffectEvent(() => overflow?.onCollapsed?.());
  useEffect(() => {
    Animated.timing(progress, {
      toValue: expanded ? 1 : 0,
      duration: expanded ? 340 : 280,
      easing: EXPAND_EASING,
      // Drives the panel's height, which the native driver can't animate.
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !expanded) onCollapsed();
    });
  }, [progress, expanded]);

  // A destination that just took over a slot (e.g. picked from the overflow) pops in.
  const keys = destinations.map((destination) => destination.key).join('|');
  const [previousKeys, setPreviousKeys] = useState(keys);
  const [freshKey, setFreshKey] = useState<string | null>(null);
  if (keys !== previousKeys) {
    const before = previousKeys.split('|');
    setPreviousKeys(keys);
    setFreshKey(destinations.find((destination) => !before.includes(destination.key))?.key ?? null);
  }

  const rows: NavigationBarDestination[][] = [];
  overflow?.destinations.forEach((destination, index) => {
    if (index % OVERFLOW_COLUMNS === 0) rows.push([]);
    rows[rows.length - 1].push(destination);
  });

  return (
    // box-none: the fade is decoration only, so taps on it reach the page below.
    <Animated.View
      pointerEvents="box-none"
      style={{ paddingTop: progress.interpolate({ inputRange: [0, 1], outputRange: [0, EXPANDED_FADE_HEIGHT] }) }}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: progress }]}>
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 1 1" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={fadeId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={theme.colors.scrim} stopOpacity={0} />
              <Stop offset="0.5" stopColor={theme.colors.scrim} stopOpacity={0.08} />
              <Stop offset="1" stopColor={theme.colors.scrim} stopOpacity={0.18} />
            </LinearGradient>
          </Defs>
          <Rect width={1} height={1} fill={`url(#${fadeId})`} />
        </Svg>
      </Animated.View>
      <View style={[styles.bar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.surfaceVariant, paddingBottom: bottomInset }]}>
        {overflow ? (
          <Animated.View
            aria-hidden={!expanded}
            pointerEvents={expanded ? 'auto' : 'none'}
            style={[styles.panel, { height: progress.interpolate({ inputRange: [0, 1], outputRange: [0, panelHeight] }) }]}>
            {/* Pinned to the panel's bottom, so the rows nearest the bar are revealed first as it grows. */}
            <Animated.View
              onLayout={(event) => setPanelHeight(event.nativeEvent.layout.height)}
              style={[
                styles.panelContent,
                {
                  opacity: progress.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 0, 1] }),
                  transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
                },
              ]}>
              <Text accessibilityRole="header" style={[styles.panelTitle, { color: theme.colors.onSurfaceVariant }]}>
                {overflow.title.toUpperCase()}
              </Text>
              <View style={[styles.divider, styles.titleDivider, { backgroundColor: theme.colors.surfaceVariant }]} />
              {rows.map((row) => (
                <View key={row[0].key} style={styles.gridRow}>
                  {row.map((destination) => (
                    <NavItem
                      key={destination.key}
                      destination={destination}
                      active={destination.key === activeKey}
                      onPress={() => onChange(destination.key)}
                      style={styles.gridItem}
                    />
                  ))}
                </View>
              ))}
              <View style={[styles.divider, { backgroundColor: theme.colors.surfaceVariant }]} />
            </Animated.View>
          </Animated.View>
        ) : null}
        <View
          accessibilityRole="tablist"
          // The top hairline is part of the bar's height.
          onLayout={(event) => onRestingHeightChange?.(event.nativeEvent.layout.height + StyleSheet.hairlineWidth + bottomInset)}
          style={styles.row}>
          {destinations.map((destination) => (
            <NavItem
              key={destination.key}
              destination={destination}
              active={destination.key === activeKey}
              onPress={() => onChange(destination.key)}
              popIn={destination.key === freshKey}
              style={styles.item}
            />
          ))}
          {overflow ? (
            <TouchableRipple
              onPress={() => overflow.onExpandedChange(!expanded)}
              accessibilityRole="button"
              accessibilityLabel={expanded ? `Hide ${overflow.title}` : overflow.title}
              accessibilityState={{ expanded }}
              borderless
              style={styles.item}>
              <View style={styles.itemContent}>
                <View style={styles.indicator}>
                  <Animated.View
                    style={{ transform: [{ rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}>
                    <Icon source="caret-up" size={24} color={theme.colors.onSurface} />
                  </Animated.View>
                </View>
                <Text numberOfLines={1} style={[styles.label, { color: theme.colors.onSecondaryContainer, fontFamily: Fonts.regular }]}>
                  {overflow.title}
                </Text>
              </View>
            </TouchableRipple>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

/** Figma layers a 50% white over base/secondary for the indicator (see useAppColors). */
function useIndicatorColor() {
  return useAppColors().highlight;
}

function NavItem({
  destination,
  active,
  onPress,
  popIn = false,
  style,
}: {
  destination: NavigationBarDestination;
  active: boolean;
  onPress: () => void;
  /** Scale and fade in on mount. */
  popIn?: boolean;
  style: object;
}) {
  const theme = useTheme();
  const indicatorColor = useIndicatorColor();
  const [entrance] = useState(() => new Animated.Value(popIn ? 0 : 1));
  useEffect(() => {
    Animated.timing(entrance, { toValue: 1, duration: 280, easing: EXPAND_EASING, useNativeDriver: true }).start();
  }, [entrance]);

  return (
    <TouchableRipple
      onPress={onPress}
      accessibilityRole="tab"
      aria-selected={active}
      accessibilityLabel={destination.label}
      borderless
      style={style}>
      <Animated.View
        style={[
          styles.itemContent,
          { opacity: entrance, transform: [{ scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] },
        ]}>
        <View style={[styles.indicator, active && { width: 56, backgroundColor: indicatorColor }]}>
          <Icon source={active ? destination.focusedIcon : destination.icon} size={24} color={theme.colors.onSurface} />
          {destination.badge ? (
            <Badge size={destination.badge === true ? 6 : 16} style={styles.badge}>
              {destination.badge === true ? undefined : destination.badge}
            </Badge>
          ) : null}
        </View>
        <Text
          numberOfLines={1}
          style={[styles.label, { color: theme.colors.onSecondaryContainer, fontFamily: active ? Fonts.medium : Fonts.regular }]}>
          {destination.label}
        </Text>
      </Animated.View>
    </TouchableRipple>
  );
}

const ITEM_RADIUS = Shape.max;
// Figma rounds the indicator fully (16dp); the app caps every radius at Shape.max.
const INDICATOR_RADIUS = Shape.max;

const styles = StyleSheet.create({
  // A slight shadow above the bar, so it lifts off the page behind it.
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  panel: { overflow: 'hidden' },
  panelContent: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  panelTitle: { fontFamily: Fonts.semiBold, fontSize: 12, lineHeight: 16, letterSpacing: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  // Same side padding as the bar's row, so the grid's columns sit over its items.
  gridRow: { flexDirection: 'row', paddingHorizontal: 8 },
  gridItem: { width: `${100 / OVERFLOW_COLUMNS}%`, borderRadius: ITEM_RADIUS },
  // Separators run edge to edge across the bar.
  divider: { height: 1, marginTop: 4 },
  titleDivider: { marginTop: 0, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 8 },
  item: { flex: 1, borderRadius: ITEM_RADIUS },
  itemContent: { alignItems: 'center', gap: 4, paddingTop: 6, paddingBottom: 10 },
  indicator: { width: 32, height: 32, borderRadius: INDICATOR_RADIUS, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 2, right: 8 },
  label: { fontSize: 10, lineHeight: 12, letterSpacing: 0.15, textAlign: 'center' },
});
