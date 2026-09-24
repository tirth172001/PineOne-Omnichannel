import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';

import { SUPPORT_TICKETS } from '@/data/support';

import { SupportChatComposer, SupportHeroIcon } from './support-chat-composer';
import { SupportLanding } from './support-landing';
import { TicketDetailSheet, TicketEditSheet } from './ticket-sheets';
import { VideoThumbnail } from './video-thumbnail';

const meta = {
  title: 'PineOne/Support',
  component: SupportLanding,
  parameters: {
    docs: {
      description: {
        component:
          'Support module (web: components/support/*): the landing hero with the chat composer and topic chips, recent tickets and tutorial videos, and the ticket detail / edit panels.',
      },
    },
  },
} satisfies Meta<typeof SupportLanding>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Landing: Story = {};

function ComposerDemo() {
  const [value, setValue] = useState('');
  return (
    <View style={{ gap: 16, alignItems: 'stretch' }}>
      <SupportHeroIcon size={56} />
      <SupportChatComposer value={value} onChange={setValue} onSubmit={() => setValue('')} />
      <VideoThumbnail />
    </View>
  );
}

export const Composer: Story = { render: () => <ComposerDemo /> };

function TicketPanelsDemo() {
  const [panel, setPanel] = useState<'detail' | 'edit' | null>(null);
  const ticket = SUPPORT_TICKETS[2];
  return (
    <View style={{ gap: 12, alignItems: 'flex-start' }}>
      <Button mode="outlined" onPress={() => setPanel('detail')}>
        Ticket detail
      </Button>
      <Button mode="outlined" onPress={() => setPanel('edit')}>
        Edit ticket
      </Button>
      <TicketDetailSheet visible={panel === 'detail'} onDismiss={() => setPanel(null)} ticket={ticket} onEdit={() => setPanel('edit')} />
      <TicketEditSheet visible={panel === 'edit'} onDismiss={() => setPanel(null)} ticket={ticket} onSave={() => {}} />
    </View>
  );
}

export const TicketPanels: Story = { render: () => <TicketPanelsDemo /> };
