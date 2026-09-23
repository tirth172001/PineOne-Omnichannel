import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';

import { ButtonGroup, type ButtonGroupItem } from '@/components/material3/button-group';

const ITEMS: ButtonGroupItem[] = [
  { value: 'upi', label: 'UPI', icon: 'qr-code' },
  { value: 'card', label: 'Card', icon: 'credit-card' },
  { value: 'bank', label: 'Bank', icon: 'bank' },
];

function ButtonGroupDemo({ variant }: { variant?: 'standard' | 'connected' }) {
  const [value, setValue] = useState('upi');
  return <ButtonGroup items={ITEMS} value={value} onValueChange={setValue} variant={variant} />;
}

const meta = {
  title: 'Material3/ButtonGroup',
  component: ButtonGroupDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 Expressive guidance: a group of related buttons that react to each other when pressed. Standard groups are separate rounded buttons. Connected groups share edges and replace segmented buttons for single-select choices, and the selected item gets the full outer radius. Built in-house (src/components/material3/button-group.tsx) because Paper has no equivalent.',
      },
    },
  },
} satisfies Meta<typeof ButtonGroupDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = { args: { variant: 'standard' } };

export const Connected: Story = { args: { variant: 'connected' } };
