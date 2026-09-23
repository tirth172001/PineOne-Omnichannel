import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Avatar, List, Searchbar } from 'react-native-paper';

import { Shape } from '@/constants/shape';

const RECENT = ['TXN-88213', 'Refund ₹1,200', 'Indiranagar store'];

function SearchBarDemo() {
  const [query, setQuery] = useState('');

  return (
    <Searchbar
      placeholder="Search transactions"
      icon="magnifying-glass"
      clearIcon="x"
      value={query}
      onChangeText={setQuery}
      right={() => <Avatar.Text size={32} label="HG" style={{ marginRight: 12 }} />}
      style={{ borderRadius: Shape.max }}
    />
  );
}

function SearchViewDemo() {
  const [query, setQuery] = useState('');
  const results = RECENT.filter((r) => r.toLowerCase().includes(query.toLowerCase()));

  return (
    <View>
      <Searchbar
        mode="view"
        placeholder="Search transactions"
        value={query}
        onChangeText={setQuery}
        icon="arrow-left"
        onIconPress={() => setQuery('')}
        clearIcon="x"
        showDivider
      />
      {results.map((item) => (
        <List.Item key={item} title={item} left={(props) => <List.Icon {...props} icon="clock-counter-clockwise" />} onPress={() => setQuery(item)} />
      ))}
    </View>
  );
}

const meta = {
  title: 'Material3/Search',
  component: SearchBarDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: the search bar is a persistent, prominent entry point at the top of a screen. Tapping it opens the search view (full-screen on compact), which shows recent searches and suggestions as the user types. Use it when searching is a main way to find content, such as transactions or stores.',
      },
    },
  },
} satisfies Meta<typeof SearchBarDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Bar: Story = {};

export const View_: Story = {
  name: 'View',
  render: () => <SearchViewDemo />,
};
