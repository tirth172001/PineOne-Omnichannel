import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { DataTable } from 'react-native-paper';

const ROWS = [
  { id: 'TXN001', amount: '₹2,44,234.00', status: 'Settled' },
  { id: 'TXN002', amount: '₹14,134.00', status: 'In process' },
  { id: 'TXN003', amount: '₹324.00', status: 'Failed' },
];

function DataTableDemo() {
  const [page, setPage] = useState(0);

  return (
    <DataTable>
      <DataTable.Header>
        <DataTable.Title>Transaction</DataTable.Title>
        <DataTable.Title numeric>Amount</DataTable.Title>
        <DataTable.Title>Status</DataTable.Title>
      </DataTable.Header>
      {ROWS.map((row) => (
        <DataTable.Row key={row.id}>
          <DataTable.Cell>{row.id}</DataTable.Cell>
          <DataTable.Cell numeric>{row.amount}</DataTable.Cell>
          <DataTable.Cell>{row.status}</DataTable.Cell>
        </DataTable.Row>
      ))}
      <DataTable.Pagination
        page={page}
        numberOfPages={3}
        onPageChange={setPage}
        label="1-3 of 324"
      />
    </DataTable>
  );
}

const meta = {
  title: 'Material3/DataTable',
  component: DataTableDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: for comparing structured, multi-column data (transaction ledgers, settlement batches). On narrow phone widths, consider whether a List with a detail screen serves the same data better than horizontal scrolling.',
      },
    },
  },
} satisfies Meta<typeof DataTableDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
