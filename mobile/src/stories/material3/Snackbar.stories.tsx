import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { Button, Snackbar } from 'react-native-paper';

function SnackbarDemo() {
  const [visible, setVisible] = useState(true);

  return (
    <>
      <Button mode="contained" onPress={() => setVisible(true)}>
        Trigger snackbar
      </Button>
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        action={{ label: 'Undo', onPress: () => setVisible(false) }}>
        Transaction marked as settled.
      </Snackbar>
    </>
  );
}

const meta = {
  title: 'Material3/Snackbar',
  component: SnackbarDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: brief, non-blocking feedback about an action just taken (undo an edit, confirm a background sync). One at a time, auto-dismisses, at most one action. Never use it to communicate something the user must act on immediately — that’s a Dialog.',
      },
    },
  },
} satisfies Meta<typeof SnackbarDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
