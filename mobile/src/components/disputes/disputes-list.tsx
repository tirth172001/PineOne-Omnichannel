import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { FilterMenuButton, OutlinedActionButton } from '@/components/shared/controls';
import { DateRangeFilter, getDefaultDateRangePresets, makeDateRangeValue } from '@/components/shared/date-range-filter';
import { DetailScreen } from '@/components/shared/detail-screen';
import { LIST_ROW_INNER_RADIUS, ListCard, ListRow, ListRowLine, ListingToolbar } from '@/components/shared/listing';
import { StatusPill } from '@/components/shared/status';
import { SummaryCards } from '@/components/shared/summary-cards';
import { Fonts } from '@/constants/theme';
import {
  DISPUTE_STATUSES,
  disputeActionLabel,
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
 * Disputes (web: DisputesContent): the header channel's disputes, the
 * Disputed and Won amount summary, search, date and status filters, and the channel's disputes
 * as stacked records (dispute and transaction IDs, amount, created and due
 * dates, status and next action). Rows open the dispute detail.
 */
export function DisputesList() {
  const theme = useTheme();
  const presets = useMemo(() => getDefaultDateRangePresets(), []);
  // Follows the header's channel; All channels lists both.
  const { channel } = useBusiness();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | DisputeStatus>('all');
  const [dateRange, setDateRange] = useState(() => makeDateRangeValue(presets, 'today'));
  const muted = { color: theme.colors.onSurfaceVariant };

  const forChannel = channel === 'all' ? disputeRecords : disputeRecords.filter((row) => row.channel === channel);
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
      />
      <ListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by any ID"
        filters={
          <>
            <DateRangeFilter presets={presets} value={dateRange} onApply={setDateRange} initialPresetId="today" />
            <FilterMenuButton value={status} onValueChange={setStatus} options={STATUS_OPTIONS} accessibilityLabel="Status" />
          </>
        }
        actions={<OutlinedActionButton label="Download filtered" icon="download-simple" />}
      />
      <ListCard empty="No disputes found.">
        {rows.map((row) => (
          <ListRow
            key={row.id}
            onPress={() => router.push({ pathname: '/more/disputes/[disputeId]', params: { disputeId: row.id } })}
            accessibilityLabel={`Dispute ${row.id}, ${row.amount}, ${disputeStatusLabel(row)}`}>
            <ListRowLine
              left={<Text variant="bodyMedium" style={styles.medium}>{row.id}</Text>}
              right={<Text variant="bodyMedium" style={styles.medium}>{row.amount}</Text>}
            />
            <ListRowLine
              left={
                <Text variant="bodySmall" style={muted}>
                  Txn {row.transactionId} · Created {row.createdOn}
                </Text>
              }
            />
            <ListRowLine
              left={
                <Text variant="bodySmall" style={muted}>
                  Due {row.dueDate} · <Text variant="bodySmall" style={[styles.medium, { color: theme.colors.onSurface }]}>{disputeActionLabel(row)}</Text>
                </Text>
              }
              right={<StatusPill label={disputeStatusLabel(row)} tone={disputeStatusTone(row)} radius={LIST_ROW_INNER_RADIUS} />}
            />
          </ListRow>
        ))}
      </ListCard>
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  medium: { fontFamily: Fonts.medium },
});
