import type { Meta, StoryObj } from '@storybook/react-native';

import { ORGANISATIONS } from '@/data/businesses';

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
          'App shell header (Figma 47:2350): the title (the user and their role on Overview, the page name elsewhere) over the store / channel scope, opening the switcher; notifications on the right.',
      },
    },
  },
  args: {
    title: 'Tirth Trivedi',
    badge: 'Admin',
    scope: `${ORGANISATIONS[0].shops[0].name} · All channels`,
  },
} satisfies Meta<typeof AppHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PageTitle: Story = {
  args: {
    title: 'Settlements',
    badge: undefined,
    scope: `${ORGANISATIONS[0].shops[0].name} · In-store`,
  },
};
