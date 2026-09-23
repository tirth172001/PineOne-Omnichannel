import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { List, Switch } from 'react-native-paper';

function SwitchDemo() {
  const [refunds, setRefunds] = useState(true);
  const [alerts, setAlerts] = useState(false);

  return (
    <List.Section>
      <List.Item
        title="Auto-approve refunds"
        description="Under ₹5,000"
        right={() => <Switch value={refunds} onValueChange={setRefunds} />}
      />
      <List.Item
        title="Settlement alerts"
        description="Push notification on every payout"
        right={() => <Switch value={alerts} onValueChange={setAlerts} />}
      />
      <List.Item title="International cards" description="Requires KYC upgrade" right={() => <Switch value={false} disabled />} />
    </List.Section>
  );
}

const meta = {
  title: 'Material3/Switch',
  component: SwitchDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: turns a single setting on or off, and the change takes effect right away with no Save button. If the change needs confirmation or a submit step, use a Checkbox. Note: Paper’s Switch wraps the platform switch, so on Android it looks like the native Material switch rather than the exact M3 spec.',
      },
    },
  },
} satisfies Meta<typeof SwitchDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
