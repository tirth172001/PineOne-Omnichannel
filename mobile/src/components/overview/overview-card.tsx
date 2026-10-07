import type { ReactNode } from 'react';
import { type ImageSourcePropType, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { LocalSvg } from 'react-native-svg/css';

import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

/**
 * Building blocks for the Overview's Today cards (Figma 6470:685 / 6470:737,
 * "PineOne - Omni-channel"): a centred uppercase title, a centred summary over
 * a soft coloured glow, divided rows, and a centred footer link.
 */

const CARD_PADDING = 12;
/** Figma's base/accent: the hairlines between a card's sections. */
const HAIRLINE = 1;

/**
 * The card surface: borderless white on the grey page, like the app's other
 * cards (user decision). A plain View rather than Paper's Card: on iOS a
 * Card's content doesn't stretch with it (so a section can't grow to fill a
 * card that matches its neighbour's height), and Card passes an `index` prop
 * to its children, which Fragments reject.
 */
export function OverviewCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return <View style={[styles.card, { backgroundColor: theme.colors.surface }, style]}>{children}</View>;
}

/** The card's centred, uppercase muted title. */
export function OverviewCardHeader({ title }: { title: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.header, { borderBottomColor: theme.colors.surfaceVariant }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>
        {title.toUpperCase()}
      </Text>
    </View>
  );
}

/** A section of the card's body, with the hairline above it. */
export function OverviewCardDivider() {
  const theme = useTheme();
  return <View style={{ height: HAIRLINE, backgroundColor: theme.colors.surfaceVariant }} />;
}

/**
 * The glow behind a card's summary (Figma: a blurred ellipse, 222×52, peeking
 * in from the section's top edge). Drawn from the design's own SVG, blur
 * included, centred on the card.
 */
export function OverviewCardGlow({ source }: { source: ImageSourcePropType }) {
  return (
    <View pointerEvents="none" style={styles.glow}>
      <LocalSvg asset={source} width={GLOW_WIDTH} height={GLOW_HEIGHT} />
    </View>
  );
}

/** Centred text link with a trailing caret, e.g. "View payment history ›". */
export function OverviewCardFooter({ label, onPress }: { label: string; onPress?: () => void }) {
  const theme = useTheme();
  return (
    <View style={[styles.footer, { borderTopColor: theme.colors.surfaceVariant }]}>
      <TouchableRipple onPress={onPress} borderless accessibilityRole="button" style={styles.footerButton}>
        <View style={styles.footerButtonContent}>
          <Text style={[styles.footerLabel, { color: theme.colors.primary }]}>{label}</Text>
          <Icon source="caret-right" size={16} color={theme.colors.primary} />
        </View>
      </TouchableRipple>
    </View>
  );
}

// The glow SVG is the 222×52 ellipse plus its 100dp blur on every side, sitting 32dp above the section.
const GLOW_WIDTH = 422;
const GLOW_HEIGHT = 252;
const GLOW_TOP = -32 - 100;

// Figma rounds the card at 18dp; the app caps every radius at Shape.max.
const CARD_RADIUS = Shape.max;
const FOOTER_PADDING_Y = 8;
const FOOTER_BUTTON_RADIUS = concentric(CARD_RADIUS, FOOTER_PADDING_Y, 32);

const styles = StyleSheet.create({
  card: { borderRadius: CARD_RADIUS, overflow: 'hidden' },
  header: { alignItems: 'center', paddingHorizontal: CARD_PADDING, paddingVertical: 16, borderBottomWidth: HAIRLINE },
  title: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 12, letterSpacing: 0.6 },
  glow: { position: 'absolute', top: GLOW_TOP, left: '50%', marginLeft: -GLOW_WIDTH / 2, width: GLOW_WIDTH, height: GLOW_HEIGHT },
  footer: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: FOOTER_PADDING_Y, borderTopWidth: HAIRLINE },
  footerButton: { borderRadius: FOOTER_BUTTON_RADIUS },
  footerButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, paddingHorizontal: 10 },
  footerLabel: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
});

export const OVERVIEW_CARD_PADDING = CARD_PADDING;
