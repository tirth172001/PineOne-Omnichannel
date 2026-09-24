import { Fragment, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Icon, RadioButton, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { ChecklistSheet } from '@/components/shared/checklist-sheet';
import { CollapsibleSection } from '@/components/shared/form-fields';
import { LIST_ROW_INNER_RADIUS } from '@/components/shared/listing';
import { PANEL_INNER_RADIUS, PanelSection, PanelSheet } from '@/components/shared/panel-sheet';
import { Fonts } from '@/constants/theme';
import { ALL_PERMISSIONS, type AccessScope, PERMISSION_GROUPS, type PermissionChannel } from '@/data/roles';
import { STORE_IDENTITIES } from '@/data/terminal-devices';
import type { ManagedRole } from '@/data/user-management';
import type { UserStatus } from '@/data/user-roster';

const PILL_HEIGHT = 24;
const SUCCESS = '#10b981';

/** One icon per permission group (web: GROUP_ICON). */
export const GROUP_ICON: Record<string, string> = {
  'Transactions & Settlements': 'repeat',
  Refunds: 'arrow-counter-clockwise',
  Reports: 'chart-bar',
  'User & Role Management': 'users',
  'Merchant Settings & Configuration': 'sliders',
  Account: 'user-circle',
  'Service Requests': 'lifebuoy',
  'Campaigns & Offers': 'megaphone',
  'EMI World': 'credit-card',
  'Gateway Management': 'plug',
  'Routing Logic': 'path',
  'Payment Links': 'link-simple',
  'Payouts & Beneficiaries': 'wallet',
  IMEI: 'device-mobile',
  'Partner Management': 'handshake',
  Credentials: 'key',
};

function Pill({ children, radius = LIST_ROW_INNER_RADIUS, muted = false }: { children: React.ReactNode; radius?: number; muted?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.pill,
        { borderRadius: Math.min(radius, PILL_HEIGHT / 2), borderColor: theme.colors.outlineVariant, opacity: muted ? 0.7 : 1 },
      ]}>
      {children}
    </View>
  );
}

function Dot({ color }: { color: string }) {
  return <View style={[styles.dot, { backgroundColor: color }]} />;
}

/** Web: RoleBadge — amber dot for Admin, green for Owner. */
export function RoleBadge({ role, radius }: { role: string; radius?: number }) {
  const theme = useTheme();
  const color = role === 'Admin' ? '#f59e0b' : role === 'Owner' ? SUCCESS : theme.colors.outline;
  return (
    <Pill radius={radius}>
      <Dot color={color} />
      <Text variant="labelMedium">{role}</Text>
    </Pill>
  );
}

/** Web: StatusBadge for roster entries. */
export function UserStatusBadge({ status, radius }: { status: UserStatus; radius?: number }) {
  const theme = useTheme();
  const color = status === 'Active' ? SUCCESS : status === 'Invited' ? '#f59e0b' : status === 'Pending' ? '#0ea5e9' : theme.colors.outline;
  return (
    <Pill radius={radius} muted={status === 'Deactivated'}>
      <Dot color={color} />
      <Text variant="labelMedium">{status}</Text>
    </Pill>
  );
}

/** Which channels a role or user reaches (web: AccessScopeBadge). */
export function AccessScopeBadge({ scope, radius }: { scope: AccessScope; radius?: number }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      {scope !== 'Online' ? (
        <Pill radius={radius}>
          <Icon source="storefront" size={12} color={theme.colors.onSurfaceVariant} />
          <Text variant="labelMedium">In-store</Text>
        </Pill>
      ) : null}
      {scope !== 'In-store' ? (
        <Pill radius={radius}>
          <Icon source="globe" size={12} color={theme.colors.onSurfaceVariant} />
          <Text variant="labelMedium">Online</Text>
        </Pill>
      ) : null}
    </View>
  );
}

/** Default (green) or Custom (violet) role tag (web: RoleTypeChip). */
export function RoleTypeChip({ roleType, radius = LIST_ROW_INNER_RADIUS }: { roleType: ManagedRole['roleType']; radius?: number }) {
  const custom = roleType === 'custom';
  const color = custom ? '#7c3aed' : '#059669';
  return (
    <View
      style={[
        styles.pill,
        {
          borderRadius: Math.min(radius, PILL_HEIGHT / 2),
          borderColor: custom ? 'rgba(139, 92, 246, 0.4)' : 'rgba(16, 185, 129, 0.4)',
          backgroundColor: custom ? 'rgba(139, 92, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        },
      ]}>
      <Text variant="labelSmall" style={{ color }}>
        {custom ? 'Custom role' : 'Default role'}
      </Text>
    </View>
  );
}

/** Bordered field showing a value with a caret, opening a picker. */
export function PickerField({ label, placeholder, onPress, accessibilityLabel }: { label?: string; placeholder: string; onPress: () => void; accessibilityLabel: string }) {
  const theme = useTheme();
  return (
    <TouchableRipple
      onPress={onPress}
      borderless
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.picker, { borderColor: theme.colors.outlineVariant }]}>
      <View style={styles.pickerContent}>
        <Text variant="bodyMedium" numberOfLines={1} style={[styles.flex, { color: label ? theme.colors.onSurface : theme.colors.onSurfaceVariant }]}>
          {label ?? placeholder}
        </Text>
        <Icon source="caret-down" size={16} color={theme.colors.onSurfaceVariant} />
      </View>
    </TouchableRipple>
  );
}

const ROLE_GROUPS: { label: string; filter: (role: ManagedRole) => boolean }[] = [
  { label: 'Offline (in-store)', filter: (role) => role.system === 'offline' },
  { label: 'Online (payment gateway)', filter: (role) => role.system === 'online' },
  { label: 'Offline & online', filter: (role) => role.system === 'both' },
  { label: 'Custom roles', filter: (role) => role.roleType === 'custom' },
];

/**
 * User role picker (web: RoleSelectField — a select grouped by system with
 * each role's description). Opens a sheet of radio rows.
 */
export function RoleSelectField({ roleName, onChange, roleCatalog }: { roleName: string; onChange: (name: string) => void; roleCatalog: ManagedRole[] }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <>
      <PickerField label={roleName || undefined} placeholder="Select role" onPress={() => setOpen(true)} accessibilityLabel={`User role: ${roleName}`} />
      <PanelSheet visible={open} onDismiss={() => setOpen(false)} title="User role">
        {ROLE_GROUPS.map((group, groupIndex) => {
          const roles = roleCatalog.filter(group.filter);
          if (roles.length === 0) return null;
          return (
            <PanelSection key={group.label} last={groupIndex === ROLE_GROUPS.length - 1}>
              <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                {group.label}
              </Text>
              {roles.map((role) => (
                <TouchableRipple
                  key={role.id}
                  onPress={() => {
                    onChange(role.name);
                    setOpen(false);
                  }}
                  borderless
                  accessibilityRole="radio"
                  aria-checked={role.name === roleName}
                  accessibilityState={{ checked: role.name === roleName }}
                  style={styles.roleOption}>
                  <View style={styles.roleOptionContent}>
                    <RadioButton.Android value={role.name} status={role.name === roleName ? 'checked' : 'unchecked'} />
                    <View style={styles.flex}>
                      <Text variant="bodyMedium" style={styles.medium}>
                        {role.name}
                      </Text>
                      {role.description ? (
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {role.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </TouchableRipple>
              ))}
            </PanelSection>
          );
        })}
      </PanelSheet>
    </>
  );
}

/** Store access multi-select (web: StoreMultiSelect). */
export function StoreAccessField({ storeIds, onChange }: { storeIds: string[]; onChange: (ids: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const label =
    storeIds.length === 0
      ? undefined
      : storeIds.length === 1
        ? (STORE_IDENTITIES.find((store) => store.storeId === storeIds[0])?.name ?? '1 store')
        : `${storeIds.length} stores selected`;
  return (
    <>
      <PickerField label={label} placeholder="Select stores" onPress={() => setOpen(true)} accessibilityLabel={`Store access: ${label ?? 'none'}`} />
      <ChecklistSheet
        visible={open}
        onDismiss={() => setOpen(false)}
        title="Store access"
        heading="Choose stores"
        items={STORE_IDENTITIES.map((store) => ({ id: store.storeId, title: store.name, subtitle: store.address }))}
        initialSelected={storeIds}
        onApply={onChange}
        countLabel={(count) => `${count} store${count === 1 ? '' : 's'} selected`}
        searchPlaceholder="Search stores"
      />
    </>
  );
}

/**
 * What a role grants (web: RolePermissionsPreview): per channel it touches,
 * every permission in that channel grouped, with a check or a cross.
 */
export function RolePermissionsPreview({ role }: { role: ManagedRole | undefined }) {
  const theme = useTheme();
  if (!role) return null;
  const channels = (
    [
      { id: 'offline', label: 'In-store permissions', icon: 'storefront' },
      { id: 'online', label: 'Online permissions', icon: 'globe' },
    ] as { id: PermissionChannel; label: string; icon: string }[]
  ).filter((channel) => role.permissionKeys.some((key) => key.startsWith(`${channel.id}:`)));

  return (
    <View style={styles.previewList}>
      {channels.map((channel) => {
        const channelPermissions = ALL_PERMISSIONS.filter((permission) => permission.channel === channel.id);
        const granted = channelPermissions.filter((permission) => role.permissionKeys.includes(permission.key)).length;
        const groups = PERMISSION_GROUPS.map((group) => ({ group, permissions: channelPermissions.filter((permission) => permission.group === group) })).filter(
          (section) => section.permissions.length > 0
        );
        return (
          <View key={channel.id} style={[styles.previewCard, { borderColor: theme.colors.outlineVariant }]}>
            <CollapsibleSection
              title={channel.label}
              badge={
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {granted}/{channelPermissions.length} allowed
                </Text>
              }>
              {groups.map(({ group, permissions }) => (
                <View key={group} style={styles.previewGroup}>
                  <View style={styles.row}>
                    <Icon source={GROUP_ICON[group] ?? 'hard-drives'} size={16} color={theme.colors.onSurface} />
                    <Text variant="bodyMedium" style={styles.semiBold}>
                      {group}
                    </Text>
                  </View>
                  {permissions.map((permission) => {
                    const allowed = role.permissionKeys.includes(permission.key);
                    return (
                      <View key={permission.key} style={styles.row}>
                        <Icon source={allowed ? 'check' : 'x'} size={16} color={allowed ? SUCCESS : theme.colors.error} />
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                          {permission.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </CollapsibleSection>
          </View>
        );
      })}
    </View>
  );
}

/** Label/value rows in a card separated by hairlines (web: FieldRowGroup). */
export function Rows({ children }: { children: React.ReactNode[] }) {
  return (
    <>
      {children.filter(Boolean).map((child, index) => (
        <Fragment key={index}>
          {index > 0 ? <Divider /> : null}
          {child}
        </Fragment>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  medium: { fontFamily: Fonts.medium },
  semiBold: { fontFamily: Fonts.semiBold },
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
  picker: { height: 40, borderWidth: 1, borderRadius: PANEL_INNER_RADIUS, justifyContent: 'center' },
  pickerContent: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
  roleOption: { borderRadius: PANEL_INNER_RADIUS },
  roleOptionContent: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, paddingVertical: 4 },
  previewList: { gap: 12 },
  previewCard: { borderWidth: 1, borderRadius: PANEL_INNER_RADIUS, padding: 12 },
  previewGroup: { gap: 6 },
});
