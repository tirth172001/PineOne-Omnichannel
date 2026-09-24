import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

import { FilterMenuButton } from '@/components/shared/controls';
import { DateRangeFilter, getDefaultDateRangePresets, makeDateRangeValue } from '@/components/shared/date-range-filter';
import { DayGroupedList, displayTimestamp, groupByDay, sortNewestFirst } from '@/components/shared/day-groups';
import { DetailScreen } from '@/components/shared/detail-screen';
import { LazyListFooter, useLazyList } from '@/components/shared/lazy-list';
import { LIST_ROW_INNER_RADIUS, ListRow, ListRowLine, ListingToolbar } from '@/components/shared/listing';
import { StatusPill } from '@/components/shared/status';
import { SummaryCards } from '@/components/shared/summary-cards';
import { Fonts } from '@/constants/theme';
import {
  DISPUTE_STATUSES,
  disputeRecords,
  type DisputeStatus,
  disputeStatusLabel,
  disputeStatusTone,
  parseInr,
} from '@/data/disputes';
import { useBusiness } from '@/hooks/use-business';

const STATUS_OPTIONS = [{ value: 'all', label: 'All statuses' }, ...DISPUTE_STATUSES.map((status) => ({ value: status, label: status }))] as const;

const plural = (count: number) => `among ${count} payment${count === 1 ? '' : 's'}`;

/**
 * Disputes (web: DisputesContent): the header channel's disputes — the
 * Disputed / Won amount cards (swipeable), search, date and status filters,
 * and the disputes grouped by the day each was raised: amount with the
 * dispute ID below and the status. Rows open the dispute detail
 * (transaction, due date, next action).
 */
export function DisputesList() {
  const theme = useTheme();
  const presets = useMemo(() => getDefaultDateRangePresets(), []);
  // Follows the header's channel (In-store or Online; this page has no All channels).
  const { specificChannel: channel } = useBusiness();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | DisputeStatus>('all');
  const [dateRange, setDateRange] = useState(() => makeDateRangeValue(presets, 'today'));
  const lazy = useLazyList();
  const muted = { color: theme.colors.onSurfaceVariant };

  const forChannel = disputeRecords.filter((row) => row.channel === channel);
  const query = search.trim().toLowerCase();
  const rows = forChannel.filter((row) => {
    if (status !== 'all' && row.status !== status) return false;
    return !query || `${row.id} ${row.transactionId} ${row.amount}`.toLowerCase().includes(query);
  });
  const unresolved = forChannel.filter((row) => row.status !== 'Closed');
  const won = forChannel.filter((row) => row.status === 'Closed' && row.outcome === 'Won');

  return (
    <DetailScreen title="Disputes" fallbackHref="/more" scoped>
      <SummaryCards
        cards={[
          {
            icon: 'gavel',
            label: 'Disputed amount',
            value: unresolved.reduce((sum, row) => sum + parseInr(row.amount), 0),
            subtext: plural(unresolved.length),
          },
          {
            icon: 'check-circle',
            label: 'Won amount',
            value: won.reduce((sum, row) => sum + parseInr(row.amount), 0),
            subtext: plural(won.length),
          },
        ]}
        carousel
      />
      <ListingToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          lazy.reset();
        }}
        searchPlaceholder="Search by any ID"
        filters={
          <>
            <DateRangeFilter presets={presets} value={dateRange} onApply={setDateRange} initialPresetId="today" />
            <FilterMenuButton
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                lazy.reset();
              }}
              options={STATUS_OPTIONS} accessibilityLabel="Status" />
          </>
        }
        floatingActions={[{ label: 'Download filtered', icon: 'download-simple' }]}
      />
      <DayGroupedList
        groups={groupByDay(
          sortNewestFirst(rows, (row) => displayTimestamp(row.createdOn, row.time)).slice(0, lazy.count),
          (row) => row.createdOn
        )}
        empty="No disputes found."
        renderRow={(row) => (
          <ListRow
            key={row.id}
            onPress={() => router.push({ pathname: '/more/disputes/[disputeId]', params: { disputeId: row.id } })}
            accessibilityLabel={`${row.amount}, dispute ${row.id}, ${disputeStatusLabel(row)}`}>
            {/* Amount with the dispute ID below on the left, status on the right (user decision); the rest is in the detail. */}
            <ListRowLine
              left={
                <>
                  <Text variant="titleMedium" style={styles.amount}>
                    {row.amount}
                  </Text>
                  <View style={styles.idRow}>
                    <Icon source="gavel" size={16} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodySmall" numberOfLines={1} style={muted}>
                      Dispute ID {row.id}
                    </Text>
                  </View>
                </>
              }
              right={<StatusPill label={disputeStatusLabel(row)} tone={disputeStatusTone(row)} radius={LIST_ROW_INNER_RADIUS} />}
              centered
            />
          </ListRow>
        )}
      />
      <LazyListFooter lazy={lazy} total={rows.length} noun="disputes" />
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  amount: { fontFamily: Fonts.semiBold, fontVariant: ['tabular-nums'] },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
