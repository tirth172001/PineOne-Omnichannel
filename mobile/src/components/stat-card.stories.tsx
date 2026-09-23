import type { Meta, StoryObj } from '@storybook/react-native';

import { StatCard } from './stat-card';

const meta = {
  title: 'PineOne/StatCard',
  component: StatCard,
} satisfies Meta<typeof StatCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TrendUp: Story = {
  args: {
    label: 'Transactions',
    amount: '₹2,34,86,400.54',
    trend: { label: '+5.2%', direction: 'up', tone: 'success' },
    linkLabel: 'View payment details',
  },
};

export const TrendDown: Story = {
  args: {
    label: 'Refunds',
    amount: '₹86,400',
    trend: { label: '234 txns', direction: 'down', tone: 'error' },
  },
};

export const WithCaption: Story = {
  args: {
    label: 'Total payout',
    amount: '₹10,00,000',
    caption: 'Net after deductions',
  },
};
