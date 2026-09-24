import { useLocalSearchParams } from 'expo-router';

import { UsersRoles } from '@/components/account/users-roles';

/** /more/users (web: the sidebar's "Manage users and roles"). `?invite=1` opens Invite users (Overview quick action). */
export default function UsersRolesScreen() {
  const { invite } = useLocalSearchParams<{ invite?: string }>();
  return <UsersRoles openInvite={invite === '1'} />;
}
