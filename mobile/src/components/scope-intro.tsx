import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

import { useAppColors } from '@/constants/app-colors';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import type { ChannelFilter } from '@/data/overview';
import { useBusiness } from '@/hooks/use-business';

/**
 * Keeps the user aware of the store / channel scope everything is showing,
 * without repeating itself:
 *
 * - Once per session (a cold start, or back after 30+ minutes in the
 *   background), the first page that follows the scope opens on a blank
 *   page with the scope — the channel's icon on a tile and "In-store •
 *   2 stores" under it — which then glides into the header's scope line,
 *   top left, as the page fades in.
 * - After that, whenever the scope on screen changes (a new scope applied,
 *   or a page that shows it differently, e.g. Overview's All channels →
 *   Payments' In-store), the header's scope line pulses lime once.
 *
 * Tapping skips the intro; with Reduce Motion on it fades instead of moving.
 */

/** Back in the app after this long counts as a new session. */
const NEW_SESSION_AFTER_MS = 30 * 60 * 1000;
/** Lets the splash finish first. */
const START_DELAY_MS = 400;
const HOLD_MS = 900;
const ENTER_MS = 360;
const EXIT_MS = 560;
// M3 emphasized easings.
const EMPHASIZED = Easing.bezier(0.2, 0, 0, 1);
const EMPHASIZED_DECELERATE = Easing.bezier(0.05, 0.7, 0.1, 1);

const CHANNEL_ICONS: Record<ChannelFilter, string> = { all: 'squares-four', 'in-store': 'storefront', online: 'globe' };

type Rect = { x: number; y: number; width: number; height: number };
type Phase = 'pending' | 'playing' | 'done';

type ScopeIntroContextValue = {
  phase: Phase;
  /** The header's scope line, in window coordinates: where the intro lands. */
  setAnchor: (rect: Rect) => void;
  /** 0–1: the scope line's lime pulse. */
  highlight: Animated.Value;
  /** Notes the scope now on screen; pulses the scope line if it differs from the last one seen. */
  see: (scope: string) => void;
  pulse: () => void;
};

const ScopeIntroContext = createContext<ScopeIntroContextValue | null>(null);

type ScopeIntroProviderProps = {
  /** The current page follows the scope (a tab root with the switcher): the intro can play here. */
  scopedPage: boolean;
  /** Only Overview shows "All channels". */
  allowAllChannels: boolean;
  children: ReactNode;
};

export function ScopeIntroProvider({ scopedPage, allowAllChannels, children }: ScopeIntroProviderProps) {
  const theme = useTheme();
  const business = useBusiness();
  const [phase, setPhase] = useState<Phase>('pending');
  const [anchor, setAnchor] = useState<Rect | null>(null);
  const [highlight] = useState(() => new Animated.Value(0));
  const lastSeen = useRef<string | null>(null);

  const pulse = () => {
    highlight.stopAnimation();
    highlight.setValue(0);
    Animated.sequence([
      Animated.timing(highlight, { toValue: 1, duration: 180, easing: EMPHASIZED_DECELERATE, useNativeDriver: false }),
      Animated.delay(500),
      Animated.timing(highlight, { toValue: 0, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: false }),
    ]).start();
  };

  // A long break in the background starts a new session: the intro plays again on the next scoped page.
  useEffect(() => {
    let backgroundedAt: number | null = null;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') backgroundedAt = Date.now();
      if (state === 'active' && backgroundedAt !== null) {
        if (Date.now() - backgroundedAt > NEW_SESSION_AFTER_MS) setPhase('pending');
        backgroundedAt = null;
      }
    });
    return () => subscription.remove();
  }, []);

  const channel = allowAllChannels ? business.channel : business.specificChannel;
  const label = business.scopeText(allowAllChannels).split(' · ').join(' • ');
  const playing = phase === 'pending' && scopedPage ? true : phase === 'playing';

  return (
    <ScopeIntroContext.Provider
      value={{
        phase,
        setAnchor,
        highlight,
        pulse,
        see: (scope) => {
          // Until the intro has played, it shows the scope itself; after it, only a change is worth a pulse.
          if (phase === 'done' && lastSeen.current !== null && lastSeen.current !== scope) pulse();
          lastSeen.current = scope;
        },
      }}>
      {children}
      {playing ? (
        <IntroOverlay
          icon={CHANNEL_ICONS[channel]}
          label={label}
          anchor={anchor}
          background={theme.colors.background}
          onStart={() => {
            setPhase('playing');
            lastSeen.current = label;
          }}
          onLanded={pulse}
          onDone={() => setPhase('done')}
        />
      ) : null}
    </ScopeIntroContext.Provider>
  );
}

type IntroOverlayProps = {
  icon: string;
  label: string;
  anchor: Rect | null;
  background: string;
  onStart: () => void;
  onLanded: () => void;
  onDone: () => void;
};

function IntroOverlay({ icon, label, anchor, background, onStart, onLanded, onDone }: IntroOverlayProps) {
  const theme = useTheme();
  const [enter] = useState(() => new Animated.Value(0));
  const [exit] = useState(() => new Animated.Value(0));
  const [group, setGroup] = useState<Rect | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lime = useAppColors().highlight;

  const leave = () => {
    if (leaving) return;
    setLeaving(true);
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(exit, { toValue: 1, duration: EXIT_MS, easing: EMPHASIZED, useNativeDriver: true }).start(() => {
      onLanded();
      onDone();
    });
  };

  useEffect(() => {
    onStart();
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion, () => {});
    const start = setTimeout(() => {
      Animated.timing(enter, { toValue: 1, duration: ENTER_MS, easing: EMPHASIZED_DECELERATE, useNativeDriver: true }).start();
      timer.current = setTimeout(leave, ENTER_MS + HOLD_MS);
    }, START_DELAY_MS);
    return () => {
      clearTimeout(start);
      if (timer.current) clearTimeout(timer.current);
    };
    // Runs once, when the intro mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Glides from the screen's centre into the header's scope line, shrinking to its height.
  const target = anchor && group && !reduceMotion
    ? {
        // Its shrunk left edge lands on the line's start.
        dx: anchor.x + (group.width * landingScale(anchor, group)) / 2 - (group.x + group.width / 2),
        dy: anchor.y + anchor.height / 2 - (group.y + group.height / 2),
        scale: landingScale(anchor, group),
      }
    : { dx: 0, dy: 0, scale: reduceMotion ? 1 : 0.9 };

  return (
    <Pressable
      onPress={leave}
      accessibilityRole="button"
      accessibilityLabel={`Viewing ${label.replace(' • ', ', ')}. Tap to continue`}
      style={StyleSheet.absoluteFill}>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: background, opacity: exit.interpolate({ inputRange: [0, 0.25, 1], outputRange: [1, 1, 0] }) }]}
      />
      <View pointerEvents="none" style={styles.center}>
        <Animated.View
          onLayout={(event) => setGroup(event.nativeEvent.layout)}
          style={[
            styles.group,
            {
              opacity: Animated.multiply(enter, exit.interpolate({ inputRange: [0, 0.55, 1], outputRange: [1, 1, 0] })),
              transform: [
                { translateX: exit.interpolate({ inputRange: [0, 1], outputRange: [0, target.dx] }) },
                { translateY: exit.interpolate({ inputRange: [0, 1], outputRange: [0, target.dy] }) },
                { scale: Animated.multiply(enter.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }), exit.interpolate({ inputRange: [0, 1], outputRange: [1, target.scale] })) },
              ],
            },
          ]}>
          <View style={[styles.tile, { backgroundColor: lime }]}>
            <Icon source={`${icon}-fill`} size={32} color={theme.colors.onSurface} />
          </View>
          <View style={styles.text}>
            <Text style={[styles.caption, { color: theme.colors.onSurfaceVariant }]}>VIEWING</Text>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>{label}</Text>
          </View>
        </Animated.View>
      </View>
    </Pressable>
  );
}

/**
 * For the header's scope line: where the intro lands (measure the line with
 * `ref` + `onLayout`), and the lime pulse to draw behind it. Pass the scope
 * shown: the line pulses whenever it differs from the scope last on screen.
 */
export function useScopeLine(scope: string | undefined) {
  const context = useContext(ScopeIntroContext);
  const ref = useRef<View>(null);
  const phase = context?.phase;

  useEffect(() => {
    if (scope) context?.see(scope);
    // Only when the scope on screen (or the intro's phase) changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, phase]);

  return {
    ref,
    onLayout: () => ref.current?.measureInWindow((x, y, width, height) => context?.setAnchor({ x, y, width, height })),
    highlight: context?.highlight,
  };
}

/** The intro shrinks to the scope line's height as it lands. */
function landingScale(anchor: Rect, group: Rect) {
  return Math.max(0.12, anchor.height / group.height);
}

const TILE_SIZE = 72;

const styles = StyleSheet.create({
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', padding: 32 },
  group: { alignItems: 'center', gap: 16 },
  tile: { width: TILE_SIZE, height: TILE_SIZE, borderRadius: Shape.max, alignItems: 'center', justifyContent: 'center' },
  text: { alignItems: 'center', gap: 4 },
  caption: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
  label: { fontFamily: Fonts.semiBold, fontSize: 20, lineHeight: 28, textAlign: 'center' },
});
