import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text, useTheme } from 'react-native-paper';

import { FilterMenuButton, OutlinedActionButton } from '@/components/shared/controls';
import { DayGroupedList, displayTimestamp, groupByDay, sortNewestFirst } from '@/components/shared/day-groups';
import { DateRangeFilter, getDefaultDateRangePresets, makeDateRangeValue } from '@/components/shared/date-range-filter';
import { LIST_ROW_INNER_RADIUS, ListRow, ListRowLine, ListingToolbar } from '@/components/shared/listing';
import { type MoreFilterSelection, MoreFilters } from '@/components/shared/more-filters';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { DotStatusBadge } from '@/components/shared/status';
import { SummaryCards } from '@/components/shared/summary-cards';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { REFUND_AMOUNT_TYPES, REFUND_STATUSES, REFUND_SUMMARY, type RefundStatus, refundRows, refundStatusTone } from '@/data/refunds';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...REFUND_STATUSES.map((status) => ({ value: status, label: status })),
] as const;

/**
 * Payments → Refunds (web: RefundsContent): Bulk refunds and
 * upload history, the Refunds pending / Refunded amount summary, search, date
 * and status filters, the Amount type filter, and the paginated refunds. As on
 * web, the channel toggle doesn't change the (shared) list.
 */
export function RefundsView() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | RefundStatus>('all');
  const [moreFilters, setMoreFilters] = useState<MoreFilterSelection>({});
  const presets = useMemo(() => getDefaultDateRangePresets(), []);
  const [dateRange, setDateRange] = useState(() => makeDateRangeValue(presets, 'today'));
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return refundRows.filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      if (!query) return true;
      return `${row.transactionId} ${row.refundId} ${row.storeName}`.toLowerCase().includes(query);
    });
  }, [search, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const paged = sortNewestFirst(filtered, (row) => displayTimestamp(row.datePrimary, row.dateSecondary)).slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };
  const muted = { color: theme.colors.onSurfaceVariant };

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <OutlinedActionButton label="Bulk upload history" />
        <Button mode="contained" compact style={styles.primary}>
          Bulk refunds
        </Button>
      </View>

      <SummaryCards cards={REFUND_SUMMARY} carousel />

      <ListingToolbar
        search={search}
        onSearchChange={resetPage(setSearch)}
        searchPlaceholder="Search by any ID"
        filters={
          <>
            <DateRangeFilter presets={presets} value={dateRange} onApply={setDateRange} initialPresetId="today" />
            <FilterMenuButton value={status} onValueChange={resetPage(setStatus)} options={STATUS_OPTIONS} accessibilityLabel="Status" />
            <MoreFilters
              categories={[{ id: 'amount-type', label: 'Amount type', display: 'badge', searchable: false, options: REFUND_AMOUNT_TYPES }]}
              applied={moreFilters}
              onApply={setMoreFilters}
            />
          </>
        }
        actions={
          <>
            <OutlinedActionButton label="Email filtered" icon="envelope-simple" />
            <OutlinedActionButton label="Download filtered" icon="download-simple" />
          </>
        }
      />

      <DayGroupedList
        groups={groupByDay(paged, (row) => row.datePrimary)}
        empty="No refunds found."
        renderRow={(row) => (
            <ListRow key={row.id} accessibilityLabel={`Refund ${row.refundId}, ${row.amount}, ${row.status}`}>
              {/* Amount with the refund ID below on the left, status on the right (user decision). */}
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

      <PaginationBar
        page={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        totalRows={filtered.length}
        onPageChange={setPage}
        onRowsPerPageChange={resetPage(setRowsPerPage)}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  primary: { borderRadius: Shape.small },
  amount: { fontFamily: Fonts.semiBold, fontVariant: ['tabular-nums'] },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
