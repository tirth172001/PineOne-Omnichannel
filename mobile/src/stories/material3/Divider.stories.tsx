import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { Divider, List, Text } from 'react-native-paper';

function DividerDemo() {
  return (
    <View style={{ gap: 24 }}>
      <View style={{ gap: 8 }}>
        <Text variant="labelMedium">Full width: separates sections</Text>
        <Text variant="bodyMedium">Today’s collections</Text>
        <Divider />
        <Text variant="bodyMedium">Pending settlements</Text>
      </View>
      <View>
        <Text variant="labelMedium">Inset: separates items inside a list</Text>
        <List.Item title="UPI" description="₹3,10,200" left={(props) => <List.Icon {...props} icon="qr-code" />} />
        <Divider leftInset />
        <List.Item title="Cards" description="₹1,42,800" left={(props) => <List.Icon {...props} icon="credit-card" />} />
        <Divider leftInset />
        <List.Item title="Netbanking" description="₹29,300" left={(props) => <List.Icon {...props} icon="bank" />} />
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="labelMedium">Bold: stronger section break</Text>
        <Divider bold />
      </View>
    </View>
  );
}

const meta = {
  title: 'Material3/Divider',
  component: DividerDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: a thin line that groups content. Use full-width dividers between sections and inset dividers between items of a list. Use them sparingly, because spacing and grouping usually separate content well enough. PineOne cards rely on the grey/white contrast instead.',
      },
    },
  },
} satisfies Meta<typeof DividerDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
