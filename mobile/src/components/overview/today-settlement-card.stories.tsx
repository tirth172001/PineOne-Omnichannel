import type { Meta, StoryObj } from '@storybook/react-native';

import { TodaySettlementCard } from './today-settlement-card';

const meta = {
  title: 'PineOne/Overview/TodaySettlementCard',
  component: TodaySettlementCard,
  parameters: {
    docs: {
      description: {
        component:
          'Overview card for today’s settlement. Same content and section order as the web Overview’s Settlements card: a Pine Labs / Partner Bank toggle, the net amount settled, then “Yet to settle” and “Next settlement”.',
      },
    },
  },
} satisfies Meta<typeof TodaySettlementCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
