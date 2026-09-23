import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { en, registerTranslation, TimePickerModal } from 'react-native-paper-dates';

registerTranslation('en', en);

function TimePickerDemo({ defaultInputType = 'picker' }: { defaultInputType?: 'picker' | 'keyboard' }) {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState({ hours: 18, minutes: 0 });

  return (
    <View style={{ gap: 12, alignItems: 'flex-start' }}>
      <Button mode="outlined" icon="clock" onPress={() => setOpen(true)}>
        Daily report time
      </Button>
      <Text variant="bodyMedium">
        {String(time.hours).padStart(2, '0')}:{String(time.minutes).padStart(2, '0')}
      </Text>
      <TimePickerModal
        locale="en"
        visible={open}
        hours={time.hours}
        minutes={time.minutes}
        defaultInputType={defaultInputType}
        onDismiss={() => setOpen(false)}
        onConfirm={(next) => {
          setOpen(false);
          setTime(next);
        }}
      />
    </View>
  );
}

const meta = {
  title: 'Material3/TimePicker',
  component: TimePickerDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: the dial picker is for choosing a time by touch. The input mode is for typing an exact time, and users can switch between the two. Use it for scheduling, such as report delivery or store hours. For a very small set of times, a menu is simpler.',
      },
    },
  },
} satisfies Meta<typeof TimePickerDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Dial: Story = { args: { defaultInputType: 'picker' } };

export const Input: Story = { args: { defaultInputType: 'keyboard' } };
