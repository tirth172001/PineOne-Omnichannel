import type { Preview } from '@storybook/react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

/**
 * Paints every story on the app's own light background. Storybook's UI follows
 * the OS color scheme, so without this, stories (which use the light-only
 * PineOne theme, e.g. onSurface text) render dark-on-dark when the OS is in dark mode.
 */
function StoryCanvas({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return <View style={{ flex: 1, padding: 16, backgroundColor: theme.colors.background }}>{children}</View>;
}

const preview: Preview = {
  decorators: [
    (Story) => (
      <StoryCanvas>
        <Story />
      </StoryCanvas>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
