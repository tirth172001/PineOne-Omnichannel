import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { Surface, Text } from 'react-native-paper';

function SurfaceDemo() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {[0, 1, 2, 3, 4, 5].map((elevation) => (
        <Surface key={elevation} elevation={elevation as 0 | 1 | 2 | 3 | 4 | 5} style={{ width: 72, height: 72, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="labelSmall">{elevation}</Text>
        </Surface>
      ))}
    </View>
  );
}

const meta = {
  title: 'Material3/Surface',
  component: SurfaceDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: elevation communicates hierarchy, not decoration — reserve higher levels for temporary, overlaying surfaces (menus, dialogs) rather than permanent page content, where flat surfaces separated by color (see the Colors section) usually read more cleanly.',
      },
    },
  },
} satisfies Meta<typeof SurfaceDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
