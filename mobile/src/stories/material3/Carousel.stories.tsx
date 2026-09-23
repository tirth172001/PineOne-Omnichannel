import type { Meta, StoryObj } from '@storybook/react-native';
import { useTheme } from 'react-native-paper';

import { Carousel, type CarouselItem } from '@/components/material3/carousel';

function useItems(): CarouselItem[] {
  const { colors } = useTheme();
  return [
    { key: 'amex', title: 'Accept Amex', subtitle: '65% of nearby merchants do', color: colors.primaryContainer, onColor: colors.onPrimaryContainer },
    { key: 'links', title: 'Payment links', subtitle: 'Get paid over WhatsApp', color: colors.secondaryContainer, onColor: colors.onSecondaryContainer },
    { key: 'pos', title: 'In-store POS', subtitle: 'Tap, dip, or scan', color: colors.tertiaryContainer, onColor: colors.onTertiaryContainer },
    { key: 'emi', title: 'Card EMI', subtitle: 'Bigger baskets', color: colors.primary, onColor: colors.onPrimary },
    { key: 'intl', title: 'Cross-border', subtitle: 'Sell worldwide', color: colors.secondary, onColor: colors.onSecondary },
  ];
}

function CarouselDemo({ layout }: { layout?: 'multi-browse' | 'hero' | 'uncontained' }) {
  const items = useItems();
  return <Carousel items={items} layout={layout} />;
}

const meta = {
  title: 'Material3/Carousel',
  component: CarouselDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: a scrollable collection of visual items, such as product promos or offers. Multi-browse shows several items at once, hero puts one item in focus with a peek of the next, and uncontained scrolls freely at a fixed size. Don’t put essential content only in a carousel, because later items are easy to miss. Swipe or tap an item to advance. Built in-house (src/components/material3/carousel.tsx).',
      },
    },
  },
} satisfies Meta<typeof CarouselDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MultiBrowse: Story = { args: { layout: 'multi-browse' } };

export const Hero: Story = { args: { layout: 'hero' } };

export const Uncontained: Story = { args: { layout: 'uncontained' } };
