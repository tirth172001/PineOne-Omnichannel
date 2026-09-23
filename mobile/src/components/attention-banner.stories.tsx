import type { Meta, StoryObj } from '@storybook/react-native';

import { AttentionBanner } from './attention-banner';

const meta = {
  title: 'PineOne/AttentionBanner',
  component: AttentionBanner,
} satisfies Meta<typeof AttentionBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Stay competitive — 65% of merchants in your area accept Amex',
    description: 'Enable American Express cards to avoid losing premium customers.',
    ctaLabel: 'Explore Checkout',
  },
};
