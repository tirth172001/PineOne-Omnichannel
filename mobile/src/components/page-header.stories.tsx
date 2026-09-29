import type { Meta, StoryObj } from '@storybook/react-native';
import { useMemo, useState } from 'react';
import { Animated, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { getDefaultDateRangePresets, makeDateRangeValue } from './shared/date-range-filter';
import { ListingToolbar, selectFilter } from './shared/listing';
import { HeaderControl, PageTitle, PageTopBar, ScopeSwitcherButton } from './page-header';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Status' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
];

/**
 * The header at rest (`collapsed` 0): the top bar, the large title and the
 * listing toolbar. In the app the bar floats over the scrolling page and the
 * small title takes over as the large one scrolls away.
 */
function PageHeaderDemo({ variant }: { variant: 'main' | 'inner' }) {
  const theme = useTheme();
  const [rest] = useState(() => new Animated.Value(0));
  const [barHeight, setBarHeight] = useState(0);
  const presets = useMemo(() => getDefaultDateRangePresets(), []);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(() => makeDateRangeValue(presets, '30d'));
  const [status, setStatus] = useState('all');
  const main = variant === 'main';

  return (
    <View style={{ height: 420, margin: -16, backgroundColor: theme.colors.background }}>
      <View style={{ paddingTop: barHeight, paddingHorizontal: 16, gap: 24 }}>
        <PageTitle title={main ? 'Payments' : 'Audit log'} subtitle={main ? undefined : 'Mode changes on your in-store devices'} />
        <ListingToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by any ID"
          filters={[
            { type: 'date', presets, value: date, onApply: setDate, initialPresetId: '30d' },
            selectFilter({ label: 'Status', options: STATUS_OPTIONS, value: status, onApply: setStatus }),
          ]}
          actions={[
            { label: 'Analytics', icon: 'chart-bar' },
            { label: 'Email filtered', icon: 'envelope-simple' },
            { label: 'Download filtered', icon: 'download-simple' },
          ]}
        />
      </View>
      <PageTopBar
        onLayout={(event) => setBarHeight(event.nativeEvent.layout.height)}
        leading={main ? <ScopeSwitcherButton label="In-store · Koramangala" onPress={() => {}} /> : <HeaderControl icon="arrow-left" accessibilityLabel="Back" />}
        title={main ? 'Payments' : 'Audit log'}
        replaceLeading={main}
        trailing={main ? <HeaderControl icon="plus" label="New link" accessibilityLabel="New payment link" /> : <HeaderControl icon="plus" label="New" primary accessibilityLabel="New" />}
        collapsed={rest}
        surfaceOpacity={rest}
      />
    </View>
  );
}

const meta = {
  title: 'PineOne/PageHeader',
  component: PageHeaderDemo,
  parameters: {
    docs: {
      description: {
        component:
          'The header every page shares (Figma 6254:20): a configurable leading control (the store / channel switcher on a tab page, Back on an inner page) and trailing call to action; the large left-aligned title; then search with every filter under one Filters button, and the page-level actions in a sideways-scrolling row.',
      },
    },
  },
  args: { variant: 'main' },
} satisfies Meta<typeof PageHeaderDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MainPage: Story = {};

export const InnerPage: Story = { args: { variant: 'inner' } };
