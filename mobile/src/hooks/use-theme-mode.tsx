import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, useColorScheme, View } from 'react-native';

import { paperDarkTheme, paperTheme } from '@/constants/paper-theme';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeModeContextValue = {
  /** What the user picked. */
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** What's on screen: the pick, or the device's setting for System. */
  scheme: 'light' | 'dark';
  /** The device's own setting, for saying what System means right now. */
  systemScheme: 'light' | 'dark';
};

const STORAGE_KEY = 'pineone.themeMode';
// A quick fade-through, so the whole app doesn't flip colour in one frame.
const FADE_IN_MS = 140;
const FADE_OUT_MS = 240;

const background = (scheme: 'light' | 'dark') => (scheme === 'dark' ? paperDarkTheme : paperTheme).colors.background;

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

/**
 * Light, Dark or System, picked in the profile panel and remembered across
 * launches. Starts on Light until a pick is made (the app's designed look).
 * A pick that changes what's on screen fades through the new page colour
 * (skipped with Reduce motion).
 */
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [veil] = useState(() => new Animated.Value(0));
  const [veilColor, setVeilColor] = useState<string | null>(null);
  const switching = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(
      (stored) => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') setModeState(stored);
      },
      () => {}
    );
  }, []);

  const scheme = mode === 'system' ? system : mode;

  const fadeOut = () => {
    Animated.timing(veil, { toValue: 0, duration: FADE_OUT_MS, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start(({ finished }) => {
      if (!finished) return;
      switching.current = false;
      setVeilColor(null);
    });
  };

  const setMode = (next: ThemeMode) => {
    if (next === mode) return;
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
    const nextScheme = next === 'system' ? system : next;
    // A pick during a fade never waits: it lands now and the veil clears from where it is.
    if (switching.current) {
      veil.stopAnimation();
      setVeilColor(background(nextScheme));
      setModeState(next);
      fadeOut();
      return;
    }
    if (nextScheme === scheme) {
      setModeState(next);
      return;
    }
    AccessibilityInfo.isReduceMotionEnabled().then(
      (reduceMotion) => {
        if (reduceMotion) {
          setModeState(next);
          return;
        }
        switching.current = true;
        setVeilColor(background(nextScheme));
        Animated.timing(veil, { toValue: 1, duration: FADE_IN_MS, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(({ finished }) => {
          if (!finished) return;
          setModeState(next);
          fadeOut();
        });
      },
      () => setModeState(next)
    );
  };

  return (
    <ThemeModeContext.Provider value={{ mode, setMode, scheme, systemScheme: system }}>
      <View style={styles.fill}>
        {children}
        {veilColor ? <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: veilColor, opacity: veil }]} /> : null}
      </View>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const value = useContext(ThemeModeContext);
  if (!value) throw new Error('useThemeMode must be used inside <ThemeModeProvider>');
  return value;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
