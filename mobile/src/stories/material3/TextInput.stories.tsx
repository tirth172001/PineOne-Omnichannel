import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';

function TextInputDemo() {
  const [flat, setFlat] = useState('');
  const [outlined, setOutlined] = useState('');
  const [withIcon, setWithIcon] = useState('');

  return (
    <View style={{ gap: 16 }}>
      <TextInput mode="flat" label="Flat (filled)" value={flat} onChangeText={setFlat} />
      <TextInput mode="outlined" label="Outlined" value={outlined} onChangeText={setOutlined} />
      <TextInput
        mode="outlined"
        label="Search transactions"
        value={withIcon}
        onChangeText={setWithIcon}
        left={<TextInput.Icon icon="magnifying-glass" />}
      />
      <TextInput mode="outlined" label="Disabled" value="Read only" disabled />
    </View>
  );
}

const meta = {
  title: 'Material3/TextInput',
  component: TextInputDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: use outlined fields on light-background surfaces where a filled/flat field would be hard to distinguish from the page; use flat fields inside already-differentiated surfaces (cards, sheets). Always label — never rely on placeholder text alone.',
      },
    },
  },
} satisfies Meta<typeof TextInputDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
