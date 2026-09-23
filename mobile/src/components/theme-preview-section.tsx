import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

/** Section wrapper for the theme preview screen — a title + its content, nothing more. */
export function ThemePreviewSection({ title, children }: SectionProps) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
});
