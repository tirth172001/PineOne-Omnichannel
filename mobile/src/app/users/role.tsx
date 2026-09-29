import { useLocalSearchParams } from 'expo-router';

import { RoleForm } from '@/components/account/role-form';

/** /users/role?roleId=… (edit) | ?cloneId=… (create from) | none (create). */
export default function RoleFormScreen() {
  const { roleId, cloneId } = useLocalSearchParams<{ roleId?: string; cloneId?: string }>();
  return <RoleForm key={`${roleId ?? ''}|${cloneId ?? ''}`} roleId={roleId} cloneId={cloneId} />;
}
