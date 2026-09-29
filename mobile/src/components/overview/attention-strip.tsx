import { type Href, router } from 'expo-router';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { formatInr } from '@/data/common';
import { disputeRecords, parseInr } from '@/data/disputes';
import { settlementRows } from '@/data/settlements';
import type { ChannelFilter } from '@/data/overview';

type AttentionItem = { key: string; title: string; detail: string; href: Href };

const CARD_PADDING = 12;
const GAP = 8;
/** How much of the next alert shows at the screen edge. */
const PEEK = 24;
/** The page's side padding: the row bleeds to the screen edges and starts in line with the content. */
const PAGE_PADDING = 16;

/** "14 Aug 2026" → "14 Aug". */
const shortDate = (date: string) => date.split(' ').slice(0, 2).join(' ');

/**
 * What's blocking the merchant's money right now, aggregated by type
 * (docs/flows/merchant-homepage.md §1): disputes needing a response (earliest
 * due date first) and failed or held settlements, each with the amount at
 * stake, opening its list. Compact cards in one row at the top of the page
 * that scrolls sideways — the next one peeks in slightly at the edge — so
 * they're seen first without pushing the rest down (user decisions). Renders nothing when nothing
 * is blocked — the happy view has no banner at all (design principle 2).
 */
export function AttentionStrip({ channel }: { channel: ChannelFilter }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const inChannel = (rowChannel: string) => channel === 'all' || rowChannel === channel;

  const disputes = disputeRecords
    .filter((row) => row.status === 'Action pending' && inChannel(row.channel))
    .sort((a, b) => Date.parse(a.dueDate) - Date.parse(b.dueDate));
  const held = settlementRows.filter((row) => (row.status === 'Failed' || row.status === 'On Hold') && inChannel(row.channel));

  const items: AttentionItem[] = [];
  if (disputes.length) {
    items.push({
      key: 'disputes',
      title: `${disputes.length} dispute${disputes.length === 1 ? '' : 's'} need${disputes.length === 1 ? 's' : ''} a response`,
      detail: `${formatInr(disputes.reduce((sum, row) => sum + parseInr(row.amount), 0))} at risk · first due ${shortDate(disputes[0].dueDate)}`,
      href: '/disputes',
    });
  }
  if (held.length) {
    items.push({
      key: 'settlements',
      title: `${held.length} settlement${held.length === 1 ? '' : 's'} failed or on hold`,
      detail: `${formatInr(held.reduce((sum, row) => sum + row.netAmount, 0))} not paid out yet`,
      href: '/settlements',
    });
  }
  if (!items.length) return null;
  // One card fills the row; with more, each is a little narrower so the next one peeks in, which says the row scrolls (user decision).
  const cardWidth = items.length === 1 ? width - 2 * PAGE_PADDING : width - 2 * PAGE_PADDING - PEEK;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={cardWidth + GAP}
      decelerationRate="fast"
      style={styles.scroller}
      contentContainerStyle={styles.row}
      accessibilityRole="summary"
      accessibilityLabel={`${items.length} thing${items.length === 1 ? '' : 's'} need your attention`}>
      {items.map((item) => (
        <TouchableRipple
          key={item.key}
          onPress={() => router.navigate(item.href)}
          borderless
          accessibilityRole="button"
          accessibilityLabel={`${item.title}. ${item.detail}`}
          style={[styles.card, { width: cardWidth, backgroundColor: theme.colors.errorContainer }]}>
          <View style={styles.cardContent}>
            <Icon source="warning-circle" size={18} color={theme.colors.onErrorContainer} />
            <View style={styles.text}>
              <Text variant="labelLarge" numberOfLines={1} style={[styles.title, { color: theme.colors.onErrorContainer }]}>
                {item.title}
              </Text>
              <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onErrorContainer }}>
                {item.detail}
              </Text>
            </View>
            <Icon source="caret-right" size={14} color={theme.colors.onErrorContainer} />
          </View>
        </TouchableRipple>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroller: { marginHorizontal: -PAGE_PADDING, flexGrow: 0 },
  row: { gap: GAP, paddingHorizontal: PAGE_PADDING },
  card: { borderRadius: Shape.max },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: CARD_PADDING },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: Fonts.semiBold },
});
