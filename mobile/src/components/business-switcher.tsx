import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List, Portal, Text, useTheme } from 'react-native-paper';

import { BottomSheet } from '@/components/material3/bottom-sheet';
import { concentric, Shape } from '@/constants/shape';
import type { Organisation } from '@/data/businesses';

type BusinessSwitcherProps = {
  visible: boolean;
  onDismiss: () => void;
  organisations: Organisation[];
  organisation: Organisation;
  /** Selected shop ids; empty = all shops. */
  shopIds: string[];
  onSelectOrganisation: (organisationId: string) => void;
  onSelectShop: (shopId: string) => void;
  onSelectAllShops: () => void;
};

const SHEET_HEIGHT = 520;
// Nested shapes: sheet (Shape.max) → rows inset 8dp → 40dp logo tiles inset
// 8dp (List.Item's vertical padding).
const SHEET_RADIUS = Shape.max;
const SHEET_GUTTER = 8;
const ROW_RADIUS = concentric(SHEET_RADIUS, SHEET_GUTTER);
const LOGO_RADIUS = concentric(ROW_RADIUS, 8, 40);

/**
 * Org/shop switcher opened from the app header. Picking an organisation keeps
 * the sheet open so a store can be chosen; picking a store (or All stores)
 * applies and closes it. Picking several stores happens in Overview's store picker.
 */
export function BusinessSwitcher({
  visible,
  onDismiss,
  organisations,
  organisation,
  shopIds,
  onSelectOrganisation,
  onSelectShop,
  onSelectAllShops,
}: BusinessSwitcherProps) {
  const theme = useTheme();
  const check = (selected: boolean) =>
    selected ? (props: { color: string }) => <List.Icon {...props} icon="check" color={theme.colors.onSurface} /> : undefined;

  return (
    <Portal>
      <BottomSheet variant="modal" height={SHEET_HEIGHT} radius={SHEET_RADIUS} visible={visible} onDismiss={onDismiss}>
        <Text variant="titleLarge" style={styles.title}>
          Switch business
        </Text>
        <ScrollView contentContainerStyle={styles.content}>
          <List.Section>
            <List.Subheader style={styles.subheader}>Organisation</List.Subheader>
            {organisations.map((org) => (
              <List.Item
                key={org.id}
                title={org.name}
                description={`${org.shops.length} stores`}
                onPress={() => onSelectOrganisation(org.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: org.id === organisation.id }}
                left={() => (
                  <View style={[styles.logo, { borderColor: theme.colors.surfaceVariant, backgroundColor: theme.colors.surface }]}>
                    {org.logo ? (
                      <Image source={org.logo} style={styles.logoImage} contentFit="cover" />
                    ) : (
                      <Text variant="titleMedium">{org.name.charAt(0)}</Text>
                    )}
                  </View>
                )}
                right={check(org.id === organisation.id)}
                style={styles.item}
              />
            ))}
          </List.Section>
          <List.Section>
            <List.Subheader style={styles.subheader}>Store</List.Subheader>
            <List.Item
              title="All stores"
              description={`${organisation.shops.length} stores`}
              onPress={() => {
                onSelectAllShops();
                onDismiss();
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: shopIds.length === 0 }}
              left={(props) => <List.Icon {...props} icon="buildings" />}
              right={check(shopIds.length === 0)}
              style={styles.item}
            />
            {organisation.shops.map((s) => (
              <List.Item
                key={s.id}
                title={s.name}
                description={s.address}
                descriptionNumberOfLines={1}
                onPress={() => {
                  onSelectShop(s.id);
                  onDismiss();
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: shopIds.length === 1 && shopIds[0] === s.id }}
                left={(props) => <List.Icon {...props} icon="storefront" />}
                right={check(shopIds.length === 1 && shopIds[0] === s.id)}
                style={styles.item}
              />
            ))}
          </List.Section>
        </ScrollView>
      </BottomSheet>
    </Portal>
  );
}

const styles = StyleSheet.create({
  title: { paddingHorizontal: 24, paddingBottom: 4 },
  subheader: { paddingHorizontal: 16 },
  content: { paddingHorizontal: SHEET_GUTTER, paddingBottom: 24 },
  item: { paddingLeft: 16, borderRadius: ROW_RADIUS },
  logo: {
    width: 40,
    height: 40,
    borderRadius: LOGO_RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: { width: '100%', height: '100%' },
});
