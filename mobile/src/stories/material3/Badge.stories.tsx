import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';
import { Badge, IconButton, Text } from 'react-native-paper';

function BadgedIcon({ icon, badge }: { icon: string; badge?: number | 'dot' }) {
  return (
    <View>
      <IconButton icon={icon} onPress={() => {}} />
      {badge === 'dot' ? (
        <Badge size={6} style={styles.dot} />
      ) : badge !== undefined ? (
        <Badge style={styles.count}>{badge > 999 ? '999+' : badge}</Badge>
      ) : null}
    </View>
  );
}

function BadgeDemo() {
  return (
    <View style={styles.row}>
      <View style={styles.item}>
        <BadgedIcon icon="bell" badge="dot" />
        <Text variant="labelSmall">Small (dot)</Text>
      </View>
      <View style={styles.item}>
        <BadgedIcon icon="chat-circle" badge={3} />
        <Text variant="labelSmall">Large (count)</Text>
      </View>
      <View style={styles.item}>
        <BadgedIcon icon="warning-circle" badge={1284} />
        <Text variant="labelSmall">Overflow</Text>
      </View>
    </View>
  );
}

const meta = {
  title: 'Material3/Badge',
  component: BadgeDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: shows a status or count on a navigation item or icon, like unread support replies or new disputes. Use a small dot for "something new" and a count when the number matters, capped at 999+. Don’t put badges on buttons or on content that’s already a list of items.',
      },
    },
  },
} satisfies Meta<typeof BadgeDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 32 },
  item: { alignItems: 'center', gap: 4 },
  dot: { position: 'absolute', top: 12, right: 12 },
  count: { position: 'absolute', top: 4, right: 0 },
});
