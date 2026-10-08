import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { PANEL_INNER_RADIUS, PanelSection, PanelSheet } from '@/components/shared/panel-sheet';
import { SelectionMark } from '@/components/shared/selection-mark';
import { useAppColors } from '@/constants/app-colors';
import { concentric } from '@/constants/shape';
import type { Organisation } from '@/data/businesses';

// Rows sit 16dp inside the sheet; the 40dp logo tile 4dp inside a row.
const LOGO_RADIUS = concentric(PANEL_INNER_RADIUS, 4, 40);

/** An organisation's logo, or its initial when it has none. */
export function OrganisationLogo({ organisation, size }: { organisation: Organisation; /** Square side; the default suits a list row. */ size?: number }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.logo,
        size ? { width: size, height: size, borderRadius: Math.round(size / 4) } : null,
        { borderColor: theme.colors.surfaceVariant, backgroundColor: theme.colors.surface },
      ]}>
      {organisation.logo ? (
        <Image source={organisation.logo} style={styles.logoImage} contentFit="cover" />
      ) : (
        <Text variant="titleMedium">{organisation.name.charAt(0)}</Text>
      )}
    </View>
  );
}

/**
 * Switch organisation, from Account settings (user decision: it belongs with
 * the profile, not the header's channel / store switcher, which only scopes
 * the current organisation). Picking one and applying starts on all of its
 * stores.
 */
export function OrganisationSwitcher({
  visible,
  onDismiss,
  organisations,
  currentId,
  onApply,
}: {
  visible: boolean;
  onDismiss: () => void;
  organisations: Organisation[];
  currentId: string;
  onApply: (organisationId: string) => void;
}) {
  const highlight = useAppColors().highlight;
  const theme = useTheme();
  const [draft, setDraft] = useState(currentId);
  // Start from the current organisation each time the sheet opens (adjusting state during render).
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDraft(currentId);
  }

  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title="Switch organisation"
      height={Math.min(220 + organisations.length * 64, 640)}
      footer={
        <Button
          mode="contained"
          disabled={draft === currentId}
          onPress={() => {
            onApply(draft);
            onDismiss();
          }}
          style={styles.apply}>
          Switch
        </Button>
      }>
      <PanelSection last>
        {organisations.map((org) => {
          const checked = org.id === draft;
          return (
            <TouchableRipple
              key={org.id}
              onPress={() => setDraft(org.id)}
              borderless
              accessibilityRole="radio"
              aria-checked={checked}
              accessibilityState={{ checked }}
              style={[styles.row, checked && { backgroundColor: highlight }]}>
              <View style={styles.rowContent}>
                <OrganisationLogo organisation={org} />
                <View style={styles.flex}>
                  <Text variant="bodyLarge">{org.name}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {org.shops.length} stores
                  </Text>
                </View>
                <SelectionMark type="radio" checked={checked} />
              </View>
            </TouchableRipple>
          );
        })}
      </PanelSection>
    </PanelSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { borderRadius: PANEL_INNER_RADIUS },
  rowContent: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6, paddingLeft: 8, paddingRight: 4 },
  logo: { width: 40, height: 40, borderRadius: LOGO_RADIUS, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  logoImage: { width: '100%', height: '100%' },
  apply: { borderRadius: PANEL_INNER_RADIUS },
});
