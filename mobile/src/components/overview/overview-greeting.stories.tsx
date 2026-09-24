import type { Meta, StoryObj } from '@storybook/react-native';

import { CURRENT_USER } from '@/data/businesses';

import { OverviewGreeting } from './overview-greeting';

const meta = {
  title: 'PineOne/Overview/Greeting',
  component: OverviewGreeting,
  args: { userName: CURRENT_USER.name, roleLabel: CURRENT_USER.roleLabel },
  parameters: {
    docs: {
      description: {
        component:
          "Top of the Overview, matching the web greeting row: time-of-day greeting with the role badge. Store and channel scope are set only in the header switcher.",
      },
    },
  },
} satisfies Meta<typeof OverviewGreeting>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
