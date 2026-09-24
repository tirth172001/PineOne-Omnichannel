import { Asset } from 'expo-asset';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Button, Divider, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { DimmedDecimalAmount } from '@/components/shared/amount';
import { CompactSegmentedButtons } from '@/components/shared/controls';
import { CopyableValue } from '@/components/shared/copyable-value';
import { DetailRow, DetailSections } from '@/components/shared/detail-rows';
import { DETAIL_FOOTER_BUTTON_RADIUS, DetailScreen, type StatusGradientTone } from '@/components/shared/detail-screen';
import { PANEL_INNER_RADIUS, PanelSection, PanelSheet } from '@/components/shared/panel-sheet';
import { StatusPill } from '@/components/shared/status';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { formatInr } from '@/data/common';
import {
  ACTIVITY_PANEL,
  type ActivityEvent,
  type ActivityTone,
  CHARGE_SLIPS,
  type DetailChannel,
  getActivityEvents,
  getInStoreSections,
  ONLINE_PRODUCTS,
  ONLINE_SECTIONS,
  PRODUCT_DETAIL_FIELDS,
} from '@/data/transaction-detail';
import type { TransactionRecord } from '@/data/transactions';

const TONE_ICON: Record<ActivityTone, { icon: string; color: string }> = {
  success: { icon: 'check-circle', color: '#10b981' },
  failed: { icon: 'x-circle', color: '#ef4444' },
  processing: { icon: 'arrow-counter-clockwise', color: '#f59e0b' },
  initiated: { icon: 'circle', color: '#8b5cf6' },
};

const GRADIENT: Record<TransactionRecord['status']['tone'], StatusGradientTone> = {
  success: 'success',
  failed: 'failed',
  processing: 'processing',
  initiated: 'neutral',
};

const amount = (value: number) => formatInr(value).replace(/\.00$/, '');

/**
 * Transaction detail (web: TransactionDetailContent): payment-mode tile,
 * amount and status, the meta line (and ID pills online), Refund and
 * Charge-slip actions, the detail sections, product rows (online), and the
 * activity timeline. The web's side-by-side details + activity columns stack
 * on a phone; every side panel opens as a sheet.
 */
export function TransactionDetail({ transaction, channel }: { transaction: TransactionRecord; channel: DetailChannel }) {
  const theme = useTheme();
  const online = channel === 'online';
  const events = getActivityEvents(transaction, channel);
  const [activityEvent, setActivityEvent] = useState<ActivityEvent | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);
  const [chargeSlipOpen, setChargeSlipOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

  return (
    <DetailScreen
      title="Transaction details"
      fallbackHref="/payments?tab=transactions"
      gradient={GRADIENT[transaction.status.tone]}
      footer={
        <>
          {!online ? (
            <Button
              mode="outlined"
              onPress={() => setChargeSlipOpen(true)}
              textColor={theme.colors.onSurface}
              style={[styles.footerButton, { borderColor: theme.colors.outlineVariant }]}
              labelStyle={styles.footerLabel}>
              View chargeslip / receipt
            </Button>
          ) : null}
          <Button mode="contained" onPress={() => setRefundOpen(true)} style={styles.footerButton} labelStyle={styles.footerLabel}>
            Refund transaction
          </Button>
        </>
      }>

      <View style={styles.hero}>
        <View style={[styles.modeTile, { backgroundColor: theme.colors.primary }]}>
          <Icon source={transaction.paymentMode === 'card' ? 'credit-card' : 'qr-code'} size={32} color={theme.colors.onPrimary} />
        </View>
        <View style={styles.amountRow}>
          <DimmedDecimalAmount value={amount(transaction.amount)} size="hero" />
          <StatusPill label={transaction.status.label} tone={transaction.status.tone} radius={Shape.max} />
        </View>
        <Text variant="bodyMedium" style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
          Payment mode: {transaction.provider}
          {'\n'}
          {online ? 'Last updated on' : 'Transaction on'}: {transaction.date}, {transaction.time}
        </Text>
        {online ? (
          <View style={styles.pills}>
            <CopyableValue variant="pill" value={transaction.transactionId} label={`Transaction ID: ${transaction.transactionId}`} />
            <CopyableValue variant="pill" value={transaction.orderId} label={`Order ID: ${transaction.orderId}`} />
            <CopyableValue variant="pill" value={transaction.merchantId} label={`Merchant ID: ${transaction.merchantId}`} />
          </View>
        ) : null}
      </View>

      <Divider />

      <DetailSections
        sections={(online ? ONLINE_SECTIONS : getInStoreSections(transaction)).map((section) => ({ title: section.title, rows: section.fields }))}
      />

      {online ? (
        <View style={styles.block}>
          <Divider />
          <Text style={styles.sectionTitle}>Product details</Text>
          {ONLINE_PRODUCTS.map((product, index) => (
            <TouchableRipple
              key={index}
              onPress={() => setProductOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`Product ${product}, view details`}
              borderless
              style={[styles.productRow, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
              <View style={styles.productRowContent}>
                <Text variant="bodyMedium" style={styles.regular}>
                  Product: {product}
                </Text>
                <View style={styles.inlineLink}>
                  <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                    View details
                  </Text>
                  <Icon source="caret-right" size={14} color={theme.colors.primary} />
                </View>
              </View>
            </TouchableRipple>
          ))}
        </View>
      ) : null}

      <Divider />

      <View style={styles.block}>
        <Text style={styles.sectionTitle}>Activity</Text>
        <View style={styles.timeline}>
          <View style={[styles.timelineLine, { backgroundColor: theme.colors.outlineVariant }]} />
          {events.map((event) => (
            <View key={event.id} style={styles.event}>
              <View style={[styles.eventIcon, { backgroundColor: theme.colors.background }]}>
                <Icon source={TONE_ICON[event.tone].icon} size={16} color={TONE_ICON[event.tone].color} />
              </View>
              <View style={styles.eventBody}>
                <View style={styles.eventTitleRow}>
                  <Text variant="bodyMedium" style={styles.regular}>
                    {event.title}
                  </Text>
                  {event.badge ? (
                    <View style={[styles.badge, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
                      <Text style={styles.badgeText}>{event.badge}</Text>
                    </View>
                  ) : null}
                </View>
                <Text variant="bodyMedium" style={[styles.regular, { color: theme.colors.onSurfaceVariant }]}>
                  {event.timestamp}
                </Text>
                <TouchableRipple onPress={() => setActivityEvent(event)} accessibilityRole="button" borderless style={styles.eventLink}>
                  <View style={styles.inlineLink}>
                    <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                      View details
                    </Text>
                    <Icon source="caret-right" size={14} color={theme.colors.primary} />
                  </View>
                </TouchableRipple>
              </View>
            </View>
          ))}
        </View>
      </View>

      <ActivityPanel event={activityEvent} onDismiss={() => setActivityEvent(null)} />
      <ProductPanel visible={productOpen} onDismiss={() => setProductOpen(false)} />
      <RefundPanel transaction={transaction} visible={refundOpen} onDismiss={() => setRefundOpen(false)} />
      <ChargeSlipPanel transaction={transaction} visible={chargeSlipOpen} onDismiss={() => setChargeSlipOpen(false)} />
    </DetailScreen>
  );
}

/** Web: ActivityTimelineSidepanel (fixed demo content for every event, as on web). */
function ActivityPanel({ event, onDismiss }: { event: ActivityEvent | null; onDismiss: () => void }) {
  const theme = useTheme();
  return (
    <PanelSheet visible={event !== null} onDismiss={onDismiss} title="Transaction details">
      <PanelSection>
        <View style={[styles.panelTile, { backgroundColor: theme.colors.primary }]}>
          <Icon source="credit-card" size={24} color={theme.colors.onPrimary} />
        </View>
        <View style={styles.amountRow}>
          <DimmedDecimalAmount value={ACTIVITY_PANEL.amount} size="large" />
          <StatusPill label={ACTIVITY_PANEL.statusLabel} tone="failed" radius={PANEL_INNER_RADIUS} />
        </View>
        <Text variant="bodyMedium" style={[styles.regular, { color: theme.colors.onSurfaceVariant }]}>
          {ACTIVITY_PANEL.meta.join('  |  ')}
        </Text>
        <View style={styles.panelRows}>
          {ACTIVITY_PANEL.fields.map((field, index) => (
            <DetailRow key={`${field.label}-${index}`} label={field.label}>
              {'copyable' in field && field.copyable ? <CopyableValue value={field.value} /> : <Text variant="bodyMedium">{field.value}</Text>}
            </DetailRow>
          ))}
        </View>
      </PanelSection>
      <PanelSection>
        <Text variant="titleMedium" style={styles.semiBold}>
          Error details
        </Text>
        {ACTIVITY_PANEL.errorFields.map((field) => (
          <DetailRow key={field.label} label={field.label} value={field.value} />
        ))}
      </PanelSection>
      <PanelSection last>
        <Text variant="titleMedium" style={styles.semiBold}>
          Custom fields
        </Text>
        {ACTIVITY_PANEL.customFields.map((field) => (
          <DetailRow key={field.label} label={field.label} value={field.value} />
        ))}
      </PanelSection>
    </PanelSheet>
  );
}

/** Web: the Product details side panel. */
function ProductPanel({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const theme = useTheme();
  return (
    <PanelSheet visible={visible} onDismiss={onDismiss} title="Product details" height={440}>
      <PanelSection last>
        {PRODUCT_DETAIL_FIELDS.map((field) => (
          <DetailRow key={field.label} label={field.label}>
            <View style={styles.inlineLink}>
              {field.icon ? <Icon source={field.icon} size={16} color={theme.colors.onSurface} /> : null}
              <Text variant="bodyMedium">{field.value}</Text>
              {field.info ? <Icon source="info" size={16} color={theme.colors.onSurfaceVariant} /> : null}
            </View>
          </DetailRow>
        ))}
      </PanelSection>
    </PanelSheet>
  );
}

/** Web: the Refund transaction side panel — full or partial refund with validation. */
function RefundPanel({ transaction, visible, onDismiss }: { transaction: TransactionRecord; visible: boolean; onDismiss: () => void }) {
  const theme = useTheme();
  const refundable = transaction.amount;
  const [input, setInput] = useState(String(refundable));
  const [submitted, setSubmitted] = useState(false);
  // Reset each time the panel opens (adjusting state during render).
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setInput(String(refundable));
      setSubmitted(false);
    }
  }
  const refundAmount = Number(input || '0');
  const valid = Number.isFinite(refundAmount) && refundAmount > 0 && refundAmount <= refundable;
  const partial = valid && refundAmount < refundable;

  return (
    <PanelSheet visible={visible} onDismiss={onDismiss} title="Refund transaction" height={520}>
      <PanelSection>
        <DetailRow label="Transaction ID" value={transaction.transactionId} />
        <Text variant="bodyMedium" style={[styles.regular, { color: theme.colors.onSurfaceVariant }]}>
          Refundable amount
        </Text>
        <DimmedDecimalAmount value={amount(refundable)} size="large" />
      </PanelSection>
      <PanelSection last>
        {submitted ? (
          <View style={[styles.success, { borderColor: theme.colors.outlineVariant }]}>
            <View style={styles.successIcon}>
              <Icon source="check-circle" size={20} color="#10b981" />
            </View>
            <Text variant="titleMedium" style={[styles.semiBold, styles.center]}>
              Refund initiated
            </Text>
            <Text variant="bodySmall" style={[styles.center, { color: theme.colors.onSurfaceVariant }]}>
              {amount(refundAmount)} {partial ? 'partial refund' : 'full refund'} initiated for {transaction.transactionId}.
            </Text>
          </View>
        ) : (
          <>
            <Text variant="bodyMedium" style={[styles.regular, { color: theme.colors.onSurfaceVariant }]}>
              Refund amount
            </Text>
            <TextInput
              value={input}
              onChangeText={(value) => setInput(value.replace(/[^\d]/g, ''))}
              keyboardType="number-pad"
              accessibilityLabel="Refund amount"
              style={[styles.input, { borderColor: valid ? theme.colors.outlineVariant : theme.colors.error, color: theme.colors.onSurface }]}
            />
            {partial ? (
              <View style={[styles.note, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surfaceVariant }]}>
                <Text variant="bodySmall">You are initiating a partial refund of {amount(refundAmount)}.</Text>
              </View>
            ) : null}
            {!valid ? (
              <Text variant="bodySmall" style={{ color: theme.colors.error }}>
                Enter an amount between ₹1 and {amount(refundable)}.
              </Text>
            ) : null}
            <Button mode="contained" disabled={!valid} onPress={() => setSubmitted(true)} style={styles.panelButton}>
              {partial ? 'Initiate partial refund' : 'Initiate full refund'}
            </Button>
          </>
        )}
      </PanelSection>
    </PanelSheet>
  );
}

const CHARGE_SLIP_OPTIONS = [
  { value: 'customer', label: 'Customer copy' },
  { value: 'merchant', label: 'Merchant copy' },
] as const;

/**
 * Web: the Charge slip / Receipt panel, which previews the PDF inline. Phones
 * open the PDF in the in-app browser instead (the web's iframe preview has no
 * cross-platform equivalent without an extra WebView dependency).
 */
function ChargeSlipPanel({ transaction, visible, onDismiss }: { transaction: TransactionRecord; visible: boolean; onDismiss: () => void }) {
  const theme = useTheme();
  const [type, setType] = useState<'customer' | 'merchant'>('merchant');
  const openSlip = async () => {
    const asset = Asset.fromModule(CHARGE_SLIPS[type]);
    await asset.downloadAsync();
    await WebBrowser.openBrowserAsync(asset.localUri ?? asset.uri);
  };
  const fileName = `${type}-chargeslip-${transaction.transactionId}.pdf`;

  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title="Charge slip / Receipt"
      height={420}
      footer={
        <Button mode="contained" icon="download-simple" onPress={openSlip} style={styles.panelButton}>
          Download chargeslip
        </Button>
      }>
      <PanelSection>
        <CompactSegmentedButtons value={type} onValueChange={setType} options={CHARGE_SLIP_OPTIONS} radius={PANEL_INNER_RADIUS} grow />
      </PanelSection>
      <PanelSection last>
        <TouchableRipple
          onPress={openSlip}
          accessibilityRole="button"
          accessibilityLabel={`Open ${fileName}`}
          borderless
          style={[styles.file, { borderColor: theme.colors.outlineVariant }]}>
          <View style={styles.fileContent}>
            <Icon source="file-pdf" size={32} color={theme.colors.error} />
            <View style={styles.fileText}>
              <Text variant="bodyMedium" style={styles.medium} numberOfLines={1}>
                {fileName}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Tap to preview
              </Text>
            </View>
            <Icon source="arrow-up-right" size={16} color={theme.colors.onSurfaceVariant} />
          </View>
        </TouchableRipple>
      </PanelSection>
    </PanelSheet>
  );
}

const TIMELINE_ICON = 16;

const styles = StyleSheet.create({
  footerButton: { flex: 1, borderRadius: DETAIL_FOOTER_BUTTON_RADIUS },
  footerLabel: { marginHorizontal: 8 },
  hero: { gap: 12 },
  modeTile: { width: 48, height: 48, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center' },
  panelTile: { width: 36, height: 36, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center' },
  amountRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  meta: { fontFamily: Fonts.regular, lineHeight: 22 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  block: { gap: 12 },
  // Web: text-xl font-medium.
  sectionTitle: { fontFamily: Fonts.medium, fontSize: 20, lineHeight: 24 },
  productRow: { borderWidth: 1, borderRadius: Shape.small },
  productRowContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  inlineLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeline: { gap: 20 },
  timelineLine: { position: 'absolute', left: TIMELINE_ICON / 2 - 0.5, top: 8, bottom: 8, width: 1 },
  event: { flexDirection: 'row', gap: 16 },
  eventIcon: { paddingTop: 2 },
  eventBody: { flex: 1, gap: 2 },
  eventTitleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  badge: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Shape.small, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 11, lineHeight: 14, fontFamily: Fonts.regular },
  eventLink: { alignSelf: 'flex-start', borderRadius: Shape.extraSmall, marginTop: 2 },
  regular: { fontFamily: Fonts.regular },
  medium: { fontFamily: Fonts.medium },
  semiBold: { fontFamily: Fonts.semiBold },
  center: { textAlign: 'center' },
  panelRows: { gap: 12, marginTop: 8 },
  input: { height: 44, borderWidth: 1, borderRadius: PANEL_INNER_RADIUS, paddingHorizontal: 12, fontFamily: Fonts.regular, fontSize: 14 },
  note: { borderWidth: 1, borderRadius: PANEL_INNER_RADIUS, paddingHorizontal: 12, paddingVertical: 8 },
  panelButton: { borderRadius: PANEL_INNER_RADIUS },
  success: { borderWidth: 1, borderRadius: PANEL_INNER_RADIUS, padding: 16, gap: 4 },
  successIcon: { alignSelf: 'center', padding: 8 },
  file: { borderWidth: 1, borderRadius: PANEL_INNER_RADIUS },
  fileContent: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  fileText: { flex: 1, gap: 2 },
});

