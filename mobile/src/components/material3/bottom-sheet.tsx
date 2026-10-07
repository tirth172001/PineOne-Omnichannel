import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Animated, Easing, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { TouchableRipple, useTheme } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';

type BottomSheetProps = {
  children: ReactNode;
  /** Expanded sheet height. */
  height: number;
  /**
   * `modal`: slides up over a scrim when `visible`; drag down or tap the scrim to dismiss.
   * `standard`: always present, toggles between `collapsedHeight` and `height`; content behind stays interactive.
   */
  variant?: 'modal' | 'standard';
  visible?: boolean;
  onDismiss?: () => void;
  collapsedHeight?: number;
  /** Top corner radius; children nested near the top should use concentric() of it. */
  radius?: number;
};

const EMPHASIZED_DECELERATE = Easing.bezier(0.05, 0.7, 0.1, 1);
const EMPHASIZED_ACCELERATE = Easing.bezier(0.3, 0, 0.8, 0.15);
const DISMISS_VELOCITY = 1;

/**
 * M3 bottom sheet — not in react-native-paper. Built on RN Animated +
 * PanResponder (rather than @gorhom/bottom-sheet, whose snap animation doesn't
 * run on web with our Reanimated version) so it behaves the same in Expo Go
 * and the web preview. Shape.max top corners, a 32×4 drag handle,
 * and a white surface. Renders absolutely at the bottom of its nearest
 * positioned parent — wrap in Paper's <Portal> to cover a whole screen.
 */
export function BottomSheet({
  children,
  height,
  variant = 'modal',
  visible = false,
  onDismiss,
  collapsedHeight = 96,
  radius = Shape.max,
}: BottomSheetProps) {
  const theme = useTheme();
  const modal = variant === 'modal';
  // translateY: 0 = fully expanded; `height` = fully hidden.
  const restingHidden = modal ? height : height - collapsedHeight;
  const [translateY] = useState(() => new Animated.Value(restingHidden));
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(modal ? visible : true);
  // Mount immediately on open; unmount only once the exit animation finishes.
  if (modal && visible && !mounted) setMounted(true);

  const open = modal ? visible : expanded;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: open ? 0 : restingHidden,
      duration: open ? 400 : 200,
      easing: open ? EMPHASIZED_DECELERATE : EMPHASIZED_ACCELERATE,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && modal && !open) setMounted(false);
    });
  }, [open, restingHidden, modal, translateY]);

  // Recreated with `open` so the gesture always starts from the current resting position.
  const panResponder = useMemo(() => {
    const start = open ? 0 : restingHidden;
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => translateY.setValue(Math.min(restingHidden, Math.max(0, start + g.dy))),
      onPanResponderRelease: (_, g) => {
        const draggedDown = g.dy > height * 0.3 || g.vy > DISMISS_VELOCITY;
        const draggedUp = -g.dy > height * 0.3 || -g.vy > DISMISS_VELOCITY;
        if (modal) {
          if (draggedDown) onDismiss?.();
          else Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        } else {
          const next = open ? !draggedDown : draggedUp;
          if (next === open) {
            Animated.spring(translateY, { toValue: open ? 0 : restingHidden, useNativeDriver: true }).start();
          } else {
            setExpanded(next);
          }
        }
      },
    });
  }, [open, restingHidden, height, modal, onDismiss, translateY]);

  if (!mounted) return null;

  return (
    <View style={styles.host} pointerEvents="box-none">
      {modal ? (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: theme.colors.scrim,
              opacity: translateY.interpolate({ inputRange: [0, height], outputRange: [0.32, 0], extrapolate: 'clamp' }),
            },
          ]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessibilityLabel="Close sheet" />
        </Animated.View>
      ) : null}
      <Animated.View
        accessibilityViewIsModal={modal}
        style={[
          styles.sheet,
          {
            height,
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
            // White like the app's cards, not M3's tinted surface (which reads green with our seed).
            backgroundColor: theme.colors.surface,
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}>
        <TouchableRipple
          onPress={modal ? undefined : () => setExpanded((prev) => !prev)}
          accessibilityRole={modal ? undefined : 'button'}
          accessibilityLabel={modal ? undefined : expanded ? 'Collapse sheet' : 'Expand sheet'}
          style={[styles.handleArea, { borderRadius: concentric(radius, 0) }]}>
          <View style={[styles.handle, { backgroundColor: theme.colors.onSurfaceVariant }]} />
        </TouchableRipple>
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Clips the sheet to its parent so the hidden/collapsed part never spills outside it.
  host: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  handleArea: { alignItems: 'center', paddingVertical: 16 },
  handle: { width: 32, height: 4, borderRadius: 2, opacity: 0.4 },
  content: { flex: 1 },
});
