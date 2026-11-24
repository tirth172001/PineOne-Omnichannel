import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useSvgId } from '@/components/shared/hatch';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

const LIGHTNING = require('../../../assets/images/overview/lightning.svg');

/**
 * The On-Demand settlement banner (Figma 7154:141243 Home, 7161:93454
 * Settlements): white, washed with indigo from the left edge and fading out by the right, the lightning mark, one
 * line of what it does, and the action underlined at the end. Home and
 * Settlements share it so the two read the same. `danger` is the same banner
 * washed red with a warning mark, for something the merchant has to act on
 * (disputes awaiting a response, on Settlements).
 */
export function ActionBanner({
  label = 'Get money in your bank today via On-Demand settlement',
  actionLabel = 'Settle now',
  onPress,
  tone = 'accent',
  icon,
}: {
  /** A Phosphor icon in place of the lightning mark (e.g. a gift for referrals). */
  icon?: string;
  label?: string;
  actionLabel?: string;
  onPress?: () => void;
  tone?: 'accent' | 'danger';
}) {
  const theme = useTheme();
  const danger = tone === 'danger';
  // The design's base/destructive red (as StatusStack's urgent note), lighter on dark.
  const dangerColor = theme.dark ? '#f87171' : '#dc2626';
  const gradientId = useSvgId('action-banner');
  return (
    <TouchableRipple onPress={onPress} borderless accessibilityRole="button" accessibilityLabel={`${label}. ${actionLabel}`} style={styles.banner}>
      {/* White inner border: the wash stops 1dp short of the edge, so the banner reads as a white-rimmed card. */}
      <View style={[styles.content, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surface }]}>
        {/* A unit viewBox stretched over the whole banner: percentage sizes don't fill it on iOS. */}
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 1 1" preserveAspectRatio="none">
          <Defs>
            {/* Measured from the design (Home 7154:141243, Settlements 7161:93454): indigo-600 at 24% on the card's white, fading evenly to nothing at the right edge. */}
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={danger ? '#dc2626' : '#4f46e5'} stopOpacity={danger ? 0.16 : 0.24} />
              <Stop offset="1" stopColor={danger ? '#dc2626' : '#4f46e5'} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect width={1} height={1} fill={`url(#${gradientId})`} />
        </Svg>
        {danger ? <Icon source="warning-fill" size={24} color={dangerColor} /> : icon ? <Icon source={icon} size={24} color="#4f46e5" /> : <Image source={LIGHTNING} style={styles.icon} />}
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>{label}</Text>
        <Text style={[styles.action, { color: danger ? dangerColor : theme.colors.primary }]}>{actionLabel}</Text>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: Shape.max },
  content: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 15, paddingVertical: 15, borderWidth: 1, borderRadius: Shape.max, overflow: 'hidden' },
  icon: { width: 24, height: 24 },
  // Figma breaks the line after "today": the copy is held to the design's 200dp column.
  label: { flex: 1, maxWidth: 200, marginRight: 'auto', fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  action: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20, textDecorationLine: 'underline' },
});
