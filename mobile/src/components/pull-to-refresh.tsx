import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Platform, RefreshControl, StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

import { Fonts } from '@/constants/theme';

/** How far (dp) the page must be pulled before letting go refreshes it. */
const TRIGGER = 64;
/** Resistance: the indicator moves this fraction of the finger's travel. */
const DRAG = 0.5;
const MAX_PULL = 120;
/** The data is mock, so a refresh just takes a moment and says it's done. */
const REFRESH_MS = 900;
const DONE_MS = 900;

type Phase = 'idle' | 'pulling' | 'refreshing' | 'done';

/**
 * Pull to refresh for a tab page's scroll view. On iOS and Android it's the
 * platform's RefreshControl (spinner just under the header). Phone browsers
 * don't get one from React Native Web, so there the page listens for a pull at
 * the top of the scroll: a round indicator follows the finger (its arrow turns
 * when letting go would refresh), spins while refreshing, then shows a ✓
 * "Up to date" before tucking away. The page's state (filters, search) is
 * kept — only the feedback is shown, as the data is mock.
 */
export function usePullToRefresh(offsetTop: number) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [pull] = useState(() => new Animated.Value(0));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const settle = useCallback(
    (to: number, after?: () => void) => {
      Animated.timing(pull, { toValue: to, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(() => after?.());
    },
    [pull]
  );

  const refresh = useCallback(() => {
    setPhase('refreshing');
    timers.current.push(
      setTimeout(() => {
        setPhase('done');
        timers.current.push(setTimeout(() => settle(0, () => setPhase('idle')), DONE_MS));
      }, REFRESH_MS)
    );
  }, [settle]);

  // Web: follow touches on the scroll node while it's at the top.
  const nodeRef = useRef<HTMLElement | null>(null);
  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  const attach = useCallback(
    (instance: unknown) => {
      if (Platform.OS !== 'web') return;
      const node = (instance as { getScrollableNode?: () => HTMLElement } | null)?.getScrollableNode?.() ?? null;
      if (node === nodeRef.current) return;
      nodeRef.current = node;
      if (!node) return;
      let startY: number | null = null;
      let distance = 0;
      const onStart = (event: TouchEvent) => {
        startY = node.scrollTop <= 0 && phaseRef.current === 'idle' ? event.touches[0].clientY : null;
        distance = 0;
      };
      const onMove = (event: TouchEvent) => {
        if (startY === null) return;
        const travel = event.touches[0].clientY - startY;
        if (travel <= 0 || node.scrollTop > 0) {
          if (distance > 0) pull.setValue(0);
          distance = 0;
          return;
        }
        // Hold the page still (no browser overscroll) while pulling the indicator down.
        event.preventDefault();
        distance = Math.min(MAX_PULL, travel * DRAG);
        pull.setValue(distance);
        if (phaseRef.current !== 'pulling') setPhase('pulling');
      };
      const onEnd = () => {
        if (startY === null) return;
        startY = null;
        if (distance >= TRIGGER) {
          settle(TRIGGER);
          refresh();
        } else {
          settle(0, () => setPhase('idle'));
        }
        distance = 0;
      };
      node.addEventListener('touchstart', onStart, { passive: true });
      node.addEventListener('touchmove', onMove, { passive: false });
      node.addEventListener('touchend', onEnd);
      node.addEventListener('touchcancel', onEnd);
    },
    [pull, refresh, settle]
  );

  const refreshControl =
    Platform.OS === 'web' ? undefined : (
      <RefreshControl refreshing={phase === 'refreshing'} onRefresh={refresh} progressViewOffset={offsetTop} />
    );

  const indicator = Platform.OS === 'web' && phase !== 'idle' ? <PullIndicator pull={pull} phase={phase} offsetTop={offsetTop} /> : null;

  return { attach, refreshControl, indicator };
}

function PullIndicator({ pull, phase, offsetTop }: { pull: Animated.Value; phase: Phase; offsetTop: number }) {
  const theme = useTheme();
  const ready = pull.interpolate({ inputRange: [0, TRIGGER * 0.9, TRIGGER], outputRange: ['0deg', '0deg', '180deg'], extrapolate: 'clamp' });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          top: offsetTop - 44,
          opacity: pull.interpolate({ inputRange: [0, 24], outputRange: [0, 1], extrapolate: 'clamp' }),
          transform: [{ translateY: pull }],
        },
      ]}>
      <View style={[styles.pill, { backgroundColor: theme.colors.surface }]}>
        {phase === 'refreshing' ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : phase === 'done' ? (
          <>
            <Icon source="check" size={16} color={theme.colors.primary} />
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>Up to date</Text>
          </>
        ) : (
          <Animated.View style={{ transform: [{ rotate: ready }] }}>
            <Icon source="arrow-down" size={18} color={theme.colors.onSurfaceVariant} />
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 1 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 36,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 18,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  label: { fontFamily: Fonts.medium, fontSize: 13, lineHeight: 16 },
});
