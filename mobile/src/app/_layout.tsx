import { useFonts } from 'expo-font';
import { DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Appearance } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { paperIconSettings } from '@/components/icons';
import { paperTheme } from '@/constants/paper-theme';
import { FONT_ASSETS } from '@/constants/theme';
import { BusinessProvider } from '@/hooks/use-business';

// Force light mode regardless of system/device setting. `userInterfaceStyle: "light"`
// in app.json only takes effect in a native build (prebuild/EAS) — it's a no-op under
// Expo Go, which is how this app gets previewed here. This JS-level override is what
// actually works in Expo Go. react-native-web doesn't implement setColorScheme (see
// hooks/use-color-scheme.web.ts for the web-side equivalent) — guard it here so this
// doesn't crash the web preview. Revisit once dark mode is a designed, deliberate feature.
if (typeof Appearance.setColorScheme === 'function') {
  Appearance.setColorScheme('light');
}

// Keeps react-navigation's own chrome (headers, native screen background during
// transitions) in sync with the Paper/Material 3 theme, instead of two competing
// color systems.
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: paperTheme.colors.primary,
    background: paperTheme.colors.background,
    card: paperTheme.colors.surface,
    text: paperTheme.colors.onSurface,
    border: paperTheme.colors.outlineVariant,
    notification: paperTheme.colors.error,
  },
};

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const [fontsLoaded] = useFonts(FONT_ASSETS);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <PaperProvider theme={paperTheme} settings={paperIconSettings}>
      <ThemeProvider value={navigationTheme}>
        <BusinessProvider>
          <AnimatedSplashOverlay />
          <AppTabs />
        </BusinessProvider>
      </ThemeProvider>
    </PaperProvider>
  );
}
