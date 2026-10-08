import { useEffect, useRef } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { Icon, TouchableRipple, useTheme } from 'react-native-paper';

import { MIN_RADIUS } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  /** concentric() of the container it sits in. */
  radius: number;
  autoFocus?: boolean;
  /** Defaults to 40dp. */
  height?: number;
  /** Focuses the field whenever it changes (e.g. a timestamp from "Find a payment" on Overview). */
  focusRequest?: string;
};

/**
 * Compact in-sheet search input (web: Input with a leading magnifier). Built
 * from a plain TextInput rather than Paper's Searchbar/TextInput.Icon, whose
 * icon buttons are fixed circles, so the shape follows the concentric rule.
 */
export function SearchField({ value, onChangeText, placeholder, radius, autoFocus, height = 40, focusRequest }: SearchFieldProps) {
  const theme = useTheme();
  const input = useRef<TextInput>(null);
  useEffect(() => {
    if (focusRequest) input.current?.focus();
  }, [focusRequest]);
  return (
    <View style={[styles.field, { height, borderRadius: radius, borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
      {/* Never squeezed out by the input on narrow screens. */}
      <View style={styles.icon}>
        <Icon source="magnifying-glass" size={16} color={theme.colors.onSurfaceVariant} />
      </View>
      <TextInput
        ref={input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        autoFocus={autoFocus}
        accessibilityLabel={placeholder}
        style={[styles.input, { color: theme.colors.onSurface }]}
      />
      {value ? (
        <TouchableRipple onPress={() => onChangeText('')} borderless accessibilityRole="button" accessibilityLabel="Clear search" style={styles.clear}>
          <Icon source="x" size={16} color={theme.colors.onSurfaceVariant} />
        </TouchableRipple>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  icon: { flexShrink: 0 },
  // minWidth 0 lets the input shrink below the browser's default width; long placeholders end in an ellipsis.
  input: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    fontFamily: Fonts.regular,
    fontSize: 14,
    ...(Platform.OS === 'web' ? ({ textOverflow: 'ellipsis' } as object) : null),
  },
  clear: { padding: 4, marginRight: -4, borderRadius: MIN_RADIUS },
});
