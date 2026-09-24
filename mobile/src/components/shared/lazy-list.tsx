import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

/** Rows per load (user decision: "load 10 if a user scroll to that part"). */
export const LAZY_PAGE_SIZE = 10;
/** How close to the bottom (dp) counts as reaching the end. */
const END_THRESHOLD = 240;
/** Stands in for the network round-trip of fetching the next rows. */
const LOAD_DELAY_MS = 450;

type EndReachedContextValue = { subscribe: (listener: () => void) => () => void };

const EndReachedContext = createContext<EndReachedContextValue | null>(null);

/**
 * For a page's ScrollView: tells lazy lists inside it when the bottom is
 * near — on scroll, and when the content is too short to scroll at all.
 * Spread `scrollProps` onto the ScrollView and wrap its content in
 * `EndReachedProvider` with `value`.
 */
export function useEndReached() {
  const metrics = useRef({ offset: 0, viewport: 0, content: 0 });
  const listeners = useRef(new Set<() => void>());
  const [value] = useState<EndReachedContextValue>(() => ({
    subscribe: (listener) => {
      listeners.current.add(listener);
      return () => listeners.current.delete(listener);
    },
  }));

  const check = () => {
    const { offset, viewport, content } = metrics.current;
    if (viewport > 0 && content > 0 && offset + viewport >= content - END_THRESHOLD) listeners.current.forEach((listener) => listener());
  };

  return {
    value,
    scrollProps: {
      scrollEventThrottle: 16,
      onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        metrics.current.offset = event.nativeEvent.contentOffset.y;
        metrics.current.viewport = event.nativeEvent.layoutMeasurement.height;
        metrics.current.content = event.nativeEvent.contentSize.height;
        check();
      },
      onLayout: (event: LayoutChangeEvent) => {
        metrics.current.viewport = event.nativeEvent.layout.height;
        check();
      },
      onContentSizeChange: (_width: number, height: number) => {
        metrics.current.content = height;
        check();
      },
    },
  };
}

/** Wraps a scroll container's content so lazy lists inside it can load on reaching the end. */
export function EndReachedProvider({ value, children }: { value: EndReachedContextValue; children: ReactNode }) {
  return <EndReachedContext.Provider value={value}>{children}</EndReachedContext.Provider>;
}

/**
 * Lazy loading for a listing (replaces pagination): starts with 10 rows and
 * adds 10 more each time the end of the page is reached. `reset()` goes back
 * to the first 10 (call it when a filter or search changes).
 */
export function useLazyList() {
  const [count, setCount] = useState(LAZY_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  // Scroll events can arrive faster than a re-render; this keeps it to one load at a time.
  const pending = useRef(false);
  return {
    count,
    loading,
    loadMore: () => {
      if (pending.current) return;
      pending.current = true;
      setLoading(true);
      setTimeout(() => {
        setCount((current) => current + LAZY_PAGE_SIZE);
        setLoading(false);
        pending.current = false;
      }, LOAD_DELAY_MS);
    },
    reset: () => setCount(LAZY_PAGE_SIZE),
  };
}

/**
 * The end of a lazy list: listens for the page reaching its end and loads
 * more, showing a spinner while loading, "Showing N of M" while more remain,
 * and "All M shown" at the end.
 */
export function LazyListFooter({
  lazy,
  total,
  noun = 'records',
}: {
  lazy: ReturnType<typeof useLazyList>;
  /** Rows matching the current filters (all of them, not just the loaded ones). */
  total: number;
  noun?: string;
}) {
  const theme = useTheme();
  const context = useContext(EndReachedContext);
  const { loading, loadMore } = lazy;
  const shown = Math.min(lazy.count, total);
  const hasMore = shown < total;
  useEffect(() => {
    if (!context || !hasMore || loading) return;
    return context.subscribe(loadMore);
  }, [context, hasMore, loading, loadMore]);

  if (total === 0) return null;
  const muted = { color: theme.colors.onSurfaceVariant };
  return (
    <View style={styles.footer} accessibilityLiveRegion="polite">
      {loading ? <ActivityIndicator size={18} /> : null}
      <Text variant="bodySmall" style={muted}>
        {loading ? `Loading more ${noun}…` : hasMore ? `Showing ${shown} of ${total} · scroll for more` : `All ${total} ${noun} shown`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8 },
});
