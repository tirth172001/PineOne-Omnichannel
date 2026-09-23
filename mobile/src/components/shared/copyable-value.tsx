import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

import { Fonts } from '@/constants/theme';

type CopyableValueProps = {
  value: string;
  /** Visible text, if different from what's copied (e.g. "UTR: 6876…"). */
  label?: string;
  variant?: 'text' | 'pill';
  radius?: number;
};

/**
 * A value with a copy icon (web: the CopyIcon next to IDs, MID, UTR…). Tapping
 * copies to the clipboard and the icon briefly turns into a check.
 */
export function CopyableValue({ value, label, variant = 'text', radius = 12 }: CopyableValueProps) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const pill = variant === 'pill';
  return (
    <Pressable
      onPress={async () => {
        await Clipboard.setStringAsync(value);
        setCopied(true);
      }}
      accessibilityRole="button"
      accessibilityLabel={`Copy ${label ?? value}`}
      accessibilityHint={copied ? 'Copied' : undefined}
      style={[
        styles.row,
        pill && [styles.pill, { borderRadius: Math.min(radius, 12), borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }],
      ]}>
      <Text variant={pill ? 'labelMedium' : 'bodyMedium'} style={!pill ? styles.text : undefined}>
        {label ?? value}
      </Text>
      <Icon source={copied ? 'check' : 'copy'} size={pill ? 12 : 16} color={copied ? '#059669' : theme.colors.onSurfaceVariant} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  text: { fontFamily: Fonts.regular },
  pill: { height: 24, paddingHorizontal: 8, borderWidth: StyleSheet.hairlineWidth },
});
