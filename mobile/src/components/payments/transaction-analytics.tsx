import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Card, Switch, Text, useTheme } from 'react-native-paper';

import { BarChart, PieChart, XYChart } from '@/components/shared/charts';
import { FilterMenuButton } from '@/components/shared/controls';
import { DETAIL_HEADER_BUTTON_STYLE, DetailScreen } from '@/components/shared/detail-screen';
import { PanelSection, PanelSheet } from '@/components/shared/panel-sheet';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import {
  ANALYTICS_COMPARE_OPTIONS,
  ANALYTICS_DATE_OPTIONS,
  ANALYTICS_VIEW_OPTIONS,
  ANALYTICS_WEEK_LABELS,
  compareScale,
  DEFAULT_ANALYTICS_COMPARE,
  DEFAULT_ANALYTICS_DATE,
  dateScale,
  TRANSACTION_ANALYTICS_WIDGETS,
  type TransactionAnalyticsWidget,
} from '@/data/transaction-analytics';

/** Series with a small spread (rates, minutes) read better on a fitted axis than from zero. */
const FIT_RANGE_IDS = ['avg-completion-time', 'success-rate'];

function WidgetChart({ widget, scale, compare }: { widget: TransactionAnalyticsWidget; scale: number; compare: number }) {
  const data = widget.chart.map((point) => Number((point * scale).toFixed(2)));
  if (widget.chartType === 'pie') return <PieChart labels={widget.chartLabels ?? []} data={data} />;
  if (widget.chartType === 'bar') return <BarChart labels={widget.chartLabels ?? []} data={data} />;
  return (
    <XYChart
      type={widget.chartType}
      categories={widget.chartLabels ?? ANALYTICS_WEEK_LABELS}
      data={data}
      compare={widget.compareChart?.map((point) => Number((point * compare).toFixed(2)))}
      fitRange={FIT_RANGE_IDS.includes(widget.id)}
    />
  );
}

/**
 * Transaction Analytics (web: TransactionsAnalyticsContent on the
 * OverviewAnalyticsCanvas): date, compare and product selectors, then the ten
 * widgets — title, headline value and chart (column / area / line with a
 * dashed comparison, horizontal bars, pies). Customize shows or hides widgets;
 * the web's widget widths and drag-to-reorder don't apply to a single-column
 * phone layout.
 */
export function TransactionAnalytics() {
  const theme = useTheme();
  const [date, setDate] = useState(DEFAULT_ANALYTICS_DATE);
  const [compare, setCompare] = useState(DEFAULT_ANALYTICS_COMPARE);
  const [view, setView] = useState<string>('all');
  const [hidden, setHidden] = useState<string[]>([]);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const visible = TRANSACTION_ANALYTICS_WIDGETS.filter((widget) => !hidden.includes(widget.id));

  return (
    <DetailScreen
      title="Transaction Analytics"
      fallbackHref="/payments"
      actions={<Appbar.Action icon="sliders" onPress={() => setCustomizeOpen(true)} accessibilityLabel="Customize" style={DETAIL_HEADER_BUTTON_STYLE} />}>
      <Text variant="bodyMedium" style={[styles.regular, { color: theme.colors.onSurfaceVariant }]}>
        Deep performance analysis for transaction flows
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroller} contentContainerStyle={styles.filters}>
        <FilterMenuButton value={date} onValueChange={setDate} options={ANALYTICS_DATE_OPTIONS} icon="calendar-dots" accessibilityLabel="Date range" />
        <FilterMenuButton value={compare} onValueChange={setCompare} options={ANALYTICS_COMPARE_OPTIONS} accessibilityLabel="Compare" />
        <FilterMenuButton value={view} onValueChange={setView} options={ANALYTICS_VIEW_OPTIONS} icon="grid-four" accessibilityLabel="Product" />
      </ScrollView>

      {visible.map((widget) => (
        <Card key={widget.id} mode="outlined" style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
          <View style={styles.cardBody}>
            <Text variant="labelLarge">{widget.title}</Text>
            <Text style={styles.value}>{widget.value}</Text>
            <WidgetChart widget={widget} scale={dateScale(date)} compare={compareScale(compare)} />
          </View>
        </Card>
      ))}

      <PanelSheet visible={customizeOpen} onDismiss={() => setCustomizeOpen(false)} title="Customize Widgets">
        <PanelSection>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Show or hide widgets.
          </Text>
        </PanelSection>
        {TRANSACTION_ANALYTICS_WIDGETS.map((widget, index) => {
          const isHidden = hidden.includes(widget.id);
          return (
            <PanelSection key={widget.id} last={index === TRANSACTION_ANALYTICS_WIDGETS.length - 1}>
              <View style={styles.toggleRow}>
                <View style={styles.flex}>
                  <Text variant="bodyMedium" style={styles.medium}>
                    {widget.title}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {isHidden ? 'Hidden from overview' : 'Visible on overview'}
                  </Text>
                </View>
                <Switch
                  value={!isHidden}
                  onValueChange={(show) => setHidden((current) => (show ? current.filter((id) => id !== widget.id) : [...current, widget.id]))}
                  accessibilityLabel={`Show ${widget.title}`}
                />
              </View>
            </PanelSection>
          );
        })}
      </PanelSheet>
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  regular: { fontFamily: Fonts.regular, marginTop: -12 },
  medium: { fontFamily: Fonts.medium },
  scroller: { marginHorizontal: -16 },
  filters: { gap: 8, paddingHorizontal: 16 },
  card: { borderRadius: Shape.max },
  cardBody: { padding: 12, gap: 8 },
  // Web: text-[20px] font-semibold.
  value: { fontFamily: Fonts.semiBold, fontSize: 20, lineHeight: 24 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
});
