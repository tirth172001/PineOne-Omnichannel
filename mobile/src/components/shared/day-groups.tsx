import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { Fonts } from '@/constants/theme';
import { parseDisplayDate } from '@/data/transactions';

import { ListCard } from './listing';

export type DayGroup<T> = { day: string; label: string; rows: T[] };

/** Timestamp of a "16 Aug 2026" + "10:10 PM" pair (unparseable dates sort last). */
export function displayTimestamp(date: string, time: string) {
  return parseDisplayDate(date, time)?.getTime() ?? -Infinity;
}

/** Newest first, keeping the source order for equal timestamps. */
export function sortNewestFirst<T>(rows: T[], timestamp: (row: T) => number) {
  return rows
    .map((row, index) => ({ row, index, time: timestamp(row) }))
    .sort((a, b) => b.time - a.time || a.index - b.index)
    .map((entry) => entry.row);
}

/** "Sun, 16 Aug 2026" for a "16 Aug 2026" display date (keeps the data's own month spelling). */
function dayLabel(day: string) {
  const date = parseDisplayDate(day, '12:00 PM');
  return date ? `${date.toLocaleDateString('en-GB', { weekday: 'short' })}, ${day}` : day;
}

/** Splits already-sorted rows into consecutive runs that share a day. */
export function groupByDay<T>(rows: T[], day: (row: T) => string): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  for (const row of rows) {
    const key = day(row);
    const last = groups[groups.length - 1];
    if (last && last.day === key) last.rows.push(row);
    else groups.push({ day: key, label: dayLabel(key), rows: [row] });
  }
  return groups;
}

/**
 * A listing grouped by day: each day's date as a heading, then that day's
 * records in their own card, newest day first. Replaces a single ListCard for
 * payments, refunds and settlements.
 */
export function DayGroupedList<T>({
  groups,
  renderRow,
  empty,
}: {
  groups: DayGroup<T>[];
  renderRow: (row: T) => ReactNode;
  empty: string;
}) {
  const theme = useTheme();
  if (groups.length === 0) return <ListCard empty={empty}>{[]}</ListCard>;
  return (
    <View style={styles.groups}>
      {groups.map((group) => (
        <View key={group.day} style={styles.group}>
          <View style={styles.heading}>
            <Text variant="titleSmall" style={styles.day} accessibilityRole="header">
              {group.label}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {group.rows.length} {group.rows.length === 1 ? 'record' : 'records'}
            </Text>
          </View>
          <ListCard>{group.rows.map(renderRow)}</ListCard>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  groups: { gap: 20 },
  group: { gap: 8 },
  heading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, paddingHorizontal: 4 },
  day: { fontFamily: Fonts.semiBold },
});
