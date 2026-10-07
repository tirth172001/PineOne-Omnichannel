import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { DateRangeFields, type DateRange, type DateRangeValue } from '@/components/shared/date-range-filter';
import { PANEL_INNER_RADIUS, PANEL_PADDING, PanelSheet } from '@/components/shared/panel-sheet';
import { SelectionMark } from '@/components/shared/selection-mark';
import { useAppColors } from '@/constants/app-colors';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

/**
 * How a number or a list keeps time — one model for every page (experiment,
 * see constants/experiments.ts):
 *
 * - `range`: a total over dates the user picks (Collected, Settled, a list of
 *   records). Shown as a date button; it opens a sheet with the ranges this
 *   one supports, its limits said in words, and a custom range when allowed.
 * - `live`: a balance right now (To settle, At risk). Shown as a Live tag —
 *   a status, not a control — so it never looks like it has dates to change.
 *
 * The control always sits in the same place: the top-right of the answer, or
 * first in the records card's control row when a list keeps its own dates.
 */

export type RangePreset = 'today' | 'yesterday' | '7d' | '30d' | '90d' | 'all';
export type RangeValue = { preset: RangePreset | 'custom'; custom?: DateRange };

const PRESET_LABELS: Record<RangePreset, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  // For records that aren't a stream (stores, users, devices): the list starts whole.
  all: 'All time',
};
const PRESET_DAYS: Record<Exclude<RangePreset, 'all'>, number> = { today: 1, yesterday: 1, '7d': 7, '30d': 30, '90d': 90 };

export type RangeScope = {
  kind: 'range';
  /** What the dates apply to, for the sheet's title: "Show {subject} for". */
  subject: string;
  presets: RangePreset[];
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  /** Lets the user pick their own dates, up to `maxDays` long. */
  allowCustom?: boolean;
  maxDays?: number;
  /** A limit worth knowing, said plainly (e.g. "Settled totals go back 7 days."). */
  note?: string;
};

export type LiveScope = { kind: 'live'; /** e.g. "2:40 PM"; omitted reads just "Live". */ updatedAt?: string };

export type TimeScope = RangeScope | LiveScope;

const DAY_MS = 24 * 60 * 60 * 1000;
const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = (date: Date) => `${date.getDate()} ${MONTHS[date.getMonth()]}`;

/** [from, to) for a range, with presets ending on `latest` (the newest day in the data, as the web's presets do). */
export function resolveRange(value: RangeValue, latest: Date): [Date, Date] {
  if (value.preset === 'custom' && value.custom) {
    return [startOfDay(value.custom.from), new Date(startOfDay(value.custom.to).getTime() + DAY_MS)];
  }
  const preset = value.preset === 'custom' ? '7d' : value.preset;
  if (preset === 'all') return [new Date(0), new Date(8.64e15)];
  const end = new Date(startOfDay(latest).getTime() + DAY_MS);
  if (preset === 'yesterday') return [new Date(end.getTime() - 2 * DAY_MS), new Date(end.getTime() - DAY_MS)];
  return [new Date(end.getTime() - PRESET_DAYS[preset] * DAY_MS), end];
}

/** "Last 7 days", or "12 Aug – 18 Aug" for a custom range. */
export function rangeLabel(value: RangeValue) {
  if (value.preset === 'custom') return value.custom ? `${shortDate(value.custom.from)} – ${shortDate(value.custom.to)}` : 'Custom';
  return PRESET_LABELS[value.preset];
}

/** Words for a sentence: "today", "in the last 7 days", "from 12 Aug to 18 Aug". */
export function rangePhrase(value: RangeValue) {
  if (value.preset === 'custom') return value.custom ? `from ${shortDate(value.custom.from)} to ${shortDate(value.custom.to)}` : '';
  if (value.preset === 'all') return '';
  if (value.preset === 'today' || value.preset === 'yesterday') return PRESET_LABELS[value.preset].toLowerCase();
  return `in the ${PRESET_LABELS[value.preset].toLowerCase()}`;
}

/** The time control for a scope: a date button that opens its sheet, or the Live tag. */
export function TimeControl({ scope }: { scope: TimeScope }) {
  return scope.kind === 'live' ? <LiveTag updatedAt={scope.updatedAt} /> : <DateButton scope={scope} />;
}

/** A balance right now: a status, not a control. */
export function LiveTag({ updatedAt }: { updatedAt?: string }) {
  const theme = useTheme();
  return (
    <View accessible accessibilityLabel={updatedAt ? `Live, updated ${updatedAt}` : 'Live, right now'} style={styles.live}>
      <View style={styles.liveDot} />
      <Text style={[styles.liveLabel, { color: theme.colors.onSurfaceVariant }]}>{updatedAt ? `Live · ${updatedAt}` : 'Live'}</Text>
    </View>
  );
}

/** The dates a total covers: always a visible button, opening the range sheet. */
export function DateButton({ scope, compact = false }: { scope: RangeScope; /** 32dp, to sit in a row of chips. */ compact?: boolean }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const label = rangeLabel(scope.value);
  return (
    <>
      <TouchableRipple
        onPress={() => setOpen(true)}
        borderless
        accessibilityRole="button"
        accessibilityLabel={`${scope.subject}: ${label}. Change dates`}
        style={[styles.dateButton, compact && styles.compact, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        <View style={styles.dateButtonContent}>
          <Icon source="calendar-blank" size={16} color={theme.colors.onSurface} />
          <Text numberOfLines={1} style={[styles.dateButtonLabel, { color: theme.colors.onSurface }]}>
            {label}
          </Text>
          <Icon source="caret-down" size={14} color={theme.colors.onSurfaceVariant} />
        </View>
      </TouchableRipple>
      <RangeSheet scope={scope} visible={open} onDismiss={() => setOpen(false)} />
    </>
  );
}

function RangeSheet({ scope, visible, onDismiss }: { scope: RangeScope; visible: boolean; onDismiss: () => void }) {
  const theme = useTheme();
  const appColors = useAppColors();
  const [draft, setDraft] = useState<RangeValue>(scope.value);
  // Start from the applied range each time the sheet opens (adjusting state during render).
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDraft(scope.value);
  }
  const customDays = draft.custom ? Math.round((startOfDay(draft.custom.to).getTime() - startOfDay(draft.custom.from).getTime()) / DAY_MS) + 1 : 0;
  const customError =
    draft.preset !== 'custom'
      ? undefined
      : !draft.custom
        ? 'Pick a start and an end date.'
        : customDays < 1
          ? 'The end date is before the start date.'
          : scope.maxDays && customDays > scope.maxDays
            ? `Pick ${scope.maxDays} days or fewer.`
            : undefined;
  const rows: { key: RangePreset | 'custom'; label: string }[] = [
    ...scope.presets.map((preset) => ({ key: preset, label: PRESET_LABELS[preset] })),
    ...(scope.allowCustom ? [{ key: 'custom' as const, label: 'Custom range' }] : []),
  ];
  // DateRangeFields speaks the filters' DateRangeValue.
  const fieldsValue: DateRangeValue = { presetId: 'custom', range: draft.custom, startTime: '12:00 AM', endTime: '11:59 PM' };

  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title={`Show ${scope.subject} for`}
      grouped
      height={draft.preset === 'custom' ? 620 : 150 + rows.length * 52 + (scope.note ? 56 : 0) + 80}
      footer={
        <Button
          mode="contained"
          disabled={!!customError}
          onPress={() => {
            scope.onChange(draft);
            onDismiss();
          }}
          contentStyle={styles.applyContent}
          style={styles.apply}>
          Show {draft.preset === 'custom' ? (draft.custom && !customError ? rangeLabel(draft) : 'custom range') : PRESET_LABELS[draft.preset].toLowerCase()}
        </Button>
      }>
      <View style={styles.sheetBody}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          {rows.map((row, index) => {
            const checked = draft.preset === row.key;
            return (
              <View key={row.key}>
                {index > 0 ? <View style={[styles.hairline, { backgroundColor: theme.colors.surfaceVariant }]} /> : null}
                <TouchableRipple
                  onPress={() => setDraft((current) => ({ preset: row.key, custom: row.key === 'custom' ? current.custom : undefined }))}
                  accessibilityRole="radio"
                  accessibilityState={{ checked }}>
                  <View style={[styles.row, checked && { backgroundColor: appColors.highlight }]}>
                    <Text style={[styles.rowLabel, { color: theme.colors.onSurface, fontFamily: checked ? Fonts.semiBold : Fonts.medium }]}>{row.label}</Text>
                    <SelectionMark type="radio" checked={checked} />
                  </View>
                </TouchableRipple>
              </View>
            );
          })}
        </View>
        {draft.preset === 'custom' ? (
          <View style={[styles.card, styles.custom, { backgroundColor: theme.colors.surface }]}>
            <DateRangeFields value={fieldsValue} onChange={(next) => setDraft({ preset: 'custom', custom: next.range })} />
            {customError ? <Text style={[styles.note, { color: theme.colors.error }]}>{customError}</Text> : null}
          </View>
        ) : null}
        {scope.note ? (
          <View style={styles.noteRow}>
            <Icon source="info" size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.note, styles.flex, { color: theme.colors.onSurfaceVariant }]}>{scope.note}</Text>
          </View>
        ) : null}
      </View>
    </PanelSheet>
  );
}

export const TIME_CONTROL_HEIGHT = 36;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 6, height: TIME_CONTROL_HEIGHT, paddingHorizontal: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  liveLabel: { fontFamily: Fonts.medium, fontSize: 13, lineHeight: 16 },
  dateButton: { borderRadius: Shape.small, borderWidth: 1, height: TIME_CONTROL_HEIGHT, justifyContent: 'center' },
  compact: { height: 32 },
  dateButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10 },
  dateButtonLabel: { fontFamily: Fonts.medium, fontSize: 13, lineHeight: 16 },
  sheetBody: { padding: PANEL_PADDING, gap: 12 },
  card: { borderRadius: Shape.max, overflow: 'hidden' },
  custom: { padding: 12, gap: 8 },
  hairline: { height: 1, marginLeft: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 52, paddingLeft: 16, paddingRight: 4 },
  rowLabel: { fontSize: 15, lineHeight: 20 },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 4 },
  note: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18 },
  apply: { borderRadius: PANEL_INNER_RADIUS },
  applyContent: { height: 48 },
});

/**
 * A list's own dates, for a ListingCard's `time`: the range state, the scope
 * for its date button, and the rows inside the range (presets end on the
 * newest record, as the web's do). `onChange` runs after a new range is set,
 * e.g. to reset lazy loading.
 */
export function useListDates<T>(
  rows: T[],
  dateOf: (row: T) => Date | null,
  options: { subject: string; presets: RangePreset[]; initial: RangePreset; onChange?: () => void }
) {
  const [range, setRange] = useState<RangeValue>({ preset: options.initial });
  const latest = new Date(Math.max(0, ...rows.map((row) => dateOf(row)?.getTime() ?? 0)));
  const [from, to] = resolveRange(range, latest);
  const inRange = rows.filter((row) => {
    const date = dateOf(row);
    // Records without a parseable date stay listed rather than vanish.
    return !date || (date >= from && date < to);
  });
  const scope: RangeScope = {
    kind: 'range',
    subject: options.subject,
    presets: options.presets,
    value: range,
    onChange: (value) => {
      setRange(value);
      options.onChange?.();
    },
    allowCustom: true,
  };
  return { range, setRange, inRange, scope };
}
