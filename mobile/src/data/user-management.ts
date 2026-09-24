/**
 * Live Users & roles state (web: the roster / roleCatalog state in
 * ManageUsersSection, settings-slide-panel.tsx). The web keeps it in one
 * component because its screens (list, pending approvals, create role) are
 * swapped in place; on mobile they are separate pushed screens, so the state
 * lives in this small store and screens subscribe with useUserManagement().
 * Manage stores reads the same roster, so a user added there shows up here.
 */
import { useSyncExternalStore } from 'react';

import { ALL_PERMISSIONS, computeAccessScope, DEFAULT_ROLE_CATALOG, type AccessScope, type RoleCatalogSystem } from './roles';
import { formatTime, INITIAL_ROSTER, MONTHS, type RosterEntry } from './user-roster';

export type ManagedRole = {
  id: string;
  name: string;
  roleType: 'system_default' | 'custom';
  system?: RoleCatalogSystem;
  description: string;
  permissionKeys: string[];
};

export type CustomRoleDraft = { name: string; description: string; permissionKeys: string[] };

const INITIAL_ROLE_CATALOG: ManagedRole[] = DEFAULT_ROLE_CATALOG.map((entry) => ({
  id: entry.id,
  name: entry.name,
  roleType: 'system_default',
  system: entry.system,
  description: entry.description,
  permissionKeys: entry.permissionKeys,
}));

type State = { roster: RosterEntry[]; roleCatalog: ManagedRole[] };

let state: State = { roster: INITIAL_ROSTER, roleCatalog: INITIAL_ROLE_CATALOG };
const listeners = new Set<() => void>();

function setState(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useUserManagement() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export function getUserManagement() {
  return state;
}

/** Web: formatNow() in settings-slide-panel.tsx. */
export function formatNow() {
  const now = new Date();
  return { dateStr: `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`, timeStr: formatTime(now.getHours(), now.getMinutes()) };
}

/** Order-independent comparison — same permissions in a different pick order still count as duplicates. */
export function permissionSetsEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((key) => setB.has(key));
}

/** A role grants store-scoped access whenever it holds any in-store permission. */
export function roleNeedsStoreAccess(role: ManagedRole | undefined) {
  return Boolean(role?.permissionKeys.some((key) => key.startsWith('offline:')));
}

export function scopeForRole(roleName: string, fallback: AccessScope | string = 'In-store') {
  const role = state.roleCatalog.find((entry) => entry.name === roleName);
  return role ? computeAccessScope(role.permissionKeys) : fallback;
}

export function assignedUserCount(roleName: string, roster = state.roster) {
  return roster.filter((entry) => entry.role === roleName && entry.status !== 'Deactivated').length;
}

export function permissionsForRole(role: ManagedRole) {
  return ALL_PERMISSIONS.filter((permission) => role.permissionKeys.includes(permission.key));
}

/** Each action returns the toast to show, or { error } when it was refused (web: toast.error). */
export type ActionResult = { message: string } | { error: string };

export function saveRole(draft: CustomRoleDraft, editingId?: string): ActionResult {
  const duplicateName = state.roleCatalog.find(
    (entry) => entry.id !== editingId && entry.name.trim().toLowerCase() === draft.name.trim().toLowerCase()
  );
  if (duplicateName) return { error: `A role named "${duplicateName.name}" already exists` };
  const duplicatePermissions = state.roleCatalog.find(
    (entry) => entry.id !== editingId && permissionSetsEqual(entry.permissionKeys, draft.permissionKeys)
  );
  if (duplicatePermissions) return { error: `A role with the same permissions already exists: "${duplicatePermissions.name}"` };

  const existing = editingId ? state.roleCatalog.find((entry) => entry.id === editingId) : undefined;
  if (existing) {
    setState({
      roleCatalog: state.roleCatalog.map((entry) =>
        entry.id === existing.id ? { ...entry, name: draft.name, description: draft.description, permissionKeys: draft.permissionKeys } : entry
      ),
      roster:
        existing.name !== draft.name
          ? state.roster.map((entry) => (entry.role === existing.name ? { ...entry, role: draft.name } : entry))
          : state.roster,
    });
    return { message: `Role "${draft.name}" updated` };
  }
  setState({
    roleCatalog: [
      { id: `custom-role-${Date.now()}`, name: draft.name, roleType: 'custom', description: draft.description, permissionKeys: draft.permissionKeys },
      ...state.roleCatalog,
    ],
  });
  return { message: `Custom role "${draft.name}" created with ${draft.permissionKeys.length} permission(s)` };
}

export function updateUser(id: string, patch: Partial<RosterEntry>) {
  setState({ roster: state.roster.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)) });
}

export function inviteUser(invite: { name: string; email: string; phone: string; role: string; storeIds: string[] }): ActionResult {
  const normalizedEmail = invite.email.trim().toLowerCase();
  if (state.roster.some((entry) => entry.email.trim().toLowerCase() === normalizedEmail)) {
    return { error: `${invite.email} is already invited or added` };
  }
  const { dateStr, timeStr } = formatNow();
  const entry: RosterEntry = {
    id: `invite-${Date.now()}`,
    name: invite.name,
    email: invite.email,
    phone: invite.phone || undefined,
    addedOnDate: dateStr,
    addedOnTime: timeStr,
    scope: scopeForRole(invite.role),
    role: invite.role,
    status: 'Invited',
    storeIds: invite.storeIds.length > 0 ? invite.storeIds : undefined,
  };
  setState({ roster: [entry, ...state.roster] });
  return { message: `Invite sent to ${invite.email}` };
}

/** Adds a ready-made roster entry (Manage stores → Add user). */
export function addRosterEntry(entry: RosterEntry) {
  setState({ roster: [entry, ...state.roster] });
}

export function setUserStatus(id: string, status: RosterEntry['status']) {
  updateUser(id, { status });
}

export function removeRosterEntry(id: string) {
  setState({ roster: state.roster.filter((entry) => entry.id !== id) });
}

export function deleteRole(id: string) {
  setState({ roleCatalog: state.roleCatalog.filter((entry) => entry.id !== id) });
}

export function reassignAndDeleteRole(role: ManagedRole, replacementName: string): ActionResult {
  const replacement = state.roleCatalog.find((entry) => entry.name === replacementName);
  if (!replacement) return { error: 'Choose a role to move users to' };
  const assigned = assignedUserCount(role.name);
  const scope = computeAccessScope(replacement.permissionKeys);
  setState({
    roster: state.roster.map((entry) => (entry.role === role.name ? { ...entry, role: replacement.name, scope } : entry)),
    roleCatalog: state.roleCatalog.filter((entry) => entry.id !== role.id),
  });
  return { message: `Reassigned ${assigned} user(s) to "${replacement.name}" and deleted "${role.name}"` };
}
