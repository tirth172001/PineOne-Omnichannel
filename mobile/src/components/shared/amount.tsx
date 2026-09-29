import color from 'color';
import { StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { Fonts } from '@/constants/theme';

const SIZES = {
  /** Overview's one hero figure (Collected today): the only text this large in the app. */
  display: { fontFamily: Fonts.semiBold, fontSize: 44, lineHeight: 52, letterSpacing: -0.5 },
  /** Detail-screen hero amount (web: text-[32px]–[36px] font-semibold). */
  hero: { fontFamily: Fonts.semiBold, fontSize: 32, lineHeight: 38 },
  /** Card totals (web: text-[24px] font-semibold). */
  large: { fontFamily: Fonts.semiBold, fontSize: 24, lineHeight: 28 },
  /** Summary cards (web: text-xl font-semibold). */
  medium: { fontFamily: Fonts.semiBold, fontSize: 20, lineHeight: 28 },
  /** Inline amounts in rows (web: text-sm font-medium). */
  inline: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
} as const;

/**
 * Dims the trailing ".XX" of a formatted amount: the whole rupees read as the
 * real number and the paise fade out (web: DimmedDecimalAmount / AmountText).
 */
export function DimmedDecimalAmount({ value, size = 'large' }: { value: string; size?: keyof typeof SIZES }) {
  const theme = useTheme();
  const dot = value.lastIndexOf('.');
  const main = dot === -1 ? value : value.slice(0, dot);
  const decimals = dot === -1 ? '' : value.slice(dot);

  return (
    <Text style={[SIZES[size], styles.tabular, { color: theme.colors.onSurface }]}>
      {main}
      {decimals ? (
        <Text style={[styles.decimals, { fontFamily: SIZES[size].fontFamily, color: color(theme.colors.onSurfaceVariant).alpha(0.5).rgb().string() }]}>
          {decimals}
        </Text>
      ) : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  tabular: { fontVariant: ['tabular-nums'] },
  // The paise are 14px at every size, in the amount's own weight (nested Paper Text doesn't inherit it).
  decimals: { fontSize: 14 },
});
