import type { Meta, StoryObj } from '@storybook/react-native';

import { SalesHero } from './sales-hero';

const meta = {
  title: 'PineOne/Overview/SalesHero',
  component: SalesHero,
  parameters: {
    docs: {
      description: {
        component:
          "Overview's hero, sales first: collected today as the one large figure (ⓘ explains what it counts), payments and success rate in one quiet line, and when the money reaches the bank.",
      },
    },
  },
  args: {
    collected: 660365,
    count: 16,
    failedCount: 8,
    settling: 17795.66,
    nextSettlement: 'Tomorrow · 03:00 PM',
    scope: 'All channels · Koramangala',
    onPressSettlement: () => {},
  },
} satisfies Meta<typeof SalesHero>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
