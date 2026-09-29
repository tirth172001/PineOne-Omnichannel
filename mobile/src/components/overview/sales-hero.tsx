import { useState } from 'react';
import { Animated, type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Icon, IconButton, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { DimmedDecimalAmount } from '@/components/shared/amount';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { formatInr } from '@/data/overview';

type SalesHeroProps = {
  collected: number;
  count: number;
  failedCount: number;
  /** Still to reach the bank, and when (e.g. "Tomorrow · 03:00 PM"). */
  settling: number;
  nextSettlement: string;
  /** The store / channel scope, named in the explanation. */
  scope: string;
  onPressSettlement: () => void;
  /** From the tab header, so the hero collapses into it on scroll. */
  style?: Animated.WithAnimatedObject<object>;
  onLayout?: (event: LayoutChangeEvent) => void;
};

/**
 * Overview's hero (docs/design/mobile-home-reference-analysis.md, variant A:
 * sales first), centred with room around it so it's where the eye lands
 * (Revolut reference, user decision): a small label, today's collections as
 * the one large figure, one quiet line of context, and a pill saying when the
 * money reaches the bank. Failures are stated neutrally: they're customers'
 * failed attempts, not the merchant's money being held (design principle 2).
 */
export function SalesHero({ collected, count, failedCount, settling, nextSettlement, scope, onPressSettlement, style, onLayout }: SalesHeroProps) {
  const theme = useTheme();
  const [explained, setExplained] = useState(false);
  const muted = { color: theme.colors.onSurfaceVariant };
  const successRate = count > 0 ? Math.round(((count - failedCount) / count) * 100) : null;
  // "Tomorrow · 03:00 PM" reads as "tomorrow, 03:00 PM" inside a sentence.
  const when = nextSettlement.replace(' · ', ', ').replace(/^\w/, (letter) => letter.toLowerCase());

  return (
    <Animated.View onLayout={onLayout} style={[styles.hero, style]}>
      <View style={styles.labelRow}>
        <Text variant="titleSmall" style={[styles.label, muted]} accessibilityRole="header">
          Collected today
        </Text>
        <IconButton
          icon="info"
          size={16}
          iconColor={theme.colors.onSurfaceVariant}
          onPress={() => setExplained((open) => !open)}
          accessibilityLabel={explained ? 'Hide what collected today counts' : 'What does collected today count?'}
          style={styles.info}
        />
      </View>
      {explained ? (
        <Text variant="bodySmall" style={[styles.centred, styles.explanation, muted]}>
          Successful payments since midnight for {scope}, before fees and refunds.
        </Text>
      ) : null}

      <DimmedDecimalAmount value={formatInr(collected)} size="display" />

      <Text variant="bodyMedium" style={[styles.centred, muted]}>
        {count} payments{successRate !== null ? ` · ${successRate}% successful` : ''}
      </Text>

      <TouchableRipple
        onPress={onPressSettlement}
        borderless
        accessibilityRole="link"
        accessibilityLabel={`${formatInr(settling)} reaches your bank ${when}. View settlements`}
        // The page's one brand-tinted surface: "when do I get paid" is second only to the hero (audit F1).
        style={[styles.pill, { backgroundColor: theme.colors.secondaryContainer }]}>
        <View style={styles.pillRow}>
          <Icon source="bank" size={18} color={theme.colors.onSecondaryContainer} />
          <Text variant="labelLarge" numberOfLines={1} style={[styles.pillText, { color: theme.colors.onSecondaryContainer }]}>
            <Text style={styles.pillAmount}>{formatInr(settling)}</Text> to your bank {when}
          </Text>
          <Icon source="caret-right" size={14} color={theme.colors.onSecondaryContainer} />
        </View>
      </TouchableRipple>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // The room around the hero is what makes it the hero: nothing else on the page gets this much.
  hero: { alignItems: 'center', gap: 4, paddingTop: 40, paddingBottom: 40, transformOrigin: 'center top' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginRight: -28 },
  label: { fontFamily: Fonts.medium },
  info: { margin: 0, width: 28, height: 28, borderRadius: Shape.small },
  centred: { textAlign: 'center' },
  explanation: { maxWidth: 280, marginBottom: 4 },
  pill: { marginTop: 20, borderRadius: Shape.max, maxWidth: '100%' },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  pillText: { flexShrink: 1 },
  pillAmount: { fontFamily: Fonts.semiBold, fontSize: 16 },
});
