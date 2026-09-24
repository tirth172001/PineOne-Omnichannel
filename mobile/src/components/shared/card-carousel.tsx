import { Children, type ReactElement, useState } from 'react';
import { type NativeScrollEvent, type NativeSyntheticEvent, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const SIDE_PADDING = 16;
const GAP = 12;
/** How much of the next card shows at the edge, hinting that the row scrolls. */
const PEEK = 28;

/**
 * Horizontally scrolling, snapping row of summary cards with page dots
 * (Overview's Today's payments / settlement, Settlements' Settled / Remaining
 * amount). Each card is a screen width minus a peek of the next; cards
 * stretch to the tallest one's height when given `flex: 1`.
 */
export function CardCarousel({ children }: { children: ReactElement<{ style?: object }>[] }) {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const items = Children.toArray(children) as ReactElement<{ style?: object }>[];
  const cardWidth = Math.min(windowWidth, 600) - SIDE_PADDING * 2 - PEEK;
  const interval = cardWidth + GAP;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / interval);
    if (next !== page) setPage(Math.max(0, Math.min(items.length - 1, next)));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={interval}
        decelerationRate="fast"
        disableIntervalMomentum
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.scroller}
        contentContainerStyle={styles.row}>
        {items.map((item, index) => (
          <View key={item.key ?? index} style={{ width: cardWidth }}>
            {item}
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {items.map((item, index) => (
          <View
            key={item.key ?? index}
            style={[styles.dot, { backgroundColor: index === page ? theme.colors.onSurface : theme.colors.outlineVariant }, index === page && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  // Bleeds to the screen edges so cards scroll under the page padding.
  scroller: { marginHorizontal: -SIDE_PADDING },
  row: { paddingHorizontal: SIDE_PADDING, gap: GAP, alignItems: 'stretch' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { width: 16 },
});
