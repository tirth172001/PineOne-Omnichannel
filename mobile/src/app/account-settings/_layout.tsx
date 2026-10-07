import { InnerPageStack } from '@/components/inner-page-stack';

/**
 * Account settings is a stack: the list of sections at /account-settings,
 * with each section's page pushed on top, sliding in from the right (see
 * InnerPageStack).
 */
export default function AccountSettingsLayout() {
  return <InnerPageStack />;
}
