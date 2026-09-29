import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Checkbox, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { SearchField } from '@/components/search-field';
import { DETAIL_FOOTER_BUTTON_RADIUS, DetailScreen } from '@/components/shared/detail-screen';
import { CollapsibleSection, FormField, FormTextInput } from '@/components/shared/form-fields';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { ALL_PERMISSIONS, type Permission, PERMISSION_GROUPS, type PermissionChannel } from '@/data/roles';
import { getUserManagement, permissionSetsEqual, saveRole, useUserManagement } from '@/data/user-management';
import { useToast } from '@/hooks/use-toast';

import { GROUP_ICON } from './account-ui';

const CARD_PADDING = 16;
const INNER_RADIUS = concentric(Shape.max, CARD_PADDING);
const GROUP_RADIUS = concentric(INNER_RADIUS, 12);

function CheckRow({ label, checked, onPress }: { label: string; checked: boolean; onPress: () => void }) {
  return (
    <TouchableRipple onPress={onPress} accessibilityRole="checkbox" aria-checked={checked} accessibilityState={{ checked }} accessibilityLabel={label} borderless style={styles.checkRow}>
      <View style={styles.checkContent}>
        <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={onPress} />
        <Text variant="bodyMedium" style={styles.flex}>
          {label}
        </Text>
      </View>
    </TouchableRipple>
  );
}

/**
 * Create / edit role (web: CreateRolePage): role name and description (both
 * checked for duplicates), then In-store and Online permissions — each with
 * search, Select all, and the permissions grouped by area. `roleId` edits a
 * custom role; `cloneId` starts from an existing role's permissions.
 */
export function RoleForm({ roleId, cloneId }: { roleId?: string; cloneId?: string }) {
  const theme = useTheme();
  const toast = useToast();
  const { roleCatalog } = useUserManagement();
  const editing = roleId ? roleCatalog.find((role) => role.id === roleId) : undefined;
  const [initial] = useState(() => {
    const catalog = getUserManagement().roleCatalog;
    const edit = roleId ? catalog.find((role) => role.id === roleId) : undefined;
    if (edit) return { name: edit.name, description: edit.description, permissionKeys: edit.permissionKeys };
    const clone = cloneId ? catalog.find((role) => role.id === cloneId) : undefined;
    if (clone) return { name: `${clone.name} (Custom)`, description: clone.description, permissionKeys: clone.permissionKeys };
    return { name: '', description: '', permissionKeys: [] as string[] };
  });
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [selected, setSelected] = useState<string[]>(initial.permissionKeys);
  const [searches, setSearches] = useState<Record<PermissionChannel, string>>({ offline: '', online: '' });

  const trimmed = name.trim();
  const duplicateName = trimmed ? roleCatalog.find((role) => role.id !== editing?.id && role.name.trim().toLowerCase() === trimmed.toLowerCase()) : undefined;
  const duplicatePermissions =
    selected.length > 0 ? roleCatalog.find((role) => role.id !== editing?.id && permissionSetsEqual(role.permissionKeys, selected)) : undefined;
  const canSave = Boolean(trimmed) && selected.length > 0 && !duplicateName && !duplicatePermissions;

  const toggle = (key: string) => setSelected((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  const toggleMany = (permissions: Permission[], checked: boolean) => {
    const keys = permissions.map((permission) => permission.key);
    setSelected((current) => (checked ? Array.from(new Set([...current, ...keys])) : current.filter((key) => !keys.includes(key))));
  };

  const save = () => {
    if (!canSave) return;
    const result = saveRole({ name: trimmed, description: description.trim(), permissionKeys: selected }, editing?.id);
    toast('error' in result ? result.error : result.message);
    if (!('error' in result)) {
      if (router.canGoBack()) router.back();
      else router.replace('/users');
    }
  };

  const channelSection = (channel: PermissionChannel, label: string, icon: string) => {
    const all = ALL_PERMISSIONS.filter((permission) => permission.channel === channel);
    const selectedCount = all.filter((permission) => selected.includes(permission.key)).length;
    const allSelected = all.length > 0 && selectedCount === all.length;
    const query = searches[channel].trim().toLowerCase();
    const filtered = query ? all.filter((permission) => `${permission.label} ${permission.group}`.toLowerCase().includes(query)) : all;
    const groups = PERMISSION_GROUPS.map((group) => ({ group, permissions: filtered.filter((permission) => permission.group === group) })).filter(
      (section) => section.permissions.length > 0
    );

    return (
      <View style={[styles.card, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
        <CollapsibleSection
          title={label}
          badge={
            <View style={styles.inline}>
              <Icon source={icon} size={14} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {selectedCount}/{all.length} selected
              </Text>
            </View>
          }>
          <SearchField
            value={searches[channel]}
            onChangeText={(value) => setSearches((current) => ({ ...current, [channel]: value }))}
            placeholder="Search permission"
            radius={INNER_RADIUS}
          />
          <CheckRow label="Select all" checked={allSelected} onPress={() => toggleMany(all, !allSelected)} />
          {groups.length === 0 ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              No permissions match this search.
            </Text>
          ) : (
            groups.map(({ group, permissions }) => (
              <View key={group} style={[styles.group, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View style={styles.inline}>
                  <Icon source={GROUP_ICON[group] ?? 'hard-drives'} size={14} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodyMedium" style={styles.semiBold}>
                    {group}
                  </Text>
                </View>
                {permissions.map((permission) => (
                  <CheckRow key={permission.key} label={permission.label} checked={selected.includes(permission.key)} onPress={() => toggle(permission.key)} />
                ))}
              </View>
            ))
          )}
        </CollapsibleSection>
      </View>
    );
  };

  return (
    <DetailScreen
      title={editing ? 'Edit custom role' : 'Create new role'}
      fallbackHref="/users"
      footer={
        <Button mode="contained" disabled={!canSave} onPress={save} style={styles.footerButton}>
          {editing ? 'Save changes' : 'Save role and permission'}
        </Button>
      }>
      <FormField label="Role name">
        <FormTextInput value={name} onChangeText={setName} placeholder="Enter role name" accessibilityLabel="Role name" radius={Shape.small} />
        {duplicateName ? (
          <Text variant="bodySmall" style={{ color: theme.colors.error }}>
            A role named &quot;{duplicateName.name}&quot; already exists.
          </Text>
        ) : null}
      </FormField>
      <FormField label="Role description">
        <FormTextInput value={description} onChangeText={setDescription} placeholder="Enter role description" accessibilityLabel="Role description" radius={Shape.small} />
      </FormField>
      {duplicatePermissions ? (
        <Text variant="bodySmall" style={{ color: theme.colors.error }}>
          A role with the same permissions already exists: &quot;{duplicatePermissions.name}&quot;.
        </Text>
      ) : null}
      {channelSection('offline', 'In-store permissions', 'storefront')}
      {channelSection('online', 'Online permissions', 'globe')}
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  semiBold: { fontFamily: Fonts.semiBold },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  card: { borderWidth: 1, borderRadius: Shape.max, padding: CARD_PADDING },
  group: { borderRadius: INNER_RADIUS, padding: 12, gap: 2 },
  checkRow: { borderRadius: GROUP_RADIUS },
  checkContent: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerButton: { flex: 1, borderRadius: DETAIL_FOOTER_BUTTON_RADIUS },
});
