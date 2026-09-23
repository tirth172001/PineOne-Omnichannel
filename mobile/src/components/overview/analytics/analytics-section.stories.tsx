import type { Meta, StoryObj } from '@storybook/react-native';
import { ScrollView } from 'react-native';

import { AnalyticsSection } from './analytics-section';

function AnalyticsSectionDemo() {
  return (
    <ScrollView style={{ height: 640 }}>
      <AnalyticsSection storeScale={1} channelScale={1} />
    </ScrollView>
  );
}

const meta = {
  title: 'PineOne/Overview/Analytics',
  component: AnalyticsSectionDemo,
  parameters: {
    docs: {
      description: {
        component:
          'The Overview’s Analytics section, matching the web: a date filter, a Customize sheet, and the checkout funnel, pay modes, payment volume, failed payments, devices, refunds and disputes cards, each with By count / By amount. Shown here for all stores and all channels, the web’s default numbers.',
      },
    },
  },
} satisfies Meta<typeof AnalyticsSectionDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllStores: Story = {};
