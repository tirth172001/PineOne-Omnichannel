import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

/** The web's symbol marks (public/bank-logos, from github.com/praveenpuglia/indian-banks); expo-image renders SVG. */
const BANK_LOGOS: Record<string, number> = {
  HDFC: require('../../../assets/bank-logos/hdfc.svg'),
  ICICI: require('../../../assets/bank-logos/icic.svg'),
  AXIS: require('../../../assets/bank-logos/utib.svg'),
  SBI: require('../../../assets/bank-logos/sbin.svg'),
};

const FALLBACK_COLORS: Record<string, string> = { ICICI: '#ae282e', AXIS: '#97144d', SBI: '#1f4e96' };

/** A bank's symbol mark, or a coloured initial for banks without one (web: BankLogo). */
export function BankLogo({ bank, size = 16 }: { bank: string; size?: number }) {
  const source = BANK_LOGOS[bank];
  // Small marks keep the web's 3px corners; larger tiles use the minimum container radius.
  const radius = size >= 32 ? Shape.extraSmall : 3;

  if (source) {
    return (
      <Image
        source={source}
        style={{ width: size, height: size, borderRadius: radius }}
        contentFit="contain"
        accessibilityLabel={`${bank} logo`}
      />
    );
  }

  return (
    <View
      accessibilityElementsHidden
      style={[styles.fallback, { width: size, height: size, borderRadius: radius, backgroundColor: FALLBACK_COLORS[bank] ?? '#6b7280' }]}>
      <Text style={[styles.initial, { fontSize: size * 0.56 }]}>{bank[0]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#ffffff', fontFamily: Fonts.bold },
});
