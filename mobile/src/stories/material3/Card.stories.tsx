import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { Avatar, Button, Card, Text } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';

// Card (Shape.max) → avatar tile inset 16dp (Card.Title padding) and action
// buttons inset 8dp (Card.Actions padding), each concentric with the card.
const CARD_STYLE = { borderRadius: Shape.max };
const AVATAR_RADIUS = concentric(Shape.max, 16, 40);
const ACTION_RADIUS = concentric(Shape.max, 8, 40);

function CardContent() {
  return (
    <>
      <Card.Title
        title="Health & Glow, Indiranagar"
        subtitle="Store ID 10482"
        left={(props) => <Avatar.Icon {...props} icon="storefront" style={{ borderRadius: AVATAR_RADIUS }} />}
      />
      <Card.Content>
        <Text variant="bodyMedium">₹4,82,300 collected today across 1,204 transactions.</Text>
      </Card.Content>
      <Card.Actions>
        <Button style={{ borderRadius: ACTION_RADIUS }} onPress={() => {}}>
          View details
        </Button>
      </Card.Actions>
    </>
  );
}

function CardVariantsDemo() {
  return (
    <View style={{ gap: 16 }}>
      <Card mode="elevated" style={CARD_STYLE} onPress={() => {}}>
        <CardContent />
      </Card>
      <Card mode="contained" style={CARD_STYLE} onPress={() => {}}>
        <CardContent />
      </Card>
      <Card mode="outlined" style={CARD_STYLE} onPress={() => {}}>
        <CardContent />
      </Card>
    </View>
  );
}

const meta = {
  title: 'Material3/Card',
  component: CardVariantsDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: a card holds content and actions about one subject. There are three types: elevated, filled (Paper’s "contained"), and outlined. Keep each card about one thing and make the whole card tappable when it leads to detail. PineOne screens use flat white cards on a grey background (elevation={0}) per the Figma reference.',
      },
    },
  },
} satisfies Meta<typeof CardVariantsDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {};

export const Elevated: Story = {
  render: () => (
    <Card mode="elevated" style={CARD_STYLE}>
      <CardContent />
    </Card>
  ),
};

export const Filled: Story = {
  render: () => (
    <Card mode="contained" style={CARD_STYLE}>
      <CardContent />
    </Card>
  ),
};

export const Outlined: Story = {
  render: () => (
    <Card mode="outlined" style={CARD_STYLE}>
      <CardContent />
    </Card>
  ),
};
