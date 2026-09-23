import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { RadioButton } from 'react-native-paper';

function RadioButtonDemo() {
  const [value, setValue] = useState('t1');

  return (
    <RadioButton.Group onValueChange={setValue} value={value}>
      <RadioButton.Item label="Instant settlement (T+0)" value="t0" position="leading" labelStyle={{ textAlign: 'left' }} />
      <RadioButton.Item label="Next day (T+1)" value="t1" position="leading" labelStyle={{ textAlign: 'left' }} />
      <RadioButton.Item label="Weekly" value="weekly" position="leading" labelStyle={{ textAlign: 'left' }} />
      <RadioButton.Item
        label="Custom (contact support)"
        value="custom"
        disabled
        position="leading"
        labelStyle={{ textAlign: 'left' }}
      />
    </RadioButton.Group>
  );
}

const meta = {
  title: 'Material3/RadioButton',
  component: RadioButtonDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: exactly one choice from a short list (2–5) where the user needs to see every option side by side. For longer lists use a menu or dropdown. For 2–5 options that change a view, use segmented buttons.',
      },
    },
  },
} satisfies Meta<typeof RadioButtonDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
