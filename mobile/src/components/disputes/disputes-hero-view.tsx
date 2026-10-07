import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

import { AnswerHero, HERO_OVERLAP } from '@/components/listing-hero/answer-hero';
import { ListingCard } from '@/components/listing-hero/listing-card';
import { type RangeValue, resolveRange } from '@/components/listing-hero/time-scope';
import { DayGroupedList, dayTotals, displayTimestamp, groupByDay, sortNewestFirst } from '@/components/shared/day-groups';
import { LazyListFooter, useLazyList } from '@/components/shared/lazy-list';
import { LIST_ROW_INNER_RADIUS, ListRow, ListRowLine, selectFilter } from '@/components/shared/listing';
import { StatusPill } from '@/components/shared/status';
import { TabScreen } from '@/components/tab-screen';
import { Fonts } from '@/constants/theme';
import { DISPUTE_STATUSES, type DisputeRecord, disputeRecords, type DisputeStatus, disputeStatusLabel, disputeStatusTone, parseInr } from '@/data/disputes';
import { parseDisplayDate } from '@/data/transactions';
import { useBusiness } from '@/hooks/use-business';

const STATUS_OPTIONS = [{ value: 'all', label: 'All statuses' }, ...DISPUTE_STATUSES.map((status) => ({ value: status, label: status }))] as const;

const raisedOn = (row: DisputeRecord) => parseDisplayDate(row.createdOn, row.time);
const total = (rows: DisputeRecord[]) => rows.reduce((sum, row) => sum + parseInr(row.amount), 0);

/**
 * Disputes, "the answer, then the records" (experiment, see
 * constants/experiments.ts). The answer is a balance right now — what's at
 * risk in open disputes, and when the first response is due — so it's live,
 * and the page's date sits in the records card. Disputes that need a
 * response are a one-tap filter there.
 */
export function DisputesHeroView() {
  const theme = useTheme();
  // Follows the header's channel (In-store or Online; this page has no All channels).
  const { specificChannel: channel } = useBusiness();
  const [range, setRange] = useState<RangeValue>({ preset: '30d' });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | DisputeStatus>('all');
  const lazy = useLazyList();
  const resetList = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    lazy.reset();
  };

  const forChannel = useMemo(() => disputeRecords.filter((row) => row.channel === channel), [channel]);
  const latest = useMemo(() => new Date(Math.max(0, ...forChannel.map((row) => raisedOn(row)?.getTime() ?? 0))), [forChannel]);
  const inRange = useMemo(() => {
    const [from, to] = resolveRange(range, latest);
    return forChannel.filter((row) => {
      const date = raisedOn(row);
      return !!date && date >= from && date < to;
    });
  }, [forChannel, latest, range]);
  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return inRange.filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      return !query || `${row.id} ${row.transactionId} ${row.amount}`.toLowerCase().includes(query);
    });
  }, [inRange, search, status]);
  const loaded = sortNewestFirst(rows, (row) => displayTimestamp(row.createdOn, row.time)).slice(0, lazy.count);

  // At risk is a balance right now, whatever the dates.
  const open = forChannel.filter((row) => row.status !== 'Closed');
  const needResponse = forChannel.filter((row) => row.status === 'Action pending');
  const firstDue = needResponse
    .map((row) => ({ label: row.dueDate.replace(/ \d{4}$/, ''), at: parseDisplayDate(row.dueDate, '12:00 PM')?.getTime() ?? Infinity }))
    .sort((a, b) => a.at - b.at)[0];
  const noun = { one: 'dispute', other: 'disputes' };
  const muted = { color: theme.colors.onSurfaceVariant };

  return (
    <TabScreen tab="disputes">
      <View style={styles.container}>
        <AnswerHero
          views={[
            {
              key: 'at-risk',
              label: 'At risk',
              amount: total(open),
              line: open.length
                ? `${open.length} open ${open.length === 1 ? 'dispute' : 'disputes'}${firstDue ? ` · first response due ${firstDue.label}` : ''}`
                : 'No open disputes',
              time: { kind: 'live' },
            },
          ]}
        />

        <ListingCard
          style={styles.overHero}
          search={search}
          onSearchChange={resetList(setSearch)}
          searchPlaceholder="Search by any ID"
          time={{
            kind: 'range',
            subject: 'disputes',
            presets: ['7d', '30d', '90d'],
            value: range,
            onChange: resetList(setRange),
            allowCustom: true,
            maxDays: 90,
          }}
          suggestions={
            needResponse.length && status !== 'Action pending'
              ? [
                  {
                    key: 'respond',
                    label: `${needResponse.length} need a response`,
                    icon: 'warning-circle',
                    color: theme.colors.error,
                    // They can be older than the list's dates: widen them so all show.
                    onPress: () => {
                      resetList(setRange)({ preset: '90d' });
                      resetList(setStatus)('Action pending');
                    },
                  },
                ]
              : []
          }
          filters={[selectFilter({ label: 'Status', options: STATUS_OPTIONS, value: status, onApply: resetList(setStatus) })]}
          actions={[{ label: 'Download filtered', icon: 'download-simple' }]}
          totals={{ all: inRange.length, shown: rows.length, amount: total(rows) }}
          noun={noun}>
          <DayGroupedList
            flat
            groups={groupByDay(loaded, (row) => row.createdOn)}
            totals={dayTotals(rows, (row) => row.createdOn, (row) => parseInr(row.amount))}
            noun={noun}
            empty={inRange.length ? 'No disputes match. Try clearing the search or filters.' : 'No disputes raised in these dates.'}
            renderRow={(row) => (
              <ListRow
                key={row.id}
                onPress={() => router.push({ pathname: '/disputes/[disputeId]', params: { disputeId: row.id } })}
                accessibilityLabel={`${row.amount}, dispute ${row.id}, ${disputeStatusLabel(row)}`}>
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
        </ListingCard>
      </View>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  // The container's gap plus the hero's open foot.
  overHero: { marginTop: -(16 + HERO_OVERLAP) },
  amount: { fontFamily: Fonts.semiBold, fontVariant: ['tabular-nums'] },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
