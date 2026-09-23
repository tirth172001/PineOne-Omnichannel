import type { Meta, StoryObj } from '@storybook/react-native';

import { CURRENT_USER, ORGANISATIONS } from '@/data/businesses';

import { AppHeader } from './app-header';
import { ShellTopBar } from './shell-top-bar';

const meta = {
  title: 'PineOne/AppHeader',
  component: AppHeader,
  // The header is transparent; it's always shown inside the shell's rounded top bar.
  decorators: [
    (Story) => (
      <ShellTopBar>
        <Story />
      </ShellTopBar>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'App shell header (Figma 47:2350). The left side opens the org/shop switcher, and the right side holds notifications and the account.',
      },
    },
  },
  args: {
    organisationName: ORGANISATIONS[0].name,
    shopName: ORGANISATIONS[0].shops[0].name,
    organisationLogo: ORGANISATIONS[0].logo,
    avatar: CURRENT_USER.avatar,
  },
} satisfies Meta<typeof AppHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutLogo: Story = {
  args: {
    organisationName: ORGANISATIONS[1].name,
    shopName: ORGANISATIONS[1].shops[0].name,
    organisationLogo: undefined,
  },
};
