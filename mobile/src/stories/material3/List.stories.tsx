import type { Meta, StoryObj } from '@storybook/react-native';
import { List } from 'react-native-paper';

function ListDemo() {
  return (
    <List.Section>
      <List.Subheader>Account</List.Subheader>
      <List.Item
        title="Manage users & roles"
        left={(props) => <List.Icon {...props} icon="users" />}
        right={(props) => <List.Icon {...props} icon="caret-right" />}
      />
      <List.Item
        title="Business details"
        left={(props) => <List.Icon {...props} icon="briefcase" />}
        right={(props) => <List.Icon {...props} icon="caret-right" />}
      />
      <List.Item
        title="Settings"
        description="Refunds, webhooks, preferences"
        left={(props) => <List.Icon {...props} icon="gear" />}
        right={(props) => <List.Icon {...props} icon="caret-right" />}
      />
    </List.Section>
  );
}

const meta = {
  title: 'Material3/List',
  component: ListDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: for a scannable, vertically-repeating set of items (settings, account sections, search results). Keep each row to one primary line plus at most one supporting line — anything denser belongs in a DataTable instead.',
      },
    },
  },
} satisfies Meta<typeof ListDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
