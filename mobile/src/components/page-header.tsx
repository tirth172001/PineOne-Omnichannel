import { router, type Href } from 'expo-router';
import { type ReactNode, type RefObject, useState } from 'react';
import { Animated, type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OutlineTag } from '@/components/shared/status';
import { useAppColors } from '@/constants/app-colors';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

/**
 * The page header every screen shares (reference: Figma 6254:20, Mercury and
 * Revolut Business). From the top:
 *
 * 1. The top bar. A tab's page has AppHeader (Figma 6470:982): on Overview,
 *    who's signed in, with notifications; on the other tabs, the page's name
 *    and its actions. Both show the store / channel scope. An inner page has
 *    PageTopBar — Back and the page's main call to action; it floats over the
 *    page and fades its surface in, with a small title, once the large title
 *    has scrolled away.
 * 2. PageTitle — the large, left-aligned title (with an optional subtitle),
 *    first thing in the scrolling content.
 * 3. The page's toolbar (ListingToolbar): search with every filter combined
 *    under one Filters button, then the page-level actions in a scrolling row.
 *
 * useCollapsingHeader drives the hand-off between 1 and 2 from the scroll
 * position, as the tab pages did before.
 */

/** Height of the top bar's row, under the status bar. */
const BAR_HEIGHT = 56;
const CONTROL_HEIGHT = 40;
/** Header controls sit on the page like its other page-level controls (the header's surface only fades in on scroll). */
export const HEADER_CONTROL_RADIUS = Shape.small;

export type HeaderCollapse = {
  scrollY: Animated.Value;
  /** 0 while the large title shows, 1 once it has scrolled away under the bar. */
  collapsed: Animated.AnimatedInterpolation<number>;
  /** The bar's surface fades in a little ahead of the small title. */
  surfaceOpacity: Animated.AnimatedInterpolation<number>;
  /** Style for the large title: it shrinks, sinks and fades as it scrolls away. */
  titleStyle: Animated.WithAnimatedObject<object>;
  onTitleLayout: (event: LayoutChangeEvent) => void;
  titleHeight: number;
  /** The floating bar's height (status bar included): pad the scrolling content by it. */
  barHeight: number;
  onBarLayout: (event: LayoutChangeEvent) => void;
};

/** The scroll-driven collapse shared by tab pages and inner pages: feed `scrollY` from the page's Animated.ScrollView. */
export function useCollapsingHeader(): HeaderCollapse {
  const [scrollY] = useState(() => new Animated.Value(0));
  const [titleHeight, setTitleHeight] = useState(0);
  const [barHeight, setBarHeight] = useState(0);
  const collapse = Math.max(titleHeight, 1);
  const range = (input: number[], output: number[]) => scrollY.interpolate({ inputRange: input, outputRange: output, extrapolate: 'clamp' });

  return {
    scrollY,
    collapsed: range([collapse * 0.6, collapse], [0, 1]),
    surfaceOpacity: range([collapse * 0.5, collapse], [0, 1]),
    titleStyle: {
      opacity: range([0, collapse * 0.75], [1, 0]),
      // Drifts down a little as it scrolls up, so it appears to sink into the bar.
      transform: [{ translateY: range([0, collapse], [0, collapse * 0.3]) }, { scale: range([0, collapse], [1, 0.9]) }],
    },
    onTitleLayout: (event) => setTitleHeight(event.nativeEvent.layout.height),
    titleHeight,
    barHeight,
    onBarLayout: (event) => setBarHeight(event.nativeEvent.layout.height),
  };
}

type PageTopBarProps = {
  /** Leading control: ScopeSwitcherButton on a tab's page, BackButton on an inner page. */
  leading?: ReactNode;
  /** The small title that comes in as the large one scrolls away. */
  title: string;
  /** A line under the small title (e.g. the store / channel scope). */
  subtitle?: string;
  /** Next to the small title, e.g. the user's role on Overview. */
  badge?: string;
  /** Makes the small title a button (the switcher, when it takes the switcher's place). */
  onPressTitle?: () => void;
  titleAccessibilityLabel?: string;
  /**
   * The small title replaces the leading control as it comes in (a tab's
   * switcher, whose job the small title then does), rather than sitting beside
   * it (Back stays).
   */
  replaceLeading?: boolean;
  /** Trailing control(s): the page's main call to action, or notifications on Overview. */
  trailing?: ReactNode;
  collapsed: Animated.AnimatedInterpolation<number> | Animated.Value;
  surfaceOpacity: Animated.AnimatedInterpolation<number> | Animated.Value;
  onLayout?: (event: LayoutChangeEvent) => void;
  /** Rounded bottom corners on the surface; off when sub-tabs dock beneath it. */
  roundedSurface?: boolean;
};

/**
 * The header's top row, floating over the page: leading control, small title
 * and trailing control. Its surface and small title fade in with the scroll
 * position (`collapsed`, `surfaceOpacity`).
 */
export function PageTopBar({
  leading,
  title,
  subtitle,
  badge,
  onPressTitle,
  titleAccessibilityLabel,
  replaceLeading = false,
  trailing,
  collapsed,
  surfaceOpacity,
  onLayout,
  roundedSurface = true,
}: PageTopBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  // When the small title takes the leading control's place, one fades out before the other fades in, so they never overlap mid-scroll.
  const leadingOpacity = replaceLeading ? collapsed.interpolate({ inputRange: [0, 0.4], outputRange: [1, 0], extrapolate: 'clamp' }) : 1;
  const titleOpacity = replaceLeading ? collapsed.interpolate({ inputRange: [0.5, 1], outputRange: [0, 1], extrapolate: 'clamp' }) : collapsed;
  const titleShift = collapsed.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  const titleBlock = (
    <View>
      <View style={styles.smallTitleRow}>
        <Text variant="titleMedium" numberOfLines={1} style={styles.smallTitle}>
          {title}
        </Text>
        {badge ? <OutlineTag label={badge} /> : null}
      </View>
      {subtitle ? (
        <View style={styles.smallSubtitleRow}>
          <Text variant="bodySmall" numberOfLines={1} style={[styles.shrink, { color: theme.colors.onSurfaceVariant }]}>
            {subtitle}
          </Text>
          {onPressTitle ? <Icon source="caret-down" size={14} color={theme.colors.onSurfaceVariant} /> : null}
        </View>
      ) : null}
    </View>
  );

  return (
    <View pointerEvents="box-none" onLayout={onLayout} style={[styles.bar, { paddingTop: insets.top }]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.surface, roundedSurface && styles.surfaceRounded, { backgroundColor: theme.colors.surface, opacity: surfaceOpacity }]}
      />
      <View style={styles.row}>
        <View style={styles.leading}>
          {leading ? <Animated.View style={{ opacity: leadingOpacity }}>{leading}</Animated.View> : null}
          <Animated.View
            // Only a button once it's the thing on show; until then taps reach the leading control.
            pointerEvents={onPressTitle ? 'box-none' : 'none'}
            style={[replaceLeading ? styles.smallTitleOver : styles.smallTitleBeside, { opacity: titleOpacity, transform: [{ translateY: titleShift }] }]}>
            {onPressTitle ? (
              <TouchableRipple
                onPress={onPressTitle}
                borderless
                accessibilityRole="button"
                accessibilityLabel={titleAccessibilityLabel ?? title}
                style={styles.smallTitleButton}>
                {titleBlock}
              </TouchableRipple>
            ) : (
              <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.smallTitleButton}>
                {titleBlock}
              </View>
            )}
          </Animated.View>
        </View>
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
    </View>
  );
}

type AppHeaderProps = {
  /** Overview: the signed-in user (initials avatar, name and role). Other tabs: omit, and pass the page's `title`. */
  user?: { name: string; roleLabel: string };
  title?: string;
  /** Under the title: the store / channel scope, or the organisation on pages that don't follow it. */
  context: string;
  /** Makes the context line the store / channel switcher (with a caret). */
  onPressContext?: () => void;
  contextAccessibilityLabel?: string;
  /** The avatar opens the profile panel. */
  onPressAvatar?: () => void;
  /** The scope line, for measuring where it sits (see useScopeLine). */
  contextRef?: RefObject<View | null>;
  onContextLayout?: () => void;
  /** 0–1: a lime pulse behind the scope line, e.g. when the scope changes. */
  contextHighlight?: Animated.Value;
  trailing?: ReactNode;
  onLayout?: (event: LayoutChangeEvent) => void;
};

/**
 * A tab page's top bar (Figma 6470:982). Overview leads with the user — their
 * initials (opening the profile panel), name and role; the other tabs with the
 * page's name. Under it, the store / channel scope, which opens the global
 * switcher; the trailing controls at the end. A solid white bar that stays
 * put while the page scrolls under it.
 */
export function AppHeader({
  user,
  title,
  context,
  onPressContext,
  contextAccessibilityLabel,
  onPressAvatar,
  contextRef,
  onContextLayout,
  contextHighlight,
  trailing,
  onLayout,
}: AppHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const initials = user?.name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const contextText = (
    <Text numberOfLines={1} style={[styles.appHeaderContext, { color: theme.colors.onSurfaceVariant }]}>
      {context}
    </Text>
  );
  const appColors = useAppColors();
  const pulse = contextHighlight ? (
    <Animated.View
      pointerEvents="none"
      style={[styles.appHeaderContextPulse, { backgroundColor: appColors.highlight, opacity: contextHighlight }]}
    />
  ) : null;

  return (
    <View onLayout={onLayout} style={[styles.bar, { paddingTop: insets.top, backgroundColor: theme.colors.surface }]}>
      <View style={[styles.appHeaderRow, !user && styles.appHeaderRowTitled]}>
        <View style={styles.appHeaderLeading}>
          {user ? (
            <TouchableRipple
              onPress={onPressAvatar}
              borderless
              accessibilityRole="button"
              accessibilityLabel={`${user.name}, ${user.roleLabel}. Open profile`}
              style={styles.avatarTarget}>
              <View>
                <View style={[styles.avatar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant }]}>
                  <Text style={[styles.avatarInitials, { color: appColors.brand }]}>{initials}</Text>
                </View>
                <View style={[styles.avatarBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Icon source="list" size={9} color={theme.colors.onSurface} />
                </View>
              </View>
            </TouchableRipple>
          ) : null}
          <View style={styles.appHeaderText}>
            {user ? (
              <View style={styles.appHeaderNameRow}>
                <Text numberOfLines={1} style={styles.appHeaderName}>
                  {user.name}
                </Text>
                <OutlineTag label={user.roleLabel} radius={Shape.max} />
              </View>
            ) : (
              <Text accessibilityRole="header" numberOfLines={1} style={styles.appHeaderTitle}>
                {title}
              </Text>
            )}
            {onPressContext ? (
              <TouchableRipple
                onPress={onPressContext}
                borderless
                accessibilityRole="button"
                accessibilityLabel={contextAccessibilityLabel ?? context}
                style={styles.appHeaderContextButton}>
                <View ref={contextRef} collapsable={false} onLayout={onContextLayout} style={styles.appHeaderContextRow}>
                  {pulse}
                  {contextText}
                  <Icon source="caret-right" size={16} color={theme.colors.onSurfaceVariant} />
                </View>
              </TouchableRipple>
            ) : (
              <View style={styles.appHeaderContextRow}>{contextText}</View>
            )}
          </View>
        </View>
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
    </View>
  );
}

type PageTitleProps = {
  title: string;
  /** Beside the title, e.g. the user's role. */
  badge?: string;
  /** A muted line under the title: what the page is for, or the scope it shows. */
  subtitle?: string;
  /** Makes the subtitle a button with a caret, e.g. the scope opening the switcher. */
  onPressSubtitle?: () => void;
  subtitleAccessibilityLabel?: string;
  /** From useCollapsingHeader. */
  style?: Animated.WithAnimatedObject<object>;
  onLayout?: (event: LayoutChangeEvent) => void;
};

/** The page's large, left-aligned title, first thing in its scrolling content. */
export function PageTitle({ title, badge, subtitle, onPressSubtitle, subtitleAccessibilityLabel, style, onLayout }: PageTitleProps) {
  const theme = useTheme();
  const subtitleText = (
    <Text variant="bodyMedium" numberOfLines={2} style={[styles.shrink, { color: theme.colors.onSurfaceVariant }]}>
      {subtitle}
    </Text>
  );
  return (
    <Animated.View onLayout={onLayout} style={[styles.title, style]}>
      <View accessible accessibilityRole="header">
        {/* The badge stays beside the title; a long title truncates rather than wrapping it away. */}
        <View style={styles.largeTitleRow}>
          <Text numberOfLines={1} style={styles.largeTitle}>
            {title}
          </Text>
          {badge ? (
            <View style={styles.badge}>
              <OutlineTag label={badge} />
            </View>
          ) : null}
        </View>
      </View>
      {subtitle ? (
        onPressSubtitle ? (
          <TouchableRipple
            onPress={onPressSubtitle}
            borderless
            accessibilityRole="button"
            accessibilityLabel={subtitleAccessibilityLabel ?? subtitle}
            style={styles.subtitleButton}>
            <View style={styles.subtitleRow}>
              {subtitleText}
              <Icon source="caret-down" size={16} color={theme.colors.onSurfaceVariant} />
            </View>
          </TouchableRipple>
        ) : (
          subtitleText
        )
      ) : null}
    </Animated.View>
  );
}

type HeaderControlProps = {
  icon?: string;
  label?: string;
  /** A caret after the label: the control opens a menu or sheet. */
  caret?: boolean;
  /** The page's main call to action: filled in the brand colour. */
  primary?: boolean;
  /** Icon only, no fill (e.g. Overview's notifications). */
  quiet?: boolean;
  /** On a white bar (a tab's header): filled grey rather than white, so the control still reads as one. */
  tinted?: boolean;
  onPress?: () => void;
  accessibilityLabel: string;
};

/**
 * A control in the top bar: an icon tile (Back, notifications) or an icon and
 * label (the switcher, a "New" call to action). Borderless white, like the
 * app's other floating surfaces; filled for the page's main action.
 */
export function HeaderControl({ icon, label, caret = false, primary = false, quiet = false, tinted = false, onPress, accessibilityLabel }: HeaderControlProps) {
  const theme = useTheme();
  const color = primary ? theme.colors.onPrimary : theme.colors.onSurface;
  return (
    <TouchableRipple
      onPress={onPress}
      borderless
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.control, { backgroundColor: primary ? theme.colors.primary : quiet ? 'transparent' : tinted ? theme.colors.surfaceVariant : theme.colors.surface }, !label && styles.controlIconOnly]}>
      <View style={[styles.controlContent, label ? styles.controlContentLabelled : null]}>
        {icon ? <Icon source={icon} size={20} color={color} /> : null}
        {label ? (
          <Text variant="labelLarge" numberOfLines={1} style={[styles.controlLabel, { color }]}>
            {label}
          </Text>
        ) : null}
        {caret ? <Icon source="caret-down" size={14} color={primary ? color : theme.colors.onSurfaceVariant} /> : null}
      </View>
    </TouchableRipple>
  );
}

/** Back, for an inner page: returns to where the user came from, or `fallbackHref` when the page was opened directly. */
export function BackButton({ fallbackHref }: { fallbackHref: Href }) {
  return (
    <HeaderControl icon="arrow-left" accessibilityLabel="Back" onPress={() => (router.canGoBack() ? router.back() : router.navigate(fallbackHref))} />
  );
}

/**
 * The store / channel switcher, leading a tab's page: shows the current scope
 * (e.g. "In-store · Koramangala") and opens the global switcher.
 */
export function ScopeSwitcherButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <HeaderControl icon="storefront" label={label} caret onPress={onPress} accessibilityLabel={`${label}. Switch store or channel`} />;
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', top: 0, left: 0, right: 0 },
  appHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingLeft: 12, paddingRight: 16, paddingVertical: 12 },
  // Without the avatar, the title lines up with the page's 16dp margin; its controls centre on the two lines.
  appHeaderRowTitled: { paddingLeft: 16, alignItems: 'center' },
  appHeaderLeading: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 10, minWidth: 0 },
  avatarTarget: { width: CONTROL_HEIGHT, height: CONTROL_HEIGHT, borderRadius: Shape.max, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 32, height: 32, borderRadius: Shape.small, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  // The account menu's mark, on the avatar's bottom-right corner.
  avatarBadge: { position: 'absolute', left: 20, top: 20, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  appHeaderText: { flexShrink: 1, minHeight: 48, justifyContent: 'center' },
  appHeaderNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  appHeaderName: { fontFamily: Fonts.medium, fontSize: 16, lineHeight: 24, flexShrink: 1 },
  appHeaderTitle: { fontFamily: Fonts.semiBold, fontSize: 20, lineHeight: 24 },
  appHeaderContextButton: { alignSelf: 'flex-start', maxWidth: '100%', borderRadius: Shape.extraSmall },
  appHeaderContextRow: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 24 },
  // Bleeds a little past the line so the pulse reads as a highlight, not a box around the text.
  appHeaderContextPulse: { position: 'absolute', top: 0, bottom: 0, left: -6, right: -4, borderRadius: Shape.small },
  appHeaderContext: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 18, flexShrink: 1 },
  surface: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  // Attached to the top edge: only the content-facing (bottom) corners are rounded.
  surfaceRounded: { borderBottomLeftRadius: Shape.max, borderBottomRightRadius: Shape.max },
  row: { height: BAR_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  leading: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 0 },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallTitleBeside: { flex: 1, minWidth: 0 },
  // Takes the leading control's place (the row's full leading area).
  smallTitleOver: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center' },
  smallTitleButton: { alignSelf: 'flex-start', maxWidth: '100%', borderRadius: HEADER_CONTROL_RADIUS, paddingHorizontal: 4, paddingVertical: 2 },
  smallTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallTitle: { flexShrink: 1, fontFamily: Fonts.semiBold },
  smallSubtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  shrink: { flexShrink: 1 },
  // 16dp clear of the top bar; pulled 8dp into the page's 24dp section gap, so what follows (search) sits 16dp below.
  title: { gap: 4, paddingTop: 16, marginBottom: -8, transformOrigin: 'left top' },
  largeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // The title's glyphs sit low in its 31dp line box; nudge the badge to their optical centre.
  badge: { marginTop: 1.5 },
  // Web: text-2xl font-semibold leading-[1.3].
  largeTitle: { fontFamily: Fonts.semiBold, fontSize: 24, lineHeight: 31, flexShrink: 1 },
  subtitleButton: { alignSelf: 'flex-start', borderRadius: HEADER_CONTROL_RADIUS, marginHorizontal: -4 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 4, paddingVertical: 2 },
  control: { height: CONTROL_HEIGHT, borderRadius: HEADER_CONTROL_RADIUS, justifyContent: 'center', flexShrink: 1 },
  controlIconOnly: { width: CONTROL_HEIGHT },
  controlContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  controlContentLabelled: { paddingHorizontal: 12 },
  controlLabel: { fontFamily: Fonts.medium, flexShrink: 1 },
});
