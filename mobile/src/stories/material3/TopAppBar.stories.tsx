import type { Meta, StoryObj } from '@storybook/react-native';
import { Appbar } from 'react-native-paper';

type Mode = 'small' | 'center-aligned' | 'medium' | 'large';

function TopAppBarDemo({ mode = 'small', title = 'Settlements' }: { mode?: Mode; title?: string }) {
  return (
    <Appbar.Header mode={mode} statusBarHeight={0}>
      {/* Appbar.Action, not Appbar.BackAction: BackAction hard-codes a Material icon. */}
      <Appbar.Action icon="arrow-left" onPress={() => {}} accessibilityLabel="Back" />
      <Appbar.Content title={title} />
      <Appbar.Action icon="magnifying-glass" onPress={() => {}} />
      <Appbar.Action icon="dots-three-vertical" onPress={() => {}} />
    </Appbar.Header>
  );
}

const meta = {
  title: 'Material3/TopAppBar',
  component: TopAppBarDemo,
  parameters: {
    docs: {
      description: {
        component:
          'M3 guidance: shows the screen title plus navigation and a few actions (at most 3 icons, the rest go in an overflow menu). Use small for most screens and center-aligned for top-level screens with a single title. Medium and large are for screens where the title is important; they collapse to small on scroll.',
      },
    },
  },
  args: { title: 'Settlements' },
} satisfies Meta<typeof TopAppBarDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Small: Story = { args: { mode: 'small' } };

export const CenterAligned: Story = { args: { mode: 'center-aligned' } };

export const Medium: Story = { args: { mode: 'medium' } };

export const Large: Story = { args: { mode: 'large' } };
