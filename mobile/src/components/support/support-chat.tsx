import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Icon, IconButton, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { OutlinedActionButton } from '@/components/shared/controls';
import { DETAIL_HEADER_BUTTON_STYLE, DetailScreen } from '@/components/shared/detail-screen';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { CHAT_DEVICES, type TicketEditDraft } from '@/data/support';
import {
  type ChatMessage,
  type ChatState,
  confirmTicket,
  initialChat,
  RAISE_PRINTER_TICKET,
  RAISE_TICKET,
  raiseTicketDirect,
  raiseTicketForPrinter,
  RUN_HEALTH_CHECK,
  runHealthCheck,
  selectDevice,
  selectQuestion,
  selectTopic,
  sendFreeText,
  startChat,
  TRY_ANOTHER_CHECK,
  updateTicketDraft,
} from '@/data/support-chat';
import { useToast } from '@/hooks/use-toast';

import { SupportChatComposer, SupportHeroIcon } from './support-chat-composer';
import { TicketEditSheet } from './ticket-sheets';

const CARD_PADDING = 16;
const CARD_INNER_RADIUS = concentric(Shape.max, CARD_PADDING);
const SUCCESS = '#059669';
const DESTRUCTIVE = '#dc2626';

type Handlers = {
  onOption: (message: Extract<ChatMessage, { kind: 'options' }>, option: string) => void;
  onDevice: (deviceId: string) => void;
  onSuggestion: (message: Extract<ChatMessage, { kind: 'health-report' }>, suggestion: string) => void;
  onEditTicket: (message: Extract<ChatMessage, { kind: 'raise-ticket' }>) => void;
  onRaiseTicket: () => void;
  toast: (message: string) => void;
};

function FeedbackRow() {
  const theme = useTheme();
  return (
    <View style={styles.feedback}>
      <IconButton icon="thumbs-up" size={14} iconColor={theme.colors.onSurfaceVariant} accessibilityLabel="Helpful" style={styles.feedbackButton} onPress={() => {}} />
      <IconButton icon="thumbs-down" size={14} iconColor={theme.colors.onSurfaceVariant} accessibilityLabel="Not helpful" style={styles.feedbackButton} onPress={() => {}} />
    </View>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.keyValue}>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={[styles.medium, styles.keyValueValue]}>
        {value}
      </Text>
    </View>
  );
}

function BotContent({ message, handlers }: { message: ChatMessage; handlers: Handlers }) {
  const theme = useTheme();
  const muted = { color: theme.colors.onSurfaceVariant };
  const border = { borderColor: theme.colors.outlineVariant };

  switch (message.kind) {
    case 'text':
      return <Text variant="bodyMedium" style={styles.body}>{message.text}</Text>;
    case 'steps':
      return (
        <View style={styles.stack}>
          <Text variant="bodyMedium" style={styles.semiBold}>
            {message.heading}
          </Text>
          <Text variant="bodyMedium" style={muted}>
            Try this next:
          </Text>
          {message.steps.map((step, index) => (
            <Text key={step} variant="bodyMedium">
              {index + 1}. {step}
            </Text>
          ))}
          <Text variant="bodyMedium" style={muted}>
            {message.footer}
          </Text>
        </View>
      );
    case 'options':
      return (
        <View style={styles.stack}>
          <Text variant="bodyMedium">{message.prompt}</Text>
          {message.options.map((option) => (
            <TouchableRipple
              key={option}
              onPress={() => handlers.onOption(message, option)}
              borderless
              accessibilityRole="button"
              style={[styles.option, border, { backgroundColor: theme.colors.surface }]}>
              <Text variant="bodyMedium">{option}</Text>
            </TouchableRipple>
          ))}
        </View>
      );
    case 'device-picker':
      return (
        <View style={styles.stack}>
          <Text variant="bodyMedium">Select the device you want me to check.</Text>
          <View style={[styles.deviceList, border, { backgroundColor: theme.colors.surface }]}>
            {CHAT_DEVICES.map((device, index) => (
              <TouchableRipple
                key={device.id}
                onPress={() => handlers.onDevice(device.id)}
                accessibilityRole="button"
                accessibilityLabel={device.label}
                style={[styles.deviceRow, index > 0 && [styles.divider, border]]}>
                <View>
                  <Text variant="bodyMedium" style={styles.medium}>
                    {device.label}
                  </Text>
                  <Text variant="bodySmall" style={muted}>
                    {device.meta}
                  </Text>
                </View>
              </TouchableRipple>
            ))}
            <TouchableRipple
              onPress={() => handlers.toast('No more devices to show in this demo')}
              accessibilityRole="button"
              style={[styles.deviceMore, styles.divider, border]}>
              <Text variant="bodyMedium" style={[styles.medium, { color: theme.colors.primary }]}>
                View more devices
              </Text>
            </TouchableRipple>
          </View>
        </View>
      );
    case 'health-report':
      return (
        <View style={styles.stackLarge}>
          <View style={styles.rowBetween}>
            <Text variant="bodyMedium" style={styles.semiBold}>
              Health check report
            </Text>
            <OutlinedActionButton label="Download report" icon="download-simple" onPress={() => handlers.toast('Downloading health check report...')} />
          </View>
          <View style={styles.healthGrid}>
            {message.cards.map((card) => (
              <View key={card.label} style={[styles.healthCard, border, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.rowBetween}>
                  <Icon source={card.icon} size={20} color={theme.colors.onSurfaceVariant} />
                  <Icon source={card.ok ? 'check-circle-fill' : 'x-circle-fill'} size={16} color={card.ok ? SUCCESS : DESTRUCTIVE} />
                </View>
                <Text variant="bodyMedium" style={styles.medium}>
                  {card.label}
                </Text>
              </View>
            ))}
          </View>
          {message.issueNote ? (
            <View style={styles.issueNote}>
              <Icon source="warning-fill" size={14} color={DESTRUCTIVE} />
              <Text variant="bodySmall" style={{ color: DESTRUCTIVE }}>
                {message.issueNote}
              </Text>
            </View>
          ) : null}
          <Text variant="bodyMedium" style={styles.body}>
            {message.message}
          </Text>
          <FeedbackRow />
          <View style={styles.suggestions}>
            {message.suggestions.map((suggestion) => (
              <OutlinedActionButton key={suggestion} label={suggestion} onPress={() => handlers.onSuggestion(message, suggestion)} />
            ))}
          </View>
        </View>
      );
    case 'raise-ticket': {
      const { draft } = message;
      return (
        <View style={[styles.ticketCard, border, { backgroundColor: theme.colors.surface }]}>
          <Text variant="bodyMedium" style={styles.semiBold}>
            Raise a ticket
          </Text>
          <KeyValue label="Category" value={draft.category} />
          <KeyValue label="POS ID" value={draft.posId} />
          <KeyValue label="Issue description" value={draft.issueDescription} />
          <View style={styles.keyValue}>
            <Text variant="bodyMedium" style={muted}>
              Health check report
            </Text>
            <TouchableRipple onPress={() => handlers.toast('Downloading health check report...')} borderless accessibilityRole="button" style={styles.link}>
              <View style={styles.linkContent}>
                <Text variant="bodyMedium" style={[styles.medium, { color: theme.colors.primary }]}>
                  {draft.healthCheckReport}
                </Text>
                <Icon source="download-simple" size={14} color={theme.colors.primary} />
              </View>
            </TouchableRipple>
          </View>
          <View style={[styles.hr, { backgroundColor: theme.colors.outlineVariant }]} />
          <Text variant="bodyMedium" style={styles.semiBold}>
            Store details
          </Text>
          <View style={styles.storeGrid}>
            <View style={styles.half}>
              <Text variant="bodyMedium" style={muted}>
                Name
              </Text>
              <Text variant="bodyMedium" style={styles.medium}>
                {draft.storeName}
              </Text>
            </View>
            <View style={styles.half}>
              <Text variant="bodyMedium" style={muted}>
                Contact
              </Text>
              <Text variant="bodyMedium" style={styles.medium}>
                {draft.storeContact}
              </Text>
            </View>
          </View>
          <View>
            <Text variant="bodyMedium" style={muted}>
              Address
            </Text>
            <Text variant="bodyMedium" style={styles.medium}>
              {draft.storeAddress}
            </Text>
          </View>
          <View style={styles.warning}>
            <Text variant="bodySmall" style={{ color: '#92400e' }}>
              Ensure that you verify the store&apos;s address and contact details.
            </Text>
          </View>
          <View style={styles.ticketActions}>
            <Button
              mode="outlined"
              onPress={() => handlers.onEditTicket(message)}
              textColor={theme.colors.onSurface}
              style={[styles.flex, styles.innerButton, border]}>
              Edit details
            </Button>
            <Button mode="contained" onPress={handlers.onRaiseTicket} style={[styles.flex, styles.innerButton]}>
              Raise ticket
            </Button>
          </View>
          <FeedbackRow />
        </View>
      );
    }
    case 'ticket-confirmation':
      return (
        <View style={styles.confirmation}>
          <View style={styles.linkContent}>
            <Icon source="check-circle-fill" size={16} color={SUCCESS} />
            <Text variant="bodyMedium" style={styles.semiBold}>
              Ticket raised successfully
            </Text>
          </View>
          <Text variant="bodySmall" style={muted}>
            Ticket <Text variant="bodySmall" style={[styles.medium, { color: theme.colors.onSurface }]}>{message.ticketId}</Text> has been
            created. Our team will get back to you within 48 hours.
          </Text>
        </View>
      );
  }
}

function MessageBubble({ message, handlers }: { message: ChatMessage; handlers: Handlers }) {
  const theme = useTheme();
  if (message.role === 'user') {
    return (
      <View style={styles.userRow}>
        <View style={[styles.userBubble, { backgroundColor: theme.colors.primary }]}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onPrimary }}>
            {message.kind === 'text' ? message.text : ''}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.botRow}>
      <SupportHeroIcon size={32} />
      <View style={styles.botContent}>
        <BotContent message={message} handlers={handlers} />
      </View>
    </View>
  );
}

/**
 * Support chat (web: SupportChatContent): a scripted assistant. The header
 * shows the current topic or question with New chat; messages scroll above
 * the pinned composer. `topic` / `prompt` come from the Support landing.
 */
export function SupportChat({ topic, prompt }: { topic?: string; prompt?: string }) {
  const theme = useTheme();
  const toast = useToast();
  const [chat, setChat] = useState<ChatState>(() => initialChat({ topic, prompt }));
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState<{ messageId: string; draft: TicketEditDraft } | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const handlers: Handlers = {
    toast,
    onOption: (message, option) => {
      if (message.purpose === 'topics') setChat((current) => selectTopic(current, option));
      else if (message.purpose === 'questions' && message.topicSlug) {
        const slug = message.topicSlug;
        setChat((current) => selectQuestion(current, slug, option));
      } else if (option === RUN_HEALTH_CHECK) setChat(runHealthCheck);
      else if (option === RAISE_TICKET) setChat(raiseTicketDirect);
    },
    onDevice: (deviceId) => {
      const device = CHAT_DEVICES.find((item) => item.id === deviceId);
      if (device) setChat((current) => selectDevice(current, device));
    },
    onSuggestion: (message, suggestion) => {
      if (suggestion === TRY_ANOTHER_CHECK) setChat(runHealthCheck);
      else if (suggestion === RAISE_PRINTER_TICKET) setChat((current) => raiseTicketForPrinter(current, message.device));
    },
    onEditTicket: (message) => setEditing({ messageId: message.id, draft: message.draft }),
    onRaiseTicket: () => {
      const ticketId = `PL-ITCH${Math.floor(30 + Math.random() * 60)}`;
      setChat((current) => confirmTicket(current, ticketId));
      toast(`Ticket ${ticketId} raised successfully`);
    },
  };

  const send = () => {
    setChat((current) => sendFreeText(current, draft));
    setDraft('');
  };

  return (
    <DetailScreen
      title={chat.title}
      fallbackHref="/support"
      scroll={false}
      actions={
        <>
          <Appbar.Action
            icon="sidebar-simple"
            onPress={() => toast("Chat history isn't available in this demo")}
            accessibilityLabel="Toggle chat list"
            style={DETAIL_HEADER_BUTTON_STYLE}
          />
          <OutlinedActionButton label="New chat" icon="plus" onPress={() => setChat(startChat())} />
        </>
      }>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
          {chat.messages.map((message) => (
            <MessageBubble key={message.id} message={message} handlers={handlers} />
          ))}
        </ScrollView>
        <View style={[styles.composer, { backgroundColor: theme.colors.background }]}>
          <SupportChatComposer value={draft} onChange={setDraft} onSubmit={send} placeholder="Describe your support issue" />
        </View>
      </KeyboardAvoidingView>

      <TicketEditSheet
        visible={editing !== null}
        onDismiss={() => setEditing(null)}
        ticket={null}
        initialDraft={editing?.draft}
        onSave={(next) => {
          if (editing) setChat((current) => updateTicketDraft(current, editing.messageId, next));
        }}
      />
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  medium: { fontFamily: Fonts.medium },
  semiBold: { fontFamily: Fonts.semiBold },
  body: { lineHeight: 22 },
  messages: { padding: 16, gap: 20 },
  composer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  userRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  // Web: rounded-2xl rounded-tr-sm, capped at the 12dp maximum.
  userBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Shape.max,
    borderTopRightRadius: Shape.extraSmall,
  },
  botRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  botContent: { flex: 1, minWidth: 0, maxWidth: '90%' },
  stack: { gap: 8 },
  stackLarge: { gap: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  // Standalone controls in the message column.
  option: { borderWidth: 1, borderRadius: Shape.small, paddingHorizontal: 14, paddingVertical: 10 },
  deviceList: { borderWidth: 1, borderRadius: Shape.max, overflow: 'hidden' },
  deviceRow: { paddingHorizontal: 16, paddingVertical: 12 },
  deviceMore: { paddingVertical: 10, alignItems: 'center' },
  divider: { borderTopWidth: StyleSheet.hairlineWidth },
  healthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  healthCard: { flexBasis: '45%', flexGrow: 1, borderWidth: 1, borderRadius: Shape.max, padding: 12, gap: 8 },
  issueNote: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  feedback: { flexDirection: 'row', gap: 4, marginLeft: -8 },
  feedbackButton: { margin: 0, borderRadius: Shape.small },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ticketCard: { borderWidth: 1, borderRadius: Shape.max, padding: CARD_PADDING, gap: 10 },
  keyValue: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  keyValueValue: { flexShrink: 1, textAlign: 'right' },
  link: { borderRadius: CARD_INNER_RADIUS, flexShrink: 1 },
  linkContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hr: { height: StyleSheet.hairlineWidth },
  storeGrid: { flexDirection: 'row', gap: 8 },
  half: { flex: 1 },
  warning: { backgroundColor: '#fef3c7', borderRadius: CARD_INNER_RADIUS, paddingHorizontal: 12, paddingVertical: 8 },
  ticketActions: { flexDirection: 'row', gap: 8 },
  innerButton: { borderRadius: CARD_INNER_RADIUS },
  confirmation: {
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: Shape.max,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
});
