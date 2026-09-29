import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { PRODUCT_BANNERS } from '@/data/overview';

import { OutlinedActionButton } from '@/components/shared/controls';

const BANNER_WIDTH = 306;
const BANNER_HEIGHT = 136;

/**
 * "Explore products" (web: OverviewExploreProducts): a title with its own
 * View all button (titles aren't links, user decision), then the four product
 * promo banners in a horizontal scroll. It's our promotion, not a merchant
 * job, so its heading is quieter than the page's other sections and Overview
 * sets it furthest down (docs/design/mobile-home-hierarchy-audit.md F4). Banners are the
 * web app's own images (public/images/overview-products).
 */
export function ExploreProducts({ onPressViewAll, onPressBanner }: { onPressViewAll?: () => void; onPressBanner?: (id: string) => void }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text variant="labelLarge" style={[styles.title, { color: theme.colors.onSurfaceVariant }]} accessibilityRole="header">
          Explore products
        </Text>
        <OutlinedActionButton label="View all" icon="caret-right" trailingIcon onPress={onPressViewAll} accessibilityLabel="View all products" />
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
  // Web: text-2xl font-semibold.
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontFamily: Fonts.medium },
  scroller: { marginHorizontal: -16 },
  row: { gap: 16, paddingHorizontal: 16 },
  banner: { width: BANNER_WIDTH, height: BANNER_HEIGHT, borderRadius: Shape.max, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
});
