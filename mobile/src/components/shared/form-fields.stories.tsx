import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

import type { DateRange } from './date-range-filter';
import { ChoiceControl, CollapsibleSection, DateRangeField, FormField, FormTextInput, SelectField } from './form-fields';

function FormDemo() {
  const [name, setName] = useState('All transaction reports');
  const [range, setRange] = useState<DateRange>();
  const [zone, setZone] = useState('all');
  const [format, setFormat] = useState('Excel');
  const [email, setEmail] = useState(true);

  return (
    <View style={{ gap: 16 }}>
      <FormField label="Save report as">
        <FormTextInput value={name} onChangeText={setName} accessibilityLabel="Save report as" />
      </FormField>
      <FormField label="Select date range for report">
        <DateRangeField value={range} onChange={setRange} />
      </FormField>
      <FormField label="Zone" required>
        <SelectField
          value={zone}
          onValueChange={setZone}
          options={[{ value: 'all', label: 'All zones' }, ...['North', 'South'].map((z) => ({ value: z, label: z }))]}
          accessibilityLabel="Zone"
        />
      </FormField>
      <FormField label="File format" required>
        <View style={{ flexDirection: 'row', gap: 8, marginLeft: -8 }}>
          {['Excel', 'Csv'].map((option) => (
            <ChoiceControl key={option} type="radio" label={option} checked={format === option} onPress={() => setFormat(option)} />
          ))}
          <ChoiceControl type="checkbox" label="Email" checked={email} onPress={() => setEmail(!email)} />
        </View>
      </FormField>
      <CollapsibleSection title="Select filters">
        <Text variant="bodyMedium">Collapsible content</Text>
      </CollapsibleSection>
    </View>
  );
}

const meta = {
  title: 'PineOne/Shared/Form fields',
  component: FormDemo,
  parameters: {
    docs: {
      description: {
        component:
          'Form controls for panels (web: Label + Input / Select / RadioGroup / Checkbox / Collapsible / ReportDateRangeField). Corners default to the panel\'s concentric inner radius.',
      },
    },
  },
} satisfies Meta<typeof FormDemo>;

export default meta;

export const Fields: StoryObj<typeof meta> = {};
