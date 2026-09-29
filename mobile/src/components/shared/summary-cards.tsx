import { StyleSheet, View } from 'react-native';
import { Card, Icon, Text, useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { formatInr } from '@/data/common';

import { DimmedDecimalAmount } from './amount';
import { CardCarousel } from './card-carousel';

export type SummaryCardItem = { icon: string; label: string; value: number; subtext: string };

/**
 * Row of summary figures above a listing (web: SummaryCardGroup): icon and
 * label, the amount with faded paise, and a subtext. Stacks on a phone, or
 * with `carousel` becomes a swipeable row (Refunds).
 */
export function SummaryCards({ cards, carousel = false }: { cards: SummaryCardItem[]; carousel?: boolean }) {
  const theme = useTheme();
  const items = cards.map((card) => (
        <Card
          key={card.label}
          mode="contained"
          style={[styles.card, carousel && styles.fill, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Icon source={card.icon} size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                {card.label}
              </Text>
            </View>
            <DimmedDecimalAmount value={formatInr(card.value)} size="medium" />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {card.subtext}
            </Text>
          </View>
        </Card>
  ));
  return carousel && items.length > 1 ? <CardCarousel>{items}</CardCarousel> : <View style={styles.group}>{items}</View>;
}

const styles = StyleSheet.create({
  group: { gap: 12 },
  card: { borderRadius: Shape.max },
  fill: { flex: 1 },
  content: { padding: 16, gap: 4 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  label: { fontFamily: Fonts.medium },
});
