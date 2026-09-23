import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { useBusiness } from '@/hooks/use-business';

import { ChecklistSheet } from '@/components/shared/checklist-sheet';

/**
 * "Showing data across all stores · Change store" under a section title (web:
 * StoreScopeNote). Reads and writes the same store selection as the header's
 * switcher, so the two never disagree. Hidden for single-store businesses.
 */
export function StoreScopeNote() {
  const theme = useTheme();
  const { organisation, shopIds, shops, setShopIds } = useBusiness();
  const [open, setOpen] = useState(false);

  if (organisation.shops.length <= 1) return null;
  const allIds = organisation.shops.map((shop) => shop.id);

  return (
    <>
      <View style={styles.note}>
        <Text variant="bodyMedium" style={[styles.noteText, { color: theme.colors.onSurfaceVariant }]}>
          {shopIds.length === 0 ? (
            'Showing data across all stores'
          ) : (
            <>
              Showing data for{' '}
              <Text style={[styles.noteStrong, { color: theme.colors.onSurface }]}>
                {shops.length === 1 ? shops[0].name : `${shops.length} stores`}
              </Text>
            </>
          )}
        </Text>
        <Button
          mode="text"
          compact
          icon="arrows-counter-clockwise"
          onPress={() => setOpen(true)}
          contentStyle={styles.trailingIcon}
          labelStyle={styles.changeLabel}
          style={styles.changeButton}>
          Change store
        </Button>
      </View>
      <ChecklistSheet
        visible={open}
        onDismiss={() => setOpen(false)}
        title="Change stores"
        heading="Choose stores to view details"
        items={organisation.shops.map((shop) => ({ id: shop.id, title: shop.name, subtitle: shop.address }))}
        // Empty = all stores: open with every store checked so nothing reads as "none selected".
        initialSelected={shopIds.length === 0 ? allIds : shopIds}
        onApply={setShopIds}
        searchPlaceholder="Search store name or address"
        countLabel={(count) =>
          count === 0 ? 'No stores selected' : count === 1 ? '1 store selected' : `${count} stores selected`
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  note: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 4 },
  noteText: { fontFamily: Fonts.regular },
  noteStrong: { fontFamily: Fonts.medium },
  // Page-level text button (not nested in a container).
  changeButton: { margin: 0, borderRadius: Shape.small },
  changeLabel: { fontSize: 14, marginVertical: 4, marginHorizontal: 6 },
  trailingIcon: { flexDirection: 'row-reverse' },
});
