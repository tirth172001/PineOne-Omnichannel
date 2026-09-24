import type { Meta, StoryObj } from '@storybook/react-native';

import { QuickActions } from './quick-actions';

const meta = {
  title: 'PineOne/Overview/QuickActions',
  component: QuickActions,
  parameters: {
    docs: {
      description: {
        component:
          "Overview's Quick actions (mobile-only, replaces the web's Analytics): small cards with an icon and label for the most common tasks. Download report, Create payment link and Invite user open their flow directly; Respond to disputes shows how many need a response.",
      },
    },
  },
} satisfies Meta<typeof QuickActions>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
