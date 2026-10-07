import { useLocalSearchParams } from 'expo-router';

import { AccountSettingsSection } from '@/components/account/account-settings';

/** /account-settings/[section]: one section of Account settings (web: a tab of /account-settings). */
export default function AccountSettingsSectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  return <AccountSettingsSection sectionKey={section} />;
}
