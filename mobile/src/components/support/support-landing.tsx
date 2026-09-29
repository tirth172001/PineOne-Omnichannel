import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { StatusPill } from '@/components/shared/status';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { applyTicketDraft, SUPPORT_TICKETS, SUPPORT_TOPICS, SUPPORT_VIDEOS, type SupportTicket, ticketStatusTone } from '@/data/support';
import { useToast } from '@/hooks/use-toast';

import { SupportChatComposer, SupportHeroIcon } from './support-chat-composer';
import { TicketDetailSheet, TicketEditSheet } from './ticket-sheets';
import { VideoThumbnail } from './video-thumbnail';

const HERO_TOPIC_LIMIT = 4;
const CARD_PADDING = 16;
const CARD_INNER_RADIUS = concentric(Shape.max, CARD_PADDING);

function SectionHeader({ title, onViewAll }: { title: string; onViewAll: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text variant="titleMedium" style={styles.semiBold} accessibilityRole="header">
        {title}
      </Text>
      <Button mode="text" compact onPress={onViewAll} style={styles.textButton}>
        View all
      </Button>
    </View>
  );
}

/**
 * Support landing (web: SupportLandingContent): the "How can we help you
 * today?" hero with the chat composer and topic chips, then the three latest
 * support tickets and tutorial videos. Asking or picking a topic opens the
 * chat; tickets open the detail panel. The web's composer slide-down
 * animation into the chat page is replaced by the stack's push transition.
 */
export function SupportLanding() {
  const theme = useTheme();
  const toast = useToast();
  const [prompt, setPrompt] = useState('');
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>(SUPPORT_TICKETS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null;
  const topics = showAllTopics ? SUPPORT_TOPICS : SUPPORT_TOPICS.slice(0, HERO_TOPIC_LIMIT);
  const muted = { color: theme.colors.onSurfaceVariant };

  const ask = () => {
    const text = prompt.trim();
    setPrompt('');
    router.push(text ? { pathname: '/support/chat', params: { prompt: text } } : '/support/chat');
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <SupportHeroIcon size={56} />
        <Text variant="headlineSmall" style={[styles.semiBold, styles.center]}>
          How can we help you today?
        </Text>
        <Text variant="bodyMedium" style={[styles.center, muted]}>
          Ask a question or describe your issue — our assistant will take it from there.
        </Text>
        <View style={styles.composer}>
          <SupportChatComposer value={prompt} onChange={setPrompt} onSubmit={ask} />
        </View>
        <View style={styles.chips}>
          {topics.map((topic) => (
            <Chip
              key={topic.slug}
              mode="outlined"
              icon={topic.icon}
              compact
              onPress={() => router.push({ pathname: '/support/chat', params: { topic: topic.slug } })}
              style={[styles.chip, { backgroundColor: theme.colors.surface }]}
              textStyle={styles.chipText}>
              {topic.label}
            </Chip>
          ))}
          {!showAllTopics && SUPPORT_TOPICS.length > HERO_TOPIC_LIMIT ? (
            <Chip mode="outlined" compact onPress={() => setShowAllTopics(true)} style={[styles.chip, { backgroundColor: theme.colors.surface }]} textStyle={styles.chipText}>
              +{SUPPORT_TOPICS.length - HERO_TOPIC_LIMIT} more
            </Chip>
          ) : null}
          <Button mode="text" compact onPress={() => router.push('/support/faqs')} labelStyle={styles.chipText} style={styles.textButton}>
            View all FAQs
          </Button>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Support tickets" onViewAll={() => router.push('/support/tickets')} />
        {tickets.slice(0, 3).map((ticket) => (
          <Card
            key={ticket.id}
            mode="contained"
            onPress={() => {
              setSelectedId(ticket.id);
              setDetailOpen(true);
            }}
            accessibilityLabel={`${ticket.issue}, ${ticket.status}`}
            style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.cardBody}>
              <StatusPill label={ticket.status} tone={ticketStatusTone(ticket.status)} radius={CARD_INNER_RADIUS} />
              <Text variant="bodyMedium" numberOfLines={2} style={styles.medium}>
                {ticket.issue}
              </Text>
              <Text variant="bodySmall" style={muted}>
                {ticket.createdAt}
              </Text>
            </View>
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Tutorial videos" onViewAll={() => router.push('/support/videos')} />
        {SUPPORT_VIDEOS.slice(0, 3).map((video) => (
          <TouchableRipple
            key={video.title}
            onPress={() => router.push('/support/videos')}
            borderless
            accessibilityRole="link"
            accessibilityLabel={video.title}
            style={styles.video}>
            <View style={styles.videoContent}>
              <VideoThumbnail />
              <Text variant="bodyMedium" numberOfLines={2} style={styles.medium}>
                {video.title}
              </Text>
            </View>
          </TouchableRipple>
        ))}
      </View>

      <TicketDetailSheet
        visible={detailOpen}
        onDismiss={() => setDetailOpen(false)}
        ticket={selected}
        onEdit={() => {
          setDetailOpen(false);
          setEditOpen(true);
        }}
      />
      <TicketEditSheet
        visible={editOpen}
        onDismiss={() => setEditOpen(false)}
        ticket={selected}
        onSave={(draft) => {
          setTickets((current) => current.map((ticket) => (ticket.id === selectedId ? applyTicketDraft(ticket, draft) : ticket)));
          toast('Ticket details updated');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 32 },
  semiBold: { fontFamily: Fonts.semiBold },
  medium: { fontFamily: Fonts.medium },
  center: { textAlign: 'center' },
  hero: { alignItems: 'center', gap: 8, paddingTop: 24 },
  composer: { alignSelf: 'stretch', marginTop: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 12 },
  // Standalone page-level chips and links.
  chip: { borderRadius: Shape.small },
  chipText: { fontSize: 12, fontFamily: Fonts.medium },
  textButton: { borderRadius: Shape.small },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  card: { borderRadius: Shape.max },
  cardBody: { padding: CARD_PADDING, gap: 8 },
  video: { borderRadius: Shape.max },
  videoContent: { gap: 8 },
});
