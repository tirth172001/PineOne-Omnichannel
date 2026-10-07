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
          'Overview card for today’s payments (Figma 6470:685): total with faded paise over a lime glow, the payment count, the latest payments with their status (led by a channel’s share when given), and a link to the history.',
      },
    },
  },
  args: { ...TODAY_PAYMENTS },
} satisfies Meta<typeof TodayPaymentsCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithChannelShare: Story = {
  args: { channel: { label: 'In-store payments', count: 21, amount: 835168 }, recent: TODAY_PAYMENTS.recent.slice(0, 2) },
};
