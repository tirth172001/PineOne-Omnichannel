import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { ShellTopBar } from '@/components/shell-top-bar';
import { concentric, Shape } from '@/constants/shape';

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
export function DetailScreen({ title, fallbackHref, gradient, actions, scroll = true, footer, children }: DetailScreenProps) {
  const theme = useTheme();
  const goBack = () => (router.canGoBack() ? router.back() : router.navigate(fallbackHref));

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ShellTopBar>
        <Appbar.Header mode="small" elevated={false} style={styles.appbar}>
          <Appbar.Action icon="arrow-left" onPress={goBack} accessibilityLabel="Back" style={styles.headerButton} />
          <Appbar.Content title={title} titleStyle={styles.title} />
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

export const DETAIL_HEADER_BUTTON_STYLE = { borderRadius: HEADER_BUTTON_RADIUS };

const styles = StyleSheet.create({
  screen: { flex: 1 },
  appbar: { backgroundColor: 'transparent', paddingHorizontal: 4 },
  headerButton: { borderRadius: HEADER_BUTTON_RADIUS },
  title: { fontSize: 16, lineHeight: 24 },
  content: { padding: 16, paddingBottom: 32, gap: 24 },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0 },
  // Attached to the bottom edge, so only the content-facing (top) corners are rounded.
  footer: {
    flexDirection: 'row',
    gap: 8,
    padding: FOOTER_PADDING,
    borderTopLeftRadius: Shape.max,
    borderTopRightRadius: Shape.max,
  },
});
