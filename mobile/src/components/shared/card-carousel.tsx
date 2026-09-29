import { Children, type ReactElement } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

const SIDE_PADDING = 16;
const GAP = 12;
/** How much of the next card shows at the edge, hinting that the row scrolls. */
const PEEK = 28;

/**
 * Horizontally scrolling, snapping row of summary cards (Overview's Today's
 * payments / settlement, Settlements' Settled / Remaining amount, listing
 * summaries). Each card is a screen width minus a peek of the next, which is
 * the only hint that the row scrolls: no page dots (user decision). Cards
 * stretch to the tallest one's height when given `flex: 1`.
 */
export function CardCarousel({ children }: { children: ReactElement<{ style?: object }>[] }) {
  const { width: windowWidth } = useWindowDimensions();
  const items = Children.toArray(children) as ReactElement<{ style?: object }>[];
  const cardWidth = Math.min(windowWidth, 600) - SIDE_PADDING * 2 - PEEK;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={cardWidth + GAP}
      decelerationRate="fast"
      disableIntervalMomentum
      style={styles.scroller}
      contentContainerStyle={styles.row}>
      {items.map((item, index) => (
        <View key={item.key ?? index} style={{ width: cardWidth }}>
          {item}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Bleeds to the screen edges so cards scroll under the page padding.
  scroller: { marginHorizontal: -SIDE_PADDING },
  row: { paddingHorizontal: SIDE_PADDING, gap: GAP, alignItems: 'stretch' },
});
