import type { Meta, StoryObj } from '@storybook/react-native';

import { ExploreProducts } from './explore-products';

const meta = {
  title: 'PineOne/Overview/ExploreProducts',
  component: ExploreProducts,
  parameters: {
    docs: {
      description: {
        component: 'The web Overview’s Explore products row: a View all link and the four product promo banners, scrolling horizontally.',
      },
    },
  },
} satisfies Meta<typeof ExploreProducts>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
