import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

import { AnswerHero, HERO_OVERLAP } from '@/components/listing-hero/answer-hero';
import { rangeLabel, type RangeScope, type RangeValue, rangePhrase, resolveRange } from '@/components/listing-hero/time-scope';
import { ListingCard } from '@/components/listing-hero/listing-card';
import { BankLogo } from '@/components/shared/bank-logo';
import { DayGroupedList, dayTotals, displayTimestamp, groupByDay, sortNewestFirst } from '@/components/shared/day-groups';
import { LazyListFooter, useLazyList } from '@/components/shared/lazy-list';
import { LIST_ROW_INNER_RADIUS, ListRow, ListRowLine, selectFilter } from '@/components/shared/listing';
import type { MoreFilterSelection } from '@/components/shared/more-filters';
import { DotStatusBadge } from '@/components/shared/status';
import { Fonts } from '@/constants/theme';
import { formatCount } from '@/data/common';
import { getSettlementSummary, type SettlementRow, type SettlementStatus, settlementRows } from '@/data/settlements';
import { parseDisplayDate } from '@/data/transactions';
import { useBusiness } from '@/hooks/use-business';
import { useToast } from '@/hooks/use-toast';

import { collectionLabel, MORE_FILTER_CATEGORIES, rupees, settlementStatusTone, STATUS_OPTIONS } from './settlements-view';

const DAY_MS = 24 * 60 * 60 * 1000;
/** Settled totals are available for this many days at most. */
const SETTLED_MAX_DAYS = 7;

const settledOn = (row: SettlementRow) => {
  const date = parseDisplayDate(row.settlementDatePrimary, '12:00 PM');
  date?.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Settlements, "the answer, then the records" (experiment, see
 * constants/experiments.ts). Two answers that keep time differently, one on
 * screen at a time: Settled (a total, over its own Today / Yesterday / 7 days
 * — never more), and To settle (a balance, right now, with On-Demand as its
 * one action). The breakdown unfolds on request. The list keeps its own,
 * longer date range in the records card, where failures are offered as a
 * one-tap filter.
 */
export function SettlementsHeroView() {
  const theme = useTheme();
  const toast = useToast();
  const { specificChannel: channel } = useBusiness();
  // The page's one date: the list's, and Settled's (up to its last 7 days). Opens on the week: early in the day "today" is usually still empty.
  const [range, setRange] = useState<RangeValue>({ preset: '7d' });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | SettlementStatus>('all');
  const [moreFilters, setMoreFilters] = useState<MoreFilterSelection>({});
  const [heroView, setHeroView] = useState<'settled' | 'to-settle'>('settled');
  const lazy = useLazyList();
  const resetList = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    lazy.reset();
  };

  const channelRows = useMemo(() => settlementRows.filter((row) => row.channel === channel), [channel]);
  const latest = useMemo(() => new Date(Math.max(0, ...channelRows.map((row) => settledOn(row)?.getTime() ?? 0))), [channelRows]);
  const inRange = (row: SettlementRow, range: RangeValue) => {
    const [from, to] = resolveRange(range, latest);
    const date = settledOn(row);
    return !!date && date >= from && date < to;
  };

  // Settled (Window): what reached the bank in its period.
  // Settled totals go back 7 days at most: over a longer range, the total covers its latest 7 days (and says so).
  const [rangeFrom, rangeTo] = resolveRange(range, latest);
  const settledCapped = rangeTo.getTime() - rangeFrom.getTime() > SETTLED_MAX_DAYS * DAY_MS;
  const settledFrom = settledCapped ? new Date(rangeTo.getTime() - SETTLED_MAX_DAYS * DAY_MS) : rangeFrom;
  const settledRows = channelRows.filter((row) => {
    const date = settledOn(row);
    return row.status === 'Settled' && !!date && date >= settledFrom && date < rangeTo;
  });
  const settledPhrase = settledCapped ? 'in the latest 7 days' : rangePhrase(range);
  const sum = (rows: SettlementRow[], pick: (row: SettlementRow) => number) => rows.reduce((total, row) => total + pick(row), 0);
  const settled = {
    amount: sum(settledRows, (row) => row.netAmount),
    batches: settledRows.length,
    gross: sum(settledRows, (row) => row.grossAmount),
    deductions: sum(settledRows, (row) => row.deductionsTotal),
    refunds: sum(settledRows, (row) => row.refundAmount),
    mdr: sum(settledRows, (row) => row.mdrAmount),
    gst: sum(settledRows, (row) => row.gstAmount),
    others: sum(settledRows, (row) => row.platformFees + row.recoveryAmount + row.chargebackAmount),
  };
  // Still to settle (Snapshot): the balance right now, whatever the dates.
  const summary = useMemo(() => getSettlementSummary(channel), [channel]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const pick = (id: string) => moreFilters[id]?.[0];
    const [from, to] = resolveRange(range, latest);
    return channelRows.filter((row) => {
      const date = settledOn(row);
      if (!date || date < from || date >= to) return false;
      if (status !== 'all' && row.status !== status) return false;
      if (pick('bank') && row.acquiringBank.toLowerCase() !== pick('bank')) return false;
      if (pick('type') && row.settlementType !== pick('type')) return false;
      if (pick('payment') && row.paymentMethod !== pick('payment')) return false;
      if (pick('tid') && row.tid !== pick('tid')) return false;
      if (!query) return true;
      return `${row.batchId} ${row.utr} ${row.bankName} ${row.acquiringBank} ${row.tid} ${row.store}`.toLowerCase().includes(query);
    });
  }, [channelRows, latest, range, moreFilters, search, status]);
  const inListRange = useMemo(() => channelRows.filter((row) => inRange(row, range)), [channelRows, range, latest]); // eslint-disable-line react-hooks/exhaustive-deps
  // The one date control: in the hero while it shows Settled (which uses it), in the records card while the hero is live.
  const dates: RangeScope = {
    kind: 'range',
    subject: 'settlements',
    presets: ['today', 'yesterday', '7d', '30d', '90d'],
    value: range,
    onChange: resetList(setRange),
    allowCustom: true,
    maxDays: 90,
    note: 'Settled totals go back 7 days. Over a longer range, the total shows its latest 7 days and the list shows every settlement.',
  };
  const loadedRows = sortNewestFirst(filteredRows, (row) => displayTimestamp(row.settlementDatePrimary, row.settlementDateSecondary)).slice(0, lazy.count);
  const muted = { color: theme.colors.onSurfaceVariant };
  const noun = { one: 'settlement', other: 'settlements' };

  return (
    <View style={styles.container}>
      <AnswerHero
        activeKey={heroView}
        onActiveChange={(key) => setHeroView(key as 'settled' | 'to-settle')}
        views={[
          {
            key: 'settled',
            label: 'Settled',
            amount: settled.amount,
            line: settled.batches
              ? `${settled.batches} ${settled.batches === 1 ? 'batch' : 'batches'} reached your bank ${settledPhrase}`
              : `Nothing settled ${settledPhrase} yet`,
            note: settledCapped ? `Settled totals go back 7 days · the list shows the full ${rangeLabel(range).replace(/^Last /, '').toLowerCase()}` : undefined,
            time: dates,
            // Leads with how much was taken off; the parts unfold on request.
            details: settled.batches
              ? [
                  {
                    key: 'deductions',
                    label: 'Deductions',
                    value: `−${rupees(settled.deductions)}`,
                    tone: 'negative',
                    breakdown: [
                      { label: 'Collected', value: rupees(settled.gross) },
                      { label: 'Refunds', value: `−${rupees(settled.refunds)}`, tone: 'negative' },
                      { label: 'MSF / MDR', value: `−${rupees(settled.mdr)}`, tone: 'negative' },
                      { label: 'GST', value: `−${rupees(settled.gst)}`, tone: 'negative' },
                      { label: 'Others', value: `−${rupees(settled.others)}`, tone: 'negative' },
                      { label: 'Settled to your bank', value: rupees(settled.amount), tone: 'total' },
                    ],
                  },
                ]
              : undefined,
          },
          {
            key: 'to-settle',
            label: 'To settle',
            amount: summary.unsettledAmount,
            // What's waiting, then when the next run is — when it's a time ("On demand" isn't one).
            line: `${formatCount(summary.remainingCount)} payments waiting${/on demand/i.test(summary.nextSettlementAt) ? '' : ` · next settlement ${summary.nextSettlementAt.toLowerCase()}`}`,
            time: { kind: 'live' },
            // In-store only: On-Demand settlement gets some of it today.
            details:
              channel === 'in-store'
                ? [
                    {
                      key: 'on-demand',
                      icon: 'lightning',
                      tone: 'accent',
                      label: 'Get some of it today',
                      actionLabel: 'On-Demand',
                      onPress: () => toast("On-Demand settlement isn't in the prototype yet"),
                    },
                  ]
                : undefined,
          },
        ]}
      />

      <ListingCard
        style={styles.overHero}
        search={search}
        onSearchChange={resetList(setSearch)}
        searchPlaceholder="Search by UTR or Trxn ID"
        time={heroView === 'to-settle' ? dates : undefined}
        // What needs attention sits by the records it's about: one tap filters to it (and widens the dates so older ones show).
        suggestions={
          summary.failedCount > 0 && status !== 'Failed'
            ? [
                {
                  key: 'failed',
                  label: `${summary.failedCount} failed`,
                  icon: 'warning-circle',
                  color: theme.colors.error,
                  onPress: () => {
                    resetList(setRange)({ preset: '90d' });
                    resetList(setStatus)('Failed');
                  },
                },
              ]
            : []
        }
        filters={[
          selectFilter({ label: 'Status', options: STATUS_OPTIONS, value: status, onApply: resetList(setStatus) }),
          { type: 'more', categories: MORE_FILTER_CATEGORIES, applied: moreFilters, onApply: resetList(setMoreFilters) },
        ]}
        actions={[
          { label: 'Settlement preferences', icon: 'sliders', onPress: () => router.push('/settlements/preferences') },
          { label: 'Email filtered', icon: 'envelope-simple' },
          { label: 'Download filtered', icon: 'download-simple' },
        ]}
        totals={{ all: inListRange.length, shown: filteredRows.length, amount: filteredRows.reduce((total, row) => total + row.netAmount, 0) }}
        noun={noun}>
        <DayGroupedList
          flat
          groups={groupByDay(loadedRows, (row) => row.settlementDatePrimary)}
          totals={dayTotals(filteredRows, (row) => row.settlementDatePrimary, (row) => row.netAmount)}
          noun={noun}
          empty={inListRange.length ? 'No settlements match. Try clearing the search or filters.' : 'No settlements in these dates.'}
          renderRow={(row) => (
            <ListRow
              key={row.id}
              onPress={() => router.push(`/settlements/${row.batchId}`)}
              accessibilityLabel={`Settled ${rupees(row.netAmount)} to ${row.bankName} bank ending ${row.accountLabel.slice(-4)}, ${collectionLabel(row)}, ${row.status}`}>
              <ListRowLine
                left={
                  <>
                    <Text variant="titleMedium" style={styles.amount}>
                      {rupees(row.netAmount)}
                    </Text>
                    <View style={styles.line}>
                      <BankLogo bank={row.bankName} size={16} />
                      <Text variant="bodySmall" numberOfLines={1} style={muted}>
                        {row.bankName} Bank •••• {row.accountLabel.slice(-4)}
                      </Text>
                    </View>
                    <View style={styles.line}>
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
      </ListingCard>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  // The container's gap plus the hero's open foot.
  overHero: { marginTop: -(16 + HERO_OVERLAP) },
  amount: { fontFamily: Fonts.semiBold, fontVariant: ['tabular-nums'] },
  line: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
