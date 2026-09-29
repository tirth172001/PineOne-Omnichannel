import { InnerPageStack } from '@/components/inner-page-stack';

/**
 * Users and roles is a stack: the listing at /users, with pending invites and
 * the role form pushed on top, sliding in from the right (see InnerPageStack).
 */
export default function UsersLayout() {
  return <InnerPageStack />;
}
