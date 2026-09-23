import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Checkbox, useTheme } from 'react-native-paper';

import { SIDE_SHEET_ACTION_RADIUS, SideSheet } from '@/components/material3/side-sheet';

function SideSheetDemo() {
  const theme = useTheme();
  const [visible, setVisible] = useState(true);
  const [statuses, setStatuses] = useState<string[]>(['Settled']);
  const toggle = (s: string) => setStatuses((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <View style={{ height: 400, backgroundColor: theme.colors.background, padding: 16 }}>
      <Button mode="outlined" icon="funnel-simple" onPress={() => setVisible(true)} style={{ alignSelf: 'flex-start' }}>
        Filters
      </Button>
      <SideSheet
        visible={visible}
        onDismiss={() => setVisible(false)}
        title="Filter transactions"
        width={300}
        actions={
          <>
            <Button mode="contained" style={{ borderRadius: SIDE_SHEET_ACTION_RADIUS }} onPress={() => setVisible(false)}>
              Apply
            </Button>
            <Button mode="outlined" style={{ borderRadius: SIDE_SHEET_ACTION_RADIUS }} onPress={() => setStatuses([])}>
              Clear
            </Button>
          </>
        }>
        {['Settled', 'Pending', 'Failed', 'Refunded'].map((s) => (
          <Checkbox.Item
            key={s}
            label={s}
            status={statuses.includes(s) ? 'checked' : 'unchecked'}
            onPress={() => toggle(s)}
            position="leading"
            labelStyle={{ textAlign: 'left' }}
            style={{ paddingHorizontal: 0 }}
          />
        ))}
      </SideSheet>
    </View>
  );
}

const meta = {
  title: 'Material3/SideSheet',
  component: SideSheetDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: supplementary content or controls, such as filters or a detail view, shown alongside the main content on medium and larger windows. On compact phones, use a bottom sheet instead. The modal version (shown here) dims the screen and must be dismissed. Built in-house (src/components/material3/side-sheet.tsx).',
      },
    },
  },
} satisfies Meta<typeof SideSheetDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Modal: Story = {};
