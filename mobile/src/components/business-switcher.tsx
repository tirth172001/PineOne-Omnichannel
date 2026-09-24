import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { PANEL_INNER_RADIUS, PanelSection, PanelSheet } from '@/components/shared/panel-sheet';
import { SelectionMark } from '@/components/shared/selection-mark';
import { concentric } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import type { Organisation } from '@/data/businesses';
import { CHANNEL_OPTIONS, type ChannelFilter } from '@/data/overview';

export type BusinessScope = { organisationId: string; shopIds: string[]; channel: ChannelFilter };

type BusinessSwitcherProps = {
  visible: boolean;
  onDismiss: () => void;
  organisations: Organisation[];
  /** The scope currently applied; the sheet edits a draft of it until Apply. */
  scope: BusinessScope;
  onApply: (scope: BusinessScope) => void;
  /** Only Overview offers "All channels"; channel-split pages pick In-store or Online. */
  allowAllChannels?: boolean;
};

// Rows sit 16dp inside the sheet; the 40dp logo tile 4dp inside a row.
const ROW_RADIUS = PANEL_INNER_RADIUS;
const LOGO_RADIUS = concentric(ROW_RADIUS, 4, 40);

const CHANNEL_DESCRIPTIONS: Record<ChannelFilter, string> = {
  all: 'In-store and online payments together',
  'in-store': 'POS terminals and store QR payments',
  online: 'Payment gateway, payment links and checkout',
};

/**
 * The app's only scope control, opened from the header: organisation, channel
 * (All channels on Overview only; otherwise In-store or Online), and — unless
 * the channel is Online, which has no stores — which stores (any combination,
 * or all). Pages don't filter by store or channel themselves.
 */
export function BusinessSwitcher({ visible, onDismiss, organisations, scope, onApply, allowAllChannels = true }: BusinessSwitcherProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState<BusinessScope>(scope);
  // Start from the applied scope each time the sheet opens (adjusting state during render).
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDraft(scope);
  }
  const organisation = organisations.find((org) => org.id === draft.organisationId) ?? organisations[0];
  const allStores = draft.shopIds.length === 0;
  const muted = { color: theme.colors.onSurfaceVariant };

  const toggleShop = (id: string) =>
    setDraft((current) => {
      const selected = current.shopIds.length === 0 ? organisation.shops.map((shop) => shop.id) : current.shopIds;
      const next = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id];
      // Every store ticked means "All stores"; unticking the last store falls back to all too.
      return { ...current, shopIds: next.length === organisation.shops.length || next.length === 0 ? [] : next };
    });

  const row = (key: string, content: React.ReactNode, onPress: () => void, selected: boolean, role: 'radio' | 'checkbox') => (
    <TouchableRipple
      key={key}
      onPress={onPress}
      borderless
      accessibilityRole={role}
      aria-checked={selected}
      accessibilityState={{ checked: selected }}
      style={[styles.row, selected && { backgroundColor: theme.colors.secondaryContainer }]}>
      <View style={styles.rowContent}>{content}</View>
    </TouchableRipple>
  );

  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title="Switch business"
      footer={
        <Button
          mode="contained"
          onPress={() => {
            onApply(draft);
            onDismiss();
          }}
          style={styles.apply}>
          Apply
        </Button>
      }>
      <PanelSection>
        <Text variant="titleSmall" style={styles.heading}>
          Organisation
        </Text>
        {organisations.map((org) =>
          row(
            org.id,
            <>
              <View style={[styles.logo, { borderColor: theme.colors.surfaceVariant, backgroundColor: theme.colors.surface }]}>
                {org.logo ? <Image source={org.logo} style={styles.logoImage} contentFit="cover" /> : <Text variant="titleMedium">{org.name.charAt(0)}</Text>}
              </View>
              <View style={styles.flex}>
                <Text variant="bodyLarge">{org.name}</Text>
                <Text variant="bodySmall" style={muted}>
                  {org.shops.length} stores
                </Text>
              </View>
              <SelectionMark type="radio" checked={org.id === draft.organisationId} />
            </>,
            // A different organisation starts on all of its stores.
            () => setDraft((current) => (current.organisationId === org.id ? current : { ...current, organisationId: org.id, shopIds: [] })),
            org.id === draft.organisationId,
            'radio'
          )
        )}
      </PanelSection>

      <PanelSection last={draft.channel === 'online'}>
        <Text variant="titleSmall" style={styles.heading}>
          Channel
        </Text>
        {CHANNEL_OPTIONS.filter((option) => allowAllChannels || option.value !== 'all').map((option) =>
          row(
            option.value,
            <>
              <Icon source={option.value === 'online' ? 'globe' : option.value === 'in-store' ? 'storefront' : 'squares-four'} size={24} color={theme.colors.onSurfaceVariant} />
              <View style={styles.flex}>
                <Text variant="bodyLarge">{option.label}</Text>
                <Text variant="bodySmall" style={muted}>
                  {CHANNEL_DESCRIPTIONS[option.value]}
                </Text>
              </View>
              <SelectionMark type="radio" checked={draft.channel === option.value} />
            </>,
            () => setDraft((current) => ({ ...current, channel: option.value })),
            draft.channel === option.value,
            'radio'
          )
        )}
      </PanelSection>
      {/* Stores only apply in-store; Online has none. */}
      {draft.channel !== 'online' ? (
        <PanelSection last>
          <Text variant="titleSmall" style={styles.heading}>
            Stores
          </Text>
          {row(
            'all-stores',
            <>
              <Icon source="buildings" size={24} color={theme.colors.onSurfaceVariant} />
              <View style={styles.flex}>
                <Text variant="bodyLarge">All stores</Text>
                <Text variant="bodySmall" style={muted}>
                  {organisation.shops.length} stores
                </Text>
              </View>
              <SelectionMark type="checkbox" checked={allStores} />
            </>,
            () => setDraft((current) => ({ ...current, shopIds: [] })),
            allStores,
            'checkbox'
          )}
          {organisation.shops.map((shop) => {
            const checked = allStores || draft.shopIds.includes(shop.id);
            return row(
              shop.id,
              <>
                <Icon source="storefront" size={24} color={theme.colors.onSurfaceVariant} />
                <View style={styles.flex}>
                  <Text variant="bodyLarge">{shop.name}</Text>
                  <Text variant="bodySmall" numberOfLines={1} style={muted}>
                    {shop.address}
                  </Text>
                </View>
                <SelectionMark type="checkbox" checked={checked} />
              </>,
              () => toggleShop(shop.id),
              !allStores && checked,
              'checkbox'
            );
          })}
        </PanelSection>
      ) : null}
    </PanelSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  heading: { fontFamily: Fonts.semiBold },
  row: { borderRadius: ROW_RADIUS },
  rowContent: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6, paddingLeft: 8, paddingRight: 4 },
  logo: { width: 40, height: 40, borderRadius: LOGO_RADIUS, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  logoImage: { width: '100%', height: '100%' },
  apply: { borderRadius: PANEL_INNER_RADIUS },
});
