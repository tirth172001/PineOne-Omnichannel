import { Image } from 'expo-image';
import { type Href, router } from 'expo-router';
import { type ImageSourcePropType, ScrollView, StyleSheet, View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { LocalSvg } from 'react-native-svg/css';

import { useAppColors } from '@/constants/app-colors';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { useToast } from '@/hooks/use-toast';

type QuickAction = {
  key: string;
  title: string;
  subtitle: string;
  /** A finished 32dp tile (Pine AI's), or a 20dp icon on a tinted tile. */
  tile: { art: ImageSourcePropType } | { icon: ImageSourcePropType; tint: 'pink' | 'orange' };
  href?: () => Href;
};

const ACTIONS: QuickAction[] = [
  { key: 'pine-ai', title: 'Pine AI', subtitle: 'Ask anything', tile: { art: require('../../../assets/images/overview/pine-ai.svg') }, href: () => '/support/chat' },
  {
    key: 'payment-links',
    title: 'Payment links',
    subtitle: 'Create & send link',
    tile: { icon: require('../../../assets/images/overview/payment-links.svg'), tint: 'pink' },
    href: () => ({ pathname: '/payment-links', params: { create: '1' } }),
  },
  // No UPI page yet.
  { key: 'upi', title: 'Manage UPI', subtitle: 'Your QR codes', tile: { icon: require('../../../assets/images/overview/manage-upi.svg'), tint: 'orange' } },
];

/**
 * Overview's quick actions (Figma 6470:775): a sideways row of cards, each an
 * icon tile, a name and what it does.
 */
export function QuickActions() {
  const theme = useTheme();
  const toast = useToast();
  // Tailwind's pink-50 / orange-50 tiles in the design.
  const tints = useAppColors().tint;
  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]} accessibilityRole="header">
        Quick actions
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroller} contentContainerStyle={styles.row}>
        {ACTIONS.map((action) => (
          <TouchableRipple
            key={action.key}
            borderless
            accessibilityRole="button"
            accessibilityLabel={`${action.title}. ${action.subtitle}`}
            onPress={() => {
              if (action.href) router.push(action.href());
              else toast(`${action.title} is coming soon`);
            }}
            style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.cardContent}>
              {'art' in action.tile ? (
                <LocalSvg asset={action.tile.art} width={TILE_SIZE} height={TILE_SIZE} />
              ) : (
                <View style={[styles.tile, { backgroundColor: tints[action.tile.tint] }]}>
                  <Image source={action.tile.icon} style={styles.icon} />
                </View>
              )}
              <View>
                <Text numberOfLines={1} style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                  {action.title}
                </Text>
                <Text numberOfLines={1} style={[styles.cardSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                  {action.subtitle}
                </Text>
              </View>
            </View>
          </TouchableRipple>
        ))}
      </ScrollView>
    </View>
  );
}

const TILE_SIZE = 32;

const styles = StyleSheet.create({
  section: { gap: 8 },
  title: { fontFamily: Fonts.medium, fontSize: 16, lineHeight: 24, paddingHorizontal: 12 },
  // Bleeds to the screen edges so the next card peeks in.
  scroller: { marginHorizontal: -16 },
  row: { gap: 12, paddingHorizontal: 16 },
  // Figma rounds the cards at 18dp; the app caps every radius at Shape.max.
  card: {
    width: 140,
    borderRadius: Shape.max,
    shadowColor: '#1d1d16',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
  },
  cardContent: { gap: 12, padding: 12 },
  tile: { width: TILE_SIZE, height: TILE_SIZE, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 20, height: 20 },
  cardTitle: { fontFamily: Fonts.medium, fontSize: 16, lineHeight: 24 },
  cardSubtitle: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
});
