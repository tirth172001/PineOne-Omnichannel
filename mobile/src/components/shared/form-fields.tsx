import { type ReactNode, useState } from 'react';
import { type KeyboardTypeOptions, StyleSheet, TextInput, View } from 'react-native';
import { Checkbox, Icon, Menu, RadioButton, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';

import { Fonts } from '@/constants/theme';

import type { DateRange } from './date-range-filter';
import { PANEL_INNER_RADIUS } from './panel-sheet';

const FIELD_HEIGHT = 40;

/** Label (with a red asterisk when required), optional hint, and the control (web: Label + Input). */
export function FormField({
  label,
  required = false,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <Text variant="labelLarge" style={styles.label}>
        {label}
        {required ? <Text style={{ color: theme.colors.error }}>*</Text> : null}
      </Text>
      {hint ? (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {hint}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

/**
 * Bordered input (web: Input, or Textarea when multiline). A plain TextInput rather than
 * Paper's TextInput so the corner follows the concentric rule.
 */
export function FormTextInput({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  secureTextEntry,
  keyboardType,
  multiline = false,
  radius = PANEL_INNER_RADIUS,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  accessibilityLabel: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  /** Multi-line text area (web: Textarea). */
  multiline?: boolean;
  radius?: number;
}) {
  const theme = useTheme();
  return (
    <TextInput
      multiline={multiline}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.onSurfaceVariant}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={keyboardType === 'email-address' ? 'none' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={[styles.input, multiline && styles.textArea, { borderRadius: radius, borderColor: theme.colors.outlineVariant, color: theme.colors.onSurface }]}
    />
  );
}

/** Full-width bordered trigger: leading icon, value (or muted placeholder), trailing caret. */
function FieldButton({
  label,
  placeholder = false,
  icon,
  trailingIcon,
  onPress,
  accessibilityLabel,
  radius,
  onLayout,
}: {
  label: string;
  placeholder?: boolean;
  icon?: string;
  trailingIcon?: string;
  onPress: () => void;
  accessibilityLabel: string;
  radius: number;
  onLayout?: (width: number) => void;
}) {
  const theme = useTheme();
  return (
    <TouchableRipple
      onPress={onPress}
      borderless
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onLayout={(event) => onLayout?.(event.nativeEvent.layout.width)}
      style={[styles.fieldButton, { borderRadius: radius, borderColor: theme.colors.outlineVariant }]}>
      <View style={styles.fieldButtonContent}>
        {icon ? <Icon source={icon} size={16} color={theme.colors.onSurfaceVariant} /> : null}
        <Text variant="bodyMedium" numberOfLines={1} style={[styles.fieldValue, { color: placeholder ? theme.colors.onSurfaceVariant : theme.colors.onSurface }]}>
          {label}
        </Text>
        {trailingIcon ? <Icon source={trailingIcon} size={16} color={theme.colors.onSurfaceVariant} /> : null}
      </View>
    </TouchableRipple>
  );
}

/** Full-width select (web: Select with a full-width trigger); the menu matches the field's width. */
export function SelectField<T extends string>({
  value,
  onValueChange,
  options,
  accessibilityLabel,
  radius = PANEL_INNER_RADIUS,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  accessibilityLabel: string;
  radius?: number;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState<number>();
  const selected = options.find((option) => option.value === value);

  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchorPosition="bottom"
      contentStyle={{ borderRadius: radius, backgroundColor: theme.colors.surface, width, maxHeight: 320 }}
      anchor={
        <FieldButton
          label={selected?.label ?? ''}
          trailingIcon="caret-down"
          onPress={() => setOpen(true)}
          accessibilityLabel={`${accessibilityLabel}: ${selected?.label ?? ''}`}
          radius={radius}
          onLayout={setWidth}
        />
      }>
      {options.map((option) => (
        <Menu.Item
          key={option.value}
          title={option.label}
          style={styles.menuItem}
          trailingIcon={option.value === value ? 'check' : undefined}
          onPress={() => {
            setOpen(false);
            onValueChange(option.value);
          }}
        />
      ))}
    </Menu>
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Report date range field (web: ReportDateRangeField): calendar icon and
 * "D MMM YYYY to D MMM YYYY", opening a range calendar. The web's two-month
 * popover becomes Material's full-screen range picker.
 */
export function DateRangeField({
  value,
  onChange,
  radius = PANEL_INNER_RADIUS,
}: {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  radius?: number;
}) {
  const [open, setOpen] = useState(false);
  const label = value
    ? value.to.getTime() !== value.from.getTime()
      ? `${formatDate(value.from)} to ${formatDate(value.to)}`
      : formatDate(value.from)
    : 'Select the duration';

  return (
    <>
      <FieldButton
        label={label}
        placeholder={!value}
        icon="calendar-blank"
        onPress={() => setOpen(true)}
        accessibilityLabel={`Date range: ${label}`}
        radius={radius}
      />
      <DatePickerModal
        locale="en"
        mode="range"
        visible={open}
        startDate={value?.from}
        endDate={value?.to}
        onDismiss={() => setOpen(false)}
        onConfirm={({ startDate, endDate }) => {
          setOpen(false);
          if (startDate) onChange({ from: startDate, to: endDate ?? startDate });
        }}
      />
    </>
  );
}

/** Inline radio or checkbox with its label (web: RadioGroupItem / Checkbox inside a label). */
export function ChoiceControl({
  label,
  checked,
  onPress,
  type,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
  type: 'radio' | 'checkbox';
}) {
  const status = checked ? 'checked' : 'unchecked';
  return (
    <TouchableRipple
      onPress={onPress}
      borderless
      accessibilityRole={type}
      aria-checked={checked}
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={styles.choice}>
      <View style={styles.choiceContent}>
        {type === 'radio' ? <RadioButton.Android value={label} status={status} onPress={onPress} /> : <Checkbox status={status} onPress={onPress} />}
        <Text variant="bodyMedium">{label}</Text>
      </View>
    </TouchableRipple>
  );
}

/** Collapsible block with a bold title and a rotating caret (web: Collapsible, open by default). */
export function CollapsibleSection({
  title,
  badge,
  children,
  defaultOpen = true,
}: {
  title: string;
  /** Shown next to the title, e.g. a column count tag. */
  badge?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={styles.collapsible}>
      <TouchableRipple
        onPress={() => setOpen((current) => !current)}
        borderless
        accessibilityRole="button"
        aria-expanded={open}
        accessibilityState={{ expanded: open }}
        style={styles.collapsibleTrigger}>
        <View style={styles.collapsibleHeader}>
          <View style={styles.collapsibleTitle}>
            <Text variant="titleSmall" style={styles.semiBold}>
              {title}
            </Text>
            {badge}
          </View>
          <Icon source={open ? 'caret-down' : 'caret-right'} size={16} color={theme.colors.onSurfaceVariant} />
        </View>
      </TouchableRipple>
      {open ? <View style={styles.collapsibleBody}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { fontFamily: Fonts.medium },
  semiBold: { fontFamily: Fonts.semiBold },
  input: { height: FIELD_HEIGHT, paddingHorizontal: 12, borderWidth: 1, fontFamily: Fonts.regular, fontSize: 14 },
  textArea: { height: undefined, minHeight: 80, paddingVertical: 10, textAlignVertical: 'top' },
  fieldButton: { height: FIELD_HEIGHT, borderWidth: 1, justifyContent: 'center' },
  fieldButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
  fieldValue: { flex: 1, fontFamily: Fonts.regular },
  menuItem: { maxWidth: undefined },
  choice: { borderRadius: 4 },
  choiceContent: { flexDirection: 'row', alignItems: 'center', paddingRight: 8 },
  collapsible: { gap: 16 },
  collapsibleTrigger: { borderRadius: 4 },
  collapsibleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 24 },
  collapsibleTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  collapsibleBody: { gap: 16 },
});
