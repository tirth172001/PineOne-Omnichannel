import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { Shape } from '@/constants/shape';

type LoadingIndicatorProps = {
  size?: number;
  /** Adds a primaryContainer circle behind the indicator, for use on top of busy content. */
  contained?: boolean;
  accessibilityLabel?: string;
};

/**
 * M3 Expressive loading indicator — not in react-native-paper. The real spec
 * morphs through a sequence of M3 shapes (cookie, pentagon, pill…); this is a
 * lightweight approximation that rotates while its corners morph between a
 * rounded square and a circle. For short waits (under ~5s) where there's no
 * measurable progress, e.g. pull-to-refresh; for known progress use the linear/circular ProgressIndicators.
 */
export function LoadingIndicator({ size = 48, contained = false, accessibilityLabel = 'Loading' }: LoadingIndicatorProps) {
  const theme = useTheme();
  const [spin] = useState(() => new Animated.Value(0));
  const [morph] = useState(() => new Animated.Value(0));
  const shapeSize = size * 0.6;

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1500, easing: Easing.linear, useNativeDriver: false })
    );
    const morphLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(morph, { toValue: 1, duration: 650, easing: Easing.bezier(0.2, 0, 0, 1), useNativeDriver: false }),
        Animated.timing(morph, { toValue: 0, duration: 650, easing: Easing.bezier(0.2, 0, 0, 1), useNativeDriver: false }),
      ])
    );
    spinLoop.start();
    morphLoop.start();
    return () => {
      spinLoop.stop();
      morphLoop.stop();
    };
  }, [spin, morph]);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.container,
        { width: size, height: size, borderRadius: Math.min(size / 2, Shape.max) },
        contained && { backgroundColor: theme.colors.primaryContainer },
      ]}>
      <Animated.View
        style={{
          width: shapeSize,
          height: shapeSize,
          backgroundColor: contained ? theme.colors.onPrimaryContainer : theme.colors.primary,
          borderRadius: morph.interpolate({ inputRange: [0, 1], outputRange: [shapeSize * 0.28, shapeSize / 2] }),
          transform: [
            { rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
            { scale: morph.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] }) },
          ],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
