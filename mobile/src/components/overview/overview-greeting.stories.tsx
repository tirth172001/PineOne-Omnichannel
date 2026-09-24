import type { Meta, StoryObj } from '@storybook/react-native';

import { CURRENT_USER } from '@/data/businesses';

import { OverviewGreeting } from './overview-greeting';

const meta = {
  title: 'PineOne/Overview/Greeting',
  component: OverviewGreeting,
  args: { userName: CURRENT_USER.name },
  parameters: {
    docs: {
      description: {
        component:
          "Top of the Overview, matching the web greeting row: time-of-day greeting (the role badge is in the header). Store and channel scope are set only in the header switcher.",
      },
    },
  },
} satisfies Meta<typeof OverviewGreeting>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
