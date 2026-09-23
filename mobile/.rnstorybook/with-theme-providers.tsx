import { useFonts } from 'expo-font';
import type { ComponentType } from 'react';
import { PaperProvider } from 'react-native-paper';

import { paperIconSettings } from '@/components/icons';
import { paperTheme } from '@/constants/paper-theme';
import { FONT_ASSETS } from '@/constants/theme';
import { BusinessProvider } from '@/hooks/use-business';

/**
 * Wraps the Storybook UI root with the same PaperProvider + Inter Display fonts and
 * business (org/store) context as the real app's _layout.tsx, so stories preview PineOne's actual theme rather than
 * Storybook's own default styling.
 */
export function withThemeProviders(Root: ComponentType) {
  return function ThemedStorybookRoot() {
    const [fontsLoaded] = useFonts(FONT_ASSETS);

    if (!fontsLoaded) {
      return null;
    }

    return (
      <PaperProvider theme={paperTheme} settings={paperIconSettings}>
        <BusinessProvider>
          <Root />
        </BusinessProvider>
      </PaperProvider>
    );
  };
}
