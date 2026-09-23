import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { SplitButton } from '@/components/material3/split-button';

function SplitButtonDemo({ variant }: { variant?: 'filled' | 'tonal' }) {
  return (
    // Tall enough for the menu to open inside the preview.
    <View style={{ height: 220 }}>
      <SplitButton
        variant={variant}
        label="Download CSV"
        icon="download-simple"
        onPress={() => {}}
        options={[
          { label: 'Download PDF', icon: 'file-pdf', onPress: () => {} },
          { label: 'Download XLSX', icon: 'file-xls', onPress: () => {} },
          { label: 'Email report', icon: 'envelope-simple', onPress: () => {} },
        ]}
      />
    </View>
  );
}

const meta = {
  title: 'Material3/SplitButton',
  component: SplitButtonDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 Expressive guidance: a default action plus a menu of closely related alternatives, e.g. "Download CSV" with PDF/XLSX in the menu. Use it when one option is clearly the most common. If all the options are equally likely, use a single menu button instead. Built in-house (src/components/material3/split-button.tsx).',
      },
    },
  },
} satisfies Meta<typeof SplitButtonDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Filled: Story = { args: { variant: 'filled' } };

export const Tonal: Story = { args: { variant: 'tonal' } };
