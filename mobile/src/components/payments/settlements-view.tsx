import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Divider, Icon, Text, useTheme } from 'react-native-paper';

import { DimmedDecimalAmount } from '@/components/shared/amount';
import { BankLogo } from '@/components/shared/bank-logo';
import { CompactSegmentedButtons } from '@/components/shared/controls';
import { CardCarousel } from '@/components/shared/card-carousel';
import { DayGroupedList, dayTotals, displayTimestamp, groupByDay, sortNewestFirst } from '@/components/shared/day-groups';
import { getDefaultDateRangePresets, makeDateRangeValue } from '@/components/shared/date-range-filter';
import { DetailRow } from '@/components/shared/detail-rows';
import { LIST_ROW_INNER_RADIUS, ListRow, ListRowLine, ListingToolbar, selectFilter } from '@/components/shared/listing';
import { type MoreFilterCategory, type MoreFilterSelection } from '@/components/shared/more-filters';
import { LazyListFooter, useLazyList } from '@/components/shared/lazy-list';
import { PANEL_INNER_RADIUS, PanelSection, PanelSheet } from '@/components/shared/panel-sheet';
import { DotStatusBadge, type DotTone } from '@/components/shared/status';
import { concentric, Shape } from '@/constants/shape';
import { useAppColors } from '@/constants/app-colors';
import { Fonts } from '@/constants/theme';
import { useBusiness } from '@/hooks/use-business';
import { formatCount, formatInr } from '@/data/common';
import {
  getSettlementSummary,
  paymentMethodLabel,
  SETTLEMENT_BANKS,
  SETTLEMENT_PAYMENT_METHODS,
  SETTLEMENT_STATUSES,
  SETTLEMENT_TIDS,
  SETTLEMENT_TYPES,
  type SettlementRow,
  type SettlementStatus,
  settlementRows,
} from '@/data/settlements';
import { parseDisplayDate } from '@/data/transactions';

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7days', label: '7 days' },
] as const;

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...SETTLEMENT_STATUSES.map((status) => ({ value: status, label: status })),
] as const;

/** Web: settlementMoreFilterCategories (all single-select lists). */
export const MORE_FILTER_CATEGORIES: MoreFilterCategory[] = [
  { id: 'type', label: 'Settlement type', display: 'list', selectionMode: 'single', searchable: false, options: SETTLEMENT_TYPES.map((type) => ({ id: type, label: type })) },
  { id: 'payment', label: 'Payment method', display: 'list', selectionMode: 'single', searchable: false, options: SETTLEMENT_PAYMENT_METHODS.map((method) => ({ id: method, label: paymentMethodLabel(method) })) },
  { id: 'bank', label: 'Acquiring bank', display: 'list', selectionMode: 'single', searchable: false, options: SETTLEMENT_BANKS.map((bank) => ({ id: bank.toLowerCase(), label: bank })) },
  { id: 'tid', label: 'TID', display: 'list', selectionMode: 'single', options: SETTLEMENT_TIDS.map((tid) => ({ id: tid, label: tid })) },
];

export function settlementStatusTone(status: SettlementStatus): DotTone {
  if (status === 'Settled') return 'success';
  if (status === 'Failed') return 'danger';
  if (status === 'Initiated') return 'info';
  if (status === 'Processing' || status === 'On Hold') return 'warning';
  return 'neutral';
}

/** Web: rm() — "₹ 1,06,550" (whole rupees). */
export const rupees = (value: number) => formatInr(value).replace(/\.\d\d$/, '');

/**
 * Which day's collections a settlement pays out, from its captured range:
 * "15 Aug, 12:00 AM - 11:59 PM" → "Collections of Sat, 15 Aug". A part day
 * (an on-demand settlement) says where it stopped: "…, till 12 PM".
 */
export function collectionLabel(row: Pick<SettlementRow, 'capturedRange' | 'settlementDatePrimary'>) {
  const [day, window = ''] = row.capturedRange.split(', ');
  const end = window.split(' - ')[1]?.trim();
  // The range has no year: it's the settlement's (collections settle within days).
  const date = parseDisplayDate(`${day} ${row.settlementDatePrimary.split(' ')[2]}`, '12:00 PM');
  const weekday = date ? `${date.toLocaleDateString('en-GB', { weekday: 'short' })}, ` : '';
  const till = end && end !== '11:59 PM' ? `, till ${end.replace(':00', '')}` : '';
  return `Collections of ${weekday}${day}${till}`;
}

const CARD_PADDING = 16;
const INNER_RADIUS = concentric(Shape.max, CARD_PADDING);

/**
 * Settlements tab (web: V3SettlementsContent list mode) for the header's
 * channel: the Settled / Remaining summary (swipeable) with a deductions
 * breakdown and, in-store, On-Demand settlement inside the Remaining card;
 * then the searchable, filterable batch list. Settlement cycle, account and
 * preferences sit behind the header's Preferences button.
 */
export function SettlementsView() {
  const theme = useTheme();
  const appColors = useAppColors();
  // Follows the header's channel (In-store or Online; this page has no All channels).
  const { specificChannel: channel } = useBusiness();
  const [period, setPeriod] = useState<(typeof PERIOD_OPTIONS)[number]['value']>('today');
  const [deductionsOpen, setDeductionsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | SettlementStatus>('all');
  const [moreFilters, setMoreFilters] = useState<MoreFilterSelection>({});
  const presets = useMemo(() => getDefaultDateRangePresets(), []);
  // The web shows a date filter here but doesn't apply it to the batches.
  const [dateRange, setDateRange] = useState(() => makeDateRangeValue(presets, 'today'));
  const lazy = useLazyList();

  const summary = useMemo(() => getSettlementSummary(channel), [channel]);
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const pick = (id: string) => moreFilters[id]?.[0];
    return settlementRows.filter((row) => {
      if (row.channel !== channel) return false;
      if (status !== 'all' && row.status !== status) return false;
      if (pick('bank') && row.acquiringBank.toLowerCase() !== pick('bank')) return false;
      if (pick('type') && row.settlementType !== pick('type')) return false;
      if (pick('payment') && row.paymentMethod !== pick('payment')) return false;
      if (pick('tid') && row.tid !== pick('tid')) return false;
      if (!query) return true;
      return `${row.batchId} ${row.utr} ${row.bankName} ${row.acquiringBank} ${row.tid} ${row.store}`.toLowerCase().includes(query);
    });
  }, [channel, moreFilters, search, status]);
  // Newest first so each day forms one group (the web lists in source order).
  const loadedRows = sortNewestFirst(filteredRows, (row) => displayTimestamp(row.settlementDatePrimary, row.settlementDateSecondary)).slice(0, lazy.count);
  const resetList = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    lazy.reset();
  };
  const muted = { color: theme.colors.onSurfaceVariant };

  // Settlement cycle, account and the preferences link live behind the header's preferences
  // button (user decision) instead of info lines at the top of the page.
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  return (
    <View style={styles.container}>
      <ListingToolbar
        search={search}
        onSearchChange={resetList(setSearch)}
        searchPlaceholder="Search by UTR or Trxn ID"
        filters={[
          { type: 'date', presets, value: dateRange, onApply: setDateRange, initialPresetId: 'today' },
          selectFilter({ label: 'Status', options: STATUS_OPTIONS, value: status, onApply: resetList(setStatus) }),
          { type: 'more', categories: MORE_FILTER_CATEGORIES, applied: moreFilters, onApply: resetList(setMoreFilters) },
        ]}
        actions={[
          { label: 'Settlement preferences', icon: 'sliders', onPress: () => setPreferencesOpen(true) },
          { label: 'Email filtered', icon: 'envelope-simple' },
          { label: 'Download filtered', icon: 'download-simple' },
        ]}
      />

      {/* Settled and Remaining amount as a swipeable row (user decision). */}
      <CardCarousel>
        {/* Plain Views, not Paper Cards: on iOS a Card's content doesn't stretch with it, and these share the tallest one's height. */}
        <View key="settled" style={[styles.summary, styles.fill, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryTitle}>
              <Icon source="check-circle" size={20} color={theme.colors.onSurface} />
              <Text variant="titleMedium">Settled amount</Text>
            </View>
            <CompactSegmentedButtons value={period} onValueChange={setPeriod} options={PERIOD_OPTIONS} radius={INNER_RADIUS} />
          </View>
          <Divider />
          <View style={styles.summaryBody}>
            <DimmedDecimalAmount value={formatInr(summary.settledAmount)} size="medium" />
            <Text variant="bodyMedium" style={[styles.medium, muted]}>
              {formatCount(summary.settledCount)} payments settled in {summary.batchCount} batches
            </Text>
            <View style={[styles.inlineRow, styles.summaryDetails]}>
              <Text variant="bodyMedium" style={styles.medium}>
                <Text style={{ color: theme.colors.error }}>{rupees(summary.deductionsAmount)}</Text>
                <Text style={muted}> deductions</Text>
              </Text>
              <Button mode="text" compact onPress={() => setDeductionsOpen(true)} style={styles.link} labelStyle={styles.linkLabel}>
                View breakdown
              </Button>
            </View>
          </View>
        </View>
        <View key="remaining" style={[styles.summary, styles.fill, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.summaryHeaderStatic}>
            <Icon source="hourglass" size={20} color={theme.colors.onSurface} />
            <Text variant="titleMedium">Remaining amount</Text>
          </View>
          <Divider />
          <View style={styles.summaryBody}>
            <DimmedDecimalAmount value={formatInr(summary.unsettledAmount)} size="medium" />
            <Text variant="bodyMedium" style={[styles.medium, muted]}>
              {formatCount(summary.remainingCount)} payments remaining · Next settlement by{' '}
              <Text style={{ color: theme.colors.onSurface }}>{summary.nextSettlementAt}</Text>
            </Text>
            <View style={[styles.inlineRow, styles.summaryDetails]}>
              <Text variant="bodyMedium" style={styles.medium}>
                <Text style={{ color: theme.colors.error }}>{summary.failedCount}</Text>
                <Text style={muted}> settlement failed</Text>
              </Text>
              <Button mode="text" compact style={styles.link} labelStyle={styles.linkLabel}>
                View
              </Button>
              <Text variant="bodyMedium" style={styles.medium}>
                <Text style={{ color: theme.colors.error }}>{formatCount(summary.onHoldCount)}</Text>
                <Text style={muted}> payments on hold</Text>
              </Text>
              <Button mode="text" compact style={styles.link} labelStyle={styles.linkLabel}>
                View
              </Button>
            </View>
          </View>
          {/* In-store: On-Demand settlement, the way to get some of the remaining amount today (merged in, user decision). */}
          {channel === 'in-store' ? (
            <>
              <Divider />
              <View style={[styles.odsStrip, { backgroundColor: appColors.tint.indigo }]}>
                <Icon source="lightning" size={20} color="#4f46e5" />
                <Text variant="bodyMedium" style={[styles.medium, styles.flex]}>
                  Get some of it in your account today via On-Demand settlement
                </Text>
                <Button mode="outlined" compact style={[styles.settleNow, { backgroundColor: theme.colors.surface }]} textColor={theme.colors.onSurface}>
                  Settle now
                </Button>
              </View>
            </>
          ) : null}
        </View>
      </CardCarousel>

      <DayGroupedList
        groups={groupByDay(loadedRows, (row) => row.settlementDatePrimary)}
        totals={dayTotals(filteredRows, (row) => row.settlementDatePrimary, (row) => row.netAmount)}
        noun={{ one: 'settlement', other: 'settlements' }}
        empty="No settlements found."
        renderRow={(row) => (
            <ListRow
              key={row.id}
              onPress={() => router.push(`/settlements/${row.batchId}`)}
              accessibilityLabel={`Settled ${rupees(row.netAmount)} to ${row.bankName} bank ending ${row.accountLabel.slice(-4)}, ${collectionLabel(row)}, ${row.status}`}>
              {/* Settled amount with the bank and account below on the left, status on the right (user decision); the rest is in the detail. */}
              <ListRowLine
                left={
                  <>
                    <Text variant="titleMedium" style={styles.amount}>
                      {rupees(row.netAmount)}
                    </Text>
                    <View style={styles.bankRow}>
                      <BankLogo bank={row.bankName} size={16} />
                      <Text variant="bodySmall" numberOfLines={1} style={muted}>
                        {row.bankName} Bank •••• {row.accountLabel.slice(-4)}
                      </Text>
                    </View>
                    {/* Which day's money this is: settlements land days after the payments they pay out. */}
                    <View style={styles.bankRow}>
                      <Icon source="calendar-blank" size={16} color={theme.colors.onSurfaceVariant} />
                      <Text variant="bodySmall" numberOfLines={1} style={muted}>
                        {collectionLabel(row)}
                      </Text>
                    </View>
                  </>
                }
                right={<DotStatusBadge label={row.status} tone={settlementStatusTone(row.status)} radius={LIST_ROW_INNER_RADIUS} />}
                centered
              />
            </ListRow>
        )}
      />

      <LazyListFooter lazy={lazy} total={filteredRows.length} noun="settlements" />

      <PanelSheet
        visible={preferencesOpen}
        onDismiss={() => setPreferencesOpen(false)}
        title="Settlement preferences"
        height={270}
        footer={
          <Button
            mode="contained"
            icon="sliders"
            onPress={() => {
              setPreferencesOpen(false);
              router.push('/settlements/preferences');
            }}
            style={styles.sheetButton}>
            Change settlement preferences
          </Button>
        }>
        <PanelSection last>
          <DetailRow label="Settlement cycle">
            <Text variant="bodyMedium" style={styles.semiBold}>
              {channel === 'online' ? 'T+1 / T+2 days' : 'T+1 days'}
            </Text>
          </DetailRow>
          <DetailRow label="Settlement account">
            <View style={styles.account}>
              <BankLogo bank="HDFC" size={16} />
              <Text variant="bodyMedium" style={styles.semiBold}>
                HDFC bank, xx8787
              </Text>
            </View>
          </DetailRow>
        </PanelSection>
      </PanelSheet>

      <PanelSheet visible={deductionsOpen} onDismiss={() => setDeductionsOpen(false)} title="Deductions" height={420}>
        <PanelSection>
          <DetailRow label="Gross amount">
            <Text variant="bodyMedium" style={styles.semiBold}>{rupees(summary.grossAmount)}</Text>
          </DetailRow>
          {[
            ['Refunds', summary.refundsAmount],
            ['MSF / MDR', summary.mdrAmount],
            ['GST', summary.gstAmount],
            ['Others', summary.othersAmount],
          ].map(([label, value]) => (
            <DetailRow key={label} label={String(label)}>
              <Text variant="bodyMedium" style={[styles.semiBold, { color: theme.colors.error }]}>
                - {rupees(Number(value))}
              </Text>
            </DetailRow>
          ))}
        </PanelSection>
        <PanelSection last>
          <DetailRow label="Net settled amount">
            <Text variant="bodyMedium" style={styles.semiBold}>{rupees(summary.settledAmount)}</Text>
          </DetailRow>
        </PanelSection>
      </PanelSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  container: { gap: 16 },
  account: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sheetButton: { flex: 1, borderRadius: PANEL_INNER_RADIUS },
  medium: { fontFamily: Fonts.medium },
  semiBold: { fontFamily: Fonts.semiBold },
  flex: { flex: 1 },
  summary: { borderRadius: Shape.max, overflow: 'hidden' },
  summaryHeader: { padding: CARD_PADDING, gap: 12 },
  summaryHeaderStatic: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: CARD_PADDING },
  summaryTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // Takes the extra height, so the space above the details row is what flexes.
  summaryBody: { flexGrow: 1, padding: CARD_PADDING, gap: 8 },
  // Deductions / failed and on-hold sit at the bottom of the body.
  summaryDetails: { marginTop: 'auto' },
  inlineRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  // Logo and text stay on one line; the text truncates rather than wrapping under the logo.
  bankRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  amount: { fontFamily: Fonts.semiBold, fontVariant: ['tabular-nums'] },
  link: { margin: 0, borderRadius: INNER_RADIUS, minWidth: 0 },
  linkLabel: { marginVertical: 2, marginHorizontal: 4, textDecorationLine: 'underline' },
  // Web: bg-[#eef2ff] strip across the card's bottom edge.
  // Tinted footer strip of the Remaining amount card; pushed to the bottom when the card is stretched to the row's height.
  odsStrip: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: CARD_PADDING, marginTop: 'auto' },
  settleNow: { borderRadius: INNER_RADIUS },
});
