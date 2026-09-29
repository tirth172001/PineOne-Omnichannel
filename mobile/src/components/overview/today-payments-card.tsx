import { Fragment } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { formatInr, type PaymentMode, type RecentPayment } from '@/data/overview';

import { DimmedDecimalAmount } from '@/components/shared/amount';

import {
  OVERVIEW_CARD_PADDING,
  OverviewCard,
  OverviewCardDivider,
  OverviewCardFooter,
  OverviewCardHeader,
  OverviewCardRangeLabel,
} from './overview-card';

const PAY_MODE_LABEL: Record<PaymentMode, string> = { upi: 'UPI', card: 'Card', netbanking: 'Net banking' };

type TodayPaymentsCardProps = {
  totalAmount: number;
  count: number;
  failedCount: number;
  recent: RecentPayment[];
  onPressPayment?: (transactionId: string) => void;
  onPressHistory?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * "Today's payments" — mobile version of the web Overview's
 * TransactionsOverviewCard: today's total and payment count (with failures
 * called out), the last three payments, and a link to the full history. The
 * web's two columns stack here to fit a phone width. Each payment is the
 * amount with its mode and time under it; the whole row opens it, and only a
 * payment that isn't a success shows a status (user decision).
 */
export function TodayPaymentsCard({
  totalAmount,
  count,
  failedCount,
  recent,
  onPressPayment,
  onPressHistory,
  style,
}: TodayPaymentsCardProps) {
  const theme = useTheme();

  return (
    <OverviewCard style={style}>
      <OverviewCardHeader title="Today's payments" icon="money-wavy" right={<OverviewCardRangeLabel label="Today" />} />
      <OverviewCardDivider />

      <View style={styles.summary}>
        <DimmedDecimalAmount value={formatInr(totalAmount)} />
        <Text variant="bodyMedium" style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
          {count} payments
          {failedCount > 0 ? (
            <>
              {' · '}
              <Text style={{ color: theme.colors.error }}>{failedCount} Failed</Text>
            </>
          ) : null}
        </Text>
      </View>

      {recent.map((payment) => (
        <Fragment key={payment.transactionId}>
          <OverviewCardDivider />
          <TouchableRipple
            onPress={onPressPayment ? () => onPressPayment(payment.transactionId) : undefined}
            accessibilityRole="button"
            accessibilityLabel={`${formatInr(payment.amount)}, ${PAY_MODE_LABEL[payment.paymentMode]}, ${payment.time}, ${payment.status.label}`}
            borderless
            style={styles.row}>
            <View style={styles.rowContent}>
              <View style={styles.rowMain}>
                <DimmedDecimalAmount value={formatInr(payment.amount)} size="inline" />
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {PAY_MODE_LABEL[payment.paymentMode]} · {payment.time}
                </Text>
              </View>
              {/* Only a payment that isn't a success gets a status: grey while pending, red when failed. */}
              {payment.status.tone === 'success' ? null : (
                <Text
                  variant="bodySmall"
                  style={[styles.status, { color: payment.status.tone === 'failed' ? theme.colors.error : theme.colors.onSurfaceVariant }]}>
                  {payment.status.label}
                </Text>
              )}
            </View>
          </TouchableRipple>
        </Fragment>
      ))}

      <OverviewCardDivider />
      <OverviewCardFooter label="View payment history" onPress={onPressHistory} />
    </OverviewCard>
  );
}

// Rows span the card's full width (gap 0), so they share its radius.
const ROW_PADDING_Y = 12;
const ROW_RADIUS = concentric(Shape.max, 0);

const styles = StyleSheet.create({
  summary: { padding: OVERVIEW_CARD_PADDING, gap: 6 },
  meta: { fontFamily: Fonts.regular, fontVariant: ['tabular-nums'] },
  row: { borderRadius: ROW_RADIUS },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: OVERVIEW_CARD_PADDING,
    paddingVertical: ROW_PADDING_Y,
  },
  rowMain: { flex: 1, gap: 2 },
  status: { fontFamily: Fonts.medium },
});
