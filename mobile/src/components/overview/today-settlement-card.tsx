import { Image } from 'expo-image';
import { useState } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

import { DimmedDecimalAmount } from '@/components/shared/amount';
import { BankLogo } from '@/components/shared/bank-logo';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { formatInr, SETTLEMENT_SOURCES, SETTLEMENT_TODAY, type SettlementSource } from '@/data/overview';

import { OVERVIEW_CARD_PADDING, OverviewCard, OverviewCardDivider, OverviewCardFooter, OverviewCardGlow, OverviewCardHeader } from './overview-card';

const GLOW = require('../../../assets/images/overview/glow-settlement.svg');
const PINE_LABS_MARK = require('../../../assets/images/overview/pine-labs.svg');

type TodaySettlementCardProps = {
  /** Store × channel share in scope (web: combinedScale); 1 = all stores, all channels. */
  scale?: number;
  onPressHistory?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * "Today's settlement" (Figma 6470:737): a Pine Labs / Partner Bank switch
 * over an indigo glow, the amount settled today from that source and when,
 * what's still to settle and when the next run is, and a link to the history.
 */
export function TodaySettlementCard({ scale = 1, onPressHistory, style }: TodaySettlementCardProps) {
  const theme = useTheme();
  const [source, setSource] = useState<SettlementSource>('pinelabs');
  const base = SETTLEMENT_TODAY[source];
  const muted = { color: theme.colors.onSurfaceVariant };

  return (
    <OverviewCard style={style}>
      <OverviewCardHeader title="Today's settlement" />

      <View style={styles.summary}>
        <OverviewCardGlow source={GLOW} />
        <View accessibilityRole="tablist" style={[styles.tabs, { backgroundColor: theme.colors.surfaceVariant }]}>
          {SETTLEMENT_SOURCES.map((option) => {
            const active = option.value === source;
            return (
              <TouchableRipple
                key={option.value}
                onPress={() => setSource(option.value)}
                borderless
                accessibilityRole="tab"
                aria-selected={active}
                style={[styles.tab, active && { backgroundColor: theme.colors.surface }]}>
                <View style={styles.tabContent}>
                  {option.value === 'pinelabs' ? <Image source={PINE_LABS_MARK} style={styles.pineMark} /> : <BankLogo bank="HDFC" size={14} />}
                  <Text style={[styles.tabLabel, { color: active ? theme.colors.onSurface : theme.colors.onSurfaceVariant }]}>{option.label}</Text>
                </View>
              </TouchableRipple>
            );
          })}
        </View>
        <View style={styles.amount}>
          <DimmedDecimalAmount value={formatInr(base.netAmount * scale)} />
          <Text style={[styles.body, muted]}>{base.lastSettledLabel}</Text>
        </View>
      </View>

      <OverviewCardDivider />
      <View style={styles.detailRow}>
        <Text style={[styles.body, muted]}>Yet to settle</Text>
        <Text style={styles.strong}>{formatInr(base.pendingAmount * scale)}</Text>
      </View>
      <OverviewCardDivider />
      <View style={styles.detailRow}>
        <Text style={[styles.body, muted]}>Next settlement</Text>
        <Text style={styles.strong}>{base.nextSettlementLabel}</Text>
      </View>

      <OverviewCardFooter label="View settlement history" onPress={onPressHistory} />
    </OverviewCard>
  );
}

const TABS_PADDING = 4;
const TABS_RADIUS = Shape.small;
const TAB_RADIUS = concentric(TABS_RADIUS, TABS_PADDING, 24);

const styles = StyleSheet.create({
  // Grows to fill the card when it's stretched to its neighbour's height; clips the glow.
  summary: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 32, paddingHorizontal: OVERVIEW_CARD_PADDING, paddingVertical: 24, overflow: 'hidden' },
  tabs: { flexDirection: 'row', height: 32, padding: TABS_PADDING, borderRadius: TABS_RADIUS },
  tab: { height: 24, borderRadius: TAB_RADIUS, justifyContent: 'center' },
  tabContent: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12 },
  pineMark: { width: 16, height: 16 },
  tabLabel: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16 },
  amount: { alignItems: 'center', gap: 8 },
  body: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, fontVariant: ['tabular-nums'] },
  strong: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20, fontVariant: ['tabular-nums'] },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: OVERVIEW_CARD_PADDING },
});
