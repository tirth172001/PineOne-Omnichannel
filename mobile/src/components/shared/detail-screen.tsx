import { router, type Href } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useOpenScopeSwitcher } from '@/components/scope-switcher';
import { ShellTopBar } from '@/components/shell-top-bar';
import { useBusiness } from '@/hooks/use-business';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

import { useSvgId } from './hatch';

/** Web status gradients (from-success/25 via-success/10 to-background, etc.). */
export const STATUS_GRADIENT = {
  success: '#10b981',
  failed: '#ef4444',
  processing: '#f59e0b',
  neutral: '#8b5cf6',
  info: '#0ea5e9',
} as const;
export type StatusGradientTone = keyof typeof STATUS_GRADIENT;

const GRADIENT_HEIGHT = 300;

/** The web detail pages' 300px status-coloured wash behind the header. */
function StatusGradient({ tone }: { tone: StatusGradientTone }) {
  const id = useSvgId('status-gradient');
  const color = STATUS_GRADIENT[tone];
  return (
    <Svg pointerEvents="none" style={styles.gradient} width="100%" height={GRADIENT_HEIGHT}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.25} />
          <Stop offset="0.5" stopColor={color} stopOpacity={0.1} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

type DetailScreenProps = {
  title: string;
  /** Where Back goes when there's no history (e.g. the page was opened directly). */
  fallbackHref: Href;
  gradient?: StatusGradientTone;
  /** Appbar actions, e.g. an overflow or download icon. */
  actions?: ReactNode;
  /** Set false when the screen lays out its own scrolling, e.g. a chat with a pinned composer. */
  scroll?: boolean;
  /**
   * The screen's main call(s) to action, pinned to the bottom (e.g. Refund
   * transaction). Buttons should use DETAIL_FOOTER_BUTTON_RADIUS; lay out two
   * side by side with `flex: 1`, primary last.
   */
  footer?: ReactNode;
  /**
   * The page's data follows the global store / channel scope: the title row
   * shows it as "<stores> · <channel> ▾" underneath, like the home header,
   * and tapping it opens the switcher.
   */
  scoped?: boolean;
  children: ReactNode;
};

const ROW_PADDING = 12;
const FOOTER_PADDING = 16;
/** Radius for buttons in the pinned footer (16dp inside its rounded top corners). */
export const DETAIL_FOOTER_BUTTON_RADIUS = concentric(Shape.max, FOOTER_PADDING);
// Back / action buttons sit 12dp inside the rounded top bar.
const HEADER_BUTTON_RADIUS = concentric(Shape.max, ROW_PADDING, 40);

/**
 * Frame for a pushed detail screen (web: the detail pages' "← Back" row):
 * rounded top bar with back and title, then scrolling content over the web's
 * status gradient, and an optional pinned footer holding the main call to
 * action. Replaces the org header (and the nav bar) while a detail is open.
 */
export function DetailScreen({ title, fallbackHref, gradient, actions, scroll = true, footer, scoped = false, children }: DetailScreenProps) {
  const theme = useTheme();
  const goBack = () => (router.canGoBack() ? router.back() : router.navigate(fallbackHref));

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ShellTopBar>
        <Appbar.Header mode="small" elevated={false} style={styles.appbar}>
          <Appbar.Action icon="arrow-left" onPress={goBack} accessibilityLabel="Back" style={styles.headerButton} />
          {scoped ? <ScopedTitle title={title} /> : <Appbar.Content title={title} titleStyle={styles.title} />}
          {actions}
        </Appbar.Header>
      </ShellTopBar>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {gradient ? <StatusGradient tone={gradient} /> : null}
          {children}
        </ScrollView>
      ) : (
        <View style={styles.screen}>{children}</View>
      )}
      {footer ? <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>{footer}</View> : null}
    </View>
  );
}

/** Page title with the current scope and an arrow under it (the home header's subtext). */
function ScopedTitle({ title }: { title: string }) {
  const theme = useTheme();
  const { scopeText } = useBusiness();
  // Scoped inner pages are channel-split, so never "All channels".
  const scope = scopeText(false);
  const openScopeSwitcher = useOpenScopeSwitcher();
  return (
    <TouchableRipple
      onPress={openScopeSwitcher}
      borderless
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${scope}. Switch store or channel`}
      style={styles.scopedTitle}>
      <View>
        <Text variant="titleMedium" numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.scope}>
          <Text variant="bodySmall" numberOfLines={1} style={[styles.scopeText, { color: theme.colors.onSurfaceVariant }]}>
            {scope}
          </Text>
          <Icon source="caret-down" size={14} color={theme.colors.onSurfaceVariant} />
        </View>
      </View>
    </TouchableRipple>
  );
}

type CollapsingDetailScreenProps = {
  fallbackHref: Href;
  gradient?: StatusGradientTone;
  /** Large summary at the top of the page (e.g. mode tile, amount, status, meta). */
  hero: ReactNode;
  /** What the hero collapses into in the header, e.g. the amount… */
  compactTitle: string;
  /** …and the pay mode under it. */
  compactSubtitle?: string;
  footer?: ReactNode;
  /** Floats just above the footer (e.g. a search button); the caller animates it. */
  floating?: ReactNode;
  /** Scroll offset and visible height, e.g. to show `floating` only over a section. */
  onScroll?: (offsetY: number, viewportHeight: number) => void;
  children: ReactNode;
};

/**
 * Detail screen whose header starts as just a back button over the status
 * gradient. As the page scrolls, the hero shrinks and fades while a compact
 * version of it (compactTitle / compactSubtitle) slides into the header and
 * the header's surface fades in behind it — all driven continuously by the
 * scroll position, so the hand-off is seamless.
 */
export function CollapsingDetailScreen({
  fallbackHref,
  gradient,
  hero,
  compactTitle,
  compactSubtitle,
  footer,
  floating,
  onScroll,
  children,
}: CollapsingDetailScreenProps) {
  const theme = useTheme();
  const goBack = () => (router.canGoBack() ? router.back() : router.navigate(fallbackHref));
  const [scrollY] = useState(() => new Animated.Value(0));
  const [headerHeight, setHeaderHeight] = useState(64);
  const [heroHeight, setHeroHeight] = useState(180);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  // Scroll distance over which the hero hands off to the header.
  const collapse = Math.max(heroHeight - 24, 1);
  const range = (input: number[], output: number[]) => scrollY.interpolate({ inputRange: input, outputRange: output, extrapolate: 'clamp' });

  const surfaceOpacity = range([collapse * 0.5, collapse], [0, 1]);
  const heroOpacity = range([0, collapse * 0.75], [1, 0]);
  const heroScale = range([0, collapse], [1, 0.8]);
  // Drifts down a little as it scrolls up, so it appears to sink into the header.
  const heroShift = range([0, collapse], [0, collapse * 0.3]);
  const compactOpacity = range([collapse * 0.6, collapse], [0, 1]);
  const compactShift = range([collapse * 0.6, collapse], [10, 0]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
          listener: onScroll
            ? (event: { nativeEvent: { contentOffset: { y: number } } }) => onScroll(event.nativeEvent.contentOffset.y, viewportHeight)
            : undefined,
        })}
        onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingTop: headerHeight }]}>
        {gradient ? <StatusGradient tone={gradient} /> : null}
        <Animated.View
          onLayout={(event) => setHeroHeight(event.nativeEvent.layout.height)}
          style={{ opacity: heroOpacity, transform: [{ translateY: heroShift }, { scale: heroScale }] }}>
          {hero}
        </Animated.View>
        {children}
      </Animated.ScrollView>

      {/* Floats over the content so the gradient runs up behind it until the surface fades in. */}
      <View style={styles.floatingHeader} onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}>
        <Animated.View pointerEvents="none" style={[styles.headerSurface, { backgroundColor: theme.colors.surface, opacity: surfaceOpacity }]} />
        <Appbar.Header mode="small" elevated={false} style={styles.appbar}>
          <Appbar.Action icon="arrow-left" onPress={goBack} accessibilityLabel="Back" style={styles.headerButton} />
          <Animated.View
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[styles.compact, { opacity: compactOpacity, transform: [{ translateY: compactShift }] }]}>
            <Text variant="titleMedium" numberOfLines={1} style={styles.compactTitle}>
              {compactTitle}
            </Text>
            {compactSubtitle ? (
              <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
                {compactSubtitle}
              </Text>
            ) : null}
          </Animated.View>
        </Appbar.Header>
      </View>

      {floating ? (
        <View pointerEvents="box-none" style={[styles.floating, { bottom: footerHeight + 16 }]}>
          {floating}
        </View>
      ) : null}

      {footer ? (
        <View onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)} style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}

export const DETAIL_HEADER_BUTTON_STYLE = { borderRadius: HEADER_BUTTON_RADIUS };

const styles = StyleSheet.create({
  screen: { flex: 1 },
  appbar: { backgroundColor: 'transparent', paddingHorizontal: 4 },
  headerButton: { borderRadius: HEADER_BUTTON_RADIUS },
  title: { fontSize: 16, lineHeight: 24 },
  scopedTitle: { flex: 1, borderRadius: HEADER_BUTTON_RADIUS, paddingHorizontal: 8, paddingVertical: 2, marginRight: 4 },
  scope: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  scopeText: { flexShrink: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 24 },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0 },
  floatingHeader: { position: 'absolute', top: 0, left: 0, right: 0 },
  floating: { position: 'absolute', left: 16, right: 16 },
  // Same shape as the shell's top bar: attached to the top edge, bottom corners rounded.
  headerSurface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: Shape.max,
    borderBottomRightRadius: Shape.max,
  },
  compact: { flex: 1, paddingHorizontal: 8 },
  compactTitle: { fontFamily: Fonts.semiBold },
  // Attached to the bottom edge, so only the content-facing (top) corners are rounded.
  footer: {
    flexDirection: 'row',
    gap: 8,
    padding: FOOTER_PADDING,
    borderTopLeftRadius: Shape.max,
    borderTopRightRadius: Shape.max,
  },
});
