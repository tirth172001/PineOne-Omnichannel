import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { DateButton, type RangeValue, rangePhrase, resolveRange } from '@/components/listing-hero/time-scope';
import { PAY_MODE_ICON } from '@/components/payments/payment-row';
import {
  type ListingMode,
  MORE_FILTER_CATEGORIES,
  ONLINE_TABS,
  type OnlineView,
  PAYMENT_MODE_OPTIONS,
  PROVIDER_OPTIONS,
  STATUS_OPTIONS,
  type StatusFilter,
  toStatusFilterKey,
  TRANSACTION_TYPE_OPTIONS,
} from '@/components/payments/transactions-view';
import { DayGroupedList, dayTotals, displayTimestamp, groupByDay, sortNewestFirst } from '@/components/shared/day-groups';
import type { ListingFilter } from '@/components/shared/filters-sheet';
import { LazyListFooter, useLazyList } from '@/components/shared/lazy-list';
import { ListRow, ListRowLine, selectFilter } from '@/components/shared/listing';
import type { MoreFilterSelection } from '@/components/shared/more-filters';
import { DotStatusBadge, STATUS_DOT_TONE } from '@/components/shared/status';
import { useShellTabs } from '@/components/shell-tabs';
import { Fonts } from '@/constants/theme';
import { formatCount, formatInr } from '@/data/common';
import { disputeRecords } from '@/data/disputes';
import { SHOW_PAYMENT_LINKS } from '@/constants/experiments';
import { PAYMENT_LINK_ROWS } from '@/data/payment-links';
import { refundRows } from '@/data/refunds';
import { parseDisplayDate, transactionRows } from '@/data/transactions';
import { useBusiness } from '@/hooks/use-business';

import { HeroActions, HeroGroup, HeroNumber, HeroShortcuts, HeroTopRow, SampleHero, SampleSheet } from './sample-layout';

/**
 * Payments → Transactions as "information, then the listing" (sample for
 * review, see LISTING_SAMPLE_LAYOUT in constants/experiments.ts): the
 * period's collection on the coloured hero, the page's main action, and
 * where related money stands (refunds, disputes, payment links) as cards;
 * then the payments on the white sheet, by day.
 */
export function PaymentsSampleView() {
  const theme = useTheme();
  const { search: focusSearch } = useLocalSearchParams<{ search?: string }>();
  const { specificChannel: channel } = useBusiness();
  const mode: ListingMode = channel === 'online' ? 'online' : 'in-store';
  const [period, setPeriod] = useState<RangeValue>({ preset: 'today' });
  const [onlineView, setOnlineView] = useState<OnlineView>('order');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState<'all' | 'upi' | 'card' | 'netbanking'>('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'all' | 'order' | 'payment'>('all');
  const [moreFilters, setMoreFilters] = useState<MoreFilterSelection>({});
  const lazy = useLazyList();

  // Switching channel resets the channel-specific filters and the list.
  const [lastMode, setLastMode] = useState(mode);
  if (mode !== lastMode) {
    setLastMode(mode);
    setOnlineView('order');
    setTransactionTypeFilter('all');
    setPaymentModeFilter('all');
    setProviderFilter('all');
    lazy.reset();
  }
  const changeOnlineView = useCallback((key: string) => setOnlineView(key as OnlineView), []);
  useShellTabs(mode === 'online' ? { tabs: ONLINE_TABS, activeKey: onlineView, onChange: changeOnlineView } : null);

  const modeRows = useMemo(() => {
    const type = mode === 'in-store' ? 'Payment' : onlineView === 'order' ? 'Order' : 'Payment';
    return transactionRows.filter((row) => row.transactionType === type);
  }, [mode, onlineView]);

  // The period ends on the newest day in the data, as the web's presets do.
  const periodRows = useMemo(() => {
    const dated = modeRows.map((row) => ({ row, date: parseDisplayDate(row.date, row.time) }));
    const latest = new Date(Math.max(0, ...dated.map((entry) => entry.date?.getTime() ?? 0)));
    const [from, to] = resolveRange(period, latest);
    return dated.filter((entry) => !!entry.date && entry.date >= from && entry.date < to).map((entry) => entry.row);
  }, [modeRows, period]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const transactionModes = moreFilters['transaction-modes'] ?? [];
    return periodRows.filter((row) => {
      if (statusFilter !== 'all' && toStatusFilterKey(row.status.label) !== statusFilter) return false;
      if (mode === 'in-store') {
        if (transactionModes.length && !transactionModes.includes(row.transactionType.toLowerCase())) return false;
        if (paymentModeFilter !== 'all' && row.paymentMode !== paymentModeFilter) return false;
        if (providerFilter !== 'all' && row.provider !== providerFilter) return false;
      } else if (transactionTypeFilter !== 'all') {
        if (row.transactionType !== (transactionTypeFilter === 'order' ? 'Order' : 'Payment')) return false;
      }
      if (!query) return true;
      return [row.orderId, row.transactionId, row.merchantId, row.rrn, row.storeName, row.paymentLabel, row.provider, row.status.label]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [mode, moreFilters, paymentModeFilter, periodRows, providerFilter, search, statusFilter, transactionTypeFilter]);

  const sortedRows = useMemo(() => sortNewestFirst(filteredRows, (row) => displayTimestamp(row.date, row.time)), [filteredRows]);
  const resetList = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    lazy.reset();
  };

  const filters: ListingFilter[] = [
    selectFilter({ label: 'Status', options: STATUS_OPTIONS, value: statusFilter, onApply: resetList(setStatusFilter) }),
    ...(mode === 'online'
      ? [selectFilter({ label: 'Type', options: TRANSACTION_TYPE_OPTIONS, value: transactionTypeFilter, onApply: resetList(setTransactionTypeFilter) })]
      : [
          selectFilter({ label: 'Mode', options: PAYMENT_MODE_OPTIONS, value: paymentModeFilter, onApply: resetList(setPaymentModeFilter) }),
          selectFilter({ label: 'Provider', options: PROVIDER_OPTIONS, value: providerFilter, onApply: resetList(setProviderFilter) }),
          { type: 'more' as const, categories: MORE_FILTER_CATEGORIES, applied: moreFilters, onApply: resetList(setMoreFilters) },
        ]),
  ];

  // The information: the period's collection, however the list is narrowed.
  const collected = periodRows.reduce((sum, row) => sum + row.amount, 0);
  // Where related money stands (the shortcut cards), for this channel.
  const refundsInProgress = refundRows.filter((row) => row.status === 'Pending').length;
  const disputesToAnswer = disputeRecords.filter((row) => row.channel === mode && row.status === 'Action pending').length;
  const linksOpen = PAYMENT_LINK_ROWS.filter((row) => row.status === 'Created').length;
  const phrase = rangePhrase(period);
  const noun = { one: 'payment', other: 'payments' };

  return (
    <View>
      <SampleHero>
        <HeroTopRow
          label="Collected"
          period={
            <DateButton
              compact
              scope={{
                kind: 'range',
                subject: 'payments',
                presets: ['today', 'yesterday', '7d', '30d'],
                value: period,
                onChange: resetList(setPeriod),
                allowCustom: true,
                maxDays: 90,
              }}
            />
          }
        />
        <HeroNumber
          amount={collected}
          line={periodRows.length ? `${formatCount(periodRows.length)} ${periodRows.length === 1 ? 'payment' : 'payments'} ${phrase}` : `No payments ${phrase}`}
        />
        {/* The main action, then where related money stands. */}
        <HeroGroup>
          <HeroActions
            primary={SHOW_PAYMENT_LINKS ? { label: 'Create payment link', icon: 'link-simple', onPress: () => router.push({ pathname: '/payment-links', params: { create: '1' } }) } : undefined}
            menu={[
              { label: 'Analytics', icon: 'chart-bar', onPress: () => router.push('/payments/transactions/analytics') },
              { label: 'Download filtered', icon: 'download-simple' },
            ]}
          />
            <HeroShortcuts
            items={[
              {
                key: 'refunds',
                icon: 'arrow-u-up-left',
                title: 'Refunds',
                status: refundsInProgress ? `${refundsInProgress} in progress` : 'None in progress',
                onPress: () => router.push('/refunds'),
              },
              {
                key: 'disputes',
                icon: 'gavel',
                title: 'Disputes',
                status: disputesToAnswer ? `${disputesToAnswer} need a response` : 'None open',
                onPress: () => router.push('/disputes'),
              },
              ...(SHOW_PAYMENT_LINKS
                ? [
                    {
                      key: 'links',
                      icon: 'link-simple',
                      title: 'Payment links',
                      status: linksOpen ? `${linksOpen} open` : 'None open',
                      onPress: () => router.push('/payment-links'),
                    },
                  ]
                : []),
            ]}
          />
        </HeroGroup>
      </SampleHero>

      <SampleSheet
        title="Transactions"
        search={search}
        onSearchChange={resetList(setSearch)}
        searchPlaceholder={mode === 'in-store' ? 'Search by any ID' : 'Search by any value'}
        openSearch={focusSearch}
        filters={filters}
        totals={{ all: periodRows.length, shown: filteredRows.length, amount: filteredRows.reduce((sum, row) => sum + row.amount, 0) }}
        noun={noun}>
        <DayGroupedList
          plain
          groups={groupByDay(sortedRows.slice(0, lazy.count), (row) => row.date)}
          totals={dayTotals(filteredRows, (row) => row.date, (row) => row.amount)}
          noun={noun}
          empty={periodRows.length ? 'No payments match. Try clearing the search or filters.' : `No payments ${phrase}.`}
          renderRow={(row) => (
            <ListRow
              key={row.transactionId}
              icon={PAY_MODE_ICON[row.paymentMode]}
              onPress={() => router.push(`/payments/transactions/${row.transactionId}?channel=${mode}`)}
              accessibilityLabel={`${formatInr(row.amount)}, ${row.paymentLabel}, ${row.time}, ${row.status.label}`}>
              <ListRowLine
                left={
                  <>
                    <Text variant="titleMedium" style={styles.amount}>
                      {formatInr(row.amount)}
                    </Text>
                    <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
                      {row.time} · {row.paymentLabel}
                    </Text>
                  </>
                }
                right={<DotStatusBadge label={row.status.label} tone={STATUS_DOT_TONE[row.status.tone]} />}
                centered
              />
            </ListRow>
          )}
        />
        <LazyListFooter lazy={lazy} total={filteredRows.length} noun="payments" />
      </SampleSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  amount: { fontFamily: Fonts.semiBold, fontVariant: ['tabular-nums', 'stylistic-one'] },
});
