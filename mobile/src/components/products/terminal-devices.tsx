import color from 'color';
import { router } from 'expo-router';
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

import { ListingCard } from '@/components/listing-hero/listing-card';
import { useListDates } from '@/components/listing-hero/time-scope';
import { getDefaultDateRangePresets, makeDateRangeValue } from '@/components/shared/date-range-filter';
import { DetailScreen } from '@/components/shared/detail-screen';
import { initialsOf, LIST_ROW_INNER_RADIUS, ListCard, ListRow, ListRowLine, ListingToolbar, selectFilter } from '@/components/shared/listing';
import { type MoreFilterSelection } from '@/components/shared/more-filters';
import { DayGroupedList, dayTotals, displayTimestamp, groupByDay, sortNewestFirst } from '@/components/shared/day-groups';
import { LazyListFooter, useLazyList } from '@/components/shared/lazy-list';
import { PanelSheet } from '@/components/shared/panel-sheet';
import { SheetBlock, SheetButton } from '@/components/shared/sheet-parts';
import { DotStatusBadge, OutlineTag, PILL_HEIGHT } from '@/components/shared/status';
import { TabScreen } from '@/components/tab-screen';
import { LISTING_HERO_LAYOUT } from '@/constants/experiments';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { CURRENT_USER } from '@/data/businesses';
import { INITIAL_ROSTER } from '@/data/user-roster';
import { useAppColors } from '@/constants/app-colors';
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

import { TerminalPhoto } from './terminal-image';

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
 * In-store devices (Figma Manage devices 7564:69786): Audit log in the
 * header, then the date, search, filters and the devices by store. A device
 * opens its details sheet, which disables it or changes its mode.
 */
export function TerminalDevices() {
  const theme = useTheme();
  const toast = useToast();
  const presets = useMemo(() => getDefaultDateRangePresets(), []);
  const [rows, setRows] = useState<TerminalDeviceRow[]>(() => getDeviceRows());
  const { changeMode, toggleStatus } = useDeviceActions(setRows);
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
    initial: '30d',
    onChange: lazy.reset,
  });
  const muted = { color: theme.colors.onSurfaceVariant };

  const query = search.trim().toLowerCase();
  const filtered = rows.filter((row) => {
    if (status !== 'all' && row.mode.toLowerCase() !== status) return false;
    return !query || `${row.model} ${row.hardwareId} ${row.posId} ${row.storeName}`.toLowerCase().includes(query);
  });
  const loaded = filtered.slice(0, lazy.count);

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
      icon={<TerminalPhoto inactive={row.status === 'Inactive'} />}
      onPress={() => setSelectedId(row.id)}
      accessibilityLabel={`${row.model}, ${row.storeName}, ${row.status}, ${row.mode}. Open details`}>
      {/* The store is the group's heading, so the row names the device instead. */}
      <ListRowLine
        left={
          <>
            <Text numberOfLines={1} style={styles.rowTitle}>
              {row.model}
            </Text>
            <Text numberOfLines={1} style={[styles.rowId, muted]}>
              {row.hardwareId}
            </Text>
          </>
        }
        right={<DotStatusBadge label={row.status} tone={row.status === 'Active' ? 'success' : 'neutral'} />}
        centered
      />
    </ListRow>
  );
  const selected = rows.find((row) => row.id === selectedId) ?? null;
  const deviceSheet = (
    <DeviceSheet
      device={selected}
      onDismiss={() => setSelectedId(null)}
      onChangeMode={changeMode}
      onToggleStatus={toggleStatus}
    />
  );

  if (LISTING_HERO_LAYOUT) {
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
      <TabScreen tab="terminal-devices" actions={[{ label: 'Audit log', icon: '', onPress: () => router.push('/terminal-devices/audit-log') }]}>
        <ListingCard
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            lazy.reset();
          }}
          searchPlaceholder="Search device"
          time={installed.scope}
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

/** Changing a device's mode or status, shared by In-store devices and its audit log. */
function useDeviceActions(setRows: Dispatch<SetStateAction<TerminalDeviceRow[]>>) {
  const toast = useToast();
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
    toast(updated.status === 'Active' ? 'Device reactivated successfully' : 'Device deactivated successfully', { success: true });
  };
  return { changeMode, toggleStatus };
}

// Sized to Figma's flyouts: the device details, plus Changed by when opened from the Audit log.
const DETAILS_HEIGHT = 391;
/** The Changed by section: its title row and the 64dp person card. */
const CHANGED_BY_HEIGHT = 43 + 64;

/**
 * A device's details and actions (Figma 7570:74628 / 7572:80411): what it is,
 * its mode and status, its IDs and store (and, from the Audit log, who changed it).
 * Disable device confirms first (7572:75733). Enable standalone applies at
 * once; enable integrated needs a ticket (7572:78888), so the mode stays as it
 * is until that's done.
 */
export function DeviceSheet({
  device,
  onDismiss,
  onChangeMode,
  onToggleStatus,
  change,
}: {
  device: TerminalDeviceRow | null;
  onDismiss: () => void;
  onChangeMode: (device: TerminalDeviceRow) => void;
  onToggleStatus: (device: TerminalDeviceRow) => void;
  /** Opened from the Audit log: the change this row records, called out above the device. */
  change?: DeviceAuditRow | null;
}) {
  const theme = useTheme();
  const toast = useToast();
  const [confirming, setConfirming] = useState<'deactivate' | 'integrate' | null>(null);
  // Keeps the last device while the sheet slides away, so it doesn't blank mid-animation.
  const [shown, setShown] = useState<TerminalDeviceRow | null>(device);
  if (device && device !== shown) setShown(device);
  const current = device ?? shown;
  if (!current) return null;
  const active = current.status === 'Active';
  const close = () => {
    setConfirming(null);
    onDismiss();
  };
  const muted = { color: theme.colors.onSurfaceVariant };

  return (
    <>
      <PanelSheet
        visible={device !== null && confirming === null}
        onDismiss={close}
        title="Device details"
        height={DETAILS_HEIGHT + (change ? CHANGED_BY_HEIGHT : 0)}
        footer={
          <View style={styles.sheetActions}>
            <View style={styles.sheetAction}>
              {active ? (
                <SheetButton mode="outline" destructive icon="minus-circle" label="Disable device" onPress={() => setConfirming('deactivate')} />
              ) : (
                <SheetButton mode="outline" icon="arrow-counter-clockwise" label="Enable device" onPress={() => onToggleStatus(current)} />
              )}
            </View>
            <View style={styles.sheetAction}>
              {current.mode === 'Integrated' ? (
                <SheetButton label="Enable standalone" onPress={() => onChangeMode(current)} />
              ) : (
                <SheetButton label="Enable integrated" onPress={() => setConfirming('integrate')} />
              )}
            </View>
          </View>
        }>
        <SheetBlock gap={16} last={!change}>
          <View style={styles.sheetTop}>
            <View style={[styles.sheetPhoto, { borderColor: theme.colors.outlineVariant }]}>
              <TerminalPhoto size={40} inactive={!active} />
            </View>
            <View style={styles.deviceTags}>
              <ModeBadge mode={current.mode} />
              <DotStatusBadge label={current.status} tone={active ? 'success' : 'neutral'} />
            </View>
          </View>
          <View style={styles.sheetTitle}>
            <Text style={styles.sheetName}>{current.model}</Text>
            <Text style={[styles.sheetId, muted]}>{current.hardwareId}</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <InfoRow label="POS ID" value={current.posId} />
            <InfoRow label="Installation date" value={current.installationDate} />
            <InfoRow label="Store" value={current.storeName} narrow />
          </View>
        </SheetBlock>
        {change ? <ChangedBy change={change} /> : null}
      </PanelSheet>

      <ConfirmSheet
        visible={device !== null && confirming === 'deactivate'}
        onDismiss={close}
        title="Deactivate device"
        icon="minus-circle"
        destructive
        heading="Deactivate device?"
        body={`Do you want to deactivate the Terminal device ${current.model}, ${current.hardwareId}?`}
        height={284}
        action="Deactivate device"
        onConfirm={() => {
          onToggleStatus(current);
          close();
        }}
      />
      <ConfirmSheet
        visible={device !== null && confirming === 'integrate'}
        onDismiss={close}
        title="Enable integrated mode"
        icon="devices"
        heading="Raise ticket to enable integrated mode?"
        body={`Do you want to enable integrated mode for the ${current.hardwareId} and ${current.posId}, do you want to raise ticket?`}
        height={304}
        action="Raise ticket"
        onConfirm={() => {
          close();
          toast('Ticket raised successfully', { success: true });
        }}
      />
    </>
  );
}

/** A device's mode with its icon (Figma: Badge, link for Integrated, a device for Standalone). */
function ModeBadge({ mode }: { mode: DeviceMode }) {
  const theme = useTheme();
  return (
    <View style={[styles.modeBadge, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
      <Icon source={mode === 'Integrated' ? 'link-simple-horizontal' : 'device-mobile'} size={12} color={theme.colors.onSurface} />
      <Text style={styles.modeLabel}>{mode}</Text>
    </View>
  );
}

/**
 * Opened from the Audit log: who made the change, as the sheet's last
 * section — their name, role and email, so the merchant can follow up.
 */
function ChangedBy({ change }: { change: DeviceAuditRow }) {
  const theme = useTheme();
  const appColors = useAppColors();
  const email = INITIAL_ROSTER.find((entry) => entry.name === change.changedBy)?.email;
  return (
    <SheetBlock gap={12} last>
      <Text style={styles.sectionTitle}>Changed by</Text>
      <View
        accessible
        accessibilityLabel={`Changed by ${change.changedBy}, ${change.changedByRole}${email ? `, ${email}` : ''}`}
        style={[styles.actorCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View style={[styles.actorAvatar, { backgroundColor: appColors.highlight }]}>
          <Text style={[styles.actorInitials, { color: theme.colors.onSurface }]}>{initialsOf(change.changedBy)}</Text>
        </View>
        <View style={styles.flex}>
          <View style={styles.actorNameRow}>
            <Text numberOfLines={1} style={[styles.actorName, styles.actorNameText]}>
              {change.changedBy}
            </Text>
            <OutlineTag label={change.changedByRole} radius={PILL_HEIGHT / 2} />
          </View>
          {email ? (
            <Text numberOfLines={1} style={[styles.actorEmail, { color: theme.colors.onSurfaceVariant }]}>
              {email}
            </Text>
          ) : null}
        </View>
      </View>
    </SheetBlock>
  );
}

function InfoRow({ label, value, narrow = false }: { label: string; value: string; narrow?: boolean }) {
  const theme = useTheme();
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
      <Text style={[styles.infoValue, narrow && styles.infoValueNarrow]}>{value}</Text>
    </View>
  );
}

/** A question before an action (Figma 7572:76148): an icon tile, the question, what it means, and the one action at the end. */
function ConfirmSheet({
  visible,
  onDismiss,
  title,
  icon,
  destructive = false,
  heading,
  body,
  height,
  action,
  onConfirm,
}: {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  icon: string;
  destructive?: boolean;
  heading: string;
  body: string;
  height: number;
  action: string;
  onConfirm: () => void;
}) {
  const theme = useTheme();
  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title={title}
      height={height}
      footer={
        <View style={styles.confirmAction}>
          <SheetButton label={action} onPress={onConfirm} />
        </View>
      }>
      <SheetBlock gap={16} last>
        <View style={styles.confirmBody}>
          <View style={[styles.confirmTile, { backgroundColor: destructive ? color(theme.colors.error).alpha(0.06).rgb().string() : theme.colors.surfaceVariant }]}>
            <Icon source={icon} size={24} color={destructive ? theme.colors.error : theme.colors.primary} />
          </View>
          <View style={styles.confirmText}>
            <Text style={styles.confirmHeading}>{heading}</Text>
            <Text style={[styles.confirmCopy, { color: theme.colors.onSurfaceVariant }]}>{body}</Text>
          </View>
        </View>
      </SheetBlock>
    </PanelSheet>
  );
}

/**
 * Audit log (Figma 7572:81998): every mode change by day, the device and
 * the change it went through, with search, date and store filters. A change
 * opens its device.
 */
export function DeviceAuditLog() {
  const theme = useTheme();
  const presets = useMemo(() => getDefaultDateRangePresets(), []);
  const [rows] = useState(() => getAuditRows());
  const [devices, setDevices] = useState<TerminalDeviceRow[]>(() => getDeviceRows());
  const { changeMode, toggleStatus } = useDeviceActions(setDevices);
  const [selectedChange, setSelectedChange] = useState<DeviceAuditRow | null>(null);
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

  // Like the device rows: the device, then the change. Who made it and where stay for screen readers.
  const renderChange = (row: DeviceAuditRow) => (
    <ListRow
      key={row.id}
      icon={<TerminalPhoto />}
      onPress={() => setSelectedChange(row)}
      accessibilityLabel={`${row.model}, ${row.hardwareId}, changed from ${row.previousMode} to ${row.finalMode} by ${row.changedBy} (${row.changedByRole}) at ${row.storeName}, ${row.date} ${row.time}`}>
      <ListRowLine
        left={
          <>
            <Text numberOfLines={1} style={styles.rowTitle}>
              {row.model}
            </Text>
            <Text numberOfLines={1} style={[styles.rowId, muted]}>
              {row.hardwareId}
            </Text>
          </>
        }
        right={<OutlineTag label={`${row.previousMode} → ${row.finalMode}`} radius={PILL_HEIGHT / 2} />}
        centered
      />
    </ListRow>
  );

  const deviceSheet = (
    <DeviceSheet
      device={devices.find((row) => row.hardwareId === selectedChange?.hardwareId) ?? null}
      change={selectedChange}
      onDismiss={() => setSelectedChange(null)}
      onChangeMode={changeMode}
      onToggleStatus={toggleStatus}
    />
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
          searchPlaceholder="Search device ID"
          time={changed.scope}
          filters={[selectFilter({ label: 'Store', options: storeOptions, value: store, onApply: setStore })]}
          totals={{ all: changed.inRange.length, shown: shown.length }}
          noun={noun}>
          <DayGroupedList
            flat
            groups={groupByDay(ordered, (row) => row.date)}
            totals={dayTotals(shown, (row) => row.date)}
            noun={noun}
            empty={!rows.length ? 'No mode changes recorded yet.' : changed.inRange.length ? 'No changes match. Try clearing the search or filters.' : 'No mode changes recorded in these dates.'}
            renderRow={(row) => renderChange(row)}
          />
        </ListingCard>
        {deviceSheet}
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
      {deviceSheet}
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
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
  rowTitle: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 24 },
  rowId: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16 },
  flex: { flex: 1 },
  deviceTags: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sheetTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  sheetPhoto: { width: 40, height: 40, borderRadius: Shape.small, borderWidth: 1, overflow: 'hidden' },
  sheetTitle: { gap: 4 },
  sheetName: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 24 },
  sheetId: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  infoCard: { gap: 12, padding: 12, borderRadius: Shape.small },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoLabel: { flex: 1, fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16 },
  infoValue: { fontFamily: Fonts.semiBold, fontSize: 12, lineHeight: 16, textAlign: 'right' },
  infoValueNarrow: { width: 130 },
  sectionTitle: { fontFamily: Fonts.semiBold, fontSize: 14, lineHeight: 14 },
  modeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 24, paddingLeft: 8, paddingRight: 12, borderRadius: 12, borderWidth: 1 },
  modeLabel: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16 },
  sheetActions: { flexDirection: 'row', gap: 12 },
  actorCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: Shape.small },
  actorAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  actorInitials: { fontFamily: Fonts.semiBold, fontSize: 14, lineHeight: 20 },
  actorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actorName: { fontFamily: Fonts.semiBold, fontSize: 14, lineHeight: 20 },
  actorNameText: { flexShrink: 1 },
  actorEmail: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16, marginTop: 2 },
  sheetAction: { flex: 1 },
  confirmBody: { alignItems: 'center', gap: 16 },
  confirmTile: { padding: 8, borderRadius: Shape.small },
  confirmText: { alignItems: 'center', gap: 8 },
  confirmHeading: { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  confirmCopy: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  confirmAction: { alignSelf: 'flex-end' },
});
