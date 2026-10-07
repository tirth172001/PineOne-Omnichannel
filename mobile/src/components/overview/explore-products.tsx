import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { PRODUCT_BANNERS } from '@/data/overview';

const BANNER_WIDTH = 306;
const BANNER_HEIGHT = 136;

/**
 * "Explore products" (Figma 6470:811; web: OverviewExploreProducts): a title
 * with its own View all link (titles aren't links, user decision), then the
 * four product promo banners in a horizontal scroll. Banners are the web
 * app's own images (public/images/overview-products), the same as the design's.
 */
export function ExploreProducts({ onPressViewAll, onPressBanner }: { onPressViewAll?: () => void; onPressBanner?: (id: string) => void }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]} accessibilityRole="header">
          Explore products
        </Text>
        <TouchableRipple onPress={onPressViewAll} borderless accessibilityRole="button" accessibilityLabel="View all products" style={styles.viewAll}>
          <View style={styles.viewAllContent}>
            <Text style={[styles.viewAllLabel, { color: theme.colors.primary }]}>View all</Text>
            <Icon source="caret-right" size={16} color={theme.colors.primary} />
          </View>
        </TouchableRipple>
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
  section: { gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontFamily: Fonts.medium, fontSize: 16, lineHeight: 24 },
  viewAll: { borderRadius: Shape.small },
  viewAllContent: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, paddingHorizontal: 10 },
  viewAllLabel: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  scroller: { marginHorizontal: -16 },
  row: { gap: 12, paddingHorizontal: 16 },
  banner: { width: BANNER_WIDTH, height: BANNER_HEIGHT, borderRadius: Shape.max, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
});
