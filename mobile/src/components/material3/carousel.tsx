import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, PanResponder, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';

import { Shape } from '@/constants/shape';

export type CarouselItem = {
  key: string;
  title: string;
  subtitle?: string;
  /** Background color for the item (a theme container role works best until real imagery exists). */
  color: string;
  onColor: string;
};

type CarouselProps = {
  items: CarouselItem[];
  /** `multi-browse`: large + medium + small items visible. `hero`: one large item with a small peek. `uncontained`: fixed-size items that scroll freely. */
  layout?: 'multi-browse' | 'hero' | 'uncontained';
  height?: number;
  onItemPress?: (item: CarouselItem) => void;
};

const GAP = 8;
const SMALL_WIDTH = 48;
const SWIPE_THRESHOLD = 30;
const EMPHASIZED = Easing.bezier(0.2, 0, 0, 1);

/**
 * M3 carousel — not in react-native-paper. In `multi-browse` and `hero`, one
 * animated position drives every item's width (large → medium → small, and
 * collapsing as it leaves), so swiping morphs items between sizes the way the
 * M3 spec describes; text fades out as an item narrows. `uncontained` is a
 * plain free-scrolling row of equal items.
 */
export function Carousel({ items, layout = 'multi-browse', height = 200, onItemPress }: CarouselProps) {
  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = Math.min(windowWidth, 600) - 32;
  const [active, setActive] = useState(0);
  const [position] = useState(() => new Animated.Value(0));

  const hero = layout === 'hero';
  const largeWidth = hero ? containerWidth - SMALL_WIDTH - GAP : (containerWidth - SMALL_WIDTH - GAP * 2) * 0.62;
  const mediumWidth = hero ? SMALL_WIDTH : containerWidth - largeWidth - SMALL_WIDTH - GAP * 2;

  useEffect(() => {
    Animated.timing(position, { toValue: active, duration: 350, easing: EMPHASIZED, useNativeDriver: false }).start();
  }, [active, position]);

  const goTo = (index: number) => setActive(Math.max(0, Math.min(items.length - 1, index)));

  // Recreated whenever `active` changes so the release handler never reads a stale index.
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderRelease: (_, g) => {
          const last = items.length - 1;
          if (g.dx < -SWIPE_THRESHOLD) setActive(Math.min(last, active + 1));
          else if (g.dx > SWIPE_THRESHOLD) setActive(Math.max(0, active - 1));
        },
      }),
    [active, items.length]
  );

  if (layout === 'uncontained') {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: GAP }} style={{ height }}>
        {items.map((item) => (
          <View key={item.key} style={{ width: 220, height }}>
            <ItemTile item={item} textWidth={220} onPress={onItemPress} />
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.viewport, { height, width: containerWidth }]} {...panResponder.panHandlers}>
      {items.map((item, index) => {
        // Distance of this item from the active slot: -1 = just left, 0 = active, 1 = next…
        const offset = Animated.subtract(index, position);
        const inputRange = [-1, 0, 1, 2];
        const width = offset.interpolate({
          inputRange,
          outputRange: [0, largeWidth, mediumWidth, SMALL_WIDTH],
          extrapolate: 'clamp',
        });
        const marginRight = offset.interpolate({ inputRange: [-1, 0], outputRange: [0, GAP], extrapolate: 'clamp' });
        const textOpacity = offset.interpolate({
          inputRange,
          outputRange: [0, 1, hero ? 0 : 1, 0],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View key={item.key} style={{ width, marginRight, height }}>
            <ItemTile
              item={item}
              textWidth={largeWidth}
              textOpacity={textOpacity}
              onPress={() => (index === active ? onItemPress?.(item) : goTo(index))}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

function ItemTile({
  item,
  textWidth,
  textOpacity = 1,
  onPress,
}: {
  item: CarouselItem;
  textWidth: number;
  textOpacity?: number | Animated.AnimatedInterpolation<number>;
  onPress?: (item: CarouselItem) => void;
}) {
  return (
    <TouchableRipple
      onPress={onPress ? () => onPress(item) : undefined}
      borderless
      accessibilityRole="button"
      accessibilityLabel={item.title}
      style={[styles.item, { backgroundColor: item.color }]}>
      <Animated.View style={[styles.itemText, { opacity: textOpacity, width: textWidth }]}>
        <Text variant="titleMedium" style={{ color: item.onColor }} numberOfLines={1}>
          {item.title}
        </Text>
        {item.subtitle ? (
          <Text variant="bodySmall" style={{ color: item.onColor }} numberOfLines={1}>
            {item.subtitle}
          </Text>
        ) : null}
      </Animated.View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  // Items touch the viewport's edges, so both share one radius.
  viewport: { flexDirection: 'row', overflow: 'hidden', borderRadius: Shape.max },
  item: { flex: 1, borderRadius: Shape.max, overflow: 'hidden', justifyContent: 'flex-end' },
  itemText: { padding: 16, gap: 2 },
});
