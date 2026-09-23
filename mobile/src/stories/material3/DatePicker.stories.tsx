import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { DatePickerInput, DatePickerModal, en, registerTranslation } from 'react-native-paper-dates';

// Paper has no date picker. react-native-paper-dates is the pure-JS M3 picker
// built on Paper (themed by our PaperProvider, works in Expo Go and on web).
registerTranslation('en', en);

function DockedDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 8, 23));

  return (
    <DatePickerInput locale="en" label="Settlement date" value={date} onChange={setDate} inputMode="start" mode="outlined" />
  );
}

function ModalSingleDemo() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();

  return (
    <View style={{ gap: 12, alignItems: 'flex-start' }}>
      <Button mode="outlined" icon="calendar-blank" onPress={() => setOpen(true)}>
        Pick a date
      </Button>
      <Text variant="bodyMedium">{date ? date.toDateString() : 'No date selected'}</Text>
      <DatePickerModal
        locale="en"
        mode="single"
        visible={open}
        date={date}
        onDismiss={() => setOpen(false)}
        onConfirm={({ date: next }) => {
          setOpen(false);
          setDate(next);
        }}
      />
    </View>
  );
}

function ModalRangeDemo() {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<{ startDate?: Date; endDate?: Date }>({});

  return (
    <View style={{ gap: 12, alignItems: 'flex-start' }}>
      <Button mode="outlined" icon="calendar-dots" onPress={() => setOpen(true)}>
        Pick a report range
      </Button>
      <Text variant="bodyMedium">
        {range.startDate && range.endDate
          ? `${range.startDate.toDateString()} → ${range.endDate.toDateString()}`
          : 'No range selected'}
      </Text>
      <DatePickerModal
        locale="en"
        mode="range"
        visible={open}
        startDate={range.startDate}
        endDate={range.endDate}
        onDismiss={() => setOpen(false)}
        onConfirm={({ startDate, endDate }) => {
          setOpen(false);
          setRange({ startDate, endDate });
        }}
      />
    </View>
  );
}

const meta = {
  title: 'Material3/DatePicker',
  component: DockedDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: the docked (input) picker is for typing a known date, like a date of birth or an invoice date. The modal calendar is for browsing to a nearby date. Use the range picker for report and statement periods. Offer presets ("Last 7 days") as chips next to it when those ranges are common.',
      },
    },
  },
} satisfies Meta<typeof DockedDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Docked: Story = {};

export const ModalSingle: Story = {
  render: () => <ModalSingleDemo />,
};

export const ModalRange: Story = {
  render: () => <ModalRangeDemo />,
};
