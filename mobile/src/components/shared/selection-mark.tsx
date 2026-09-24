import { View } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';

/**
 * Visual-only radio or checkbox for rows that are themselves the tap target.
 * Paper's RadioButton / Checkbox are buttons, and nesting a button inside a
 * pressable row is invalid on web and doubles the touch handling.
 */
export function SelectionMark({ type, checked }: { type: 'radio' | 'checkbox'; checked: boolean }) {
  const theme = useTheme();
  const icon = type === 'radio' ? (checked ? 'radio-button-fill' : 'circle') : checked ? 'check-square-fill' : 'square';
  return (
    <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }} importantForAccessibility="no-hide-descendants">
      <Icon source={icon} size={22} color={checked ? theme.colors.primary : theme.colors.onSurfaceVariant} />
    </View>
  );
}
