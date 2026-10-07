import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

import { AnswerHero, HERO_OVERLAP } from '@/components/listing-hero/answer-hero';
import { ListingCard } from '@/components/listing-hero/listing-card';
import { type RangeScope, type RangeValue, rangePhrase, resolveRange } from '@/components/listing-hero/time-scope';
import { DayGroupedList, dayTotals, displayTimestamp, groupByDay, sortNewestFirst } from '@/components/shared/day-groups';
import { LazyListFooter, useLazyList } from '@/components/shared/lazy-list';
import { LIST_ROW_INNER_RADIUS, ListRow, ListRowLine, selectFilter } from '@/components/shared/listing';
import type { MoreFilterSelection } from '@/components/shared/more-filters';
import { DotStatusBadge } from '@/components/shared/status';
import { Fonts } from '@/constants/theme';
import { parseInr } from '@/data/common';
import { REFUND_AMOUNT_TYPES, REFUND_STATUSES, type RefundRow, type RefundStatus, refundRows, refundStatusTone } from '@/data/refunds';
import { parseDisplayDate } from '@/data/transactions';

const STATUS_OPTIONS = [{ value: 'all', label: 'All statuses' }, ...REFUND_STATUSES.map((status) => ({ value: status, label: status }))] as const;

const refundedOn = (row: RefundRow) => parseDisplayDate(row.datePrimary, row.dateSecondary);
const total = (rows: RefundRow[]) => rows.reduce((sum, row) => sum + parseInr(row.amount), 0);

/**
 * Refunds, "the answer, then the records" (experiment, see
 * constants/experiments.ts), on the same model as Settlements: two answers
 * that keep time differently — Refunded (a total over the page's dates) and
 * In progress (a balance right now) — then the records card, where failed
 * refunds are a one-tap filter. The page's one date sits in the hero while
 * Refunded is on show, and in the records card while the hero is live.
 */
export function RefundsHeroView() {
  const theme = useTheme();
  const [heroView, setHeroView] = useState<'refunded' | 'in-progress'>('refunded');
  const [range, setRange] = useState<RangeValue>({ preset: '7d' });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | RefundStatus>('all');
  const [moreFilters, setMoreFilters] = useState<MoreFilterSelection>({});
  const lazy = useLazyList();
  const resetList = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    lazy.reset();
  };

  const latest = useMemo(() => new Date(Math.max(0, ...refundRows.map((row) => refundedOn(row)?.getTime() ?? 0))), []);
  const inRange = useMemo(() => {
    const [from, to] = resolveRange(range, latest);
    return refundRows.filter((row) => {
      const date = refundedOn(row);
      return !!date && date >= from && date < to;
    });
  }, [latest, range]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const amountTypes = moreFilters['amount-type'] ?? [];
    return inRange.filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      if (amountTypes.length && !amountTypes.includes(row.amountSub)) return false;
      return !query || `${row.transactionId} ${row.refundId} ${row.storeName}`.toLowerCase().includes(query);
    });
  }, [inRange, moreFilters, search, status]);
  const loaded = sortNewestFirst(filtered, (row) => displayTimestamp(row.datePrimary, row.dateSecondary)).slice(0, lazy.count);

  const refunded = inRange.filter((row) => row.status === 'Success');
  // In progress is a balance right now, whatever the dates.
  const pending = refundRows.filter((row) => row.status === 'Pending');
  const failed = inRange.filter((row) => row.status === 'Failed').length;
  const phrase = rangePhrase(range);
  const dates: RangeScope = {
    kind: 'range',
    subject: 'refunds',
    presets: ['today', 'yesterday', '7d', '30d', '90d'],
    value: range,
    onChange: resetList(setRange),
    allowCustom: true,
    maxDays: 90,
  };
  const noun = { one: 'refund', other: 'refunds' };
  const muted = { color: theme.colors.onSurfaceVariant };

  return (
    <View style={styles.container}>
      <AnswerHero
        activeKey={heroView}
        onActiveChange={(key) => setHeroView(key as 'refunded' | 'in-progress')}
        views={[
          {
            key: 'refunded',
            label: 'Refunded',
            amount: total(refunded),
            line: refunded.length ? `${refunded.length} ${refunded.length === 1 ? 'refund' : 'refunds'} reached customers ${phrase}` : `Nothing refunded ${phrase}`,
            time: dates,
          },
          {
            key: 'in-progress',
            label: 'In progress',
            amount: total(pending),
            line: `${pending.length} ${pending.length === 1 ? 'refund is' : 'refunds are'} on the way to customers`,
            time: { kind: 'live' },
          },
        ]}
      />

      <ListingCard
        style={styles.overHero}
        search={search}
        onSearchChange={resetList(setSearch)}
        searchPlaceholder="Search by any ID"
        time={heroView === 'in-progress' ? dates : undefined}
        suggestions={
          failed > 0 && status !== 'Failed'
            ? [{ key: 'failed', label: `${failed} failed`, icon: 'warning-circle', color: theme.colors.error, onPress: () => resetList(setStatus)('Failed') }]
            : []
        }
        filters={[
          selectFilter({ label: 'Status', options: STATUS_OPTIONS, value: status, onApply: resetList(setStatus) }),
          {
            type: 'more',
            categories: [{ id: 'amount-type', label: 'Amount type', display: 'badge', searchable: false, options: REFUND_AMOUNT_TYPES }],
            applied: moreFilters,
            onApply: resetList(setMoreFilters),
          },
        ]}
        actions={[
          { label: 'Bulk refunds', icon: 'upload-simple' },
          { label: 'Bulk upload history', icon: 'clock-counter-clockwise' },
          { label: 'Email filtered', icon: 'envelope-simple' },
          { label: 'Download filtered', icon: 'download-simple' },
        ]}
        totals={{ all: inRange.length, shown: filtered.length, amount: total(filtered) }}
        noun={noun}>
        <DayGroupedList
          flat
          groups={groupByDay(loaded, (row) => row.datePrimary)}
          totals={dayTotals(filtered, (row) => row.datePrimary, (row) => parseInr(row.amount))}
          noun={noun}
          empty={inRange.length ? 'No refunds match. Try clearing the search or filters.' : 'No refunds in these dates.'}
          renderRow={(row) => (
            <ListRow key={row.id} accessibilityLabel={`Refund ${row.refundId}, ${row.amount}, ${row.status}`}>
              <ListRowLine
                left={
                  <>
                    <Text variant="titleMedium" style={styles.amount}>
                      {row.amount}
                    </Text>
                    <View style={styles.idRow}>
                      <Icon source="arrow-u-up-left" size={16} color={theme.colors.onSurfaceVariant} />
                      <Text variant="bodySmall" numberOfLines={1} style={muted}>
                        Refund ID {row.refundId}
                      </Text>
                    </View>
                  </>
                }
                right={<DotStatusBadge label={row.status} tone={refundStatusTone(row.status)} radius={LIST_ROW_INNER_RADIUS} />}
                centered
              />
            </ListRow>
          )}
        />
        <LazyListFooter lazy={lazy} total={filtered.length} noun="refunds" />
      </ListingCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  // The container's gap plus the hero's open foot.
  overHero: { marginTop: -(16 + HERO_OVERLAP) },
  amount: { fontFamily: Fonts.semiBold, fontVariant: ['tabular-nums'] },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
