import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { formatInr, SETTLEMENT_SOURCES, SETTLEMENT_TODAY, type SettlementSource } from '@/data/overview';

import {
  CompactSegmentedButtons,
  DimmedDecimalAmount,
  OVERVIEW_CARD_PADDING,
  OverviewCard,
  OverviewCardDivider,
  OverviewCardFooter,
  OverviewCardHeader,
} from './overview-card';

type TodaySettlementCardProps = {
  /** Store × channel share in scope (web: combinedScale); 1 = all stores, all channels. */
  scale?: number;
  onPressHistory?: () => void;
};

// The toggle sits 16dp inside the card (header padding).
const TOGGLE_RADIUS = concentric(Shape.max, OVERVIEW_CARD_PADDING);

/**
 * "Today's settlement" — mobile version of the web Overview's
 * SettlementsOverviewCard: net amount settled today for the chosen source
 * (Pine Labs or Partner Bank), what's still to settle, and when the next run
 * is. The web's two columns stack here to fit a phone width.
 */
export function TodaySettlementCard({ scale = 1, onPressHistory }: TodaySettlementCardProps) {
  const theme = useTheme();
  const [source, setSource] = useState<SettlementSource>('pinelabs');
  const base = SETTLEMENT_TODAY[source];
  const payments = Math.max(1, Math.round(base.transactionsConsidered * scale));

  return (
    <OverviewCard>
      <OverviewCardHeader
        title="Today's settlement"
        icon="bank"
        right={
          <CompactSegmentedButtons
            value={source}
            onValueChange={setSource}
            options={SETTLEMENT_SOURCES}
            radius={TOGGLE_RADIUS}
            grow
          />
        }
      />
      <OverviewCardDivider />

      <View style={styles.summary}>
        <DimmedDecimalAmount value={formatInr(base.netAmount * scale)} />
        <Text variant="bodyMedium" style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
          {payments} payments · Last settlement {base.lastSettlement}
        </Text>
      </View>

      <OverviewCardDivider />
      <View style={styles.detailRow}>
        <Text variant="bodyMedium" style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
          Yet to settle
        </Text>
        <DimmedDecimalAmount value={formatInr(base.pendingAmount * scale)} size="inline" />
      </View>
      <OverviewCardDivider />
      <View style={styles.detailRow}>
        <Text variant="bodyMedium" style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
          Next settlement
        </Text>
        <Text variant="bodyMedium">{base.nextSettlement}</Text>
      </View>

      <OverviewCardDivider />
      <OverviewCardFooter label="View settlements history" onPress={onPressHistory} />
    </OverviewCard>
  );
}

const styles = StyleSheet.create({
  summary: { padding: OVERVIEW_CARD_PADDING, gap: 6 },
  meta: { fontFamily: Fonts.regular, fontVariant: ['tabular-nums'] },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: OVERVIEW_CARD_PADDING,
  },
});
