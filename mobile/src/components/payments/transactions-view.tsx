import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text, useTheme } from 'react-native-paper';

import { Tabs } from '@/components/material3/tabs';
import { DayGroupedList, displayTimestamp, groupByDay, sortNewestFirst } from '@/components/shared/day-groups';
import { FilterMenuButton, OutlinedActionButton } from '@/components/shared/controls';
import {
  type DateRangeValue,
  DateRangeFilter,
  getDefaultDateRangePresets,
  makeDateRangeValue,
} from '@/components/shared/date-range-filter';
import { EmailReportSheet } from '@/components/shared/email-report-sheet';
import { LIST_ROW_INNER_RADIUS, ListRow, ListRowLine, ListingToolbar } from '@/components/shared/listing';
import { type MoreFilterCategory, type MoreFilterSelection, MoreFilters } from '@/components/shared/more-filters';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { StatusPill } from '@/components/shared/status';
import { SummaryCards } from '@/components/shared/summary-cards';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { useBusiness } from '@/hooks/use-business';
import { formatInr } from '@/data/common';
import { parseDisplayDate, type TransactionRecord, transactionRows } from '@/data/transactions';

type ListingMode = 'in-store' | 'online';
type OnlineView = 'order' | 'payments';
type StatusFilter =
  | 'all'
  | 'pending'
  | 'success'
  | 'failed'
  | 'processing'
  | 'initiated'
  | 'cancelled'
  | 'session-expired'
  | 'user-cancelled';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { label: 'Status', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Success', value: 'success' },
  { label: 'Failed', value: 'failed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Initiated', value: 'initiated' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Session expired', value: 'session-expired' },
  { label: 'User cancelled', value: 'user-cancelled' },
];

/** Pay-mode glyphs, as on the transaction detail's mode tile. */
const PAY_MODE_ICON: Record<TransactionRecord['paymentMode'], string> = { upi: 'qr-code', card: 'credit-card', netbanking: 'bank' };

const PAYMENT_MODE_OPTIONS = [
  { label: 'All modes', value: 'all' },
  { label: 'UPI', value: 'upi' },
  { label: 'Card', value: 'card' },
  { label: 'Net banking', value: 'netbanking' },
] as const;

const TRANSACTION_TYPE_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Order', value: 'order' },
  { label: 'Payment', value: 'payment' },
] as const;

const PROVIDER_OPTIONS = [
  { label: 'All providers', value: 'all' },
  ...Array.from(new Set(transactionRows.map((row) => row.provider)))
    .sort((a, b) => a.localeCompare(b))
    .map((provider) => ({ label: provider, value: provider })),
];

/** Web: toStatusFilterKey(). */
function toStatusFilterKey(label: string): StatusFilter {
  const value = label.toLowerCase();
  if (value.includes('session expired')) return 'session-expired';
  if (value.includes('user cancelled')) return 'user-cancelled';
  if (value.includes('cancel')) return 'cancelled';
  if (value.includes('processing')) return 'processing';
  if (value.includes('initiated')) return 'initiated';
  if (value.includes('pending')) return 'pending';
  if (value.includes('success')) return 'success';
  return 'failed';
}

/** Web: the in-store "More filters" categories. */
function moreFilterCategories(rows: TransactionRecord[]): MoreFilterCategory[] {
  const stores = new Map<string, string>();
  rows.forEach((row) => {
    if (!stores.has(row.storeName)) stores.set(row.storeName, row.storeAddress);
  });
  return [
    {
      id: 'stores',
      label: 'Stores',
      options: Array.from(stores.entries()).map(([label, description], index) => ({ id: `store-${index}`, label, description })),
    },
    {
      id: 'payment-modes',
      label: 'Payment modes',
      options: [
        { id: 'upi', label: 'UPI' },
        { id: 'card', label: 'Card' },
        { id: 'netbanking', label: 'Net banking' },
      ],
    },
    { id: 'hardware-id', label: 'Hardware ID', options: ['HW-1001', 'HW-1002', 'HW-1003'].map((id) => ({ id: id.toLowerCase(), label: id })) },
    {
      id: 'terminal-id',
      label: 'Terminal ID (TID)',
      options: ['97893918238', '97902118241', '98010429157', '98155281722'].map((label, index) => ({ id: `terminal-${index}`, label })),
    },
    {
      id: 'pos-id',
      label: 'POS ID',
      options: ['495745794579', '495745794580', '495745794581'].map((label, index) => ({ id: `pos-${101 + index}`, label })),
    },
    {
      id: 'transaction-modes',
      label: 'Transaction modes',
      options: [
        { id: 'payment', label: 'Payment' },
        { id: 'order', label: 'Order' },
      ],
    },
    {
      id: 'zones',
      label: 'Zones',
      options: ['North', 'South', 'West', 'East'].map((label) => ({ id: label.toLowerCase(), label })),
    },
    {
      id: 'batch-status',
      label: 'Batch status',
      options: ['Open', 'Closed', 'Settled'].map((label) => ({ id: label.toLowerCase(), label })),
    },
  ];
}

/**
 * Payments → Transactions (web: TransactionsContent): the header channel picks
 * the in-store or online listing (with its By Order / By payments views), search, date / status / mode /
 * provider filters, More filters, Total volume, and the paginated records.
 * Each web table row becomes a stacked record on a phone; tapping one opens
 * its detail.
 */
export function TransactionsView() {
  const theme = useTheme();
  // The listing follows the header's channel: Online shows orders / online payments; In-store and
  // All channels show the payments list (every payment row, in-store and online alike).
  const { channel } = useBusiness();
  const mode: ListingMode = channel === 'online' ? 'online' : 'in-store';
  const [onlineView, setOnlineView] = useState<OnlineView>('order');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState<'all' | 'upi' | 'card' | 'netbanking'>('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'all' | 'order' | 'payment'>('all');
  const [moreFilters, setMoreFilters] = useState<MoreFilterSelection>({});
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [emailOpen, setEmailOpen] = useState(false);
  // Switching channel resets the channel-specific filters and the page, as the web's mode toggle did.
  const [lastMode, setLastMode] = useState(mode);
  if (mode !== lastMode) {
    setLastMode(mode);
    setOnlineView('order');
    setTransactionTypeFilter('all');
    setPaymentModeFilter('all');
    setProviderFilter('all');
    setPage(1);
  }

  const modeRows = useMemo(() => {
    const type = mode === 'in-store' ? 'Payment' : onlineView === 'order' ? 'Order' : 'Payment';
    return transactionRows.filter((row) => row.transactionType === type);
  }, [mode, onlineView]);

  // Web: presets are relative to the latest date in the data, defaulting to Last 30 days.
  const presets = useMemo(() => {
    const times = modeRows.map((row) => parseDisplayDate(row.date, row.time)?.getTime() ?? -Infinity).filter(Number.isFinite);
    return getDefaultDateRangePresets(times.length ? new Date(Math.max(...times)) : new Date());
  }, [modeRows]);
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => makeDateRangeValue(presets, '30d'));
  // Preset ranges follow the current reference date; custom ranges stay as picked.
  const appliedRange =
    dateRange.presetId === 'custom' ? dateRange.range : presets.find((preset) => preset.id === dateRange.presetId)?.getRange?.();

  const categories = useMemo(() => moreFilterCategories(modeRows), [modeRows]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const storeNames = categories[0].options
      .filter((option) => moreFilters.stores?.includes(option.id))
      .map((option) => option.label);
    const paymentModes = moreFilters['payment-modes'] ?? [];
    const transactionModes = moreFilters['transaction-modes'] ?? [];
    const start = appliedRange?.from ? new Date(appliedRange.from) : null;
    start?.setHours(0, 0, 0, 0);
    const end = appliedRange?.to ? new Date(appliedRange.to) : start;
    end?.setHours(23, 59, 59, 999);

    return modeRows.filter((row) => {
      if (statusFilter !== 'all' && toStatusFilterKey(row.status.label) !== statusFilter) return false;
      if (mode === 'in-store') {
        if (storeNames.length && !storeNames.includes(row.storeName)) return false;
        if (paymentModes.length && !paymentModes.includes(row.paymentMode)) return false;
        if (transactionModes.length && !transactionModes.includes(row.transactionType.toLowerCase())) return false;
        if (paymentModeFilter !== 'all' && row.paymentMode !== paymentModeFilter) return false;
        if (providerFilter !== 'all' && row.provider !== providerFilter) return false;
      } else if (transactionTypeFilter !== 'all') {
        if (row.transactionType !== (transactionTypeFilter === 'order' ? 'Order' : 'Payment')) return false;
      }
      if (start && end) {
        const rowDate = parseDisplayDate(row.date, row.time);
        if (!rowDate || rowDate < start || rowDate > end) return false;
      }
      if (!query) return true;
      return [
        row.orderId,
        row.transactionId,
        row.merchantId,
        row.transactionType,
        row.rrn,
        row.storeName,
        row.storeAddress,
        row.paymentLabel,
        row.provider,
        row.date,
        row.time,
        row.status.label,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [appliedRange, categories, mode, modeRows, moreFilters, paymentModeFilter, providerFilter, search, statusFilter, transactionTypeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  // Newest first so each day forms one group (the web lists in source order).
  const sortedRows = useMemo(() => sortNewestFirst(filteredRows, (row) => displayTimestamp(row.date, row.time)), [filteredRows]);
  const visibleRows = sortedRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalVolume = filteredRows.reduce((sum, row) => sum + row.amount, 0);
  // Any filter change goes back to page 1, as on web.
  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  return (
    <View style={styles.container}>
      {mode === 'online' ? (
        <View style={styles.header}>
          <Button mode="contained" style={styles.primaryAction}>
            Verify IMEI No
          </Button>
          <Tabs
            variant="secondary"
            tabs={[
              { key: 'order', label: 'By Order' },
              { key: 'payments', label: 'By payments' },
            ]}
            activeKey={onlineView}
            onChange={(key) => resetPage(setOnlineView)(key as OnlineView)}
            indicatorColor={theme.colors.onSurface}
            style={styles.onlineTabs}
          />
        </View>
      ) : null}

      <ListingToolbar
        search={search}
        onSearchChange={resetPage(setSearch)}
        searchPlaceholder={mode === 'in-store' ? 'Search by any ID' : 'Search by any value'}
        filters={
          <>
            <DateRangeFilter presets={presets} value={dateRange} onApply={resetPage(setDateRange)} initialPresetId="30d" />
            <FilterMenuButton value={statusFilter} onValueChange={resetPage(setStatusFilter)} options={STATUS_OPTIONS} accessibilityLabel="Status" />
            {mode === 'online' ? (
              <FilterMenuButton
                value={transactionTypeFilter}
                onValueChange={resetPage(setTransactionTypeFilter)}
                options={TRANSACTION_TYPE_OPTIONS}
                accessibilityLabel="Transaction type"
              />
            ) : (
              <>
                <FilterMenuButton
                  value={paymentModeFilter}
                  onValueChange={resetPage(setPaymentModeFilter)}
                  options={PAYMENT_MODE_OPTIONS}
                  accessibilityLabel="Payment mode"
                />
                <FilterMenuButton value={providerFilter} onValueChange={resetPage(setProviderFilter)} options={PROVIDER_OPTIONS} accessibilityLabel="Provider" />
                <MoreFilters categories={categories} applied={moreFilters} onApply={resetPage(setMoreFilters)} />
              </>
            )}
          </>
        }
        actions={
          <>
            {mode === 'in-store' ? (
              <OutlinedActionButton label="Email filtered" icon="envelope-simple" onPress={() => setEmailOpen(true)} />
            ) : null}
            <OutlinedActionButton label="Download filtered" icon="download-simple" />
            <OutlinedActionButton label="View analytics" icon="chart-bar" onPress={() => router.push('/payments/transactions/analytics')} />
          </>
        }
      />

      <SummaryCards cards={[{ icon: 'wallet', label: 'Total volume', value: totalVolume, subtext: `${filteredRows.length} payments` }]} />

      <DayGroupedList
        groups={groupByDay(visibleRows, (row) => row.date)}
        empty="No transactions found."
        renderRow={(row) => (
            <ListRow
              key={row.transactionId}
              onPress={() => router.push(`/payments/transactions/${row.transactionId}?channel=${mode}`)}
              accessibilityLabel={`${formatInr(row.amount)}, ${row.paymentLabel}, ${row.status.label}`}>
              {/* Amount and pay mode on the left, status on the right — nothing else (user decision); details are one tap away. */}
              <ListRowLine
                left={
                  <>
                    <Text variant="titleMedium" style={styles.amount}>
                      {formatInr(row.amount)}
                    </Text>
                    <View style={styles.payMode}>
                      <Icon source={PAY_MODE_ICON[row.paymentMode]} size={16} color={theme.colors.onSurfaceVariant} />
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {row.paymentLabel}
                      </Text>
                    </View>
                  </>
                }
                right={<StatusPill label={row.status.label} tone={row.status.tone} radius={LIST_ROW_INNER_RADIUS} />}
              />
            </ListRow>
        )}
      />

      <PaginationBar
        page={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        totalRows={filteredRows.length}
        onPageChange={setPage}
        onRowsPerPageChange={resetPage(setRowsPerPage)}
      />

      <EmailReportSheet visible={emailOpen} onDismiss={() => setEmailOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  header: { gap: 12 },
  primaryAction: { borderRadius: Shape.small, alignSelf: 'flex-start' },
  onlineTabs: { backgroundColor: 'transparent' },
  amount: { fontFamily: Fonts.semiBold, fontVariant: ['tabular-nums'] },
  payMode: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
