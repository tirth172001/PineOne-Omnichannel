import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, List, Text, useTheme } from 'react-native-paper';

import { BottomSheet } from '@/components/material3/bottom-sheet';
import { concentric, Shape } from '@/constants/shape';

// Storybook's web canvas is shorter than a phone screen, so the demo area is
// pinned to a height that fits it.
const PREVIEW_HEIGHT = 400;
// Rows sit 8dp inside the sheet, so their radius is concentric with it.
const SHEET_GUTTER = 8;
const ROW_STYLE = { borderRadius: concentric(Shape.max, SHEET_GUTTER), paddingLeft: 16 };

function SheetContent() {
  return (
    <View style={{ paddingHorizontal: SHEET_GUTTER }}>
      <Text variant="titleMedium" style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        Share receipt
      </Text>
      <List.Item style={ROW_STYLE} title="WhatsApp" left={(props) => <List.Icon {...props} icon="whatsapp-logo" />} onPress={() => {}} />
      <List.Item style={ROW_STYLE} title="SMS" left={(props) => <List.Icon {...props} icon="chat-text" />} onPress={() => {}} />
      <List.Item style={ROW_STYLE} title="Email" left={(props) => <List.Icon {...props} icon="envelope-simple" />} onPress={() => {}} />
    </View>
  );
}

function ModalSheetDemo() {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ height: PREVIEW_HEIGHT, backgroundColor: theme.colors.background }}>
      <Button mode="contained" icon="share-network" onPress={() => setVisible(true)} style={{ alignSelf: 'flex-start' }}>
        Share receipt
      </Button>
      <BottomSheet variant="modal" height={280} visible={visible} onDismiss={() => setVisible(false)}>
        <SheetContent />
      </BottomSheet>
    </View>
  );
}

function StandardSheetDemo() {
  const theme = useTheme();

  return (
    <View style={{ height: PREVIEW_HEIGHT, backgroundColor: theme.colors.background }}>
      <Text variant="bodyMedium">Drag the sheet or tap its handle. The content behind it stays interactive.</Text>
      <BottomSheet variant="standard" height={280} collapsedHeight={96}>
        <SheetContent />
      </BottomSheet>
    </View>
  );
}

const meta = {
  title: 'Material3/BottomSheet',
  component: ModalSheetDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: supplementary content anchored to the bottom of the screen. A modal sheet (with scrim) is for a short, focused task such as share or filter options, and replaces a menu or dialog on mobile. A standard sheet stays alongside the main content so both can be used, e.g. a map with a list. Always include a drag handle. Built in-house (src/components/material3/bottom-sheet.tsx).',
      },
    },
  },
} satisfies Meta<typeof ModalSheetDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Modal: Story = {};

export const Standard: Story = {
  render: () => <StandardSheetDemo />,
};
