import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { ListingCard, ListingRows } from '@/components/listing-hero/listing-card';
import { useListDates } from '@/components/listing-hero/time-scope';
import { DayGroupedList, dayTotals, displayTimestamp, groupByDay, sortNewestFirst } from '@/components/shared/day-groups';
import { getDefaultDateRangePresets, makeDateRangeValue } from '@/components/shared/date-range-filter';
import { LazyListFooter, useLazyList } from '@/components/shared/lazy-list';
import { LIST_ROW_INNER_RADIUS, ListCard, ListRow, ListRowLine, ListingToolbar, selectFilter } from '@/components/shared/listing';
import { type MoreFilterSelection } from '@/components/shared/more-filters';
import { StatusPill } from '@/components/shared/status';
import { LISTING_HERO_LAYOUT } from '@/constants/experiments';
import { Fonts } from '@/constants/theme';
import {
  REPORT_HISTORY_ROWS,
  type ReportHistoryRow,
  REPORT_MORE_FILTERS,
  REPORT_SCHEDULE_ROWS,
  type ReportScheduleRow,
  REPORT_STATUS_OPTIONS,
  reportStatusTone,
} from '@/data/reports';
import { parseDisplayDate } from '@/data/transactions';

const SCHEDULE_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Paused', label: 'Paused' },
] as const;

/**
 * Reports → History / Schedule (web: the ListingToolbar + table in
 * ReportsContent). Search, date (This week), Status and More filters, then
 * the rows. As on web, only search narrows the list; the other filters are
 * presentational.
 */
export function ReportListing({ tab }: { tab: 'history' | 'schedule' }) {
  const theme = useTheme();
  const presets = useMemo(() => getDefaultDateRangePresets(), []);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState(() => makeDateRangeValue(presets, 'week'));
  const [moreFilters, setMoreFilters] = useState<MoreFilterSelection>({});
  const lazy = useLazyList();
  const [scheduleStatus, setScheduleStatus] = useState<string>('all');
  const created = useListDates(REPORT_HISTORY_ROWS, (row) => parseDisplayDate(row.createdOn, '12:00 PM'), {
    subject: 'reports generated',
    presets: ['7d', '30d', '90d'],
    initial: '30d',
    onChange: lazy.reset,
  });
  const query = search.trim().toLowerCase();
  const muted = { color: theme.colors.onSurfaceVariant };

  const history = REPORT_HISTORY_ROWS.filter(
    (row) => !query || `${row.reportName} ${row.dateRange} ${row.refundStatus}`.toLowerCase().includes(query)
  );
  const schedules = REPORT_SCHEDULE_ROWS.filter(
    (row) => !query || `${row.name} ${row.frequency} ${row.status}`.toLowerCase().includes(query)
  );

  const renderHistory = (row: ReportHistoryRow) => (
    <ListRow key={row.reportName} accessibilityLabel={`${row.reportName}, ${row.refundStatus}`}>
      <ListRowLine
        left={<Text variant="bodyMedium" style={styles.medium}>{row.reportName}</Text>}
        right={<StatusPill label={row.refundStatus} tone={reportStatusTone(row.refundStatus)} radius={LIST_ROW_INNER_RADIUS} />}
      />
      <ListRowLine
        left={
          <Text variant="bodySmall" style={muted}>
            Created on {row.createdOn} · {row.dateRange}
          </Text>
        }
        right={<Text variant="labelMedium">{row.action}</Text>}
      />
    </ListRow>
  );

  const renderSchedule = (row: ReportScheduleRow) => (
    <ListRow key={row.name} accessibilityLabel={`${row.name}, ${row.status}`}>
      <ListRowLine
        left={<Text variant="bodyMedium" style={styles.medium}>{row.name}</Text>}
        right={<StatusPill label={row.status} tone={reportStatusTone(row.status)} radius={LIST_ROW_INNER_RADIUS} />}
      />
      <ListRowLine
        left={
          <Text variant="bodySmall" style={muted}>
            {row.frequency} · {row.format} · Created by {row.createdBy}
          </Text>
        }
        right={<Text variant="labelMedium">{row.action}</Text>}
      />
    </ListRow>
  );

  if (LISTING_HERO_LAYOUT) {
    // The listing format (constants/experiments.ts): one card for search, filters and dates; generated reports by day.
    if (tab === 'schedule') {
      const shownSchedules = schedules.filter((row) => scheduleStatus === 'all' || row.status === scheduleStatus);
      return (
        <ListingCard
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search schedules"
          filters={[selectFilter({ label: 'Status', options: SCHEDULE_STATUS_OPTIONS, value: scheduleStatus, onApply: setScheduleStatus })]}
          totals={{ all: REPORT_SCHEDULE_ROWS.length, shown: shownSchedules.length }}
          noun={{ one: 'schedule', other: 'schedules' }}>
          <ListingRows empty="No schedules match. Try clearing the search or filters.">{shownSchedules.map(renderSchedule)}</ListingRows>
        </ListingCard>
      );
    }
    const shown = created.inRange.filter((row) => {
      if (status !== 'all' && row.refundStatus.toLowerCase() !== status) return false;
      return !query || `${row.reportName} ${row.dateRange} ${row.refundStatus}`.toLowerCase().includes(query);
    });
    const loaded = sortNewestFirst(shown, (row) => displayTimestamp(row.createdOn, '12:00 PM')).slice(0, lazy.count);
    const noun = { one: 'report', other: 'reports' };
    const failed = created.inRange.filter((row) => row.refundStatus === 'Failed').length;
    return (
      <ListingCard
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          lazy.reset();
        }}
        searchPlaceholder="Search reports"
        time={created.scope}
        suggestions={
          failed > 0 && status !== 'failed'
            ? [{ key: 'failed', label: `${failed} failed`, icon: 'warning-circle', color: theme.colors.error, onPress: () => setStatus('failed') }]
            : []
        }
        filters={[
          selectFilter({ label: 'Status', options: REPORT_STATUS_OPTIONS, value: status, onApply: setStatus }),
          { type: 'more', categories: REPORT_MORE_FILTERS, applied: moreFilters, onApply: setMoreFilters },
        ]}
        actions={[{ label: 'Download filtered', icon: 'download-simple' }]}
        totals={{ all: created.inRange.length, shown: shown.length }}
        noun={noun}>
        <DayGroupedList
          flat
          groups={groupByDay(loaded, (row) => row.createdOn)}
          totals={dayTotals(shown, (row) => row.createdOn)}
          noun={noun}
          empty={created.inRange.length ? 'No reports match. Try clearing the search or filters.' : 'No reports generated in these dates.'}
          renderRow={renderHistory}
        />
        <LazyListFooter lazy={lazy} total={shown.length} noun="reports" />
      </ListingCard>
    );
  }

  return (
    <View style={styles.container}>
      <ListingToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          lazy.reset();
        }}
        searchPlaceholder="Search reports"
        filters={[
          { type: 'date', presets, value: dateRange, onApply: setDateRange, initialPresetId: 'week' },
          selectFilter({ label: 'Status', options: REPORT_STATUS_OPTIONS, value: status, onApply: setStatus }),
          { type: 'more', categories: REPORT_MORE_FILTERS, applied: moreFilters, onApply: setMoreFilters },
        ]}
        actions={[{ label: 'Download filtered', icon: 'download-simple' }]}
      />

      {tab === 'history' ? (
        <ListCard empty="No reports found.">
          {history.slice(0, lazy.count).map(renderHistory)}
        </ListCard>
      ) : (
        <ListCard empty="No schedules found.">
          {schedules.slice(0, lazy.count).map(renderSchedule)}
        </ListCard>
      )}
      <LazyListFooter lazy={lazy} total={tab === 'history' ? history.length : schedules.length} noun={tab === 'history' ? 'reports' : 'schedules'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  medium: { fontFamily: Fonts.medium },
});
