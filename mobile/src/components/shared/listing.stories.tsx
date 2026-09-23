import type { Meta, StoryObj } from '@storybook/react-native';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { BankLogo } from './bank-logo';
import { BarChart, PieChart, XYChart } from './charts';
import { FilterMenuButton, OutlinedActionButton } from './controls';
import { CopyableValue } from './copyable-value';
import { DateRangeFilter, getDefaultDateRangePresets, makeDateRangeValue } from './date-range-filter';
import { DetailSections } from './detail-rows';
import { LIST_ROW_INNER_RADIUS, ListCard, ListRow, ListRowLine, ListingToolbar } from './listing';
import { type MoreFilterSelection, MoreFilters } from './more-filters';
import { PaginationBar } from './pagination-bar';
import { PanelSection, PanelSheet } from './panel-sheet';
import { DotStatusBadge, StatusPill } from './status';
import { SummaryCards } from './summary-cards';

/** A complete listing: toolbar, summary, rows and pagination — the pattern every module's list uses. */
function ListingDemo() {
  const presets = useMemo(() => getDefaultDateRangePresets(), []);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [date, setDate] = useState(() => makeDateRangeValue(presets, '30d'));
  const [more, setMore] = useState<MoreFilterSelection>({});
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);

  return (
    <View style={{ gap: 16 }}>
      <ListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by any ID"
        filters={
          <>
            <DateRangeFilter presets={presets} value={date} onApply={setDate} initialPresetId="30d" />
            <FilterMenuButton
              value={status}
              onValueChange={setStatus}
              options={[
                { value: 'all', label: 'Status' },
                { value: 'success', label: 'Success' },
                { value: 'failed', label: 'Failed' },
              ]}
              accessibilityLabel="Status"
            />
            <MoreFilters
              categories={[
                { id: 'modes', label: 'Payment modes', options: [{ id: 'upi', label: 'UPI' }, { id: 'card', label: 'Card' }] },
                { id: 'zones', label: 'Zones', display: 'badge', searchable: false, options: ['North', 'South'].map((z) => ({ id: z, label: z })) },
              ]}
              applied={more}
              onApply={setMore}
            />
          </>
        }
        actions={<OutlinedActionButton label="Download filtered" icon="download-simple" />}
      />
      <SummaryCards cards={[{ icon: 'wallet', label: 'Total volume', value: 4472500, subtext: '110 payments' }]} />
      <ListCard>
        {[
          { id: 'ORD-6001', amount: '₹9,000.00', status: 'Success', tone: 'success' as const },
          { id: 'ORD-6003', amount: '₹12,500.00', status: 'Failed', tone: 'failed' as const },
        ].map((row) => (
          <ListRow key={row.id} onPress={() => {}}>
            <ListRowLine left={<Text variant="bodyMedium">{row.id}</Text>} right={<Text variant="bodyMedium">{row.amount}</Text>} />
            <ListRowLine left={<Text variant="bodySmall">UPI · PhonePe</Text>} right={<StatusPill label={row.status} tone={row.tone} radius={LIST_ROW_INNER_RADIUS} />} />
          </ListRow>
        ))}
      </ListCard>
      <PaginationBar page={page} totalPages={11} rowsPerPage={rows} totalRows={110} onPageChange={setPage} onRowsPerPageChange={setRows} />
    </View>
  );
}

function PanelSheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: 12, alignItems: 'flex-start' }}>
      <Button mode="outlined" onPress={() => setOpen(true)}>
        Open panel
      </Button>
      <PanelSheet visible={open} onDismiss={() => setOpen(false)} title="Deductions" height={380} footer={<Button mode="contained">Apply</Button>}>
        <PanelSection>
          <Text variant="bodyMedium">A panel section</Text>
        </PanelSection>
        <PanelSection last>
          <Text variant="bodyMedium">The last section has no divider</Text>
        </PanelSection>
      </PanelSheet>
    </View>
  );
}

const meta = {
  title: 'PineOne/Shared/Listing',
  component: ListingDemo,
  parameters: {
    docs: {
      description: {
        component:
          'The shared listing pattern every module uses (web: ListingToolbar + SummaryCardGroup + table + PaginationControls): search, horizontally scrolling filters (date sheet, selects, More filters), actions, summary cards, stacked record rows, and pagination.',
      },
    },
  },
} satisfies Meta<typeof ListingDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Listing: Story = {};

export const Panel: Story = { render: () => <PanelSheetDemo /> };

export const StatusAndValues: Story = {
  render: () => (
    <View style={{ gap: 12, alignItems: 'flex-start' }}>
      <StatusPill label="Pending" tone="processing" radius={12} />
      <StatusPill label="Success" tone="success" radius={12} />
      <DotStatusBadge label="Settled" tone="success" radius={12} />
      <DotStatusBadge label="On Hold" tone="warning" radius={12} />
      <CopyableValue value="6876347862381" label="UTR: 6876347862381" variant="pill" />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {['HDFC', 'ICICI', 'AXIS', 'SBI'].map((bank) => (
          <BankLogo key={bank} bank={bank} size={32} />
        ))}
      </View>
    </View>
  ),
};

export const DetailRows: Story = {
  render: () => (
    <DetailSections
      sections={[
        { title: 'Transaction details', rows: [{ label: 'Transaction ID', value: '1525039336', copyable: true }, { label: 'Product', value: 'POS' }] },
        { title: 'Customer details', rows: [{ label: 'Customer name', value: 'Tirth Nehalkumar Trivedi' }] },
      ]}
    />
  ),
};

export const Charts: Story = {
  render: () => (
    <View style={{ gap: 24 }}>
      <XYChart type="column" categories={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']} data={[11140, 11390, 11680, 11820, 12110, 12340, 12720]} compare={[10810, 10970, 11090, 11360, 11640, 11810, 12130]} />
      <XYChart type="area" categories={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']} data={[164000, 169500, 172300, 178600, 182200, 188400, 193890]} />
      <BarChart labels={['Insufficient funds', 'Suspected fraud', 'Invalid mPIN']} data={[3.64, 0.68, 0.68]} />
      <PieChart labels={['GooglePay', 'PhonePe', 'BHIM', 'PayTM']} data={[30, 26, 26, 18]} />
    </View>
  ),
};
