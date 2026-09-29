import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { DimmedDecimalAmount } from '@/components/shared/amount';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { formatInr, type PaymentMode, type RecentPayment } from '@/data/overview';

const MODE_LABEL: Record<PaymentMode, string> = { upi: 'UPI', card: 'Card', netbanking: 'Net banking' };

/**
 * Overview's latest payments, right under the hero: they're what "collected
 * today" is made of (user decision). Reference material, so it stays quiet
 * (docs/design/mobile-home-hierarchy-audit.md F2): plain rows on the page with
 * hairlines, no card, no chevrons — the whole row opens the payment. Only a
 * failure is in colour; anything else not yet successful is grey text. The
 * list ends with its own "View all payments" button rather than a clickable
 * title (user decision).
 */
export function LatestPayments({
  payments,
  onPressPayment,
  onPressAll,
}: {
  payments: RecentPayment[];
  onPressPayment: (payment: RecentPayment) => void;
  onPressAll: () => void;
}) {
  const theme = useTheme();
  const statusColor = (payment: RecentPayment) => (payment.status.tone === 'failed' ? theme.colors.error : theme.colors.onSurfaceVariant);

  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={styles.title} accessibilityRole="header">
        Latest payments
      </Text>
      {payments.length === 0 ? (
        <Text variant="bodyMedium" style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
          No payments yet today.
        </Text>
      ) : (
        <View>
          {payments.map((payment, index) => (
            <Fragment key={payment.transactionId}>
              {index > 0 ? <Divider /> : null}
              <TouchableRipple
                onPress={() => onPressPayment(payment)}
                borderless
                accessibilityRole="button"
                accessibilityLabel={`${formatInr(payment.amount)}, ${MODE_LABEL[payment.paymentMode]}, ${payment.time}, ${payment.status.label}`}
                style={styles.row}>
                <View style={styles.rowContent}>
                  <View style={styles.rowMain}>
                    <DimmedDecimalAmount value={formatInr(payment.amount)} size="inline" />
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {MODE_LABEL[payment.paymentMode]} · {payment.time}
                    </Text>
                  </View>
                  {payment.status.tone === 'success' ? null : (
                    <Text variant="bodySmall" style={[styles.status, { color: statusColor(payment) }]}>
                      {payment.status.label}
                    </Text>
                  )}
                </View>
              </TouchableRipple>
            </Fragment>
          ))}
          <Divider />
          <TouchableRipple onPress={onPressAll} borderless accessibilityRole="button" style={styles.row}>
            <View style={styles.allButtonContent}>
              <Text variant="labelLarge" style={[styles.allLabel, { color: theme.colors.primary }]}>
                View all payments
              </Text>
              <Icon source="caret-right" size={14} color={theme.colors.primary} />
            </View>
          </TouchableRipple>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 4 },
  title: { fontFamily: Fonts.semiBold, marginBottom: 4 },
  empty: { paddingVertical: 12 },
  // Rows sit straight on the page; the ripple gets the page-level radius.
  row: { borderRadius: Shape.small, marginHorizontal: -8 },
  rowContent: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8, paddingVertical: 12 },
  rowMain: { flex: 1, gap: 2 },
  status: { fontFamily: Fonts.medium },
  allButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 14 },
  allLabel: { fontFamily: Fonts.medium },
});
