import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';

import { GenerateReportSheet } from './generate-report-sheet';
import { ReportCatalog } from './report-catalog';
import { ReportListing } from './report-listing';
import { ScheduleReportSheet } from './schedule-report-sheet';

const meta = {
  title: 'PineOne/Reports',
  component: ReportCatalog,
  args: { onGenerate: () => {} },
  parameters: {
    docs: {
      description: {
        component: 'Reports module (web: ReportsContent): the report catalog, History / Schedule listings, and the generate and schedule panels.',
      },
    },
  },
} satisfies Meta<typeof ReportCatalog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Catalog: Story = {};

export const History: Story = { render: () => <ReportListing tab="history" /> };

export const Schedule: Story = { render: () => <ReportListing tab="schedule" /> };

function PanelsDemo() {
  const [panel, setPanel] = useState<'transaction' | 'settlement' | 'schedule' | null>(null);
  return (
    <View style={{ gap: 12, alignItems: 'flex-start' }}>
      <Button mode="outlined" onPress={() => setPanel('transaction')}>
        Transaction report
      </Button>
      <Button mode="outlined" onPress={() => setPanel('settlement')}>
        Settlement report
      </Button>
      <Button mode="outlined" onPress={() => setPanel('schedule')}>
        Schedule a report
      </Button>
      <GenerateReportSheet
        visible={panel === 'transaction' || panel === 'settlement'}
        onDismiss={() => setPanel(null)}
        kind={panel === 'settlement' ? 'settlement' : 'transaction'}
        title={panel === 'settlement' ? 'Merchant payout report' : 'All transaction reports'}
        onGenerated={() => {}}
      />
      <ScheduleReportSheet visible={panel === 'schedule'} onDismiss={() => setPanel(null)} onCreated={() => {}} />
    </View>
  );
}

export const Panels: Story = { render: () => <PanelsDemo /> };
