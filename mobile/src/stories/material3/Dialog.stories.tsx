import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { Button, Dialog, Portal, Text } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';

// Dialog corners are capped at Shape.max (Paper's default is 28); Dialog.Actions insets its buttons 24dp.
const ACTION_RADIUS = concentric(Shape.max, 24, 40);

function DialogDemo() {
  const [visible, setVisible] = useState(true);

  return (
    <>
      <Button mode="contained" onPress={() => setVisible(true)}>
        Show dialog
      </Button>
      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)} style={{ borderRadius: Shape.max }}>
          <Dialog.Title>Delete transaction?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This action can&rsquo;t be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button style={{ borderRadius: ACTION_RADIUS }} onPress={() => setVisible(false)}>
              Cancel
            </Button>
            <Button style={{ borderRadius: ACTION_RADIUS }} onPress={() => setVisible(false)}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const meta = {
  title: 'Material3/Dialog',
  component: DialogDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: dialogs interrupt the user and demand a decision — use only for critical information or an action needing explicit confirmation (destructive actions, unsaved-changes warnings). Never use for routine confirmations; a Snackbar or inline message is usually enough.',
      },
    },
  },
} satisfies Meta<typeof DialogDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
