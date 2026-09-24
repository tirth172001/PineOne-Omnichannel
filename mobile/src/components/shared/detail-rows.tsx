import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Divider, Text, useTheme } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';

import { CopyableValue } from './copyable-value';

const SECTION_CARD_PADDING = 16;
/** Radius for containers inside a SectionCard (16dp from its edge). */
export const SECTION_CARD_INNER_RADIUS = concentric(Shape.max, SECTION_CARD_PADDING);

/** A titled card holding one segment of a detail page (details, activity, products…). */
export function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <Card mode="outlined" style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      <View style={styles.cardBody}>
        <Text variant="titleMedium" style={styles.cardTitle} accessibilityRole="header">
          {title}
        </Text>
        {children}
      </View>
    </Card>
  );
}

export type DetailRowData = { label: string; value: string; copyable?: boolean };

/**
 * A label/value pair (web: DetailField). The web stacks label over value in a
 * 1–3 column grid; on a phone each pair is one row, label left and value right,
 * which keeps long detail lists compact.
 */
export function DetailRow({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
        {label}
      </Text>
      <View style={styles.value}>
        {children ?? (
          <Text variant="bodyMedium" style={styles.valueText}>
            {value}
          </Text>
        )}
      </View>
    </View>
  );
}

/** A titled group of label/value rows (web: DetailSection). */
export function DetailSection({ title, rows }: { title: string; rows: DetailRowData[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <DetailRowList rows={rows} />
    </View>
  );
}

function DetailRowList({ rows }: { rows: DetailRowData[] }) {
  return (
    <View style={styles.rows}>
      {rows.map((row, index) => (
        <DetailRow key={`${row.label}-${index}`} label={row.label}>
          {row.copyable ? (
            <CopyableValue value={row.value} />
          ) : (
            <Text variant="bodyMedium" style={styles.valueText}>
              {row.value}
            </Text>
          )}
        </DetailRow>
      ))}
    </View>
  );
}

/** Sections separated by dividers, as the web separates them with h-px rules — or, with `carded`, each in its own card. */
export function DetailSections({ sections, carded = false }: { sections: { title: string; rows: DetailRowData[] }[]; carded?: boolean }) {
  if (carded) {
    return (
      <View style={styles.cards}>
        {sections.map((section) => (
          <SectionCard key={section.title} title={section.title}>
            <DetailRowList rows={section.rows} />
          </SectionCard>
        ))}
      </View>
    );
  }
  return (
    <View style={styles.sections}>
      {sections.map((section, index) => (
        <View key={section.title} style={styles.sections}>
          {index > 0 ? <Divider /> : null}
          <DetailSection title={section.title} rows={section.rows} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sections: { gap: 20 },
  cards: { gap: 12 },
  card: { borderRadius: Shape.max },
  cardBody: { padding: SECTION_CARD_PADDING, gap: 12 },
  cardTitle: { fontFamily: Fonts.semiBold },
  section: { gap: 12 },
  // Web: text-xl font-medium.
  title: { fontFamily: Fonts.medium, fontSize: 20, lineHeight: 24 },
  rows: { gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
  label: { fontFamily: Fonts.regular, flexShrink: 1 },
  value: { flexShrink: 1, alignItems: 'flex-end' },
  valueText: { fontFamily: Fonts.regular, textAlign: 'right' },
});
