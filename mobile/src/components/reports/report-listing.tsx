import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { FilterMenuButton, OutlinedActionButton } from '@/components/shared/controls';
import { DateRangeFilter, getDefaultDateRangePresets, makeDateRangeValue } from '@/components/shared/date-range-filter';
import { LazyListFooter, useLazyList } from '@/components/shared/lazy-list';
import { LIST_ROW_INNER_RADIUS, ListCard, ListRow, ListRowLine, ListingToolbar } from '@/components/shared/listing';
import { type MoreFilterSelection, MoreFilters } from '@/components/shared/more-filters';
import { StatusPill } from '@/components/shared/status';
import { Fonts } from '@/constants/theme';
import {
  REPORT_HISTORY_ROWS,
  REPORT_MORE_FILTERS,
  REPORT_SCHEDULE_ROWS,
  REPORT_STATUS_OPTIONS,
  reportStatusTone,
} from '@/data/reports';

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
  const query = search.trim().toLowerCase();
  const muted = { color: theme.colors.onSurfaceVariant };

  const history = REPORT_HISTORY_ROWS.filter(
    (row) => !query || `${row.reportName} ${row.dateRange} ${row.refundStatus}`.toLowerCase().includes(query)
  );
  const schedules = REPORT_SCHEDULE_ROWS.filter(
    (row) => !query || `${row.name} ${row.frequency} ${row.status}`.toLowerCase().includes(query)
  );

  return (
    <View style={styles.container}>
      <ListingToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          lazy.reset();
        }}
        searchPlaceholder="Search reports"
        filters={
          <>
            <DateRangeFilter presets={presets} value={dateRange} onApply={setDateRange} initialPresetId="week" />
            <FilterMenuButton value={status} onValueChange={setStatus} options={REPORT_STATUS_OPTIONS} accessibilityLabel="Status" />
            <MoreFilters categories={REPORT_MORE_FILTERS} applied={moreFilters} onApply={setMoreFilters} />
          </>
        }
        actions={<OutlinedActionButton label="Download filtered" icon="download-simple" />}
      />

      {tab === 'history' ? (
        <ListCard empty="No reports found.">
          {history.slice(0, lazy.count).map((row) => (
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
          ))}
        </ListCard>
      ) : (
        <ListCard empty="No schedules found.">
          {schedules.slice(0, lazy.count).map((row) => (
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
          ))}
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
