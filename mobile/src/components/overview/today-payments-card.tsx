import { Image } from 'expo-image';
import { Fragment, type ReactNode } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { DimmedDecimalAmount } from '@/components/shared/amount';
import { DotStatusBadge, type DotTone } from '@/components/shared/status';
import { Fonts } from '@/constants/theme';
import { formatInr, type RecentPayment, type StatusTone } from '@/data/overview';

import { OVERVIEW_CARD_PADDING, OverviewCard, OverviewCardDivider, OverviewCardFooter, OverviewCardHeader } from './overview-card';

const QR_ICON = require('../../../assets/images/overview/payment-qr.svg');

const STATUS_DOT: Record<StatusTone, DotTone> = { success: 'success', processing: 'warning', initiated: 'info', failed: 'danger' };

export type ChannelSummary = { label: string; count: number; amount: number; /** In-store shows the QR mark; online a globe. */ kind: 'in-store' | 'online' };

type TodayPaymentsCardProps = {
  totalAmount: number;
  count: number;
  /** Today split by channel (all channels on show). When given, these rows replace the latest payments. */
  channels?: ChannelSummary[];
  /** The latest payments (a single channel on show). */
  recent?: RecentPayment[];
  /** Which channel the latest payments are from, for their mark. */
  recentKind?: ChannelSummary['kind'];
  onPressChannel?: (kind: ChannelSummary['kind']) => void;
  onPressPayment?: (transactionId: string) => void;
  onPressHistory?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * "Today's payments" (Figma 6470:685): today's total and payment count, then either today's split by channel (In-store and Online, while
 * all channels are on show) or the latest payments — amount and time, with
 * their status — for the one channel on show, and a link to the full history.
 * Every row opens what it shows.
 */
export function TodayPaymentsCard({ totalAmount, count, channels, recent = [], recentKind = 'in-store', onPressChannel, onPressPayment, onPressHistory, style }: TodayPaymentsCardProps) {
  const theme = useTheme();
  const muted = { color: theme.colors.onSurfaceVariant };

  return (
    <OverviewCard style={style}>
      <OverviewCardHeader title="Today's payments" />

      <View style={styles.summary}>
        <DimmedDecimalAmount value={formatInr(totalAmount)} />
        <Text style={[styles.body, muted]}>{count} payments</Text>
      </View>

      {channels?.map((channel) => (
        <Fragment key={channel.kind}>
          <OverviewCardDivider />
          <Row
            onPress={onPressChannel ? () => onPressChannel(channel.kind) : undefined}
            accessibilityLabel={`${channel.label}, ${channel.count} payments, ${formatInr(channel.amount)}`}>
            <View style={styles.rowMain}>
              <ChannelMark kind={channel.kind} />
              <View style={styles.rowText}>
                <Text style={styles.strong}>{channel.label}</Text>
                <Text style={[styles.body, muted]}>
                  {channel.count} {channel.count === 1 ? 'payment' : 'payments'}
                </Text>
              </View>
            </View>
            <View style={styles.rowEnd}>
              <Text style={styles.strong}>{formatInr(channel.amount)}</Text>
              <Icon source="caret-right" size={16} color={theme.colors.onSurface} />
            </View>
          </Row>
        </Fragment>
      ))}

      {(channels ? [] : recent).map((payment) => (
        <Fragment key={payment.transactionId}>
          <OverviewCardDivider />
          <Row
            onPress={onPressPayment ? () => onPressPayment(payment.transactionId) : undefined}
            accessibilityLabel={`${formatInr(payment.amount)}, ${payment.time}, ${payment.status.label}`}>
            <View style={styles.rowMain}>
              <ChannelMark kind={recentKind} />
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

function ChannelMark({ kind }: { kind: ChannelSummary['kind'] }) {
  const theme = useTheme();
  return kind === 'in-store' ? <Image source={QR_ICON} style={styles.icon} /> : <Icon source="globe" size={20} color={theme.colors.onSurface} />;
}

function Row({ onPress, accessibilityLabel, children }: { onPress?: () => void; accessibilityLabel: string; children: ReactNode }) {
  return (
    <TouchableRipple onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
      <View style={styles.row}>{children}</View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  summary: { alignItems: 'center', gap: 8, paddingHorizontal: OVERVIEW_CARD_PADDING, paddingVertical: 32 },
  body: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, fontVariant: ['tabular-nums'] },
  strong: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20, fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: OVERVIEW_CARD_PADDING },
  rowMain: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, flexShrink: 1 },
  rowText: { gap: 2, flexShrink: 1 },
  rowEnd: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { width: 20, height: 20 },
});
