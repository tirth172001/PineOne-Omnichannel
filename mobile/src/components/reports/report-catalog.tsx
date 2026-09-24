import { StyleSheet, View } from 'react-native';
import { Button, Card, Icon, Text, useTheme } from 'react-native-paper';

import { OutlineTag } from '@/components/shared/status';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { REPORT_SECTIONS, type ReportKind } from '@/data/reports';

const CARD_PADDING = 16;
const INNER_RADIUS = concentric(Shape.max, CARD_PADDING);

/**
 * Reports → Reports (web: the catalog in ReportsContent): each section's
 * heading and its cards — icon tile, title (with an "Offline only" tag on
 * terminal and POS reports), description, and a full-width Generate button.
 * The web's 2–4 column grid stacks into one column on a phone.
 */
export function ReportCatalog({ onGenerate }: { onGenerate: (kind: ReportKind, title: string) => void }) {
  const theme = useTheme();
  return (
    <View style={styles.sections}>
      {REPORT_SECTIONS.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text variant="titleLarge" style={styles.heading} accessibilityRole="header">
            {section.heading}
          </Text>
          {section.cards.map((card) => (
            <Card
              key={card.title}
              mode="outlined"
              style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
              <View style={styles.cardBody}>
                <View style={[styles.iconTile, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Icon source={card.icon} size={24} color={theme.colors.onSurface} />
                </View>
                <View style={styles.titleRow}>
                  <Text variant="titleMedium" style={styles.title}>
                    {card.title}
                  </Text>
                  {card.offlineOnly ? <OutlineTag label="Offline only" radius={INNER_RADIUS} /> : null}
                </View>
                <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
                  {card.description}
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => onGenerate(section.kind, card.title)}
                  accessibilityLabel={`Generate ${card.title}`}
                  textColor={theme.colors.onSurface}
                  style={[styles.button, { borderColor: theme.colors.outlineVariant }]}>
                  Generate
                </Button>
              </View>
            </Card>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sections: { gap: 32 },
  section: { gap: 12 },
  // Web: text-[24px] font-semibold, scaled to a phone title.
  heading: { fontFamily: Fonts.semiBold },
  card: { borderRadius: Shape.max },
  cardBody: { padding: CARD_PADDING, gap: 12 },
  iconTile: { width: 40, height: 40, borderRadius: INNER_RADIUS, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  title: { fontFamily: Fonts.semiBold },
  description: { fontFamily: Fonts.regular },
  button: { borderRadius: INNER_RADIUS, marginTop: 4 },
});
