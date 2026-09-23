import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, RadioButton, Text, useTheme } from 'react-native-paper';
import { DatePickerModal, en, registerTranslation, TimePickerModal } from 'react-native-paper-dates';

import { Fonts } from '@/constants/theme';

import { OutlinedActionButton } from './controls';
import { PANEL_INNER_RADIUS, PANEL_PADDING, PanelSection, PanelSheet } from './panel-sheet';

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

type DateRangeFilterProps = {
  presets: DateRangePreset[];
  value: DateRangeValue;
  onApply: (value: DateRangeValue) => void;
  /** The web's default preset, restored by "Clear filter". */
  initialPresetId: string;
};

/**
 * Date-range filter button and its sheet (web: useDateRangeFilter +
 * DateRangeFilterPanel): preset list, start and end date and time, Clear
 * filter and Apply. The web's inline two-month calendar becomes the Material
 * date picker, opened from each date field.
 */
export function DateRangeFilter({ presets, value, onApply, initialPresetId }: DateRangeFilterProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [picker, setPicker] = useState<null | 'start-date' | 'end-date' | 'start-time' | 'end-time'>(null);
  const label = presets.find((preset) => preset.id === value.presetId)?.label ?? 'Custom';

  const openSheet = () => {
    setDraft(value);
    setOpen(true);
  };
  const setDate = (field: 'from' | 'to', date: Date | undefined) => {
    if (!date) return;
    setDraft((current) => {
      const range = current.range ?? { from: date, to: date };
      return { ...current, presetId: 'custom', range: { ...range, [field]: date } };
    });
  };
  const timePicker = picker === 'start-time' ? draft.startTime : picker === 'end-time' ? draft.endTime : DEFAULT_TIME;

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
          {formatDate(draft.range?.[dateField])}
        </Button>
        <Button
          mode="outlined"
          icon="clock"
          onPress={() => setPicker(timeKey === 'startTime' ? 'start-time' : 'end-time')}
          textColor={theme.colors.onSurface}
          style={[styles.fieldButton, styles.timeButton, { borderColor: theme.colors.outlineVariant }]}
          contentStyle={styles.fieldContent}>
          {draft[timeKey]}
        </Button>
      </View>
    </View>
  );

  return (
    <>
      <OutlinedActionButton
        label={label}
        icon="calendar-blank"
        onPress={openSheet}
        active={open}
        accessibilityLabel={`Date range: ${label}`}
      />
      <PanelSheet
        visible={open}
        onDismiss={() => setOpen(false)}
        title="Date range"
        footer={
          <View style={styles.footer}>
            <Button mode="text" onPress={() => setDraft(makeDateRangeValue(presets, initialPresetId))} style={styles.footerButton}>
              Clear filter
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                onApply(draft);
                setOpen(false);
              }}
              style={styles.footerButton}>
              Apply
            </Button>
          </View>
        }>
        <PanelSection>
          <RadioButton.Group
            value={draft.presetId}
            onValueChange={(presetId) => {
              const preset = presets.find((item) => item.id === presetId);
              setDraft((current) => ({ ...current, presetId, range: preset?.getRange?.() ?? current.range }));
            }}>
            {presets.map((preset) => (
              <RadioButton.Item
                key={preset.id}
                label={preset.label}
                value={preset.id}
                position="leading"
                labelStyle={styles.radioLabel}
                style={styles.radio}
              />
            ))}
          </RadioButton.Group>
        </PanelSection>
        <PanelSection last>
          {field('Start date & time', 'from', 'startTime')}
          {field('End date & time', 'to', 'endTime')}
        </PanelSection>
      </PanelSheet>

      <DatePickerModal
        locale="en"
        mode="single"
        visible={picker === 'start-date' || picker === 'end-date'}
        date={picker === 'end-date' ? draft.range?.to : draft.range?.from}
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
          const key = picker === 'end-time' ? 'endTime' : 'startTime';
          setDraft((current) => ({ ...current, [key]: formatTime(hours, minutes) }));
          setPicker(null);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  radio: { paddingHorizontal: 0, paddingVertical: 4 },
  radioLabel: { textAlign: 'left', fontFamily: Fonts.regular },
  fieldGroup: { gap: 8 },
  fieldTitle: { fontFamily: Fonts.semiBold },
  fieldRow: { flexDirection: 'row', gap: 8 },
  fieldButton: { flex: 1, borderRadius: PANEL_INNER_RADIUS },
  timeButton: { flex: 0.8 },
  fieldContent: { justifyContent: 'flex-start' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: PANEL_PADDING },
  footerButton: { borderRadius: PANEL_INNER_RADIUS },
});
