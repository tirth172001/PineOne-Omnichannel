import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { formatInr, type PaymentMode, type RecentPayment } from '@/data/overview';

import {
  DimmedDecimalAmount,
  OVERVIEW_CARD_PADDING,
  OverviewCard,
  OverviewCardDivider,
  OverviewCardFooter,
  OverviewCardHeader,
  OverviewCardRangeLabel,
  StatusPill,
} from './overview-card';

const PAY_MODE_ICON: Record<PaymentMode, string> = {
  upi: 'qr-code',
  card: 'credit-card',
  netbanking: 'dots-three-circle',
};

type TodayPaymentsCardProps = {
  totalAmount: number;
  count: number;
  failedCount: number;
  recent: RecentPayment[];
  onPressPayment?: (transactionId: string) => void;
  onPressHistory?: () => void;
};

/**
 * "Today's payments" — mobile version of the web Overview's
 * TransactionsOverviewCard: today's total and payment count (with failures
 * called out), the last three payments, and a link to the full history. The
 * web's two columns stack here to fit a phone width.
 */
export function TodayPaymentsCard({
  totalAmount,
  count,
  failedCount,
  recent,
  onPressPayment,
  onPressHistory,
}: TodayPaymentsCardProps) {
  const theme = useTheme();

  return (
    <OverviewCard>
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
            accessibilityLabel={`${formatInr(payment.amount)} at ${payment.time}, ${payment.status.label}`}
            borderless
            style={styles.row}>
            <View style={styles.rowContent}>
              <View style={styles.rowLeft}>
                <Icon source={PAY_MODE_ICON[payment.paymentMode]} size={16} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={styles.rowAmount}>
                  {formatInr(payment.amount)}
                </Text>
                <Text variant="bodyMedium" style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
                  · {payment.time}
                </Text>
              </View>
              <View style={styles.rowRight}>
                <StatusPill label={payment.status.label} tone={payment.status.tone} radius={PILL_RADIUS} />
                <Icon source="caret-right" size={16} color={theme.colors.onSurfaceVariant} />
              </View>
            </View>
          </TouchableRipple>
        </Fragment>
      ))}

      <OverviewCardDivider />
      <OverviewCardFooter label="View payment history" onPress={onPressHistory} />
    </OverviewCard>
  );
}

// Rows span the card's full width (gap 0), so they share its radius; the
// status pill sits 12dp inside a row.
const ROW_PADDING_Y = 12;
const ROW_RADIUS = concentric(Shape.max, 0);
const PILL_RADIUS = concentric(ROW_RADIUS, ROW_PADDING_Y, 24);

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
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  rowAmount: { fontVariant: ['tabular-nums'] },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
