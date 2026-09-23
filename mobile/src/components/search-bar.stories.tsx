import type { Meta, StoryObj } from '@storybook/react-native';

import { SearchBar } from './search-bar';

const meta = {
  title: 'PineOne/SearchBar',
  component: SearchBar,
} satisfies Meta<typeof SearchBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Search',
  },
};
