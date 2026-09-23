import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';

function HelperTextDemo() {
  return (
    <View style={{ gap: 4 }}>
      <TextInput mode="outlined" label="IFSC code" value="HDFC000123" error />
      <HelperText type="error" visible>
        This IFSC code doesn&rsquo;t look right.
      </HelperText>
    </View>
  );
}

const meta = {
  title: 'Material3/HelperText',
  component: HelperTextDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: pair directly under a text field for validation errors or format hints ("11-digit IFSC code"). Keep it one line where possible; error state should state what’s wrong and, ideally, how to fix it — not just "Invalid".',
      },
    },
  },
} satisfies Meta<typeof HelperTextDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
