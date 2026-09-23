import type { Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

import { DetailScreen } from './detail-screen';

/** Detail screen for a record that doesn't exist in the mock data. */
export function NotFound({ title, message, fallbackHref }: { title: string; message: string; fallbackHref: Href }) {
  const theme = useTheme();
  return (
    <DetailScreen title={title} fallbackHref={fallbackHref}>
      <View style={styles.body}>
        <Icon source="warning-circle" size={32} color={theme.colors.onSurfaceVariant} />
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {message}
        </Text>
      </View>
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  body: { alignItems: 'center', gap: 12, paddingVertical: 48 },
});
