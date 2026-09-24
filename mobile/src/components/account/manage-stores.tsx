import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { Tabs } from '@/components/material3/tabs';
import { ModePill } from '@/components/products/terminal-devices';
import { FilterMenuButton } from '@/components/shared/controls';
import { CopyableValue } from '@/components/shared/copyable-value';
import { DateRangeFilter, getDefaultDateRangePresets, makeDateRangeValue } from '@/components/shared/date-range-filter';
import { DETAIL_FOOTER_BUTTON_RADIUS, DetailScreen } from '@/components/shared/detail-screen';
import { FormField, FormTextInput, SelectField } from '@/components/shared/form-fields';
import { LIST_ROW_INNER_RADIUS, ListCard, ListRow, ListRowLine, ListingToolbar } from '@/components/shared/listing';
import { PANEL_INNER_RADIUS, PanelSection, PanelSheet } from '@/components/shared/panel-sheet';
import { QR_BACKGROUND_SWATCHES, QrPreview } from '@/components/shared/qr-preview';
import { RowActionsMenu } from '@/components/shared/row-actions';
import { DotStatusBadge } from '@/components/shared/status';
import { Fonts } from '@/constants/theme';
import { CURRENT_USER } from '@/data/businesses';
import { computeAccessScope, DEFAULT_ROLE_CATALOG } from '@/data/roles';
import { STORE_RECORDS, type StoreRecord, terminalsLinkedCount, usersInvitedForStore } from '@/data/stores';
import {
  DEVICE_MODELS,
  type DeviceMode,
  formatTime,
  getDeviceRows,
  MONTHS,
  recordModeChange,
  type TerminalDeviceRow,
  toggleDeviceStatus,
} from '@/data/terminal-devices';
import { addRosterEntry, useUserManagement } from '@/data/user-management';
import { usersForStore } from '@/data/user-roster';
import { useToast } from '@/hooks/use-toast';

import { UserStatusBadge } from './account-ui';

/** Mock VPA shared with every other merchant-details surface (web: STORE_UPI_ID). */
const STORE_UPI_ID = '6352699747@ptyes';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Store-detail adds are always in-store users (web: STORE_ROLE_OPTIONS). */
const STORE_ROLE_OPTIONS = DEFAULT_ROLE_CATALOG.filter((role) => role.system === 'offline');
const STATUS_OPTIONS = [
  { value: 'all', label: 'All status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

function nowStamp() {
  const now = new Date();
  return { date: `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`, time: formatTime(now.getHours(), now.getMinutes()) };
}

function ActiveBadge({ active }: { active: boolean }) {
  return <DotStatusBadge label={active ? 'Active' : 'Inactive'} tone={active ? 'success' : 'neutral'} radius={LIST_ROW_INNER_RADIUS} />;
}

/**
 * Manage stores (web: ManageStoresSection list): search, date and status
 * filters, and each store with its address, created date, store ID,
 * terminals linked and users invited. Rows open the store.
 */
export function ManageStores() {
  const theme = useTheme();
  const { roster } = useUserManagement();
  const presets = useMemo(() => getDefaultDateRangePresets(), []);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [dateRange, setDateRange] = useState(() => makeDateRangeValue(presets, 'today'));
  const muted = { color: theme.colors.onSurfaceVariant };

  const query = search.trim().toLowerCase();
  const stores = STORE_RECORDS.filter((store) => {
    if (status !== 'all' && store.status.toLowerCase() !== status) return false;
    return !query || `${store.name} ${store.storeId} ${store.merchantId}`.toLowerCase().includes(query);
  });

  return (
    <DetailScreen title="Manage stores" fallbackHref="/more">
      <ListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by store name"
        filters={
          <>
            <DateRangeFilter presets={presets} value={dateRange} onApply={setDateRange} initialPresetId="today" />
            <FilterMenuButton value={status} onValueChange={setStatus} options={STATUS_OPTIONS} accessibilityLabel="Status" />
          </>
        }
      />
      <ListCard empty="No stores found for current filters.">
        {stores.map((store) => (
          <ListRow
            key={store.id}
            onPress={() => router.push({ pathname: '/more/stores/[storeId]', params: { storeId: store.storeId } })}
            accessibilityLabel={`${store.name}, ${store.status}`}>
            <ListRowLine
              left={
                <>
                  <Text variant="bodyMedium" style={styles.medium}>
                    {store.name}
                  </Text>
                  <Text variant="bodySmall" style={muted} numberOfLines={1}>
                    {store.address}
                  </Text>
                </>
              }
              right={<ActiveBadge active={store.status === 'Active'} />}
            />
            <View style={styles.inline}>
              <Text variant="bodySmall" style={muted}>
                Store ID
              </Text>
              <CopyableValue value={store.storeId} />
            </View>
            <Text variant="bodySmall" style={muted}>
              {terminalsLinkedCount(store.storeId)} terminals · {usersInvitedForStore(store.storeId, roster)} users · Created {store.createdOnDate}, {store.createdOnTime}
            </Text>
          </ListRow>
        ))}
      </ListCard>
      <Text variant="bodySmall" style={muted}>
        Total {stores.length} row(s)
      </Text>
    </DetailScreen>
  );
}

/** View & edit store QR (web: StoreQrPanel): store, colour theme, the branded QR, Order and Download. */
function StoreQrSheet({ visible, onDismiss, store }: { visible: boolean; onDismiss: () => void; store: StoreRecord }) {
  const theme = useTheme();
  const toast = useToast();
  const [background, setBackground] = useState<string>(QR_BACKGROUND_SWATCHES[0]);
  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title="View & edit store QR"
      footer={
        <View style={styles.sheetFooter}>
          <Button
            mode="outlined"
            onPress={() => toast('Store QR stickers are coming to the app soon')}
            textColor={theme.colors.onSurface}
            style={[styles.flexButton, { borderColor: theme.colors.outlineVariant }]}>
            Order store QR
          </Button>
          <Button mode="contained" icon="download-simple" onPress={() => toast('Downloading store QR...')} style={styles.flexButton}>
            Download QR
          </Button>
        </View>
      }>
      <PanelSection>
        <Text style={styles.storeName}>{store.name}</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {store.address}
        </Text>
        <TouchableRipple
          onPress={() => {
            onDismiss();
            router.navigate('/payments?tab=transactions');
          }}
          accessibilityRole="link"
          borderless
          style={styles.link}>
          <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
            View transactions on this QR
          </Text>
        </TouchableRipple>
      </PanelSection>
      <PanelSection last>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Select preferred theme
        </Text>
        <View style={styles.swatches}>
          {QR_BACKGROUND_SWATCHES.map((swatch) => {
            const selected = background === swatch;
            return (
              <TouchableRipple
                key={swatch}
                onPress={() => setBackground(swatch)}
                accessibilityRole="radio"
                aria-checked={selected}
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`Use ${swatch} background`}
                borderless
                style={[styles.swatchRing, { borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant }]}>
                <View style={[styles.swatch, { backgroundColor: swatch }]} />
              </TouchableRipple>
            );
          })}
        </View>
        <QrPreview seed={`${store.storeId}-${STORE_UPI_ID}-${background}`} backgroundColor={background} upiId={STORE_UPI_ID} radius={PANEL_INNER_RADIUS} />
      </PanelSection>
    </PanelSheet>
  );
}

/** Add device (web: AddDevicePanel): model, hardware ID, POS ID and mode. */
function AddDeviceSheet({ visible, onDismiss, store, onAdd }: { visible: boolean; onDismiss: () => void; store: StoreRecord; onAdd: (device: TerminalDeviceRow) => void }) {
  const theme = useTheme();
  const [model, setModel] = useState(DEVICE_MODELS[0]);
  const [hardwareId, setHardwareId] = useState('');
  const [posId, setPosId] = useState('');
  const [mode, setMode] = useState<DeviceMode>('Standalone');
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setModel(DEVICE_MODELS[0]);
      setHardwareId('');
      setPosId('');
      setMode('Standalone');
    }
  }
  const canAdd = hardwareId.trim().length > 0 && posId.trim().length > 0;

  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title="Add device"
      footer={
        <View style={styles.sheetFooter}>
          <Button mode="outlined" onPress={onDismiss} textColor={theme.colors.onSurface} style={[styles.panelButton, { borderColor: theme.colors.outlineVariant }]}>
            Cancel
          </Button>
          <Button
            mode="contained"
            disabled={!canAdd}
            onPress={() => {
              const { date, time } = nowStamp();
              onAdd({
                id: `dev-${Date.now()}`,
                model,
                hardwareId: hardwareId.trim(),
                posId: posId.trim(),
                installationDate: date,
                installationTime: time,
                storeId: store.storeId,
                storeName: store.name,
                storeAddress: store.address,
                mode,
                status: 'Active',
              });
              onDismiss();
            }}
            style={styles.panelButton}>
            Add device
          </Button>
        </View>
      }>
      <PanelSection last>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Register a new terminal for {store.name}.
        </Text>
        <FormField label="Hardware model">
          <SelectField value={model} onValueChange={setModel} options={DEVICE_MODELS.map((option) => ({ value: option, label: option }))} accessibilityLabel="Hardware model" />
        </FormField>
        <FormField label="Hardware ID">
          <FormTextInput value={hardwareId} onChangeText={setHardwareId} placeholder="HRD-110239874" accessibilityLabel="Hardware ID" />
        </FormField>
        <FormField label="POS ID">
          <FormTextInput value={posId} onChangeText={setPosId} placeholder="POS-738723323881" accessibilityLabel="POS ID" />
        </FormField>
        <FormField label="Mode">
          <SelectField
            value={mode}
            onValueChange={setMode}
            options={[
              { value: 'Standalone', label: 'Standalone' },
              { value: 'Integrated', label: 'Integrated' },
            ]}
            accessibilityLabel="Mode"
          />
        </FormField>
      </PanelSection>
    </PanelSheet>
  );
}

/** Add user to a store (web: AddUserPanel): name, email (unique on this store), phone, in-store role. */
function AddStoreUserSheet({ visible, onDismiss, store, storeUsers }: { visible: boolean; onDismiss: () => void; store: StoreRecord; storeUsers: { email: string }[] }) {
  const theme = useTheme();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleName, setRoleName] = useState(STORE_ROLE_OPTIONS[0]?.name ?? '');
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setName('');
      setEmail('');
      setPhone('');
      setRoleName(STORE_ROLE_OPTIONS[0]?.name ?? '');
    }
  }
  const normalized = email.trim().toLowerCase();
  const emailValid = EMAIL_PATTERN.test(normalized);
  const duplicate = emailValid && storeUsers.some((entry) => entry.email.trim().toLowerCase() === normalized);
  const canAdd = name.trim().length > 0 && emailValid && Boolean(roleName) && !duplicate;

  const add = () => {
    if (!canAdd) return;
    const { date, time } = nowStamp();
    const role = STORE_ROLE_OPTIONS.find((entry) => entry.name === roleName);
    addRosterEntry({
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      addedOnDate: date,
      addedOnTime: time,
      scope: role ? computeAccessScope(role.permissionKeys) : 'In-store',
      role: roleName,
      status: 'Invited',
      storeIds: [store.storeId],
    });
    toast(`Invite sent to ${email.trim()}`);
    onDismiss();
  };

  return (
    <PanelSheet
      visible={visible}
      onDismiss={onDismiss}
      title="Add user"
      footer={
        <View style={styles.sheetFooter}>
          <Button mode="outlined" onPress={onDismiss} textColor={theme.colors.onSurface} style={[styles.panelButton, { borderColor: theme.colors.outlineVariant }]}>
            Cancel
          </Button>
          <Button mode="contained" disabled={!canAdd} onPress={add} style={styles.panelButton}>
            Send invite
          </Button>
        </View>
      }>
      <PanelSection last>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Invite a teammate to {store.name}.
        </Text>
        <FormField label="Full name">
          <FormTextInput value={name} onChangeText={setName} placeholder="Priya Singh" accessibilityLabel="Full name" />
        </FormField>
        <FormField label="Email">
          <FormTextInput value={email} onChangeText={setEmail} placeholder="teammate@company.com" keyboardType="email-address" accessibilityLabel="Email" />
          {duplicate ? (
            <Text variant="bodySmall" style={{ color: theme.colors.error }}>
              This email is already on this store&apos;s roster.
            </Text>
          ) : null}
        </FormField>
        <FormField label="Phone number">
          <FormTextInput
            value={phone}
            onChangeText={(value) => setPhone(value.replace(/\D/g, '').slice(0, 10))}
            placeholder="9876543210"
            keyboardType="phone-pad"
            accessibilityLabel="Phone number"
          />
        </FormField>
        <FormField label="Role">
          <SelectField value={roleName} onValueChange={setRoleName} options={STORE_ROLE_OPTIONS.map((role) => ({ value: role.name, label: role.name }))} accessibilityLabel="Role" />
        </FormField>
      </PanelSection>
    </PanelSheet>
  );
}

const DETAIL_TABS = [
  { key: 'devices', label: 'Devices' },
  { key: 'users', label: 'Users' },
];

/**
 * Store detail (web: StoreDetailView): name, address, store and merchant IDs,
 * then Devices (with mode change / deactivate) and Users. The web's
 * "Add ▾" menu becomes the footer's Add device / Add user for the open tab,
 * next to View & edit store QR.
 */
export function StoreDetail({ store }: { store: StoreRecord }) {
  const theme = useTheme();
  const toast = useToast();
  const { roster } = useUserManagement();
  const [tab, setTab] = useState('devices');
  const [devices, setDevices] = useState<TerminalDeviceRow[]>(() => getDeviceRows().filter((row) => row.storeId === store.storeId));
  const [sheet, setSheet] = useState<'qr' | 'device' | 'user' | null>(null);
  const users = usersForStore(store.storeId, roster);
  const muted = { color: theme.colors.onSurfaceVariant };

  const changeMode = (device: TerminalDeviceRow) => {
    const next: DeviceMode = device.mode === 'Standalone' ? 'Integrated' : 'Standalone';
    const result = recordModeChange(device.id, next, CURRENT_USER.name, CURRENT_USER.roleLabel);
    if (!result) return;
    setDevices((current) => current.map((row) => (row.id === device.id ? result.device : row)));
    toast(`${device.model} switched to ${next}`);
  };
  const toggleStatus = (device: TerminalDeviceRow) => {
    const updated = toggleDeviceStatus(device.id);
    if (!updated) return;
    setDevices((current) => current.map((row) => (row.id === device.id ? updated : row)));
    toast(`${device.model} ${updated.status === 'Active' ? 'reactivated' : 'deactivated'}`);
  };

  return (
    <DetailScreen
      title="Store details"
      fallbackHref="/more/stores"
      footer={
        <>
          <Button
            mode="outlined"
            icon="qr-code"
            onPress={() => setSheet('qr')}
            textColor={theme.colors.onSurface}
            style={[styles.footerButton, { borderColor: theme.colors.outlineVariant }]}>
            Store QR
          </Button>
          <Button mode="contained" icon="plus" onPress={() => setSheet(tab === 'devices' ? 'device' : 'user')} style={styles.footerButton}>
            {tab === 'devices' ? 'Add device' : 'Add user'}
          </Button>
        </>
      }>
      <View style={styles.hero}>
        <Text style={styles.storeName}>{store.name}</Text>
        <Text variant="bodyMedium" style={muted}>
          {store.address}
        </Text>
        <View style={styles.ids}>
          <CopyableValue variant="pill" value={store.storeId} label={`Store ID: ${store.storeId}`} />
          <CopyableValue variant="pill" value={store.merchantId} label={`Merchant ID: ${store.merchantId}`} />
        </View>
      </View>
      <View style={styles.tabs}>
        <Tabs tabs={DETAIL_TABS} activeKey={tab} onChange={setTab} variant="secondary" />
      </View>
      {tab === 'devices' ? (
        <ListCard empty="No devices linked to this store.">
          {devices.map((row) => (
            <ListRow key={row.id} accessibilityLabel={`${row.model}, ${row.mode}, ${row.status}`}>
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
              <Text variant="bodySmall" style={muted}>
                Installed {row.installationDate}
                {row.installationTime ? `, ${row.installationTime}` : ''}
              </Text>
              <View style={styles.badges}>
                <ModePill mode={row.mode} />
                <ActiveBadge active={row.status === 'Active'} />
              </View>
            </ListRow>
          ))}
        </ListCard>
      ) : (
        <ListCard empty="No users assigned to this store.">
          {users.map((row) => (
            <ListRow key={row.id} accessibilityLabel={`${row.name}, ${row.role}, ${row.status}`}>
              <ListRowLine
                left={
                  <>
                    <Text variant="bodyMedium" style={styles.medium}>
                      {row.name}
                    </Text>
                    <Text variant="bodySmall" style={muted}>
                      {row.email}
                    </Text>
                  </>
                }
                right={<UserStatusBadge status={row.status} />}
              />
              <Text variant="bodySmall" style={muted}>
                {row.role} · {row.scope}
              </Text>
            </ListRow>
          ))}
        </ListCard>
      )}

      <StoreQrSheet visible={sheet === 'qr'} onDismiss={() => setSheet(null)} store={store} />
      <AddDeviceSheet
        visible={sheet === 'device'}
        onDismiss={() => setSheet(null)}
        store={store}
        onAdd={(device) => {
          setDevices((current) => [device, ...current]);
          toast(`${device.model} added to ${store.name}`);
        }}
      />
      <AddStoreUserSheet visible={sheet === 'user'} onDismiss={() => setSheet(null)} store={store} storeUsers={users} />
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  medium: { fontFamily: Fonts.medium },
  // Web: text-2xl font-semibold.
  storeName: { fontFamily: Fonts.semiBold, fontSize: 22, lineHeight: 28 },
  hero: { gap: 6 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ids: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  tabs: { marginHorizontal: -16, marginVertical: -8 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  link: { alignSelf: 'flex-start', borderRadius: PANEL_INNER_RADIUS, paddingVertical: 4 },
  swatches: { flexDirection: 'row', gap: 8 },
  swatchRing: { width: 40, height: 40, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  swatch: { width: 30, height: 30, borderRadius: 8 },
  sheetFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  flexButton: { flex: 1, borderRadius: PANEL_INNER_RADIUS },
  panelButton: { borderRadius: PANEL_INNER_RADIUS },
  footerButton: { flex: 1, borderRadius: DETAIL_FOOTER_BUTTON_RADIUS },
});
