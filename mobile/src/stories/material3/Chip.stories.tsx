import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';

function AssistChipsDemo() {
  return (
    <View style={styles.row}>
      <Chip icon="download-simple" mode="outlined" onPress={() => {}}>
        Download statement
      </Chip>
      <Chip icon="share-network" mode="outlined" onPress={() => {}}>
        Share receipt
      </Chip>
    </View>
  );
}

function FilterChipsDemo() {
  const [selected, setSelected] = useState<string[]>(['Settled']);
  const toggle = (label: string) =>
    setSelected((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));

  return (
    <View style={styles.row}>
      {['Settled', 'Pending', 'Failed', 'Refunded'].map((label) => (
        // Phosphor check via `icon` rather than showSelectedCheck, which hard-codes a Material icon.
        <Chip
          key={label}
          mode="outlined"
          icon={selected.includes(label) ? 'check' : undefined}
          selected={selected.includes(label)}
          showSelectedCheck={false}
          onPress={() => toggle(label)}>
          {label}
        </Chip>
      ))}
    </View>
  );
}

function InputChipsDemo() {
  const [emails, setEmails] = useState(['finance@healthglow.in', 'ops@healthglow.in']);

  return (
    <View style={styles.row}>
      {emails.map((email) => (
        <Chip key={email} icon="user-circle" closeIcon="x" onClose={() => setEmails((prev) => prev.filter((e) => e !== email))}>
          {email}
        </Chip>
      ))}
    </View>
  );
}

function SuggestionChipsDemo() {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="labelMedium">Suggested questions</Text>
      <View style={styles.row}>
        {['Where is my payout?', 'Raise a refund', 'Change bank account'].map((label) => (
          <Chip key={label} mode="outlined" onPress={() => {}}>
            {label}
          </Chip>
        ))}
      </View>
    </View>
  );
}

const meta = {
  title: 'Material3/Chip',
  component: FilterChipsDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: four kinds. Assist chips trigger a smart or contextual action. Filter chips narrow content (e.g. transaction status). Input chips hold user-entered items and can be removed. Suggestion chips offer dynamic replies or queries. Chips are compact and secondary, so never use one for a screen’s primary action.',
      },
    },
  },
} satisfies Meta<typeof FilterChipsDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Filter: Story = {};

export const Assist: Story = {
  render: () => <AssistChipsDemo />,
};

export const Input: Story = {
  render: () => <InputChipsDemo />,
};

export const Suggestion: Story = {
  render: () => <SuggestionChipsDemo />,
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
