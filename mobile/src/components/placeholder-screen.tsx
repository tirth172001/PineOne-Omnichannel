import { ScrollView, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';

type PlaceholderScreenProps = {
  title: string;
  description: string;
};

/**
 * Stand-in for a tab's screen while its real content is built module by module.
 * See .scratch/mobile-app/map.md for the module → tab breakdown.
 */
export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { backgroundColor: theme.colors.background },
      ]}>
      <Card mode="elevated" elevation={0} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleLarge">{title}</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {description}
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 800,
    borderRadius: Shape.max,
  },
  cardContent: {
    gap: 8,
  },
});
