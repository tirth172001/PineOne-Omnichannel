import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Button, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { PanelSheet, SHEET_BUTTON, SheetRow, SheetSection } from '@/components/shared/panel-sheet';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { PAST_QUERIES, PAST_TICKETS } from '@/data/guide';

// Guide's feedback and history, from the playground's Guide (Figma
// "Chat-Feedback" and "Message and support history"), as the app's sheets.

export type FeedbackSheet = 'resolved' | 'new-topic' | 'improve' | null;

const NOT_LIKED = [
  'The support response didn’t address my concerns.',
  'The support response lacked essential information.',
  'The support response failed to address my problem.',
  'Response was misleading.',
  'The response was unclear and didn’t resolve my issue.',
];

function Description({ text }: { text: string }) {
  const theme = useTheme();
  return <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>{text}</Text>;
}

function Rating({ value, onChange }: { value: 'good' | 'bad' | null; onChange: (value: 'good' | 'bad') => void }) {
  const theme = useTheme();
  return (
    <View style={styles.rating}>
      {(['good', 'bad'] as const).map((option) => {
        const picked = value === option;
        return (
          <TouchableRipple
            key={option}
            onPress={() => onChange(option)}
            borderless
            accessibilityRole="button"
            accessibilityLabel={option === 'good' ? 'Good' : 'Bad'}
            accessibilityState={{ selected: picked }}
            style={[styles.rate, { backgroundColor: picked ? theme.colors.primary : theme.colors.surfaceVariant }]}>
            <View style={styles.rateContent}>
              <Text style={styles.emoji}>{option === 'good' ? '👍' : '👎'}</Text>
              <Text style={[styles.rateLabel, { color: picked ? theme.colors.onPrimary : theme.colors.onSurface }]}>{option === 'good' ? 'Good' : 'Bad'}</Text>
            </View>
          </TouchableRipple>
        );
      })}
    </View>
  );
}

export function GuideFeedbackSheets({
  open,
  onChange,
  onStartNewChat,
  onSubmitted,
}: {
  open: FeedbackSheet;
  onChange: (sheet: FeedbackSheet) => void;
  onStartNewChat: () => void;
  onSubmitted: (message: string) => void;
}) {
  const theme = useTheme();
  const [rating, setRating] = useState<'good' | 'bad' | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const close = () => onChange(null);

  return (
    <>
      <PanelSheet visible={open === 'resolved'} onDismiss={close} title="Chat feedback" fit>
        <View style={styles.body}>
          <Description text="Your feedback is important to us. Tell us about your chat experience" />
          <Rating
            value={null}
            onChange={(value) => {
              if (value === 'good') {
                close();
                onSubmitted('Thanks for the feedback!');
              } else onChange('improve');
            }}
          />
        </View>
      </PanelSheet>

      <PanelSheet
        visible={open === 'new-topic'}
        onDismiss={close}
        title="Need support on another topic?"
        fit
        footer={
          <Button
            mode="contained"
            icon="chat-circle"
            {...SHEET_BUTTON}
            onPress={() => {
              close();
              setRating(null);
              onStartNewChat();
            }}>
            Start new chat
          </Button>
        }>
        <View style={styles.body}>
          <Description text="To enhance your support tracking experience, we’ll start a new chat for this issue. The current chat will be saved." />
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>How was your chat experience?</Text>
          <Rating value={rating} onChange={setRating} />
        </View>
      </PanelSheet>

      <PanelSheet
        visible={open === 'improve'}
        onDismiss={close}
        title="What did you not like?"
        fit
        footer={
          <View style={styles.footerRow}>
            <Button mode="outlined" {...SHEET_BUTTON} style={[SHEET_BUTTON.style, styles.flex]} textColor={theme.colors.onSurface} onPress={close}>
              Skip for now
            </Button>
            <Button
              mode="contained"
              {...SHEET_BUTTON}
              style={[SHEET_BUTTON.style, styles.flex]}
              onPress={() => {
                close();
                setReasons([]);
                setNote('');
                onSubmitted('Thanks, we’ll use this to improve Guide');
              }}>
              Submit feedback
            </Button>
          </View>
        }>
        <SheetSection label="Select all that apply">
          {NOT_LIKED.map((reason, index) => (
            <SheetRow
              key={reason}
              first={index === 0}
              title={reason}
              role="checkbox"
              selected={reasons.includes(reason)}
              onPress={() => setReasons((current) => (current.includes(reason) ? current.filter((item) => item !== reason) : [...current, reason]))}
            />
          ))}
        </SheetSection>
        <View style={styles.noteWrap}>
          <TextInput
            value={note}
            onChangeText={setNote}
            multiline
            placeholder="Tell us more about your experience (optional)"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            style={[styles.note, { backgroundColor: theme.colors.surface, color: theme.colors.onSurface }]}
          />
        </View>
      </PanelSheet>
    </>
  );
}

export type SavedChat = { id: string; title: string };

/** History: this session's chats and earlier queries, then support tickets raised through Guide. */
export function GuideHistorySheet({
  visible,
  onDismiss,
  saved,
  tickets,
  onOpenChat,
  onAsk,
  onOpenTickets,
}: {
  visible: boolean;
  onDismiss: () => void;
  saved: SavedChat[];
  tickets: { title: string; when: string }[];
  onOpenChat: (id: string) => void;
  onAsk: (query: string) => void;
  onOpenTickets: () => void;
}) {
  const [tab, setTab] = useState<'queries' | 'support'>('queries');
  const theme = useTheme();
  const open = [...tickets.map((ticket) => ticket.title), ...PAST_TICKETS.open];
  return (
    <PanelSheet visible={visible} onDismiss={onDismiss} title="History">
      <View style={[styles.segments, { backgroundColor: theme.colors.surfaceVariant }]}>
        {(['queries', 'support'] as const).map((value) => (
          <TouchableRipple
            key={value}
            onPress={() => setTab(value)}
            borderless
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === value }}
            style={[styles.segment, tab === value && { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>{value === 'queries' ? 'Queries' : 'Support'}</Text>
          </TouchableRipple>
        ))}
      </View>
      {tab === 'queries' ? (
        <>
          {saved.length ? (
            <SheetSection label="Today">
              {saved.map((chat, index) => (
                <SheetRow key={chat.id} first={index === 0} title={chat.title} icon="chat-circle" onPress={() => onOpenChat(chat.id)} />
              ))}
            </SheetSection>
          ) : null}
          <SheetSection label="Earlier">
            {PAST_QUERIES.map((query, index) => (
              <SheetRow key={query} first={index === 0} title={query} icon="clock-counter-clockwise" onPress={() => onAsk(query)} />
            ))}
          </SheetSection>
        </>
      ) : (
        <>
          <SheetSection label="Open">
            {open.map((title, index) => (
              <SheetRow key={`${title}-${index}`} first={index === 0} title={title} icon="ticket" onPress={onOpenTickets} />
            ))}
          </SheetSection>
          <SheetSection label="Resolved">
            {PAST_TICKETS.resolved.map((title, index) => (
              <SheetRow key={title} first={index === 0} title={title} icon="check-circle" onPress={onOpenTickets} />
            ))}
          </SheetSection>
        </>
      )}
    </PanelSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { paddingHorizontal: 16, paddingBottom: 16, gap: 16 },
  description: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  rating: { flexDirection: 'row', gap: 8 },
  rate: { flex: 1, height: 48, borderRadius: Shape.max, justifyContent: 'center' },
  rateContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  emoji: { fontSize: 18 },
  rateLabel: { fontFamily: Fonts.medium, fontSize: 14 },
  footerRow: { flexDirection: 'row', gap: 8 },
  noteWrap: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  note: { minHeight: 80, borderRadius: Shape.max, padding: 12, fontFamily: Fonts.regular, fontSize: 14, textAlignVertical: 'top' },
  segments: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, padding: 4, borderRadius: Shape.max, gap: 4 },
  segment: { flex: 1, height: 36, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center' },
});
