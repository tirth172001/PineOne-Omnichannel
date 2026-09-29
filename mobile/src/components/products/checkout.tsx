import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import { type ReactNode, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Divider, Icon, Switch, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { Tabs } from '@/components/material3/tabs';
import { SearchField } from '@/components/search-field';
import { FormTextInput } from '@/components/shared/form-fields';
import { PANEL_INNER_RADIUS, PanelSheet } from '@/components/shared/panel-sheet';
import { TabScreen } from '@/components/tab-screen';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { DEFAULT_CHECKOUT_COLOR, PAYMODE_CARDS, type PaymodeCard } from '@/data/checkout';
import { useToast } from '@/hooks/use-toast';

import { ColorPickerSheet } from './color-picker-sheet';

const CARD_PADDING = 16;
const INNER_RADIUS = concentric(Shape.max, CARD_PADDING);
const SUCCESS = '#047857';
const TABS = [
  { key: 'customisation', label: 'Customisation' },
  { key: 'paymodes', label: 'Paymodes' },
];

type Branding = {
  darkMode: boolean;
  checkoutColor: string | null;
  checkoutLogo: string | null;
  walletName: string;
  walletColor: string | null;
  walletLogo: string | null;
  showContactDelivery: boolean;
  showRecommendedPayment: boolean;
  allowEditContact: boolean;
  allowEditAddress: boolean;
};

const INITIAL_BRANDING: Branding = {
  darkMode: false,
  checkoutColor: null,
  checkoutLogo: null,
  walletName: 'My wallet',
  walletColor: null,
  walletLogo: null,
  showContactDelivery: true,
  showRecommendedPayment: true,
  allowEditContact: true,
  allowEditAddress: true,
};

async function pickLogo() {
  const result = await DocumentPicker.getDocumentAsync({ type: ['image/png', 'image/svg+xml', 'image/jpeg'], copyToCacheDirectory: true });
  return result.canceled ? null : (result.assets[0]?.uri ?? null);
}

function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  const rows = (Array.isArray(children) ? children : [children]).filter(Boolean);
  return (
    <Card mode="contained" style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Text variant="titleMedium" style={[styles.semiBold, styles.sectionTitle]}>
        {title}
      </Text>
      {rows.map((row, index) => (
        <View key={index}>
          <Divider />
          {row}
        </View>
      ))}
    </Card>
  );
}

function SettingsRow({ icon, label, description, action }: { icon: ReactNode; label: string; description?: string; action: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.settingsRow}>
      {icon ? <View style={[styles.iconTile, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surfaceVariant }]}>{icon}</View> : null}
      <View style={styles.flex}>
        <Text variant="bodyMedium" style={styles.semiBold}>
          {label}
        </Text>
        {description ? (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {description}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}

function LinkAction({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <TouchableRipple onPress={onPress} borderless accessibilityRole="button" style={styles.link}>
      <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
        {label}
      </Text>
    </TouchableRipple>
  );
}

function ColorRow({ value, onEdit }: { value: string | null; onEdit: () => void }) {
  const theme = useTheme();
  return (
    <SettingsRow
      icon={value ? <View style={[styles.fill, { backgroundColor: value }]} /> : <Icon source="palette" size={16} color={theme.colors.onSurfaceVariant} />}
      label="Primary color"
      description="Add your brand primary colors"
      action={<LinkAction label={value ? 'Edit color' : 'Select color'} onPress={onEdit} />}
    />
  );
}

function LogoRow({ value, onChange }: { value: string | null; onChange: (uri: string) => void }) {
  const theme = useTheme();
  return (
    <SettingsRow
      icon={
        value ? (
          <Image source={{ uri: value }} style={styles.fill} contentFit="contain" />
        ) : (
          <Icon source="image-square" size={16} color={theme.colors.onSurfaceVariant} />
        )
      }
      label="Logo"
      description="Upload logo in PNG, SVG or JPEG format upto 1 MB size"
      action={
        <LinkAction
          label={value ? 'Edit logo' : 'Add logo'}
          onPress={async () => {
            const uri = await pickLogo();
            if (uri) onChange(uri);
          }}
        />
      }
    />
  );
}

/** The web's live mobile checkout preview: status bar, steps, branded header and payment options. */
function CheckoutPreview({ branding }: { branding: Branding }) {
  const theme = useTheme();
  const muted = { color: theme.colors.onSurfaceVariant };
  const border = { borderColor: theme.colors.outlineVariant };
  const headerBg = branding.darkMode ? '#0b0f0c' : (branding.checkoutColor ?? DEFAULT_CHECKOUT_COLOR);
  const radio = <Icon source="radio-button" size={20} color={theme.colors.onSurfaceVariant} />;

  return (
    <View style={[styles.previewWrap, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={styles.previewHeader}>
        <Text variant="titleSmall" style={styles.semiBold}>
          Preview
        </Text>
        <View style={styles.previewBadge}>
          <Text variant="labelSmall" style={styles.white}>
            Preview
          </Text>
        </View>
      </View>
      <View style={[styles.phone, border, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statusBar}>
          <Text variant="labelSmall">9:41</Text>
          <View style={styles.row}>
            <Icon source="cell-signal-full" size={14} color={theme.colors.onSurface} />
            <Icon source="wifi-high" size={14} color={theme.colors.onSurface} />
            <Icon source="battery-full" size={14} color={theme.colors.onSurface} />
          </View>
        </View>
        <View style={[styles.row, styles.centerRow]}>
          <Icon source="lock-simple" size={12} color={theme.colors.onSurfaceVariant} />
          <Text variant="labelSmall" style={muted}>
            gateway.plural.com
          </Text>
        </View>
        <View style={[styles.statusBar, styles.steps]}>
          <Text variant="labelSmall" style={muted}>
            Contact » Address »{' '}
          </Text>
          <View style={[styles.payStep, border]}>
            <Text variant="labelSmall">Pay</Text>
          </View>
          <View style={styles.flex} />
          <View style={[styles.translate, border]}>
            <Icon source="translate" size={14} color={theme.colors.onSurfaceVariant} />
            <Icon source="caret-down" size={12} color={theme.colors.onSurfaceVariant} />
          </View>
        </View>
        <View style={[styles.brandHeader, { backgroundColor: headerBg }]}>
          <View style={styles.statusBar}>
            <View style={styles.row}>
              {branding.checkoutLogo ? (
                <Image source={{ uri: branding.checkoutLogo }} style={styles.previewLogo} contentFit="contain" />
              ) : (
                <>
                  <View style={styles.brandMark}>
                    <Text variant="labelSmall" style={[styles.semiBold, { color: '#065f46' }]}>
                      C
                    </Text>
                  </View>
                  <Text variant="bodyMedium" style={[styles.medium, styles.white]}>
                    Croma
                  </Text>
                </>
              )}
            </View>
            <View style={styles.close}>
              <Icon source="x" size={14} color="#ffffff" />
            </View>
          </View>
          <Text style={[styles.previewAmount, styles.white]}>₹ 9,949.00</Text>
          <Text variant="labelSmall" style={styles.whiteMuted}>
            Order Summary ▾
          </Text>
        </View>
        <View style={styles.previewBody}>
          {branding.showContactDelivery ? (
            <View style={[styles.option, border]}>
              <Text variant="labelSmall" style={[muted, styles.tracking]}>
                CONTACT AND DELIVERY DETAILS
              </Text>
              <Icon source="caret-down" size={14} color={theme.colors.onSurfaceVariant} />
            </View>
          ) : null}
          <Text variant="labelSmall" style={[muted, styles.tracking]}>
            RECOMMENDED PAYMENT OPTIONS
          </Text>
          <View style={[styles.option, { borderColor: branding.showRecommendedPayment ? '#059669' : theme.colors.outlineVariant }]}>
            <View style={styles.row}>
              <View style={styles.walletDot}>
                <Icon source="wallet" size={12} color="#047857" />
              </View>
              <Text variant="bodyMedium">Simpl</Text>
            </View>
            {branding.showRecommendedPayment ? (
              <View style={[styles.checkDot, { backgroundColor: theme.colors.onSurface }]}>
                <Icon source="check" size={12} color={theme.colors.surface} />
              </View>
            ) : (
              radio
            )}
          </View>
          <View style={[styles.payButton, { backgroundColor: headerBg }]}>
            <Text variant="bodyMedium" style={[styles.medium, styles.white]}>
              Pay ₹ 9,949.00
            </Text>
          </View>
          <View style={[styles.option, border]}>
            <View style={styles.row}>
              <Icon source="money" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyMedium">LazyPay</Text>
            </View>
            {radio}
          </View>
          <View style={[styles.option, border]}>
            <View style={styles.optionStack}>
              <View style={styles.row}>
                <Icon source="credit-card" size={16} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium">
                  HDFC Credit Card <Text style={muted}>•• 4560</Text>
                </Text>
              </View>
              <View style={[styles.cvv, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={[styles.tiny, muted]}>No CVV required</Text>
              </View>
            </View>
            {radio}
          </View>
          <Text variant="labelSmall" style={[muted, styles.centerText]}>
            VIEW MORE PAYMENT OPTIONS
          </Text>
          <View style={[styles.row, styles.centerRow, styles.trust]}>
            <View style={styles.row}>
              <Icon source="shield" size={16} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.tiny, muted]}>Safe & Secure{'\n'}Payments</Text>
            </View>
            <View style={styles.row}>
              <Icon source="shield-check" size={16} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.tiny, muted]}>PCI DSS</Text>
            </View>
            <Text style={[styles.tiny, styles.semiBold]}>
              pine labs{'\n'}
              <Text style={[styles.tiny, muted]}>ONLINE</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function CustomisationTab({ branding, onChange }: { branding: Branding; onChange: (patch: Partial<Branding>) => void }) {
  const theme = useTheme();
  const [colorTarget, setColorTarget] = useState<'checkout' | 'wallet' | null>(null);
  const toggle = (label: string, key: 'showContactDelivery' | 'showRecommendedPayment' | 'allowEditContact' | 'allowEditAddress') => (
    <SettingsRow
      icon={null}
      label={label}
      action={<Switch value={branding[key]} onValueChange={(value) => onChange({ [key]: value })} accessibilityLabel={label} />}
    />
  );

  return (
    <>
      <SettingsSection title="Checkout branding">
        <SettingsRow
          icon={<Icon source="moon" size={16} color={theme.colors.onSurfaceVariant} />}
          label="Dark mode"
          description="It converts the header in the dark mode versions"
          action={<Switch value={branding.darkMode} onValueChange={(darkMode) => onChange({ darkMode })} accessibilityLabel="Dark mode" />}
        />
        <ColorRow value={branding.checkoutColor} onEdit={() => setColorTarget('checkout')} />
        <LogoRow value={branding.checkoutLogo} onChange={(checkoutLogo) => onChange({ checkoutLogo })} />
      </SettingsSection>

      <SettingsSection title="Wallet branding">
        <View style={styles.walletName}>
          <Text variant="bodyMedium" style={styles.semiBold}>
            Wallet name
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            It will be used to represent the wallet as a payment method
          </Text>
          <FormTextInput
            value={branding.walletName}
            onChangeText={(walletName) => onChange({ walletName })}
            accessibilityLabel="Wallet name"
            radius={INNER_RADIUS}
          />
        </View>
        <ColorRow value={branding.walletColor} onEdit={() => setColorTarget('wallet')} />
        <LogoRow value={branding.walletLogo} onChange={(walletLogo) => onChange({ walletLogo })} />
      </SettingsSection>

      <SettingsSection title="Express checkout preferences">
        {toggle('Show contact and delivery details', 'showContactDelivery')}
        {toggle('Show recommended payment mode', 'showRecommendedPayment')}
        {toggle('Allow users to edit the contact', 'allowEditContact')}
        {toggle('Allow users to edit the address', 'allowEditAddress')}
      </SettingsSection>

      <CheckoutPreview branding={branding} />

      <ColorPickerSheet
        visible={colorTarget !== null}
        onDismiss={() => setColorTarget(null)}
        title={colorTarget === 'wallet' ? 'Wallet primary color' : 'Checkout primary color'}
        value={colorTarget === 'wallet' ? branding.walletColor : branding.checkoutColor}
        onChange={(hex) => onChange(colorTarget === 'wallet' ? { walletColor: hex } : { checkoutColor: hex })}
      />
    </>
  );
}

/** Visa / RuPay / Mastercard marks (web: CardNetworkBadges). */
function CardNetworkBadges() {
  const theme = useTheme();
  const badge = [styles.networkBadge, { borderColor: theme.colors.outlineVariant }];
  return (
    <View style={styles.row}>
      <View style={badge}>
        <Text style={[styles.networkText, { color: '#1e40af', fontStyle: 'italic' }]}>VISA</Text>
      </View>
      <View style={[badge, styles.overlap]}>
        <Text style={[styles.networkText, { color: '#047857', fontSize: 5 }]}>RuPay</Text>
      </View>
      <View style={[badge, styles.overlap]}>
        <View style={[styles.mcCircle, { backgroundColor: '#ef4444' }]} />
        <View style={[styles.mcCircle, styles.mcRight, { backgroundColor: '#fbbf24' }]} />
      </View>
    </View>
  );
}

function PaymodeDetailSheet({ card, onDismiss }: { card: PaymodeCard | null; onDismiss: () => void }) {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const items = (card?.detail ?? []).filter((item) => item.name.toLowerCase().includes(query));
  return (
    <PanelSheet
      visible={card !== null}
      onDismiss={() => {
        onDismiss();
        setSearch('');
      }}
      title={card?.title ?? ''}
      scroll={false}>
      <View style={styles.sheetBody}>
        <SearchField value={search} onChangeText={setSearch} placeholder="Search" radius={PANEL_INNER_RADIUS} />
        <ScrollView style={styles.flex}>
          {items.map((item, index) => (
            <View key={item.name}>
              {index > 0 ? <Divider /> : null}
              <View style={styles.detailRow}>
                <Text variant="bodyMedium">{item.name}</Text>
                {item.active ? (
                  <View style={styles.row}>
                    <Icon source="check-circle-fill" size={16} color={SUCCESS} />
                    <Text variant="labelMedium" style={{ color: SUCCESS }}>
                      Active
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ))}
          {items.length === 0 ? (
            <Text variant="bodyMedium" style={[styles.centerText, styles.noResults, { color: theme.colors.onSurfaceVariant }]}>
              No results found
            </Text>
          ) : null}
        </ScrollView>
      </View>
    </PanelSheet>
  );
}

function PaymodesTab() {
  const theme = useTheme();
  const [activeCard, setActiveCard] = useState<PaymodeCard | null>(null);
  const action = (card: PaymodeCard) => (
    <TouchableRipple onPress={() => setActiveCard(card)} borderless accessibilityRole="button" style={styles.link}>
      <View style={styles.row}>
        <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
          {card.action}
        </Text>
        <Icon source="caret-right" size={14} color={theme.colors.primary} />
      </View>
    </TouchableRipple>
  );

  return (
    <>
      {PAYMODE_CARDS.map((card) => (
        <Card key={card.title} mode="contained" style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.paymodeBody}>
            <View style={styles.rowBetween}>
              <View style={[styles.iconTile, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surfaceVariant }]}>
                {card.icon === 'upi' ? (
                  <Text style={styles.upi}>UPI</Text>
                ) : (
                  <Icon source={card.icon} size={16} color={theme.colors.onSurfaceVariant} />
                )}
              </View>
              {card.active ? (
                <View style={styles.activeBadge}>
                  <Text variant="labelSmall" style={styles.white}>
                    Active
                  </Text>
                </View>
              ) : null}
            </View>
            <View>
              <Text variant="bodyMedium" style={styles.semiBold}>
                {card.title}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {card.subtitle}
              </Text>
            </View>
            {card.logos ? (
              <View style={styles.rowBetween}>
                <CardNetworkBadges />
                {action(card)}
              </View>
            ) : card.pills ? (
              <View style={styles.rowBetween}>
                <View style={styles.row}>
                  {card.pills.map((pill) => (
                    <View key={pill} style={[styles.pill, { borderColor: theme.colors.outlineVariant }]}>
                      <Icon source="check" size={12} color={theme.colors.onSurface} />
                      <Text variant="labelSmall">{pill}</Text>
                    </View>
                  ))}
                </View>
                {action(card)}
              </View>
            ) : (
              action(card)
            )}
          </View>
          {card.footerNote ? (
            <View
              style={[
                styles.footerNote,
                { backgroundColor: card.footerNote.tone === 'error' ? 'rgba(220, 38, 38, 0.1)' : theme.colors.surfaceVariant },
              ]}>
              <Text variant="bodyMedium" style={{ color: card.footerNote.tone === 'error' ? theme.colors.error : theme.colors.onSurfaceVariant }}>
                {card.footerNote.text}
              </Text>
            </View>
          ) : null}
        </Card>
      ))}
      <PaymodeDetailSheet card={activeCard} onDismiss={() => setActiveCard(null)} />
    </>
  );
}

/**
 * Checkout (web: CheckoutContent): Customisation — checkout and wallet
 * branding, express-checkout preferences, and the live mobile checkout
 * preview, saved with the header's Save once edited — and Paymodes, each payment
 * mode with its issuers, banks, apps or wallets. The web's side-by-side
 * preview (with desktop view and zoom) stacks under the settings on a phone.
 */
export function Checkout() {
  const toast = useToast();
  const [tab, setTab] = useState('customisation');
  const [branding, setBranding] = useState<Branding>(INITIAL_BRANDING);
  const [dirty, setDirty] = useState(false);

  return (
    <TabScreen
      tab="checkout"
      // Save shows once the customisation has unsaved changes.
      actions={
        tab === 'customisation' && dirty
          ? [
              {
                label: 'Save details',
                shortLabel: 'Save',
                icon: 'check',
                onPress: () => {
                  toast('Checkout settings saved');
                  setDirty(false);
                },
              },
            ]
          : []
      }>
      <View style={styles.tabs}>
        <Tabs tabs={TABS} activeKey={tab} onChange={setTab} variant="secondary" />
      </View>
      {tab === 'customisation' ? (
        <CustomisationTab
          branding={branding}
          onChange={(patch) => {
            setBranding((current) => ({ ...current, ...patch }));
            setDirty(true);
          }}
        />
      ) : (
        <PaymodesTab />
      )}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  centerRow: { justifyContent: 'center' },
  centerText: { textAlign: 'center' },
  medium: { fontFamily: Fonts.medium },
  semiBold: { fontFamily: Fonts.semiBold },
  white: { color: '#ffffff' },
  whiteMuted: { color: 'rgba(255, 255, 255, 0.7)', marginTop: 4 },
  tracking: { letterSpacing: 0.5 },
  tiny: { fontSize: 10, lineHeight: 13 },
  tabs: { marginHorizontal: -16, marginVertical: -8 },
  card: { borderRadius: Shape.max, overflow: 'hidden' },
  sectionTitle: { paddingHorizontal: CARD_PADDING, paddingVertical: 14 },
  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: CARD_PADDING, paddingVertical: 14 },
  iconTile: { width: 36, height: 36, borderRadius: INNER_RADIUS, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  fill: { width: '100%', height: '100%' },
  link: { borderRadius: INNER_RADIUS, paddingVertical: 4 },
  walletName: { paddingHorizontal: CARD_PADDING, paddingVertical: 14, gap: 4 },
  // Preview
  previewWrap: { borderRadius: Shape.max, padding: CARD_PADDING, gap: 12 },
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewBadge: { backgroundColor: '#059669', borderRadius: INNER_RADIUS, paddingHorizontal: 10, height: 24, justifyContent: 'center' },
  phone: { alignSelf: 'center', width: '100%', maxWidth: 320, borderWidth: 1, borderRadius: INNER_RADIUS, overflow: 'hidden' },
  statusBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12 },
  steps: { paddingBottom: 8 },
  payStep: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  translate: { flexDirection: 'row', alignItems: 'center', gap: 2, borderWidth: 1, borderRadius: 4, padding: 4 },
  brandHeader: { paddingHorizontal: 16, paddingBottom: 16 },
  brandMark: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  previewLogo: { width: 72, height: 24 },
  close: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.1)', alignItems: 'center', justifyContent: 'center' },
  previewAmount: { fontFamily: Fonts.semiBold, fontSize: 24, lineHeight: 30, marginTop: 12 },
  previewBody: { padding: 16, gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionStack: { gap: 6 },
  walletDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center' },
  checkDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  payButton: { height: 40, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  cvv: { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  trust: { gap: 16, paddingTop: 8 },
  // Paymodes
  paymodeBody: { padding: CARD_PADDING, gap: 12 },
  upi: { fontSize: 10, fontFamily: Fonts.bold, letterSpacing: -0.5 },
  activeBadge: { backgroundColor: SUCCESS, borderRadius: INNER_RADIUS, paddingHorizontal: 10, height: 24, justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: INNER_RADIUS, paddingHorizontal: 8, paddingVertical: 4 },
  footerNote: { paddingHorizontal: CARD_PADDING, paddingVertical: 12 },
  networkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlap: { marginLeft: -14 },
  networkText: { fontSize: 6, fontFamily: Fonts.bold },
  mcCircle: { position: 'absolute', width: 12, height: 12, borderRadius: 6, left: 4 },
  mcRight: { left: 9, opacity: 0.85 },
  sheetBody: { flex: 1, paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  noResults: { paddingVertical: 24 },
});
