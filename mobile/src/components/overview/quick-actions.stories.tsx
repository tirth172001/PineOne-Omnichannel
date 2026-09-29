import type { Meta, StoryObj } from '@storybook/react-native';

import { QuickActions } from './quick-actions';

const meta = {
  title: 'PineOne/Overview/QuickActions',
  component: QuickActions,
  parameters: {
    docs: {
      description: {
        component:
          "Overview's quick actions: the everyday jobs as labelled chips (Create payment link, Refund a payment, Download a report) in the same sideways row the listing pages use.",
      },
    },
  },
} satisfies Meta<typeof QuickActions>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
