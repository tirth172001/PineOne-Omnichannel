import { StyleSheet, TextInput, View } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';

import { Fonts } from '@/constants/theme';

type SearchFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  /** concentric() of the container it sits in. */
  radius: number;
  autoFocus?: boolean;
};

/**
 * Compact in-sheet search input (web: Input with a leading magnifier). Built
 * from a plain TextInput rather than Paper's Searchbar/TextInput.Icon, whose
 * icon buttons are fixed circles, so the shape follows the concentric rule.
 */
export function SearchField({ value, onChangeText, placeholder, radius, autoFocus }: SearchFieldProps) {
  const theme = useTheme();
  return (
    <View style={[styles.field, { borderRadius: radius, borderColor: theme.colors.outlineVariant }]}>
      <Icon source="magnifying-glass" size={16} color={theme.colors.onSurfaceVariant} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        autoFocus={autoFocus}
        accessibilityLabel={placeholder}
        style={[styles.input, { color: theme.colors.onSurface }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  input: { flex: 1, height: '100%', fontFamily: Fonts.regular, fontSize: 14 },
});
