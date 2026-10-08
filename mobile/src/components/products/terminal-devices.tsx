import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Text, useTheme } from 'react-native-paper';

import { AnswerHero, HERO_OVERLAP } from '@/components/listing-hero/answer-hero';
import { ListingCard } from '@/components/listing-hero/listing-card';
import { useListDates } from '@/components/listing-hero/time-scope';
import { getDefaultDateRangePresets, makeDateRangeValue } from '@/components/shared/date-range-filter';
import { DetailScreen } from '@/components/shared/detail-screen';
import { LIST_ROW_INNER_RADIUS, ListCard, ListRow, ListRowLine, ListingToolbar, selectFilter } from '@/components/shared/listing';
import { type MoreFilterSelection } from '@/components/shared/more-filters';
import { DayGroupedList, dayTotals, displayTimestamp, groupByDay, sortNewestFirst } from '@/components/shared/day-groups';
import { LazyListFooter, useLazyList } from '@/components/shared/lazy-list';
import { PANEL_PADDING, PanelSheet, SHEET_BUTTON, SheetRow, SheetSection } from '@/components/shared/panel-sheet';
import { DotStatusBadge } from '@/components/shared/status';
import { TabScreen } from '@/components/tab-screen';
import { LISTING_HERO_LAYOUT } from '@/constants/experiments';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { CURRENT_USER } from '@/data/businesses';
import { parseDisplayDate } from '@/data/transactions';
import {
  DEVICE_MODELS,
  type DeviceMode,
  formatTime,
  type DeviceAuditRow,
  getAuditRows,
  getDeviceRows,
  MONTHS,
  recordModeChange,
  type TerminalDeviceRow,
  toggleDeviceStatus,
} from '@/data/terminal-devices';
import { useToast } from '@/hooks/use-toast';

import { TerminalImage } from './terminal-image';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All status' },
  { value: 'standalone', label: 'Standalone' },
  { value: 'integrated', label: 'Integrated' },
] as const;

// The hero layout names the existing "Status" filter for what it is (mode), and adds a real status.
const MODE_OPTIONS = [
  { value: 'all', label: 'All modes' },
  { value: 'standalone', label: 'Standalone' },
  { value: 'integrated', label: 'Integrated' },
] as const;
const DEVICE_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
] as const;

const MODEL_FILTER = [
  { id: 'model', label: 'Hardware model', display: 'card' as const, options: DEVICE_MODELS.map((model) => ({ id: model, label: model })) },
];

const PILL_HEIGHT = 24;

/** Outlined mode label with a dot (web: ModePill — primary dot for Integrated). */
export function ModePill({ mode, radius = LIST_ROW_INNER_RADIUS }: { mode: DeviceMode; radius?: number }) {
  const theme = useTheme();
  return (
    <View style={[styles.pill, { borderRadius: Math.min(radius, PILL_HEIGHT / 2), borderColor: theme.colors.outlineVariant }]}>
      <View style={[styles.dot, { backgroundColor: mode === 'Integrated' ? theme.colors.primary : theme.colors.outline }]} />
      <Text variant="labelMedium">{mode}</Text>
    </View>
  );
}

/**
 * In-store devices (web: PosTerminalsListingContent): search, date, mode and
 * hardware-model filters, and the devices as stacked records (model and
 * hardware ID, POS ID, installation, store, mode) with a ⋮ menu to change
 * mode (recorded in the audit log) or deactivate. Add new device and Audit
 * log are in the header's Manage menu.
 */
export function TerminalDevices() {
  const theme = useTheme();
  const toast = useToast();
  const presets = useMemo(() => getDefaultDateRangePresets(), []);
  const [rows, setRows] = useState<TerminalDeviceRow[]>(() => getDeviceRows());
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState(() => makeDateRangeValue(presets, 'today'));
  const [moreFilters, setMoreFilters] = useState<MoreFilterSelection>({});
  const [deviceStatus, setDeviceStatus] = useState<'all' | 'Active' | 'Inactive'>('all');
  const lazy = useLazyList();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // The devices list keeps its own dates (installed on); the hero's count is live.
  const installed = useListDates(rows, (row) => parseDisplayDate(row.installationDate, row.installationTime || '12:00 PM'), {
    subject: 'devices installed',
    presets: ['all', '30d', '90d'],
    initial: 'all',
    onChange: lazy.reset,
  });
  const muted = { color: theme.colors.onSurfaceVariant };

  const query = search.trim().toLowerCase();
  const filtered = rows.filter((row) => {
    if (status !== 'all' && row.mode.toLowerCase() !== status) return false;
    return !query || `${row.model} ${row.hardwareId} ${row.posId} ${row.storeName}`.toLowerCase().includes(query);
  });
  const loaded = filtered.slice(0, lazy.count);

  const changeMode = (device: TerminalDeviceRow) => {
    const nextMode: DeviceMode = device.mode === 'Standalone' ? 'Integrated' : 'Standalone';
    const result = recordModeChange(device.id, nextMode, CURRENT_USER.name, CURRENT_USER.roleLabel);
    if (!result) return;
    setRows((current) => current.map((row) => (row.id === device.id ? result.device : row)));
    toast(`${device.model} switched to ${nextMode}`);
  };
  const toggleStatus = (device: TerminalDeviceRow) => {
    const updated = toggleDeviceStatus(device.id);
    if (!updated) return;
    setRows((current) => current.map((row) => (row.id === device.id ? updated : row)));
    toast(`${device.model} ${updated.status === 'Active' ? 'reactivated' : 'deactivated'}`);
  };
  const addDevice = () => {
    const now = new Date();
    const newRow: TerminalDeviceRow = {
      ...rows[0],
      id: `dev-new-${Date.now()}`,
      model: 'Touch A910',
      hardwareId: `HRD-${Math.floor(100000 + Math.random() * 900000)}`,
      posId: `POS-${Math.floor(700000000 + Math.random() * 90000000)}`,
      installationDate: `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
      installationTime: formatTime(now.getHours(), now.getMinutes()),
      mode: 'Standalone',
      status: 'Active',
    };
    setRows((current) => [newRow, ...current]);
    lazy.reset();
    toast(`${newRow.model} added`);
  };

  // Four things per device — what it is, where, whether it's working, how it's set up; the rest is in its sheet.
  const renderRow = (row: TerminalDeviceRow) => (
    <ListRow
      key={row.id}
      onPress={() => setSelectedId(row.id)}
      accessibilityLabel={`${row.model}, ${row.storeName}, ${row.status}, ${row.mode}. Open details`}>
      <View style={styles.deviceRow}>
        <View style={[styles.deviceTile, { backgroundColor: theme.colors.surfaceVariant }]}>
          <TerminalImage size={40} inactive={row.status === 'Inactive'} />
        </View>
        <View style={styles.deviceText}>
          <Text variant="bodyMedium" numberOfLines={1} style={styles.medium}>
            {row.model}
          </Text>
          {/* The store is the group's heading, so the row names the device instead. */}
          <Text variant="bodySmall" numberOfLines={1} style={muted}>
            {row.posId}
          </Text>
          <View style={styles.deviceTags}>
            <DotStatusBadge label={row.status} tone={row.status === 'Active' ? 'success' : 'neutral'} radius={LIST_ROW_INNER_RADIUS} />
            <ModePill mode={row.mode} />
          </View>
        </View>
      </View>
    </ListRow>
  );
  const selected = rows.find((row) => row.id === selectedId) ?? null;
  const deviceSheet = (
    <DeviceSheet
      device={selected}
      onDismiss={() => setSelectedId(null)}
      onChangeMode={(device) => {
        changeMode(device);
      }}
      onToggleStatus={(device) => {
        toggleStatus(device);
      }}
    />
  );

  if (LISTING_HERO_LAYOUT) {
    // The listing hero experiment (constants/experiments.ts): how many devices are working right now, then the devices.
    const active = rows.filter((row) => row.status === 'Active');
    const inactive = rows.length - active.length;
    const integrated = active.filter((row) => row.mode === 'Integrated').length;
    const heroFiltered = installed.inRange.filter((row) => {
      if (deviceStatus !== 'all' && row.status !== deviceStatus) return false;
      if (status !== 'all' && row.mode.toLowerCase() !== status) return false;
      const models = moreFilters.model ?? [];
      if (models.length && !models.includes(row.model)) return false;
      return !query || `${row.model} ${row.hardwareId} ${row.posId} ${row.storeName}`.toLowerCase().includes(query);
    });
    // Grouped by store (A–Z), newest installation first within each.
    const heroLoaded = sortNewestFirst(heroFiltered, (row) => displayTimestamp(row.installationDate, row.installationTime))
      .sort((a, b) => a.storeName.localeCompare(b.storeName))
      .slice(0, lazy.count);
    return (
      <TabScreen tab="terminal-devices" actions={[{ label: 'Add new device', shortLabel: 'Add device', icon: 'plus', onPress: addDevice }]}>
        <View style={styles.heroContainer}>
          <AnswerHero
            views={[
              {
                key: 'active',
                label: 'Active devices',
                amount: 0,
                count: { value: active.length, of: rows.length },
                line: `${active.length - integrated} standalone · ${integrated} integrated${inactive ? ` · ${inactive} inactive` : ''}`,
                time: { kind: 'live' },
              },
            ]}
          />
          <ListingCard
            style={styles.overHero}
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              lazy.reset();
            }}
            searchPlaceholder="Search by device ID"
            time={installed.scope}
            suggestions={
              inactive > 0 && deviceStatus !== 'Inactive'
                ? [
                    {
                      key: 'inactive',
                      label: `${inactive} inactive`,
                      icon: 'warning-circle',
                      color: theme.colors.error,
                      onPress: () => {
                        setDeviceStatus('Inactive');
                        lazy.reset();
                      },
                    },
                  ]
                : []
            }
            filters={[
              selectFilter({
                label: 'Status',
                options: DEVICE_STATUS_OPTIONS,
                value: deviceStatus,
                onApply: (value) => {
                  setDeviceStatus(value);
                  lazy.reset();
                },
              }),
              selectFilter({
                label: 'Mode',
                options: MODE_OPTIONS,
                value: status,
                onApply: (value) => {
                  setStatus(value);
                  lazy.reset();
                },
              }),
              { type: 'more', categories: MODEL_FILTER, applied: moreFilters, onApply: setMoreFilters },
            ]}
            actions={[
              { label: 'Audit log', icon: 'file-text', onPress: () => router.push('/terminal-devices/audit-log') },
              { label: 'Download filtered', icon: 'download-simple' },
            ]}
            totals={{ all: installed.inRange.length, shown: heroFiltered.length }}
            noun={{ one: 'device', other: 'devices' }}>
            <DayGroupedList
              flat
              groups={groupByDay(heroLoaded, (row) => row.storeName)}
              totals={dayTotals(heroFiltered, (row) => row.storeName)}
              noun={{ one: 'device', other: 'devices' }}
              empty={installed.inRange.length ? 'No devices match. Try clearing the search or filters.' : 'No devices installed in these dates.'}
              renderRow={renderRow}
            />
            <LazyListFooter lazy={lazy} total={heroFiltered.length} noun="devices" />
          </ListingCard>
        </View>
        {deviceSheet}
      </TabScreen>
    );
  }

  return (
    <TabScreen
      tab="terminal-devices"
      actions={[{ label: 'Add new device', shortLabel: 'Add device', icon: 'plus', onPress: addDevice }]}>
      <ListingToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          lazy.reset();
        }}
        searchPlaceholder="Search by device ID"
        filters={[
          { type: 'date', presets, value: dateRange, onApply: setDateRange, initialPresetId: 'today' },
          selectFilter({
            label: 'Status',
            options: STATUS_OPTIONS,
            value: status,
            onApply: (value) => {
              setStatus(value);
              lazy.reset();
            },
          }),
          { type: 'more', categories: MODEL_FILTER, applied: moreFilters, onApply: setMoreFilters },
        ]}
        actions={[
          { label: 'Audit log', icon: 'file-text', onPress: () => router.push('/terminal-devices/audit-log') },
          { label: 'Download filtered', icon: 'download-simple' },
        ]}
      />
      <ListCard empty="No devices found for current filters.">
        {loaded.map(renderRow)}
      </ListCard>
      <LazyListFooter lazy={lazy} total={filtered.length} noun="devices" />
      {deviceSheet}
    </TabScreen>
  );
}

/**
 * A device's details and actions (opened from its row), in the app's sheet
 * format: the device on the sheet's grey with its status and mode, its
 * details card (IDs, store, installation), then its two actions — change
 * mode (recorded in the audit log) and deactivate / reactivate.
 */
function DeviceSheet({
  device,
  onDismiss,
  onChangeMode,
  onToggleStatus,
}: {
  device: TerminalDeviceRow | null;
  onDismiss: () => void;
  onChangeMode: (device: TerminalDeviceRow) => void;
  onToggleStatus: (device: TerminalDeviceRow) => void;
}) {
  const theme = useTheme();
  const toast = useToast();
  // Keeps the last device while the sheet slides away, so it doesn't blank mid-animation.
  const [shown, setShown] = useState<TerminalDeviceRow | null>(device);
  if (device && device !== shown) setShown(device);
  const current = device ?? shown;
  if (!current) return null;
  const nextMode: DeviceMode = current.mode === 'Standalone' ? 'Integrated' : 'Standalone';
  const active = current.status === 'Active';
  const copy = (label: string, value: string) => {
    Clipboard.setStringAsync(value).catch(() => {});
    toast(`${label} copied`);
  };
  const copyButton = (label: string, value: string) => (
    <IconButton icon="copy" size={16} onPress={() => copy(label, value)} accessibilityLabel={`Copy ${label}`} style={styles.copy} />
  );

  return (
    <PanelSheet
      visible={device !== null}
      onDismiss={onDismiss}
      title={current.model}
      height={640}
      footer={
        <View style={styles.sheetActions}>
          <Button mode="contained" icon="arrows-left-right" onPress={() => onChangeMode(current)} {...SHEET_BUTTON}>
            Change mode to {nextMode}
          </Button>
          <Button
            mode="outlined"
            icon={active ? 'power' : 'arrow-counter-clockwise'}
            onPress={() => onToggleStatus(current)}
            textColor={active ? theme.colors.error : theme.colors.onSurface}
            {...SHEET_BUTTON}
            style={[SHEET_BUTTON.style, { borderColor: theme.colors.outlineVariant }]}>
            {active ? 'Deactivate device' : 'Reactivate device'}
          </Button>
        </View>
      }>
      <View style={styles.sheetBody}>
        <View style={styles.sheetHero}>
          <TerminalImage size={96} inactive={!active} />
          <View style={styles.deviceTags}>
            <DotStatusBadge label={current.status} tone={active ? 'success' : 'neutral'} radius={LIST_ROW_INNER_RADIUS} />
            <ModePill mode={current.mode} />
          </View>
        </View>
        <SheetSection label="Details">
          <SheetRow first icon="hard-drives" title={current.hardwareId} description="Hardware ID" trailing={copyButton('Hardware ID', current.hardwareId)} />
          <SheetRow icon="cash-register" title={current.posId} description="POS ID" trailing={copyButton('POS ID', current.posId)} />
          <SheetRow icon="storefront" title={current.storeName} description={current.storeAddress} />
          <SheetRow
            icon="calendar-blank"
            title={`${current.installationDate}${current.installationTime ? `, ${current.installationTime}` : ''}`}
            description="Installed"
          />
        </SheetSection>
        <Text style={[styles.sheetNote, { color: theme.colors.onSurfaceVariant }]}>
          {current.mode === 'Integrated'
            ? 'Integrated: payments start from your billing system and come to this device.'
            : 'Standalone: payments are entered on this device directly.'}{' '}
          Mode changes are recorded in the audit log.
        </Text>
      </View>
    </PanelSheet>
  );
}

/**
 * Audit log (web: DeviceAuditLogContent): every mode change made from
 * In-store devices this session — device, who changed it, store, previous
 * and final mode, and when — with search, date and store filters.
 */
export function DeviceAuditLog() {
  const theme = useTheme();
  const presets = useMemo(() => getDefaultDateRangePresets(), []);
  const [rows] = useState(() => getAuditRows());
  const changed = useListDates(rows, (row) => parseDisplayDate(row.date, row.time), { subject: 'mode changes', presets: ['today', '7d', '30d', '90d'], initial: '30d' });
  const [search, setSearch] = useState('');
  const [store, setStore] = useState('all');
  const [dateRange, setDateRange] = useState(() => makeDateRangeValue(presets, 'today'));
  const muted = { color: theme.colors.onSurfaceVariant };
  const storeOptions = [{ value: 'all', label: 'All stores' }, ...Array.from(new Set(rows.map((row) => row.storeName))).map((name) => ({ value: name, label: name }))];

  const query = search.trim().toLowerCase();
  const filtered = rows.filter((row) => {
    if (store !== 'all' && row.storeName !== store) return false;
    return !query || `${row.hardwareId} ${row.model} ${row.changedBy} ${row.storeName}`.toLowerCase().includes(query);
  });

  const renderChange = (row: DeviceAuditRow) => (
    <ListRow key={row.id} accessibilityLabel={`${row.model} changed to ${row.finalMode} by ${row.changedBy}`}>
      <ListRowLine
        left={
          <>
            <Text variant="bodyMedium" style={styles.medium}>
              {row.model}
            </Text>
            <Text variant="bodySmall" style={muted}>
              {row.hardwareId}
            </Text>
          </>
        }
        right={
          <Text variant="bodySmall" style={muted}>
            {row.date}, {row.time}
          </Text>
        }
      />
      <View style={styles.modeChange}>
        <ModePill mode={row.previousMode} />
        <Text variant="bodyMedium" style={muted}>
          →
        </Text>
        <ModePill mode={row.finalMode} />
      </View>
      <Text variant="bodySmall" style={muted}>
        {row.changedBy} ({row.changedByRole}) · {row.storeName}
      </Text>
    </ListRow>
  );

  if (LISTING_HERO_LAYOUT) {
    // The listing format (constants/experiments.ts): one card for search, filters and dates; changes by day.
    const shown = changed.inRange.filter((row) => {
      if (store !== 'all' && row.storeName !== store) return false;
      return !query || `${row.hardwareId} ${row.model} ${row.changedBy} ${row.storeName}`.toLowerCase().includes(query);
    });
    const ordered = sortNewestFirst(shown, (row) => displayTimestamp(row.date, row.time));
    const noun = { one: 'change', other: 'changes' };
    return (
      <DetailScreen title="Audit log" fallbackHref="/terminal-devices">
        <ListingCard
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by device ID"
          time={changed.scope}
          filters={[selectFilter({ label: 'Store', options: storeOptions, value: store, onApply: setStore })]}
          actions={[{ label: 'Download', icon: 'download-simple' }]}
          totals={{ all: changed.inRange.length, shown: shown.length }}
          noun={noun}>
          <DayGroupedList
            flat
            groups={groupByDay(ordered, (row) => row.date)}
            totals={dayTotals(shown, (row) => row.date)}
            noun={noun}
            empty={!rows.length ? 'No mode changes recorded yet.' : changed.inRange.length ? 'No changes match. Try clearing the search or filters.' : 'No mode changes recorded in these dates.'}
            renderRow={renderChange}
          />
        </ListingCard>
      </DetailScreen>
    );
  }

  return (
    <DetailScreen title="Audit log" fallbackHref="/terminal-devices">
      <ListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by device ID"
        filters={[
          { type: 'date', presets, value: dateRange, onApply: setDateRange, initialPresetId: 'today' },
          selectFilter({ label: 'Store', options: storeOptions, value: store, onApply: setStore }),
        ]}
        actions={[{ label: 'Download', icon: 'download-simple' }]}
      />
      <ListCard empty="No mode changes recorded yet.">
        {filtered.map(renderChange)}
      </ListCard>
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  medium: { fontFamily: Fonts.medium },
  pill: {
    height: PILL_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  heroContainer: { gap: 16 },
  // The container's gap plus the hero's open foot.
  overHero: { marginTop: -(16 + HERO_OVERLAP) },
  deviceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deviceTile: { width: 52, height: 60, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center' },
  deviceText: { flex: 1, minWidth: 0, gap: 2 },
  deviceTags: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  sheetBody: { padding: PANEL_PADDING, gap: 16 },
  sheetHero: { alignItems: 'center', gap: 10, paddingVertical: 8 },
  sheetNote: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16, paddingHorizontal: 4 },
  sheetActions: { gap: 8 },
  copy: { margin: 0, marginRight: 8 },
  modeChange: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 2 },
});
