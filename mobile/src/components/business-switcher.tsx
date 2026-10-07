import { Fragment, type ReactNode, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PANEL_INNER_RADIUS, PANEL_PADDING, PanelSheet } from '@/components/shared/panel-sheet';
import { SelectionMark } from '@/components/shared/selection-mark';
import { useAppColors } from '@/constants/app-colors';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import type { Shop } from '@/data/businesses';
import { CHANNEL_OPTIONS, type ChannelFilter } from '@/data/overview';

/** The channel and stores the app is scoped to, within the current organisation. */
export type BusinessScope = { shopIds: string[]; channel: ChannelFilter };

type BusinessSwitcherProps = {
  visible: boolean;
  onDismiss: () => void;
  /** The current organisation's stores (the organisation itself is switched from Account settings). */
  shops: Shop[];
  /** The scope currently applied; the sheet edits a draft of it until Apply. */
  scope: BusinessScope;
  onApply: (scope: BusinessScope) => void;
  /** Only Overview offers "All channels"; channel-split pages pick In-store or Online. */
  allowAllChannels?: boolean;
};

const CHANNEL_DESCRIPTIONS: Record<ChannelFilter, string> = {
  all: 'In-store and online payments together',
  'in-store': 'POS terminals and store QR payments',
  online: 'Payment gateway, payment links and checkout',
};

const CHANNEL_ICONS: Record<ChannelFilter, string> = { all: 'squares-four', 'in-store': 'storefront', online: 'globe' };

/**
 * The app's only scope control, opened from the header: channel (All
 * channels on Overview only; otherwise In-store or Online), and which stores
 * (any combination, or all). Online has no stores, so the stores card stays
 * in place but greyed out, keeping the sheet the same height. Laid out like
 * the app's pages: white cards of rows on the grey page, uppercase section
 * labels as on the Overview cards, and the chosen row's icon on the nav bar's
 * lime. Pages don't filter by store or channel themselves.
 */
export function BusinessSwitcher({ visible, onDismiss, shops, scope, onApply, allowAllChannels = true }: BusinessSwitcherProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [draft, setDraft] = useState<BusinessScope>(scope);
  // Start from the applied scope each time the sheet opens (adjusting state during render).
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDraft(scope);
  }
  const channels = CHANNEL_OPTIONS.filter((option) => allowAllChannels || option.value !== 'all');
  const storesApply = draft.channel !== 'online';
  const allStores = draft.shopIds.length === 0;
  const selectedCount = allStores ? shops.length : draft.shopIds.length;

  const toggleShop = (id: string) =>
    setDraft((current) => {
      const selected = current.shopIds.length === 0 ? shops.map((shop) => shop.id) : current.shopIds;
      const next = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id];
      // Every store ticked means "All stores"; unticking the last store falls back to all too.
      return { ...current, shopIds: next.length === shops.length || next.length === 0 ? [] : next };
    });

  // Sized to its content (both cards, as the stores card never goes away), up to the panel's usual 86%.
  const rows = channels.length + shops.length + 1;
  const contentHeight =
    SHEET_CHROME + PANEL_PADDING * 2 + 2 * SECTION_LABEL + SECTION_GAP + rows * ROW_HEIGHT + FOOTER_HEIGHT + Math.max(PANEL_PADDING, insets.bottom);

  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title="Channel and stores"
      grouped
      height={Math.min(contentHeight, Math.round(windowHeight * 0.86))}
      footer={
        <View style={{ paddingBottom: Math.max(0, insets.bottom - PANEL_PADDING) }}>
          <Button
            mode="contained"
            onPress={() => {
              onApply(draft);
              onDismiss();
            }}
            contentStyle={styles.applyContent}
            labelStyle={styles.applyLabel}
            style={styles.apply}>
            Apply
          </Button>
        </View>
      }>
      <View style={styles.body}>
        <Section label="Channel">
          {channels.map((option, index) => (
            <Row
              key={option.value}
              first={index === 0}
              icon={CHANNEL_ICONS[option.value]}
              title={option.label}
              description={CHANNEL_DESCRIPTIONS[option.value]}
              role="radio"
              selected={draft.channel === option.value}
              onPress={() => setDraft((current) => ({ ...current, channel: option.value }))}
            />
          ))}
        </Section>

        <Section
          label="Stores"
          trailing={storesApply ? (allStores ? 'All selected' : `${selectedCount} of ${shops.length} selected`) : 'Online has no stores'}
          disabled={!storesApply}>
          <Row
            first
            icon="buildings"
            title="All stores"
            description={`${shops.length} stores`}
            role="checkbox"
            selected={storesApply && allStores}
            disabled={!storesApply}
            onPress={() => setDraft((current) => ({ ...current, shopIds: [] }))}
          />
          {shops.map((shop) => (
            <Row
              key={shop.id}
              icon="storefront"
              title={shop.name}
              description={shop.address}
              role="checkbox"
              selected={storesApply && (allStores || draft.shopIds.includes(shop.id))}
              // While every store is in, the All stores row carries the highlight.
              highlighted={storesApply && !allStores && draft.shopIds.includes(shop.id)}
              disabled={!storesApply}
              onPress={() => toggleShop(shop.id)}
            />
          ))}
        </Section>
      </View>
    </PanelSheet>
  );
}

/** An uppercase label (as on the Overview cards) over a white card of rows. */
function Section({ label, trailing, disabled = false, children }: { label: string; trailing?: string; disabled?: boolean; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionLabelRow}>
        <Text accessibilityRole="header" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
          {label.toUpperCase()}
        </Text>
        {trailing ? <Text style={[styles.sectionTrailing, { color: theme.colors.onSurfaceVariant }]}>{trailing}</Text> : null}
      </View>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }, disabled && styles.disabled]}>{children}</View>
    </View>
  );
}

type RowProps = {
  icon: string;
  title: string;
  description: string;
  role: 'radio' | 'checkbox';
  selected: boolean;
  /** The icon tile on lime; defaults to `selected`. */
  highlighted?: boolean;
  disabled?: boolean;
  first?: boolean;
  onPress: () => void;
};

function Row({ icon, title, description, role, selected, highlighted = selected, disabled = false, first = false, onPress }: RowProps) {
  const theme = useTheme();
  // The navigation bar's active indicator.
  const lime = useAppColors().highlight;
  return (
    <Fragment>
      {first ? null : <View style={[styles.hairline, { backgroundColor: theme.colors.surfaceVariant }]} />}
      <TouchableRipple
        onPress={onPress}
        disabled={disabled}
        accessibilityRole={role}
        aria-checked={selected}
        accessibilityState={{ checked: selected, disabled }}>
        <View style={styles.row}>
          <View style={[styles.tile, { backgroundColor: highlighted ? lime : theme.colors.surfaceVariant }]}>
            <Icon source={highlighted ? `${icon}-fill` : icon} size={18} color={highlighted ? theme.colors.onSurface : theme.colors.onSurfaceVariant} />
          </View>
          <View style={styles.rowText}>
            <Text numberOfLines={1} style={[styles.rowTitle, { color: theme.colors.onSurface }]}>
              {title}
            </Text>
            <Text numberOfLines={1} style={[styles.rowDescription, { color: theme.colors.onSurfaceVariant }]}>
              {description}
            </Text>
          </View>
          <SelectionMark type={role} checked={selected} />
        </View>
      </TouchableRipple>
    </Fragment>
  );
}

// For sizing the sheet to its content.
/** Drag handle, header row and its divider (PanelSheet). */
const SHEET_CHROME = 36 + 52 + 1;
const SECTION_LABEL = 16 + 8;
const SECTION_GAP = 24;
const ROW_HEIGHT = 60;
/** Divider, padding and the Apply button; the bottom padding is added separately. */
const FOOTER_HEIGHT = 1 + PANEL_PADDING + 48;

const styles = StyleSheet.create({
  body: { padding: PANEL_PADDING, gap: SECTION_GAP },
  section: { gap: 8 },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 4 },
  sectionLabel: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
  sectionTrailing: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16 },
  card: { borderRadius: Shape.max, overflow: 'hidden' },
  disabled: { opacity: 0.5 },
  // Inset to start under the row's text, so the icon tiles read as one column.
  hairline: { height: 1, marginLeft: 12 + 32 + 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, height: ROW_HEIGHT, paddingLeft: 12, paddingRight: 4 },
  tile: { width: 32, height: 32, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  rowDescription: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16 },
  apply: { borderRadius: PANEL_INNER_RADIUS },
  applyContent: { height: 48 },
  applyLabel: { fontFamily: Fonts.medium, fontSize: 16 },
});
