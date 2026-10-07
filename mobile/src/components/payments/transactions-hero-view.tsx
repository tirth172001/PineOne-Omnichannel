import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text, useTheme } from 'react-native-paper';

import { ListingCard } from '@/components/listing-hero/listing-card';
import { AnswerHero, HERO_OVERLAP } from '@/components/listing-hero/answer-hero';
import { type RangeValue, rangePhrase, resolveRange } from '@/components/listing-hero/time-scope';
import { DayGroupedList, dayTotals, displayTimestamp, groupByDay, sortNewestFirst } from '@/components/shared/day-groups';
import { EmailReportSheet } from '@/components/shared/email-report-sheet';
import { LazyListFooter, useLazyList } from '@/components/shared/lazy-list';
import { LIST_ROW_INNER_RADIUS, selectFilter } from '@/components/shared/listing';
import type { MoreFilterSelection } from '@/components/shared/more-filters';
import { StatusPill } from '@/components/shared/status';
import { useShellTabs } from '@/components/shell-tabs';
import { Shape } from '@/constants/shape';
import { formatInr } from '@/data/common';
import { parseDisplayDate, transactionRows } from '@/data/transactions';
import { useBusiness } from '@/hooks/use-business';

import { PaymentRow } from './payment-row';
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
} from './transactions-view';

/**
 * Payments → Transactions, "the answer, then the records" (experiment, see
 * constants/experiments.ts). The hero answers "how much did I collect?" for
 * its period, with failures as the one thing to act on; the listing card
 * below holds search, filters (no date: the hero's period covers it), the
 * applied filters as chips, and the day-grouped payments. The hero follows
 * only the scope and its period, never the search or filters, so its number
 * doesn't move while the list is being narrowed; the card says what's left.
 */
export function TransactionsHeroView() {
  const theme = useTheme();
  const { search: focusSearch, intent } = useLocalSearchParams<{ search?: string; intent?: string }>();
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
  const [refundHint, setRefundHint] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const lazy = useLazyList();

  // "Find a payment" / "Refund a payment" from Overview: refunds start from a successful payment.
  const [lastFocusRequest, setLastFocusRequest] = useState<string | undefined>();
  if (focusSearch !== lastFocusRequest) {
    setLastFocusRequest(focusSearch);
    setRefundHint(intent === 'refund');
    if (intent === 'refund') setStatusFilter('success');
  }
  // Switching channel resets the channel-specific filters and the list, as the web's mode toggle did.
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
  const [lastOnlineView, setLastOnlineView] = useState(onlineView);
  if (onlineView !== lastOnlineView) {
    setLastOnlineView(onlineView);
    lazy.reset();
  }
  useShellTabs(mode === 'online' ? { tabs: ONLINE_TABS, activeKey: onlineView, onChange: changeOnlineView } : null);

  const modeRows = useMemo(() => {
    const type = mode === 'in-store' ? 'Payment' : onlineView === 'order' ? 'Order' : 'Payment';
    return transactionRows.filter((row) => row.transactionType === type);
  }, [mode, onlineView]);

  // The hero's dates (and so the list's), ending on the newest day in the data as the web's presets do.
  const periodRows = useMemo(() => {
    const dated = modeRows.map((row) => ({ row, date: parseDisplayDate(row.date, row.time) }));
    const latest = new Date(Math.max(0, ...dated.map((entry) => entry.date?.getTime() ?? 0)));
    const [from, to] = resolveRange(period, latest);
    return dated.filter((entry) => !!entry.date && entry.date >= from && entry.date < to).map((entry) => entry.row);
  }, [modeRows, period]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const paymentModes = moreFilters['payment-modes'] ?? [];
    const transactionModes = moreFilters['transaction-modes'] ?? [];
    return periodRows.filter((row) => {
      if (statusFilter !== 'all' && toStatusFilterKey(row.status.label) !== statusFilter) return false;
      if (mode === 'in-store') {
        if (paymentModes.length && !paymentModes.includes(row.paymentMode)) return false;
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
  const visibleRows = sortedRows.slice(0, lazy.count);
  const resetList = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    lazy.reset();
  };

  // The hero: the period's collection, however the list below is narrowed.
  const collected = periodRows.reduce((sum, row) => sum + row.amount, 0);
  const failed = periodRows.filter((row) => toStatusFilterKey(row.status.label) === 'failed').length;
  const phrase = rangePhrase(period);
  const noun = { one: 'payment', other: 'payments' };

  return (
    <View style={styles.container}>
      <AnswerHero
        views={[
          {
            key: 'collected',
            label: 'Collected',
            amount: collected,
            line: periodRows.length ? `${periodRows.length} ${periodRows.length === 1 ? 'payment' : 'payments'} ${phrase}` : `No payments ${phrase}`,
            time: {
              kind: 'range',
              subject: 'payments',
              presets: ['today', 'yesterday', '7d', '30d'],
              value: period,
              onChange: resetList(setPeriod),
              allowCustom: true,
              maxDays: 90,
            },
          },
        ]}
      />

      <ListingCard
        // Rides up over the hero's foot, so the answer and the records join without a seam.
        style={styles.overHero}
        // The list follows the hero's period, so it says which.
        periodPhrase={phrase}
        // What needs attention sits by the records it's about: one tap filters to it.
        suggestions={
          failed > 0 && statusFilter !== 'failed'
            ? [{ key: 'failed', label: `${failed} failed`, icon: 'warning-circle', color: theme.colors.error, onPress: () => resetList(setStatusFilter)('failed') }]
            : []
        }
        notice={
          // Only while the list is still on successful payments; changing the status filter ends it.
          refundHint && statusFilter === 'success' ? (
            <View style={[styles.hint, { backgroundColor: theme.colors.surfaceVariant }]} accessibilityRole="summary">
              <Icon source="arrow-u-up-left" size={18} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={styles.flex}>
                Pick the payment to refund. Showing successful payments.
              </Text>
              <Button
                mode="text"
                compact
                onPress={() => {
                  setRefundHint(false);
                  resetList(setStatusFilter)('all');
                }}>
                Show all
              </Button>
            </View>
          ) : undefined
        }
        search={search}
        onSearchChange={resetList(setSearch)}
        searchPlaceholder={mode === 'in-store' ? 'Search by any ID' : 'Search by any value'}
        focusSearch={focusSearch}
        filters={[
          selectFilter({ label: 'Status', options: STATUS_OPTIONS, value: statusFilter, onApply: resetList(setStatusFilter) }),
          ...(mode === 'online'
            ? [selectFilter({ label: 'Type', options: TRANSACTION_TYPE_OPTIONS, value: transactionTypeFilter, onApply: resetList(setTransactionTypeFilter) })]
            : [
                selectFilter({ label: 'Mode', options: PAYMENT_MODE_OPTIONS, value: paymentModeFilter, onApply: resetList(setPaymentModeFilter) }),
                selectFilter({ label: 'Provider', options: PROVIDER_OPTIONS, value: providerFilter, onApply: resetList(setProviderFilter) }),
                { type: 'more' as const, categories: MORE_FILTER_CATEGORIES, applied: moreFilters, onApply: resetList(setMoreFilters) },
              ]),
        ]}
        actions={[
          { label: 'Analytics', icon: 'chart-bar', onPress: () => router.push('/payments/transactions/analytics') },
          ...(mode === 'in-store' ? [{ label: 'Email filtered', icon: 'envelope-simple', onPress: () => setEmailOpen(true) }] : []),
          { label: 'Download filtered', icon: 'download-simple' },
          ...(mode === 'online' ? [{ label: 'Verify IMEI No', icon: 'device-mobile' }] : []),
        ]}
        totals={{ all: periodRows.length, shown: filteredRows.length, amount: filteredRows.reduce((sum, row) => sum + row.amount, 0) }}
        noun={noun}>
        <DayGroupedList
          flat
          groups={groupByDay(visibleRows, (row) => row.date)}
          totals={dayTotals(filteredRows, (row) => row.date, (row) => row.amount)}
          noun={noun}
          empty={periodRows.length ? 'No payments match. Try clearing the search or filters.' : `No payments ${phrase}.`}
          renderRow={(row) => (
            <PaymentRow
              key={row.transactionId}
              amount={formatInr(row.amount)}
              paymentMode={row.paymentMode}
              paymentLabel={row.paymentLabel}
              status={<StatusPill label={row.status.label} tone={row.status.tone} radius={LIST_ROW_INNER_RADIUS} />}
              onPress={() => router.push(`/payments/transactions/${row.transactionId}?channel=${mode}`)}
              accessibilityLabel={`${formatInr(row.amount)}, ${row.paymentLabel}, ${row.status.label}`}
            />
          )}
        />
        <LazyListFooter lazy={lazy} total={filteredRows.length} noun="payments" />
      </ListingCard>

      <EmailReportSheet visible={emailOpen} onDismiss={() => setEmailOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  // The container's gap plus the hero's open foot.
  overHero: { marginTop: -(16 + HERO_OVERLAP) },
  flex: { flex: 1 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 12, paddingRight: 4, paddingVertical: 4, borderRadius: Shape.small },
});
