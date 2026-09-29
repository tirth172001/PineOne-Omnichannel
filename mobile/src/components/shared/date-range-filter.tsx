import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { DatePickerModal, en, registerTranslation, TimePickerModal } from 'react-native-paper-dates';

import { Fonts } from '@/constants/theme';

import { PANEL_INNER_RADIUS } from './panel-sheet';

registerTranslation('en', en);

export type DateRange = { from: Date; to: Date };
export type DateRangePreset = { id: string; label: string; getRange?: () => DateRange };
export type DateRangeValue = { presetId: string; range?: DateRange; startTime: string; endTime: string };

const DEFAULT_TIME = '10:30 AM';

function shiftDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Web: getDefaultDateRangePresets(). Transactions passes the latest date in
 * its data as `reference` so "Today" means the dataset's latest day.
 */
export function getDefaultDateRangePresets(reference = new Date()): DateRangePreset[] {
  return [
    { id: 'today', label: 'Today', getRange: () => ({ from: reference, to: reference }) },
    { id: 'yesterday', label: 'Yesterday', getRange: () => ({ from: shiftDays(reference, -1), to: shiftDays(reference, -1) }) },
    { id: 'week', label: 'This week', getRange: () => ({ from: shiftDays(reference, -6), to: reference }) },
    { id: '30d', label: 'Last 30 days', getRange: () => ({ from: shiftDays(reference, -29), to: reference }) },
    { id: 'custom', label: 'Custom' },
  ];
}

export function makeDateRangeValue(presets: DateRangePreset[], presetId: string): DateRangeValue {
  return {
    presetId,
    range: presets.find((preset) => preset.id === presetId)?.getRange?.(),
    startTime: DEFAULT_TIME,
    endTime: DEFAULT_TIME,
  };
}

function formatDate(date?: Date) {
  return date ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select date';
}

function formatTime(hours: number, minutes: number) {
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

function parseTime(time: string) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time);
  if (!match) return { hours: 10, minutes: 30 };
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hours += 12;
  return { hours, minutes: Number(match[2]) };
}

/**
 * Start and end date & time fields, each opening the Material date or time
 * picker. Picking a date makes the range custom. Shown in the Filters sheet
 * when the range is Custom.
 */
export function DateRangeFields({ value, onChange }: { value: DateRangeValue; onChange: (value: DateRangeValue) => void }) {
  const theme = useTheme();
  const [picker, setPicker] = useState<null | 'start-date' | 'end-date' | 'start-time' | 'end-time'>(null);
  const setDate = (field: 'from' | 'to', date: Date | undefined) => {
    if (!date) return;
    const range = value.range ?? { from: date, to: date };
    onChange({ ...value, presetId: 'custom', range: { ...range, [field]: date } });
  };
  const timePicker = picker === 'start-time' ? value.startTime : picker === 'end-time' ? value.endTime : DEFAULT_TIME;

  const field = (title: string, dateField: 'from' | 'to', timeKey: 'startTime' | 'endTime') => (
    <View style={styles.fieldGroup}>
      <Text variant="titleMedium" style={styles.fieldTitle}>
        {title}
      </Text>
      <View style={styles.fieldRow}>
        <Button
          mode="outlined"
          icon="calendar-blank"
          onPress={() => setPicker(dateField === 'from' ? 'start-date' : 'end-date')}
          textColor={theme.colors.onSurface}
          style={[styles.fieldButton, { borderColor: theme.colors.outlineVariant }]}
          contentStyle={styles.fieldContent}>
          {formatDate(value.range?.[dateField])}
        </Button>
        <Button
          mode="outlined"
          icon="clock"
          onPress={() => setPicker(timeKey === 'startTime' ? 'start-time' : 'end-time')}
          textColor={theme.colors.onSurface}
          style={[styles.fieldButton, styles.timeButton, { borderColor: theme.colors.outlineVariant }]}
          contentStyle={styles.fieldContent}>
          {value[timeKey]}
        </Button>
      </View>
    </View>
  );

  return (
    <>
      {field('Start date & time', 'from', 'startTime')}
      {field('End date & time', 'to', 'endTime')}
      <DatePickerModal
        locale="en"
        mode="single"
        visible={picker === 'start-date' || picker === 'end-date'}
        date={picker === 'end-date' ? value.range?.to : value.range?.from}
        onDismiss={() => setPicker(null)}
        onConfirm={({ date }) => {
          setDate(picker === 'end-date' ? 'to' : 'from', date);
          setPicker(null);
        }}
      />
      <TimePickerModal
        locale="en"
        visible={picker === 'start-time' || picker === 'end-time'}
        {...parseTime(timePicker)}
        onDismiss={() => setPicker(null)}
        onConfirm={({ hours, minutes }) => {
          onChange({ ...value, [picker === 'end-time' ? 'endTime' : 'startTime']: formatTime(hours, minutes) });
          setPicker(null);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fieldGroup: { gap: 8 },
  fieldTitle: { fontFamily: Fonts.semiBold },
  fieldRow: { flexDirection: 'row', gap: 8 },
  fieldButton: { flex: 1, borderRadius: PANEL_INNER_RADIUS },
  timeButton: { flex: 0.8 },
  fieldContent: { justifyContent: 'flex-start' },
});
