import { registerRootComponent } from 'expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { view } from './storybook.requires';
import { withThemeProviders } from './with-theme-providers';

/**
 * This file is user-editable.
 *
 * Use it as your React Native Storybook entrypoint and wrap `StorybookUIRoot`
 * with application decorators/providers (theme, i18n, state, navigation, etc).
 *
 * Wrapped with our own PaperProvider/Inter Display fonts (withThemeProviders) so every
 * story renders with PineOne's actual Material 3 theme applied, not
 * Storybook's own default look — see .scratch/mobile-app/map.md.
 */
const StorybookUIRoot = view.getStorybookUI({
  shouldPersistSelection: true,
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
});

registerRootComponent(withThemeProviders(StorybookUIRoot));
