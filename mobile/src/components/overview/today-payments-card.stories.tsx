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
          'Overview card for today’s payments. Same content and section order as the web Overview’s Transactions card: total with faded paise, payment count with failures, the last three payments, and a link to the history.',
      },
    },
  },
  args: { ...TODAY_PAYMENTS },
} satisfies Meta<typeof TodayPaymentsCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoFailures: Story = { args: { failedCount: 0 } };
