import { Asset } from 'expo-asset';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Button, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { DimmedDecimalAmount } from '@/components/shared/amount';
import { CompactSegmentedButtons } from '@/components/shared/controls';
import { CopyableValue } from '@/components/shared/copyable-value';
import { DetailRow, DetailSections, SECTION_CARD_INNER_RADIUS, SectionCard } from '@/components/shared/detail-rows';
import { CollapsingDetailScreen, DETAIL_FOOTER_BUTTON_RADIUS, type StatusGradientTone } from '@/components/shared/detail-screen';
import { PANEL_INNER_RADIUS, PanelSection, PanelSheet } from '@/components/shared/panel-sheet';
import { StatusPill } from '@/components/shared/status';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { formatInr } from '@/data/common';
import {
  CHARGE_SLIPS,
  type DetailChannel,
  getActivityEvents,
  getInStoreSections,
  ONLINE_PRODUCTS,
  ONLINE_SECTIONS,
  PRODUCT_DETAIL_FIELDS,
} from '@/data/transaction-detail';
import type { TransactionRecord } from '@/data/transactions';

import { ActivityTimeline } from './activity-timeline';

const GRADIENT: Record<TransactionRecord['status']['tone'], StatusGradientTone> = {
  success: 'success',
  failed: 'failed',
  processing: 'processing',
  initiated: 'neutral',
};

const amount = (value: number) => formatInr(value).replace(/\.00$/, '');

/**
 * Transaction detail (web: TransactionDetailContent): a centred hero
 * (payment-mode tile, amount, status, meta line and ID pills online), then a
 * card per segment — Activity first, then each detail section and the product
 * rows (online). Refund and Charge-slip are the pinned footer; every side
 * panel opens as a sheet.
 */
export function TransactionDetail({ transaction, channel }: { transaction: TransactionRecord; channel: DetailChannel }) {
  const theme = useTheme();
  const online = channel === 'online';
  const events = getActivityEvents(transaction, channel);
  const [refundOpen, setRefundOpen] = useState(false);
  const [chargeSlipOpen, setChargeSlipOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

  // Centred summary; it collapses into the header (amount + pay mode) on scroll.
  const hero = (
    <View style={styles.hero}>
      <View style={[styles.modeTile, { backgroundColor: theme.colors.primary }]}>
        <Icon source={transaction.paymentMode === 'card' ? 'credit-card' : 'qr-code'} size={32} color={theme.colors.onPrimary} />
      </View>
      <DimmedDecimalAmount value={amount(transaction.amount)} size="hero" />
      {/* Wrapped so the pill (which aligns itself to the start) centres in the hero. */}
      <View>
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
  );

  return (
    <CollapsingDetailScreen
      fallbackHref="/payments"
      gradient={GRADIENT[transaction.status.tone]}
      compactTitle={amount(transaction.amount)}
      compactSubtitle={`${transaction.paymentLabel} · ${transaction.provider}`}
      hero={hero}
      footer={
        <>
          {!online ? (
            <Button
              mode="outlined"
              onPress={() => setChargeSlipOpen(true)}
              textColor={theme.colors.onSurface}
              style={[styles.footerButton, { borderColor: theme.colors.outlineVariant }]}
              labelStyle={styles.footerLabel}>
              Chargeslip / receipt
            </Button>
          ) : null}
          <Button mode="contained" onPress={() => setRefundOpen(true)} style={styles.footerButton} labelStyle={styles.footerLabel}>
            Refund transaction
          </Button>
        </>
      }>

      {/* One card per segment, evenly spaced; Activity comes first (user decision). */}
      <View style={styles.cards}>
        <ActivityTimeline events={events} carded />
        <DetailSections
          carded
          sections={(online ? ONLINE_SECTIONS : getInStoreSections(transaction)).map((section) => ({ title: section.title, rows: section.fields }))}
        />
        {online ? (
          <SectionCard title="Product details">
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
          </SectionCard>
        ) : null}
      </View>

      <ProductPanel visible={productOpen} onDismiss={() => setProductOpen(false)} />
      <RefundPanel transaction={transaction} visible={refundOpen} onDismiss={() => setRefundOpen(false)} />
      <ChargeSlipPanel transaction={transaction} visible={chargeSlipOpen} onDismiss={() => setChargeSlipOpen(false)} />
    </CollapsingDetailScreen>
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

const styles = StyleSheet.create({
  footerButton: { flex: 1, borderRadius: DETAIL_FOOTER_BUTTON_RADIUS },
  footerLabel: { marginHorizontal: 8 },
  hero: { gap: 10, alignItems: 'center', paddingBottom: 8 },
  cards: { gap: 12 },
  modeTile: { width: 48, height: 48, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center' },
  meta: { fontFamily: Fonts.regular, lineHeight: 22, textAlign: 'center' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  productRow: { borderWidth: 1, borderRadius: SECTION_CARD_INNER_RADIUS },
  productRowContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  inlineLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  regular: { fontFamily: Fonts.regular },
  medium: { fontFamily: Fonts.medium },
  semiBold: { fontFamily: Fonts.semiBold },
  center: { textAlign: 'center' },
  input: { height: 44, borderWidth: 1, borderRadius: PANEL_INNER_RADIUS, paddingHorizontal: 12, fontFamily: Fonts.regular, fontSize: 14 },
  note: { borderWidth: 1, borderRadius: PANEL_INNER_RADIUS, paddingHorizontal: 12, paddingVertical: 8 },
  panelButton: { borderRadius: PANEL_INNER_RADIUS },
  success: { borderWidth: 1, borderRadius: PANEL_INNER_RADIUS, padding: 16, gap: 4 },
  successIcon: { alignSelf: 'center', padding: 8 },
  file: { borderWidth: 1, borderRadius: PANEL_INNER_RADIUS },
  fileContent: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  fileText: { flex: 1, gap: 2 },
});

