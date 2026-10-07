import { Image } from 'expo-image';
import { Fragment, type ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { DimmedDecimalAmount } from '@/components/shared/amount';
import { DotStatusBadge, type DotTone } from '@/components/shared/status';
import { Fonts } from '@/constants/theme';
import { formatInr, type RecentPayment, type StatusTone } from '@/data/overview';

import { OVERVIEW_CARD_PADDING, OverviewCard, OverviewCardDivider, OverviewCardFooter, OverviewCardGlow, OverviewCardHeader } from './overview-card';

const QR_ICON = require('../../../assets/images/overview/payment-qr.svg');
const GLOW = require('../../../assets/images/overview/glow-payments.svg');

const STATUS_DOT: Record<StatusTone, DotTone> = { success: 'success', processing: 'warning', initiated: 'info', failed: 'danger' };

type ChannelSummary = { label: string; count: number; amount: number };

type TodayPaymentsCardProps = {
  totalAmount: number;
  count: number;
  /** A channel's share of today, as the first row (e.g. in-store, while Overview shows all channels). */
  channel?: ChannelSummary;
  recent: RecentPayment[];
  onPressChannel?: () => void;
  onPressPayment?: (transactionId: string) => void;
  onPressHistory?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * "Today's payments" (Figma 6470:685): today's total and payment count over a
 * lime glow, then the latest payments — amount and time, with their status —
 * led by a channel's share when one is given, and a link to the full history.
 * Every row opens what it shows.
 */
export function TodayPaymentsCard({ totalAmount, count, channel, recent, onPressChannel, onPressPayment, onPressHistory, style }: TodayPaymentsCardProps) {
  const theme = useTheme();
  const muted = { color: theme.colors.onSurfaceVariant };

  return (
    <OverviewCard style={style}>
      <OverviewCardHeader title="Today's payments" />

      <View style={styles.summary}>
        <OverviewCardGlow source={GLOW} />
        <DimmedDecimalAmount value={formatInr(totalAmount)} />
        <Text style={[styles.body, muted]}>{count} payments</Text>
      </View>

      {channel ? (
        <>
          <OverviewCardDivider />
          <Row onPress={onPressChannel} accessibilityLabel={`${channel.label}, ${channel.count} payments, ${formatInr(channel.amount)}`}>
            <View style={styles.rowMain}>
              <Image source={QR_ICON} style={styles.icon} />
              <View style={styles.rowText}>
                <Text style={styles.strong}>{channel.label}</Text>
                <Text style={[styles.body, muted]}>{channel.count} payments</Text>
              </View>
            </View>
            <View style={styles.rowEnd}>
              <Text style={styles.strong}>{formatInr(channel.amount)}</Text>
              <Icon source="caret-right" size={16} color={theme.colors.onSurface} />
            </View>
          </Row>
        </>
      ) : null}

      {recent.map((payment) => (
        <Fragment key={payment.transactionId}>
          <OverviewCardDivider />
          <Row
            onPress={onPressPayment ? () => onPressPayment(payment.transactionId) : undefined}
            accessibilityLabel={`${formatInr(payment.amount)}, ${payment.time}, ${payment.status.label}`}>
            <View style={styles.rowMain}>
              <Image source={QR_ICON} style={styles.icon} />
              <View style={styles.rowText}>
                <Text style={styles.strong}>{formatInr(payment.amount)}</Text>
                <Text style={[styles.body, muted]}>{payment.time}</Text>
              </View>
            </View>
            <View style={styles.rowEnd}>
              <DotStatusBadge label={payment.status.label} tone={STATUS_DOT[payment.status.tone]} radius={12} />
              <Icon source="caret-right" size={16} color={theme.colors.onSurface} />
            </View>
          </Row>
        </Fragment>
      ))}

      <OverviewCardFooter label="View payment history" onPress={onPressHistory} />
    </OverviewCard>
  );
}

function Row({ onPress, accessibilityLabel, children }: { onPress?: () => void; accessibilityLabel: string; children: ReactNode }) {
  return (
    <TouchableRipple onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
      <View style={styles.row}>{children}</View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  // Clips the glow to the summary section.
  summary: { alignItems: 'center', gap: 8, paddingHorizontal: OVERVIEW_CARD_PADDING, paddingVertical: 48, overflow: 'hidden' },
  body: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, fontVariant: ['tabular-nums'] },
  strong: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20, fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: OVERVIEW_CARD_PADDING },
  rowMain: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, flexShrink: 1 },
  rowText: { gap: 2, flexShrink: 1 },
  rowEnd: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { width: 20, height: 20 },
});
