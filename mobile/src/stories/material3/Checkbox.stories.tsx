import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Checkbox } from 'react-native-paper';

const METHODS = ['UPI', 'Cards', 'Netbanking'] as const;

function CheckboxDemo() {
  const [selected, setSelected] = useState<string[]>(['UPI']);
  const all = selected.length === METHODS.length;
  const toggle = (method: string) =>
    setSelected((prev) => (prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]));

  return (
    <View>
      <Checkbox.Item
        label="All payment methods"
        status={all ? 'checked' : selected.length > 0 ? 'indeterminate' : 'unchecked'}
        onPress={() => setSelected(all ? [] : [...METHODS])}
        position="leading"
        labelStyle={{ textAlign: 'left' }}
      />
      <View style={{ paddingLeft: 32 }}>
        {METHODS.map((method) => (
          <Checkbox.Item
            key={method}
            label={method}
            status={selected.includes(method) ? 'checked' : 'unchecked'}
            onPress={() => toggle(method)}
            position="leading"
            labelStyle={{ textAlign: 'left' }}
          />
        ))}
      </View>
      <Checkbox.Item
        label="Wallets (not enabled)"
        status="unchecked"
        disabled
        position="leading"
        labelStyle={{ textAlign: 'left' }}
      />
    </View>
  );
}

const meta = {
  title: 'Material3/Checkbox',
  component: CheckboxDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: lets users pick any number of options from a list, including none. Use the indeterminate state on a parent checkbox when only some of its children are selected. For a single on/off setting that applies right away, use a Switch instead.',
      },
    },
  },
} satisfies Meta<typeof CheckboxDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
