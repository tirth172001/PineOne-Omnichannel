import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

type ThemeModeContextValue = {
  /** What the user picked. */
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** What's on screen: the pick, or the device's setting for System. */
  scheme: 'light' | 'dark';
};

const STORAGE_KEY = 'pineone.themeMode';

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

/**
 * Light, Dark or System, picked in the profile panel and remembered across
 * launches. Starts on Light until a pick is made (the app's designed look).
 */
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(
      (stored) => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') setModeState(stored);
      },
      () => {}
    );
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const scheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  return <ThemeModeContext.Provider value={{ mode, setMode, scheme }}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const value = useContext(ThemeModeContext);
  if (!value) throw new Error('useThemeMode must be used inside <ThemeModeProvider>');
  return value;
}
