import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import type { MetricMode } from '@/data/overview';

import {
  CompactSegmentedButtons,
  DimmedDecimalAmount,
  OVERVIEW_CARD_PADDING,
  OverviewCard,
  OverviewCardDivider,
  OverviewCardHeader,
} from '../overview-card';

const METRIC_MODE_OPTIONS = [
  { value: 'count', label: 'By count' },
  { value: 'amount', label: 'By amount' },
] as const;

// The toggle sits 16dp inside the card (header padding).
const TOGGLE_RADIUS = concentric(Shape.max, OVERVIEW_CARD_PADDING);

type AnalyticsCardProps = {
  title: string;
  icon: string;
  /** Pre-formatted total: "₹…" in amount mode (paise dimmed), a grouped integer in count mode. */
  total: string;
  metricMode: MetricMode;
  onMetricModeChange: (mode: MetricMode) => void;
  /** `edge`: content runs to the card's edges (lists with dividers); `padded`: 16dp inset (charts). */
  contentLayout?: 'edge' | 'padded';
  children: ReactNode;
};

/**
 * One Analytics widget (web: AnalyticsCard): header with a By count / By amount
 * toggle, the total, then the chart. The web fixes every card at 380px tall
 * with inner scrolling; on a phone each card takes its content's height.
 */
export function AnalyticsCard({
  title,
  icon,
  total,
  metricMode,
  onMetricModeChange,
  contentLayout = 'padded',
  children,
}: AnalyticsCardProps) {
  return (
    <OverviewCard>
      <OverviewCardHeader
        title={title}
        icon={icon}
        right={
          <CompactSegmentedButtons
            value={metricMode}
            onValueChange={onMetricModeChange}
            options={METRIC_MODE_OPTIONS}
            radius={TOGGLE_RADIUS}
            grow
          />
        }
      />
      <View style={{ padding: OVERVIEW_CARD_PADDING }}>
        {metricMode === 'amount' ? (
          <DimmedDecimalAmount value={total} />
        ) : (
          <Text style={{ fontFamily: Fonts.semiBold, fontSize: 24, lineHeight: 28, fontVariant: ['tabular-nums'] }}>
            {total}
          </Text>
        )}
      </View>
      <OverviewCardDivider />
      <View style={contentLayout === 'padded' ? { padding: OVERVIEW_CARD_PADDING } : undefined}>{children}</View>
    </OverviewCard>
  );
}
