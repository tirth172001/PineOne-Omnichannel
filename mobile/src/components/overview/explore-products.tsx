import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';

import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { PRODUCT_BANNERS } from '@/data/overview';

import { SectionActionButton } from './overview-card';

const BANNER_WIDTH = 306;
const BANNER_HEIGHT = 136;

/**
 * "Explore products" (web: OverviewExploreProducts): a title with View all,
 * then the four product promo banners in a horizontal scroll. Banners are the
 * web app's own images (public/images/overview-products).
 */
export function ExploreProducts({ onPressViewAll, onPressBanner }: { onPressViewAll?: () => void; onPressBanner?: (id: string) => void }) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Explore products
        </Text>
        <SectionActionButton label="View all" icon="caret-right" trailingIcon onPress={onPressViewAll} />
      </View>
      {/* Bleeds to the screen edges so the next banner peeks in, as the web's fade hints. */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroller} contentContainerStyle={styles.row}>
        {PRODUCT_BANNERS.map((banner) => (
          <TouchableRipple
            key={banner.id}
            onPress={onPressBanner ? () => onPressBanner(banner.id) : undefined}
            accessibilityRole="button"
            accessibilityLabel={banner.alt}
            borderless
            style={styles.banner}>
            <Image source={banner.image} style={styles.image} contentFit="cover" accessibilityIgnoresInvertColors />
          </TouchableRipple>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 16 },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  // Web: text-2xl font-semibold.
  title: { fontFamily: Fonts.semiBold, fontSize: 24, lineHeight: 31 },
  scroller: { marginHorizontal: -16 },
  row: { gap: 16, paddingHorizontal: 16 },
  banner: { width: BANNER_WIDTH, height: BANNER_HEIGHT, borderRadius: Shape.max, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
});
