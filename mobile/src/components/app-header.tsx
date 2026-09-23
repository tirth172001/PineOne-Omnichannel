import { Image } from 'expo-image';
import type { ImageSourcePropType } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { Appbar, Icon, IconButton, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';

type AppHeaderProps = {
  organisationName: string;
  shopName: string;
  organisationLogo?: ImageSourcePropType;
  avatar?: ImageSourcePropType;
  /** Opens the org/shop switcher. */
  onPressSwitcher?: () => void;
  onPressNotifications?: () => void;
  onPressAvatar?: () => void;
};

/**
 * App shell header (Figma node 47:2350): org/shop switcher on the left,
 * notifications + account on the right. Built on Paper's Appbar.Header (which
 * handles the status-bar inset and 64dp height), laid out to the Figma spec.
 * Transparent: it sits inside the shell's rounded top bar, which paints the surface.
 */
export function AppHeader({
  organisationName,
  shopName,
  organisationLogo,
  avatar,
  onPressSwitcher,
  onPressNotifications,
  onPressAvatar,
}: AppHeaderProps) {
  const theme = useTheme();
  const tileStyle = [styles.tile, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceVariant }];

  return (
    <Appbar.Header mode="small" elevated={false} style={[styles.appbar, { backgroundColor: 'transparent' }]}>
      <View style={styles.row}>
        <TouchableRipple
          onPress={onPressSwitcher}
          borderless
          accessibilityRole="button"
          accessibilityLabel={`${organisationName}, ${shopName}. Switch organisation or store`}
          style={styles.switcher}>
          <View style={styles.switcherContent}>
            <View style={styles.slot}>
              <View style={tileStyle}>
                {organisationLogo ? (
                  <Image source={organisationLogo} style={styles.tileImage} contentFit="cover" />
                ) : (
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                    {organisationName.charAt(0)}
                  </Text>
                )}
              </View>
            </View>
            <View>
              <Text variant="titleMedium" numberOfLines={1}>
                {organisationName}
              </Text>
              <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
                {shopName}
              </Text>
            </View>
            <Icon source="caret-down" size={16} color={theme.colors.onSurface} />
          </View>
        </TouchableRipple>

        <View style={styles.actions}>
          <IconButton
            icon="bell"
            size={24}
            iconColor={theme.colors.onSurface}
            onPress={onPressNotifications}
            accessibilityLabel="Notifications"
            style={styles.iconButton}
          />
          <TouchableRipple
            onPress={onPressAvatar}
            borderless
            accessibilityRole="button"
            accessibilityLabel="Account"
            style={styles.slot}>
            <View style={tileStyle}>
              {avatar ? <Image source={avatar} style={styles.tileImage} contentFit="cover" /> : null}
            </View>
          </TouchableRipple>
        </View>
      </View>
    </Appbar.Header>
  );
}

// Nested shapes, outermost first: the shell's top bar (Shape.max) → 40dp
// slots inset 12dp (the row padding) → 32dp image tiles inset 4dp.
const ROW_PADDING = 12;
const SLOT_RADIUS = concentric(Shape.max, ROW_PADDING, 40);
const TILE_RADIUS = concentric(SLOT_RADIUS, 4, 32);

const styles = StyleSheet.create({
  appbar: { paddingHorizontal: 0 },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ROW_PADDING,
  },
  // The logo slot touches the switcher's edge, so the switcher shares its radius.
  switcher: { borderRadius: SLOT_RADIUS, flexShrink: 1 },
  // Chevron sits top-aligned next to the name, as in Figma.
  switcherContent: { flexDirection: 'row', alignItems: 'flex-start', gap: 2, paddingRight: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // 40dp touch slot around a 32dp image tile.
  slot: { width: 40, height: 40, borderRadius: SLOT_RADIUS, alignItems: 'center', justifyContent: 'center' },
  tile: {
    width: 32,
    height: 32,
    borderRadius: TILE_RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileImage: { width: '100%', height: '100%' },
  iconButton: { margin: 0, borderRadius: SLOT_RADIUS },
});
