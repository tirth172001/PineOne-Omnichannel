import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';

import { CURRENT_USER } from '@/data/businesses';
import type { ChannelFilter } from '@/data/overview';

import { OverviewGreeting } from './overview-greeting';

function OverviewGreetingDemo() {
  const [channel, setChannel] = useState<ChannelFilter>('all');
  return (
    <OverviewGreeting userName={CURRENT_USER.name} roleLabel={CURRENT_USER.roleLabel} channel={channel} onChannelChange={setChannel} />
  );
}

const meta = {
  title: 'PineOne/Overview/Greeting',
  component: OverviewGreetingDemo,
  parameters: {
    docs: {
      description: {
        component:
          'Top of the Overview, matching the web greeting row: time-of-day greeting with the role badge, which stores the data covers (Change store opens the multi-select picker, sharing its selection with the header switcher), and the channel filter.',
      },
    },
  },
} satisfies Meta<typeof OverviewGreetingDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
