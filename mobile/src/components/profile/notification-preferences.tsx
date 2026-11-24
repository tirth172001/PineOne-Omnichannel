import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Icon, Switch, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { ROLE_GROUPS } from '@/components/account/account-ui';
import { SearchField } from '@/components/search-field';
import { DetailScreen } from '@/components/shared/detail-screen';
import { PanelSheet } from '@/components/shared/panel-sheet';
import { SelectionMark } from '@/components/shared/selection-mark';
import { SheetBlock, SheetButton } from '@/components/shared/sheet-parts';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { defaultNotificationMatrix, NOTIFICATION_CATEGORIES, type NotificationCategory, type NotificationMatrix, saveNotifications, useProfile } from '@/data/profile';
import { type ManagedRole, useUserManagement } from '@/data/user-management';
import { useToast } from '@/hooks/use-toast';

import { FeatureCard, FooterButton, profileStyles } from './profile-ui';

/** Role names shown on a card before "+N". */
const SUMMARY_NAMES = 3;

/**
 * Notification preferences (Notifications → Preferences), the old app's
 * Channel preferences: one switch to send every alert to every role, then a
 * card per category saying who gets it. The roles are the live Users & roles
 * catalogue — system roles and any custom ones — so the list can be long:
 * each card opens a picker sheet (search, All roles, roles grouped as in the
 * user-role picker), as the filter sheets do for long lists. Changes are
 * drafts until Save.
 */
export function NotificationPreferences() {
  const theme = useTheme();
  const toast = useToast();
  const saved = useProfile().notifications;
  const { roleCatalog } = useUserManagement();
  const [enableAll, setEnableAll] = useState(saved.enableAll);
  const [matrix, setMatrix] = useState<NotificationMatrix>(saved.matrix);
  const [editing, setEditing] = useState<NotificationCategory | null>(null);
  const same = (a: NotificationMatrix, b: NotificationMatrix) => NOTIFICATION_CATEGORIES.every((category) => [...(a[category.key] ?? [])].sort().join() === [...(b[category.key] ?? [])].sort().join());
  const dirty = enableAll !== saved.enableAll || !same(matrix, saved.matrix);
  const isDefault = !enableAll && same(matrix, defaultNotificationMatrix());
  // Roles deleted since they were picked drop out of the count.
  const live = (ids: string[]) => roleCatalog.filter((role) => ids.includes(role.id));

  return (
    <DetailScreen
      title="Notification preferences"
      fallbackHref="/notifications"
      footer={
        <>
          <FooterButton
            label="Reset to defaults"
            mode="outlined"
            disabled={isDefault}
            onPress={() => {
              setEnableAll(false);
              setMatrix(defaultNotificationMatrix());
              toast('Preferences have been reset to defaults. Save to keep them.');
            }}
          />
          <FooterButton
            label="Save"
            disabled={!dirty}
            onPress={() => {
              saveNotifications(enableAll, matrix);
              toast('Notification preferences saved');
            }}
          />
        </>
      }>
      <View style={[profileStyles.stack, profileStyles.first]}>
        <FeatureCard
          icon="bell"
          title="Enable all notifications"
          line="Every alert goes to every role. Turn off to choose who hears about what."
          trailing={<Switch value={enableAll} onValueChange={setEnableAll} color={theme.colors.primary} accessibilityLabel="Enable all notifications" />}
        />
        {NOTIFICATION_CATEGORIES.map((category) => {
          const roles = live(matrix[category.key] ?? []);
          const all = enableAll || roles.length === roleCatalog.length;
          const summary = all ? 'All roles' : roles.length === 0 ? 'No one' : roles.slice(0, SUMMARY_NAMES).map((role) => role.name).join(', ');
          const more = all ? 0 : roles.length - SUMMARY_NAMES;
          return (
            <TouchableRipple
              key={category.key}
              onPress={() => setEditing(category)}
              disabled={enableAll}
              borderless
              accessibilityRole="button"
              accessibilityState={{ disabled: enableAll }}
              accessibilityLabel={`${category.label} alerts go to ${all ? 'all roles' : `${roles.length} roles`}. Change`}
              style={[styles.card, { backgroundColor: theme.colors.surface }, enableAll && styles.locked]}>
              <View style={styles.inner}>
                <Icon source={category.icon} size={24} color={theme.colors.primary} />
                <View style={profileStyles.flex}>
                  <Text style={[profileStyles.title, { color: theme.colors.onSurface }]}>{category.label}</Text>
                  <Text numberOfLines={1} style={[profileStyles.body, { color: roles.length === 0 && !all ? theme.colors.error : theme.colors.onSurfaceVariant }]}>
                    {summary}
                    {more > 0 ? <Text style={styles.more}>{`  +${more}`}</Text> : null}
                  </Text>
                </View>
                <Text style={[profileStyles.small, { color: theme.colors.onSurfaceVariant }]}>{all ? roleCatalog.length : roles.length} roles</Text>
                <Icon source="caret-right" size={20} color={theme.colors.onSurface} />
              </View>
            </TouchableRipple>
          );
        })}
        <Text style={[profileStyles.small, styles.updated, { color: theme.colors.onSurfaceVariant }]}>Last updated: {saved.updated}</Text>
      </View>

      <RolePickerSheet
        category={editing}
        roles={roleCatalog}
        selected={editing ? (matrix[editing.key] ?? []) : []}
        onDismiss={() => setEditing(null)}
        onDone={(ids) => {
          if (editing) setMatrix((current) => ({ ...current, [editing.key]: ids }));
          setEditing(null);
        }}
      />
    </DetailScreen>
  );
}

/**
 * Who gets a category's alerts: search (the catalogue grows with custom
 * roles), All roles, then the roles grouped as the user-role picker groups
 * them, each a checkbox. Done applies; ✕ discards.
 */
function RolePickerSheet({
  category,
  roles,
  selected,
  onDismiss,
  onDone,
}: {
  category: NotificationCategory | null;
  roles: ManagedRole[];
  selected: string[];
  onDismiss: () => void;
  onDone: (ids: string[]) => void;
}) {
  const theme = useTheme();
  const { height } = useWindowDimensions();
  const [draft, setDraft] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState<string | null>(null);
  if ((category?.key ?? null) !== shown) {
    setShown(category?.key ?? null);
    if (category) {
      setDraft(selected.filter((id) => roles.some((role) => role.id === id)));
      setQuery('');
    }
  }
  const q = query.trim().toLowerCase();
  const matches = (role: ManagedRole) => !q || `${role.name} ${role.description}`.toLowerCase().includes(q);
  const allPicked = draft.length === roles.length;
  const toggle = (id: string) => setDraft((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  const muted = { color: theme.colors.onSurfaceVariant };

  return (
    <PanelSheet
      visible={category !== null}
      onDismiss={onDismiss}
      title={category ? `${category.label} alerts` : ''}
      height={Math.round(height * 0.86)}
      footer={<SheetButton label={`Done · ${draft.length} of ${roles.length} roles`} onPress={() => onDone(draft)} />}>
      <SheetBlock gap={12}>
        <SearchField value={query} onChangeText={setQuery} placeholder="Search roles" radius={10} height={36} />
        {q ? null : (
          <Row title="All roles" line={`${roles.length} roles, including custom roles`} checked={allPicked} onPress={() => setDraft(allPicked ? [] : roles.map((role) => role.id))} />
        )}
      </SheetBlock>
      {ROLE_GROUPS.map((group) => {
        const groupRoles = roles.filter((role) => group.filter(role) && matches(role));
        if (!groupRoles.length) return null;
        return (
          <SheetBlock key={group.label} gap={0}>
            <Text style={[styles.groupLabel, muted]}>{group.label.toUpperCase()}</Text>
            {groupRoles.map((role) => (
              <Row key={role.id} title={role.name} line={role.description} checked={draft.includes(role.id)} onPress={() => toggle(role.id)} />
            ))}
          </SheetBlock>
        );
      })}
      {q && !roles.some(matches) ? (
        <SheetBlock last>
          <Text style={[profileStyles.body, styles.empty, muted]}>No roles match “{query.trim()}”</Text>
        </SheetBlock>
      ) : null}
    </PanelSheet>
  );
}

function Row({ title, line, checked, onPress }: { title: string; line?: string; checked: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <TouchableRipple onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked }} accessibilityLabel={title}>
      <View style={styles.row}>
        <View style={profileStyles.flex}>
          <Text style={[profileStyles.medium, { color: theme.colors.onSurface }]}>{title}</Text>
          {line ? (
            <Text numberOfLines={1} style={[profileStyles.small, { color: theme.colors.onSurfaceVariant }]}>
              {line}
            </Text>
          ) : null}
        </View>
        <SelectionMark type="checkbox" checked={checked} />
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Shape.max },
  locked: { opacity: 0.6 },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  more: { fontFamily: Fonts.medium },
  updated: { textAlign: 'center', paddingVertical: 8 },
  groupLabel: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.4, paddingBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingVertical: 6 },
  empty: { textAlign: 'center', paddingVertical: 16 },
});
