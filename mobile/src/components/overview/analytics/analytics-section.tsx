import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { Fonts } from '@/constants/theme';
import {
  type AnalyticsWidgetId,
  DAY_RANGE_OPTIONS,
  type DayRange,
  DEFAULT_ANALYTICS_RANGE,
  FAILED_PAYMENTS_ACCENT_COLOR,
  formatMetric,
  getDeviceRows,
  getFunnel,
  getPayModeRows,
  getTrendSeries,
  type MetricMode,
  RANGE_MULTIPLIER,
  type TrendKind,
  WIDGET_CATALOG,
} from '@/data/overview';

import { ChecklistSheet } from '../checklist-sheet';
import { FilterMenuButton, OverviewCard, OverviewCardDivider, OverviewCardHeader, SectionActionButton } from '../overview-card';
import { StoreScopeNote } from '../store-scope';

import { AnalyticsCard } from './analytics-card';
import { CheckoutFunnel } from './checkout-funnel';
import { DeviceDonut } from './device-donut';
import { DistributionBars } from './distribution-bars';
import { TrendBarChart } from './trend-bar-chart';

const TREND_WIDGETS: Partial<Record<AnalyticsWidgetId, { kind: TrendKind; accent?: string }>> = {
  'payment-volume': { kind: 'volume' },
  'failed-payments': { kind: 'failed', accent: FAILED_PAYMENTS_ACCENT_COLOR },
  refunds: { kind: 'refund' },
  disputes: { kind: 'dispute' },
};

type AnalyticsSectionProps = {
  /** Share of the business in the store selection (1 = all stores). */
  storeScale: number;
  /** Channel filter multiplier (1 = all channels). */
  channelScale: number;
};

/**
 * The Overview's Analytics section (web: OverviewAnalyticsSection): the store
 * note, a date-range filter, a Customize sheet to choose which cards show, and
 * the seven cards in the web's order. Each card keeps its own By count /
 * By amount choice. The web's two-column grid is one column on a phone.
 */
export function AnalyticsSection({ storeScale, channelScale }: AnalyticsSectionProps) {
  const [range, setRange] = useState<DayRange>(DEFAULT_ANALYTICS_RANGE);
  const [visible, setVisible] = useState<AnalyticsWidgetId[]>(WIDGET_CATALOG.map((widget) => widget.id));
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [modes, setModes] = useState<Partial<Record<AnalyticsWidgetId, MetricMode>>>({});

  const scale = storeScale * channelScale * RANGE_MULTIPLIER[range];
  const payModeRows = getPayModeRows(storeScale, channelScale, range);
  const deviceRows = getDeviceRows(storeScale, channelScale, range);
  const funnel = getFunnel(scale);
  const openTransactions = () => router.navigate('/payments?tab=transactions');

  const renderCard = (id: AnalyticsWidgetId, title: string, icon: string) => {
    if (id === 'checkout-funnel') {
      return (
        <OverviewCard key={id}>
          <OverviewCardHeader title={title} icon={icon} />
          <OverviewCardDivider />
          <CheckoutFunnel stages={funnel.stages} overallConversion={funnel.overallConversion} base={funnel.base} />
        </OverviewCard>
      );
    }

    const mode = modes[id] ?? 'count';
    const pick = (row: { count: number; amount: number }) => (mode === 'count' ? row.count : row.amount);
    let total = 0;
    let content = null;
    let layout: 'edge' | 'padded' = 'padded';

    if (id === 'paymode-distribution') {
      total = payModeRows.reduce((sum, row) => sum + pick(row), 0);
      content = <DistributionBars rows={payModeRows} metricMode={mode} onPressRow={openTransactions} />;
      layout = 'edge';
    } else if (id === 'devices-distribution') {
      total = deviceRows.reduce((sum, row) => sum + pick(row), 0);
      content = <DeviceDonut rows={deviceRows} metricMode={mode} />;
    } else {
      const trend = TREND_WIDGETS[id];
      if (!trend) return null;
      const { categories, data } = getTrendSeries(trend.kind, range, mode, scale);
      total = data.reduce((sum, value) => sum + value, 0);
      content = <TrendBarChart categories={categories} data={data} metricMode={mode} accentColor={trend.accent} />;
    }

    return (
      <AnalyticsCard
        key={id}
        title={title}
        icon={icon}
        total={formatMetric(total, mode)}
        metricMode={mode}
        onMetricModeChange={(next) => setModes((current) => ({ ...current, [id]: next }))}
        contentLayout={layout}>
        {content}
      </AnalyticsCard>
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Analytics
        </Text>
        <StoreScopeNote />
        <View style={styles.controls}>
          <FilterMenuButton value={range} onValueChange={setRange} options={DAY_RANGE_OPTIONS} accessibilityLabel="Date" />
          <SectionActionButton label="Customize" icon="sliders" onPress={() => setCustomizeOpen(true)} />
        </View>
      </View>

      {WIDGET_CATALOG.filter((widget) => visible.includes(widget.id)).map((widget) =>
        renderCard(widget.id, widget.title, widget.icon)
      )}

      <ChecklistSheet
        visible={customizeOpen}
        onDismiss={() => setCustomizeOpen(false)}
        title="Customise"
        heading="View analytics as per your choice"
        items={WIDGET_CATALOG.map((widget) => ({ id: widget.id, title: widget.title, icon: widget.icon }))}
        initialSelected={visible}
        onApply={(ids) => setVisible(ids as AnalyticsWidgetId[])}
        countLabel={(count) => (count === 0 ? 'No cards selected' : count === 1 ? '1 selected' : `${count} selected`)}
        height={640}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 16 },
  header: { gap: 8 },
  // Web: text-lg font-semibold.
  title: { fontFamily: Fonts.semiBold, fontSize: 18, lineHeight: 26 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
});
