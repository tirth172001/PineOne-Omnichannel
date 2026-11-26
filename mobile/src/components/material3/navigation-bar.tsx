import { useEffect, useEffectEvent, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { Badge, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { LocalSvg } from 'react-native-svg/css';

import { GuideMark } from '@/components/guide/guide-mark';
import { useSvgId } from '@/components/shared/hatch';
import { APP_PAGE_LAYOUT } from '@/constants/experiments';
import { useAppColors } from '@/constants/app-colors';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

export type NavigationBarDestination = {
  key: string;
  label: string;
  icon: string;
  focusedIcon: string;
  /** The design's own glyphs (Figma "Reicon", 7110:116411), outline and filled, drawn instead of `icon` / `focusedIcon`. */
  svg?: { icon: number; focused: number };
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
  /**
   * 'docked' (default): edge to edge along the bottom of the screen. 'floating'
   * (the Osmosis app's bar): a rounded white bar off the screen's edges, the
   * active item filled lime, with `detached` on its own round button beside it.
   */
  variant?: 'docked' | 'floating';
  /** Floating only: a destination drawn as its own round button to the right of the bar (Guide). */
  detached?: NavigationBarDestination;
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
export function NavigationBar(props: NavigationBarProps) {
  return props.variant === 'floating' ? <FloatingNavigationBar {...props} /> : <DockedNavigationBar {...props} />;
}

/** The fade, the expand / collapse progress and the pop-in for a destination that just took the slot, shared by both bars. */
function useOverflowMotion(destinations: NavigationBarDestination[], overflow: NavigationBarOverflow | undefined) {
  const expanded = overflow?.expanded ?? false;
  const [progress] = useState(() => new Animated.Value(expanded ? 1 : 0));
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

  const keys = destinations.map((destination) => destination.key).join('|');
  const [previousKeys, setPreviousKeys] = useState(keys);
  const [freshKey, setFreshKey] = useState<string | null>(null);
  if (keys !== previousKeys) {
    const before = previousKeys.split('|');
    setPreviousKeys(keys);
    setFreshKey(destinations.find((destination) => !before.includes(destination.key))?.key ?? null);
  }
  return { expanded, progress, freshKey };
}

/**
 * The floating bar, after the Osmosis app (pine-one.vercel.app on a phone): a
 * 64dp white bar with fully rounded ends, 16dp from the screen's sides and
 * bottom (the same on phones with a home indicator), over a white fade that
 * rises 135dp from the bottom of the screen, its items' whole 54dp pill lime
 * when active. `detached` (Guide) sits 12dp beside it on its own orb
 * (GuideOrb). More (an arrow) grows the bar itself upward (not the orb) to show the
 * overflow modules in columns over the bar's own items, as the docked bar's
 * More does; picking one swaps it into the bar.
 */
function FloatingNavigationBar({ destinations, activeKey, onChange, overflow, onRestingHeightChange, detached }: NavigationBarProps) {
  const theme = useTheme();
  const fadeId = useSvgId('floating-fade');
  const tintId = useSvgId('floating-tint');
  const indicatorColor = useIndicatorColor();
  // 16dp from the sides and the bottom: the bottom matches the sides, even over the home indicator (user decision).
  const bottomGap = FLOATING_GAP;
  const { expanded, progress, freshKey } = useOverflowMotion(destinations, overflow);
  const [panelHeight, setPanelHeight] = useState(0);
  const surface = { backgroundColor: theme.colors.surface };
  // One column per item in the bar (More included), so the modules line up over them.
  const columns = destinations.length + (overflow ? 1 : 0);
  const rows: NavigationBarDestination[][] = [];
  overflow?.destinations.forEach((destination, index) => {
    if (index % columns === 0) rows.push([]);
    rows[rows.length - 1].push(destination);
  });

  return (
    // While expanded, room above the bar for a light dark tint (the docked bar's), so the panel stands apart from the page.
    <Animated.View pointerEvents="box-none" style={{ paddingTop: progress.interpolate({ inputRange: [0, 1], outputRange: [0, EXPANDED_FADE_HEIGHT] }) }}>
      {/* The page fades to white behind the bar (Osmosis: 135px, white → 80% → clear). */}
      <Svg pointerEvents="none" style={styles.floatingFade} width="100%" height={FLOATING_FADE_HEIGHT} viewBox="0 0 1 1" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={fadeId} x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor={theme.colors.surface} stopOpacity={1} />
            <Stop offset="0.5" stopColor={theme.colors.surface} stopOpacity={0.8} />
            <Stop offset="1" stopColor={theme.colors.surface} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width={1} height={1} fill={`url(#${fadeId})`} />
      </Svg>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: progress }]}>
        <Svg width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={tintId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={theme.colors.scrim} stopOpacity={0} />
              <Stop offset="0.5" stopColor={theme.colors.scrim} stopOpacity={0.08} />
              <Stop offset="1" stopColor={theme.colors.scrim} stopOpacity={0.18} />
            </LinearGradient>
          </Defs>
          <Rect width={1} height={1} fill={`url(#${tintId})`} />
        </Svg>
      </Animated.View>
      <View
        pointerEvents="box-none"
        onLayout={() => onRestingHeightChange?.(FLOATING_HEIGHT + bottomGap)}
        style={[styles.floatingRow, { paddingBottom: bottomGap }]}>
        <View style={[styles.floatingBar, surface, expanded && styles.floatingBarExpanded]}>
          {overflow ? (
            <Animated.View
              aria-hidden={!expanded}
              pointerEvents={expanded ? 'auto' : 'none'}
              style={[styles.panel, { height: progress.interpolate({ inputRange: [0, 1], outputRange: [0, panelHeight] }) }]}>
              {/* Pinned to the panel's bottom, so the row nearest the bar shows first as it grows. */}
              <Animated.View
                onLayout={(event) => setPanelHeight(event.nativeEvent.layout.height)}
                style={[
                  styles.panelContent,
                  styles.floatingPanelContent,
                  {
                    opacity: progress.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 0, 1] }),
                    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
                  },
                ]}>
                {rows.map((row) => (
                  <View key={row[0].key} style={styles.floatingGridRow}>
                    {row.map((destination) => (
                      <FloatingNavItem
                        key={destination.key}
                        destination={destination}
                        active={destination.key === activeKey}
                        onPress={() => onChange(destination.key)}
                        style={{ width: `${100 / columns}%` }}
                      />
                    ))}
                  </View>
                ))}
              </Animated.View>
            </Animated.View>
          ) : null}
          <View accessibilityRole="tablist" style={styles.floatingItems}>
            {destinations.map((destination) => (
              <FloatingNavItem
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
                style={[styles.item, styles.floatingItem, expanded && { backgroundColor: indicatorColor }]}>
                <View style={styles.floatingItemContent}>
                  {/* As the docked bar's More: an arrow up; while open, a filled arrow down. */}
                  <LocalSvg asset={expanded ? MORE_EXPANDED : MORE} width={24} height={24} color={theme.colors.onSurface} />
                  <Text numberOfLines={1} style={[styles.floatingLabel, { color: theme.colors.onSurface }]}>
                    {overflow.title}
                  </Text>
                </View>
              </TouchableRipple>
            ) : null}
          </View>
        </View>
        {detached ? <GuideOrb destination={detached} active={detached.key === activeKey} onPress={() => onChange(detached.key)} /> : null}
      </View>
    </Animated.View>
  );
}

/**
 * Guide's round button, as the Osmosis app's guide-orb on first load: a lime
 * orb with a slowly turning swirl of greens, a white glint and the black mark.
 * It stays that way (user decision): unlike Osmosis it never settles to white.
 */
function GuideOrb({ destination, active, onPress }: { destination: NavigationBarDestination; active: boolean; onPress: () => void }) {
  const swirlId = useSvgId('orb-swirl');
  const glintId = useSvgId('orb-glint');
  const greenId = useSvgId('orb-green');
  const paleId = useSvgId('orb-pale');
  const [spin] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const swirl = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: true }));
    swirl.start();
    return () => swirl.stop();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    // The shadow sits on an outer view: iOS drops it on the ripple, which clips to its circle.
    <View style={[styles.floatingButton, { backgroundColor: ORB_LIME }]}>
      <View style={styles.orbClip}>
        <Animated.View pointerEvents="none" style={[styles.orbSwirl, { transform: [{ rotate }] }]}>
          <Svg width="100%" height="100%" viewBox="0 0 1 1">
            <Defs>
              <RadialGradient id={swirlId} cx="0.5" cy="0.5" r="0.5">
                <Stop offset="0" stopColor="#a2ee12" />
                <Stop offset="0.45" stopColor="#b8f24c" />
                <Stop offset="0.8" stopColor="#d9f8a6" />
                <Stop offset="1" stopColor="#e8fbc9" />
              </RadialGradient>
              <RadialGradient id={greenId} cx="0.3" cy="0.75" r="0.45">
                <Stop offset="0" stopColor="#8fe000" stopOpacity={1} />
                <Stop offset="1" stopColor="#8fe000" stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id={paleId} cx="0.75" cy="0.25" r="0.5">
                <Stop offset="0" stopColor="#e8fbc9" stopOpacity={1} />
                <Stop offset="1" stopColor="#e8fbc9" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width={1} height={1} fill={`url(#${swirlId})`} />
            <Rect width={1} height={1} fill={`url(#${greenId})`} />
            <Rect width={1} height={1} fill={`url(#${paleId})`} />
          </Svg>
        </Animated.View>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Svg width="100%" height="100%" viewBox="0 0 1 1">
            <Defs>
              <RadialGradient id={glintId} cx="0.74" cy="0.44" r="0.26">
                <Stop offset="0" stopColor="#ffffff" stopOpacity={0.95} />
                <Stop offset="0.27" stopColor="#ffffff" stopOpacity={0.95} />
                <Stop offset="1" stopColor="#ffffff" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width={1} height={1} fill={`url(#${glintId})`} />
          </Svg>
        </View>
      </View>
      <TouchableRipple onPress={onPress} accessibilityRole="tab" aria-selected={active} accessibilityLabel={destination.label} borderless style={styles.floatingButtonInner}>
        <View style={styles.floatingItemContent}>
          <View>
            <GuideMark size={24} color={ORB_INK} />
            {destination.badge ? <Badge size={6} style={styles.floatingBadge} /> : null}
          </View>
          <Text numberOfLines={1} style={[styles.floatingLabel, { color: ORB_INK }]}>
            {destination.label}
          </Text>
        </View>
      </TouchableRipple>
    </View>
  );
}

/** A floating bar item: icon over label, the whole pill lime while active. */
function FloatingNavItem({
  destination,
  active,
  onPress,
  popIn = false,
  style,
}: {
  destination: NavigationBarDestination;
  active: boolean;
  onPress: () => void;
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
      // Not borderless: that clips to the pill, cutting the ends off a long label.
      style={[style, styles.floatingItem, active && { backgroundColor: indicatorColor }]}>
      <Animated.View
        style={[styles.floatingItemContent, { opacity: entrance, transform: [{ scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
        <NavGlyph destination={destination} active={active} />
        <Text
          numberOfLines={1}
          style={[styles.floatingLabel, { color: theme.colors.onSurface, fontFamily: active ? Fonts.medium : Fonts.regular }]}>
          {destination.label}
        </Text>
      </Animated.View>
    </TouchableRipple>
  );
}

/** A destination's 24dp glyph, with its badge. */
export function NavGlyph({ destination, active }: { destination: NavigationBarDestination; active: boolean }) {
  const theme = useTheme();
  return (
    <View>
      {destination.svg ? (
        <LocalSvg asset={active ? destination.svg.focused : destination.svg.icon} width={24} height={24} color={theme.colors.onSurface} />
      ) : (
        <Icon source={active ? destination.focusedIcon : destination.icon} size={24} color={theme.colors.onSurface} />
      )}
      {destination.badge ? (
        <Badge size={destination.badge === true ? 6 : 16} style={styles.floatingBadge}>
          {destination.badge === true ? undefined : destination.badge}
        </Badge>
      ) : null}
    </View>
  );
}

function DockedNavigationBar({ destinations, activeKey, onChange, overflow, onRestingHeightChange, respectSafeArea = true }: NavigationBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const fadeId = useSvgId('nav-fade');
  const bottomInset = respectSafeArea ? insets.bottom : 0;
  const expanded = overflow?.expanded ?? false;
  const indicatorColor = useIndicatorColor();

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
    <Animated.View pointerEvents="box-none" style={{ paddingTop: progress.interpolate({ inputRange: [0, 1], outputRange: [0, EXPANDED_FADE_HEIGHT] }) }}>
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
      <View
        style={[
          APP_PAGE_LAYOUT ? styles.appBar : styles.bar,
          { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.surfaceVariant, paddingBottom: bottomInset },
          // Expanded, the panel's top corners round off (Figma 7160:45316).
          APP_PAGE_LAYOUT && expanded && styles.appBarExpanded,
        ]}>
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
              {APP_PAGE_LAYOUT ? (
                // Figma 7160:45365: the modules sit straight above the bar, 12dp from the panel's top, no title or rules.
                <View style={styles.appPanelTop} />
              ) : (
                <>
                  <Text accessibilityRole="header" style={[styles.panelTitle, { color: theme.colors.onSurfaceVariant }]}>
                    {overflow.title.toUpperCase()}
                  </Text>
                  <View style={[styles.divider, styles.titleDivider, { backgroundColor: theme.colors.surfaceVariant }]} />
                </>
              )}
              <View style={styles.gridRows}>
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
              </View>
              {APP_PAGE_LAYOUT ? <View style={styles.appPanelBottom} /> : <View style={[styles.divider, { backgroundColor: theme.colors.surfaceVariant }]} />}
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
                {APP_PAGE_LAYOUT ? (
                  // Figma 7160:45316: an arrow up; expanded, a filled arrow down on the lime pill.
                  <View style={[styles.indicator, expanded && { width: 56, backgroundColor: indicatorColor }]}>
                    <LocalSvg asset={expanded ? MORE_EXPANDED : MORE} width={24} height={24} color={theme.colors.onSurface} />
                  </View>
                ) : (
                  <View style={styles.indicator}>
                    <Animated.View style={{ transform: [{ rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}>
                      <Icon source="caret-up" size={24} color={theme.colors.onSurface} />
                    </Animated.View>
                  </View>
                )}
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
    <TouchableRipple onPress={onPress} accessibilityRole="tab" aria-selected={active} accessibilityLabel={destination.label} borderless style={style}>
      <Animated.View
        style={[styles.itemContent, { opacity: entrance, transform: [{ scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
        <View style={[styles.indicator, active && { width: 56, backgroundColor: indicatorColor }]}>
          {destination.svg ? (
            <LocalSvg asset={active ? destination.svg.focused : destination.svg.icon} width={24} height={24} color={theme.colors.onSurface} />
          ) : (
            <Icon source={active ? destination.focusedIcon : destination.icon} size={24} color={theme.colors.onSurface} />
          )}
          {destination.badge ? (
            <Badge size={destination.badge === true ? 6 : 16} style={styles.badge}>
              {destination.badge === true ? undefined : destination.badge}
            </Badge>
          ) : null}
        </View>
        {/* The app pages (Figma 7110:116411) keep every label regular; the pill alone marks the active one. */}
        <Text numberOfLines={1} style={[styles.label, { color: theme.colors.onSecondaryContainer, fontFamily: active && !APP_PAGE_LAYOUT ? Fonts.medium : Fonts.regular }]}>
          {destination.label}
        </Text>
      </Animated.View>
    </TouchableRipple>
  );
}

const ITEM_RADIUS = Shape.max;
// The floating bar: 64dp tall, items inset 5dp, 16dp from the screen's edges, 12dp from Guide.
const FLOATING_HEIGHT = 64;
const FLOATING_INSET = 5;
const FLOATING_GAP = 16;
// Between the bar and the Guide orb.
const FLOATING_SPACING = 12;
// The white fade behind the bar (Osmosis: 135px).
const FLOATING_FADE_HEIGHT = 135;
// The Guide orb's lime (Osmosis guide-orb) and the dark ink on it, the same in light and dark mode.
const ORB_LIME = '#b8f24c';
const ORB_INK = '#0a0a0a';
// Osmosis's 8% on the web; iOS renders the same shadow lighter, so native gets a little more.
const FLOATING_SHADOW_OPACITY = Platform.OS === 'web' ? 0.08 : 0.14;
// Figma rounds the indicator fully (16dp); the app pages follow it, the older layout capped it at Shape.max.
const INDICATOR_RADIUS = APP_PAGE_LAYOUT ? 16 : Shape.max;
const MORE = require('../../../assets/images/nav/arrow-up2-outline.svg');
const MORE_EXPANDED = require('../../../assets/images/nav/arrow-down2-filled.svg');

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
  // Figma 7110:116411: white, no hairline, shadow 0 −1 16 2 at 10% black.
  appBar: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -1 },
    elevation: 12,
  },
  appBarExpanded: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  appPanelTop: { height: 12 },
  appPanelBottom: { height: 8 },
  panel: { overflow: 'hidden' },
  panelContent: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  panelTitle: { fontFamily: Fonts.semiBold, fontSize: 12, lineHeight: 16, letterSpacing: 1, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 12 },
  // Same side padding as the bar's row, so the grid's columns sit over its items.
  gridRow: { flexDirection: 'row', paddingHorizontal: 8 },
  // Breathing room between the rows of modules.
  gridRows: { gap: APP_PAGE_LAYOUT ? 0 : 12 },
  gridItem: { width: `${100 / OVERFLOW_COLUMNS}%`, borderRadius: ITEM_RADIUS },
  // Separators run edge to edge across the bar.
  // Room above the modules and between them and the bar's own items.
  divider: { height: 1, marginTop: 16 },
  titleDivider: { marginTop: 0, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 8 },
  item: { flex: 1, borderRadius: ITEM_RADIUS },
  itemContent: { alignItems: 'center', gap: 4, paddingTop: 6, paddingBottom: 10 },
  indicator: { width: 32, height: 32, borderRadius: INDICATOR_RADIUS, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 2, right: 8 },
  // Floating bar (Osmosis app): 16dp off the sides and bottom, 12dp between the bar and the Guide button.
  floatingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: FLOATING_SPACING, paddingHorizontal: FLOATING_GAP },
  floatingBarExpanded: { borderRadius: 28 },
  // Room above the modules, between their rows, and between them and the bar's own row.
  floatingPanelContent: { paddingTop: 12, paddingBottom: 12, gap: 12 },
  floatingGridRow: { flexDirection: 'row', paddingHorizontal: FLOATING_INSET },
  floatingFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: FLOATING_FADE_HEIGHT },
  orbClip: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: FLOATING_HEIGHT / 2, overflow: 'hidden' },
  // Osmosis sizes the swirl 30% past the orb on every side, so its edges never show as it turns.
  orbSwirl: { position: 'absolute', top: -19, left: -19, right: -19, bottom: -19 },
  floatingBar: {
    flex: 1,
    borderRadius: FLOATING_HEIGHT / 2,
    // Shadow 0 6 24 at 8% slate, as the Osmosis bar.
    shadowColor: '#0f172a',
    shadowOpacity: FLOATING_SHADOW_OPACITY,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  floatingItems: { flexDirection: 'row', height: FLOATING_HEIGHT, alignItems: 'center', paddingHorizontal: FLOATING_INSET },
  floatingItem: { height: FLOATING_HEIGHT - FLOATING_INSET * 2, borderRadius: (FLOATING_HEIGHT - FLOATING_INSET * 2) / 2, justifyContent: 'center' },
  floatingItemContent: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  floatingLabel: { fontSize: 12, lineHeight: 16, textAlign: 'center' },
  floatingButton: {
    width: FLOATING_HEIGHT,
    height: FLOATING_HEIGHT,
    borderRadius: FLOATING_HEIGHT / 2,
    shadowColor: '#0f172a',
    shadowOpacity: FLOATING_SHADOW_OPACITY,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  floatingButtonInner: { flex: 1, borderRadius: FLOATING_HEIGHT / 2, justifyContent: 'center' },
  floatingBadge: { position: 'absolute', top: -1, right: -3 },
  label: { fontSize: 10, lineHeight: 12, letterSpacing: 0.15, textAlign: 'center' },
});
