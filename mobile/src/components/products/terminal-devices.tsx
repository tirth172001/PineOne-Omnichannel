import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

import { FilterMenuButton, OutlinedActionButton } from '@/components/shared/controls';
import { DateRangeFilter, getDefaultDateRangePresets, makeDateRangeValue } from '@/components/shared/date-range-filter';
import { DETAIL_FOOTER_BUTTON_RADIUS, DetailScreen } from '@/components/shared/detail-screen';
import { LIST_ROW_INNER_RADIUS, ListCard, ListRow, ListRowLine, ListingToolbar } from '@/components/shared/listing';
import { type MoreFilterSelection, MoreFilters } from '@/components/shared/more-filters';
import { LazyListFooter, useLazyList } from '@/components/shared/lazy-list';
import { RowActionsMenu } from '@/components/shared/row-actions';
import { Fonts } from '@/constants/theme';
import { CURRENT_USER } from '@/data/businesses';
import {
  DEVICE_MODELS,
  type DeviceMode,
  getAuditRows,
  getDeviceRows,
  recordModeChange,
  type TerminalDeviceRow,
  toggleDeviceStatus,
} from '@/data/terminal-devices';
import { useToast } from '@/hooks/use-toast';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All status' },
  { value: 'standalone', label: 'Standalone' },
  { value: 'integrated', label: 'Integrated' },
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
 * Terminal devices (web: PosTerminalsListingContent): search, date, mode and
 * hardware-model filters, and the devices as stacked records (model and
 * hardware ID, POS ID, installation, store, mode) with a ⋮ menu to change
 * mode (recorded in the audit log) or deactivate. Audit log and Add new
 * device are the pinned footer actions.
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
  const lazy = useLazyList();
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
    const newRow: TerminalDeviceRow = {
      ...rows[0],
      id: `dev-new-${Date.now()}`,
      model: 'Touch A910',
      hardwareId: `HRD-${Math.floor(100000 + Math.random() * 900000)}`,
      posId: `POS-${Math.floor(700000000 + Math.random() * 90000000)}`,
      installationDate: 'Just now',
      installationTime: '',
      mode: 'Standalone',
      status: 'Active',
    };
    setRows((current) => [newRow, ...current]);
    lazy.reset();
    toast(`${newRow.model} added`);
  };

  return (
    <DetailScreen
      title="Terminal devices"
      fallbackHref="/more"
      footer={
        <>
          <Button
            mode="outlined"
            icon="file-text"
            onPress={() => router.push('/more/terminal-devices/audit-log')}
            textColor={theme.colors.onSurface}
            style={[styles.footerButton, { borderColor: theme.colors.outlineVariant }]}>
            Audit log
          </Button>
          <Button mode="contained" onPress={addDevice} style={styles.footerButton}>
            Add new device
          </Button>
        </>
      }>
      <ListingToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          lazy.reset();
        }}
        searchPlaceholder="Search by device ID"
        filters={
          <>
            <DateRangeFilter presets={presets} value={dateRange} onApply={setDateRange} initialPresetId="today" />
            <FilterMenuButton
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                lazy.reset();
              }}
              options={STATUS_OPTIONS}
              accessibilityLabel="Status"
            />
            <MoreFilters categories={MODEL_FILTER} applied={moreFilters} onApply={setMoreFilters} />
          </>
        }
        actions={<OutlinedActionButton label="Download filtered" icon="download-simple" />}
      />
      <ListCard empty="No devices found for current filters.">
        {loaded.map((row) => (
          <ListRow key={row.id} accessibilityLabel={`${row.model}, ${row.hardwareId}, ${row.mode}`}>
            <ListRowLine
              left={
                <>
                  <Text variant="bodyMedium" style={styles.medium}>
                    {row.model}
                  </Text>
                  <Text variant="bodySmall" style={muted}>
                    {row.hardwareId} · {row.posId}
                  </Text>
                </>
              }
              right={
                <RowActionsMenu
                  accessibilityLabel={`Actions for ${row.model}`}
                  actions={[
                    { label: `Change mode to ${row.mode === 'Standalone' ? 'Integrated' : 'Standalone'}`, onPress: () => changeMode(row) },
                    { label: row.status === 'Active' ? 'Deactivate device' : 'Reactivate device', onPress: () => toggleStatus(row) },
                  ]}
                />
              }
            />
            <ListRowLine
              left={
                <>
                  <Text variant="bodySmall">{row.storeName}</Text>
                  <Text variant="bodySmall" style={muted} numberOfLines={1}>
                    Installed {row.installationDate}
                    {row.installationTime ? `, ${row.installationTime}` : ''}
                  </Text>
                </>
              }
              right={<ModePill mode={row.mode} />}
            />
          </ListRow>
        ))}
      </ListCard>
      <LazyListFooter lazy={lazy} total={filtered.length} noun="devices" />
    </DetailScreen>
  );
}

/**
 * Audit log (web: DeviceAuditLogContent): every mode change made from
 * Terminal devices this session — device, who changed it, store, previous
 * and final mode, and when — with search, date and store filters.
 */
export function DeviceAuditLog() {
  const theme = useTheme();
  const presets = useMemo(() => getDefaultDateRangePresets(), []);
  const [rows] = useState(() => getAuditRows());
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

  return (
    <DetailScreen title="Audit log" fallbackHref="/more/terminal-devices">
      <ListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by device ID"
        filters={
          <>
            <DateRangeFilter presets={presets} value={dateRange} onApply={setDateRange} initialPresetId="today" />
            <FilterMenuButton value={store} onValueChange={setStore} options={storeOptions} accessibilityLabel="Store" />
          </>
        }
        actions={<OutlinedActionButton label="Download" icon="download-simple" />}
      />
      <ListCard empty="No mode changes recorded yet.">
        {filtered.map((row) => (
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
        ))}
      </ListCard>
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  medium: { fontFamily: Fonts.medium },
  footerButton: { flex: 1, borderRadius: DETAIL_FOOTER_BUTTON_RADIUS },
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
  modeChange: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 2 },
});
