import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

import { ListRow, ListRowLine } from '@/components/shared/listing';
import { Fonts } from '@/constants/theme';
import type { PaymentMode } from '@/data/common';

/** Pay-mode glyphs, as on the transaction detail's mode tile. */
export const PAY_MODE_ICON: Record<PaymentMode, string> = { upi: 'qr-code', card: 'credit-card', netbanking: 'bank' };

/**
 * One payment in a listing (user decision): the amount with the pay mode and
 * its icon below on the left, the status on the right — nothing else; the
 * rest is on the transaction detail. Shared by Payments → Transactions and
 * Settlement details → Transactions included, which list the same things.
 */
export function PaymentRow({
  amount,
  paymentMode,
  paymentLabel,
  status,
  onPress,
  accessibilityLabel,
}: {
  amount: string;
  paymentMode: PaymentMode;
  paymentLabel: string;
  status: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const theme = useTheme();
  return (
    <ListRow onPress={onPress} accessibilityLabel={accessibilityLabel}>
      <ListRowLine
        left={
          <>
            <Text variant="titleMedium" style={styles.amount}>
              {amount}
            </Text>
            <View style={styles.payMode}>
              <Icon source={PAY_MODE_ICON[paymentMode]} size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {paymentLabel}
              </Text>
            </View>
          </>
        }
        right={status}
        centered
      />
    </ListRow>
  );
}

const styles = StyleSheet.create({
  amount: { fontFamily: Fonts.semiBold, fontVariant: ['tabular-nums'] },
  payMode: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
