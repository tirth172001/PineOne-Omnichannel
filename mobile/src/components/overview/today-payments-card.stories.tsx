import type { Meta, StoryObj } from '@storybook/react-native';

import { TODAY_PAYMENTS } from '@/data/overview';

import { TodayPaymentsCard } from './today-payments-card';

const meta = {
  title: 'PineOne/Overview/TodayPaymentsCard',
  component: TodayPaymentsCard,
  parameters: {
    docs: {
      description: {
        component:
          'Overview card for today’s payments (Figma 6470:685): total with faded paise and the payment count, then the In-store / Online split (all channels) or the latest payments with their status (one channel), and a link to the history.',
      },
    },
  },
  args: { ...TODAY_PAYMENTS },
} satisfies Meta<typeof TodayPaymentsCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithChannelShare: Story = {
  args: {
    channels: [
      { kind: 'in-store', label: 'In-store payments', count: 21, amount: 835168 },
      { kind: 'online', label: 'Online payments', count: 27, amount: 1107082 },
    ],
  },
};
