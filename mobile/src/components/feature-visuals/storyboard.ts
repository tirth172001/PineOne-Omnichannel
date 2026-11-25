import { useEffect, useEffectEvent, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';

/**
 * A tiny storyboard for feature visuals: one clock (in milliseconds) that
 * runs 0 → `length` and loops, so every part of a scene is timed against the
 * same clock with `at()`. With Reduce Motion on, the clock stops on `poster`
 * (the frame that tells the story on its own).
 *
 *   const { t } = useStoryboard({ length: 6000, poster: 4200 });
 *   <Animated.View style={{ opacity: at(t, [600, 900], [0, 1]) }} />
 */
export function useStoryboard({
  length,
  poster,
  playing = true,
  onEnd,
}: {
  length: number;
  poster: number;
  playing?: boolean;
  /** Play once and call this at the end instead of looping (e.g. a carousel moving to its next slide). */
  onEnd?: () => void;
}) {
  const handleEnd = useEffectEvent(() => onEnd?.());
  const once = onEnd !== undefined;
  const [t] = useState(() => new Animated.Value(0));
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    if (reduceMotion || !playing) {
      t.setValue(poster);
      return;
    }
    t.setValue(0);
    const run = Animated.timing(t, { toValue: length, duration: length, easing: Easing.linear, useNativeDriver: true });
    const animation = once ? run : Animated.loop(run);
    animation.start(({ finished }) => {
      if (finished && once) handleEnd();
    });
    return () => animation.stop();
  }, [t, length, poster, reduceMotion, playing, once]);
  return { t, reduceMotion };
}

/** A value over the storyboard: `times` (ms) mapped to `values`, held before the first and after the last. */
export function at<T extends number | string>(t: Animated.Value, times: number[], values: T[]) {
  return t.interpolate({ inputRange: times, outputRange: values as number[] | string[], extrapolate: 'clamp' });
}

/** Shown from `start` (fading/rising in over `ease` ms) until `end` (fading out), for a part that appears once per loop. */
export function appear(t: Animated.Value, start: number, end: number, { ease = 300, rise = 10 }: { ease?: number; rise?: number } = {}) {
  return {
    opacity: at(t, [start, start + ease, end, end + ease], [0, 1, 1, 0]),
    transform: [{ translateY: at(t, [start, start + ease], [rise, 0]) }],
  };
}

/** Like `appear`, but popping in from slightly smaller (bubbles, cards). */
export function pop(t: Animated.Value, start: number, end: number, { ease = 320 }: { ease?: number } = {}) {
  return {
    opacity: at(t, [start, start + ease * 0.6, end, end + ease], [0, 1, 1, 0]),
    transform: [{ scale: at(t, [start, start + ease], [0.92, 1]) }],
  };
}
