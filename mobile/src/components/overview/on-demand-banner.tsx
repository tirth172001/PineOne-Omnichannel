import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { useAppColors } from '@/constants/app-colors';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

const LIGHTNING = require('../../../assets/images/overview/lightning.svg');

/**
 * Overview's nudge towards On-Demand settlement (Figma 6470:774): getting
 * today's money now rather than at the next scheduled run. Opens Settlements,
 * where On-Demand settlement lives.
 */
export function OnDemandBanner({ onPress }: { onPress?: () => void }) {
  const theme = useTheme();
  // Tailwind indigo-50 in the design.
  const tint = useAppColors().tint.indigo;
  return (
    <TouchableRipple
      onPress={onPress}
      borderless
      accessibilityRole="button"
      accessibilityLabel="Get some settlement in your account today via On-Demand settlement"
      style={[styles.banner, { backgroundColor: tint }]}>
      <View style={styles.content}>
        <View style={styles.text}>
          <Image source={LIGHTNING} style={styles.icon} />
          <Text style={[styles.message, { color: theme.colors.onSurface }]}>Get some settlement in your account today via On-Demand settlement</Text>
        </View>
        <Icon source="caret-right" size={12} color={theme.colors.onSurface} />
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  // Figma rounds it at 18dp; the app caps every radius at Shape.max.
  banner: { borderRadius: Shape.max },
  content: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12 },
  text: { flex: 1, gap: 12 },
  icon: { width: 24, height: 24 },
  message: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
});
