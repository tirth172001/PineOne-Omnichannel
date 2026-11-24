import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, useTheme } from 'react-native-paper';

import { HeaderControl } from '@/components/page-header';
import { DetailScreen } from '@/components/shared/detail-screen';
import { SupportChatComposer } from '@/components/support/support-chat-composer';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { CURRENT_USER } from '@/data/businesses';
import {
  type GuideAction,
  type GuideChip,
  type GuideReply,
  type GuideSession,
  type GuideStep,
  NEW_SESSION,
  planReply,
  STARTER_POOL,
  SUPPORT_OPENER,
  titleFor,
} from '@/data/guide';
import { useToast } from '@/hooks/use-toast';

import { ExtraChips, FollowUpChip, GuideActions, GuideCardView, GuideChips, GuideMark, RichText } from './guide-cards';
import { type FeedbackSheet, GuideFeedbackSheets, GuideHistorySheet } from './guide-sheets';

// Guide, ported from the playground's Guide assistant (Figma "Guide - AI
// Assistant"): starters, a scripted conversation with rich reply cards,
// history and feedback. On the phone it's a full page pushed from the Guide
// tab, its composer pinned to the bottom.

type GuideMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'guide'; reply: GuideReply }
  | { id: string; role: 'thinking' };

type StoredChat = { id: string; title: string; messages: GuideMessage[]; session: GuideSession };

const RESOLVED_REPLY: GuideReply = { text: 'Glad I could help! 🎉 I’m here if you need anything else.' };

let messageCount = 0;
const nextId = () => `g${(messageCount += 1)}`;
const plain = (text: string) => text.replace(/\*\*/g, '');

// This session's past chats, kept while the app runs so History survives leaving the page.
let savedChats: StoredChat[] = [];
const listeners = new Set<() => void>();
const savedStore = {
  get: () => savedChats,
  set: (next: StoredChat[]) => {
    savedChats = next;
    listeners.forEach((listener) => listener());
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export const firstName = () => CURRENT_USER.name.split(' ')[0];

/** Three starters at a time from the pool, as the web's Shuffle cycles them. */
export const startersAt = (offset: number) => [0, 1, 2].map((index) => STARTER_POOL[(offset + index) % STARTER_POOL.length]);

const COMPOSER_END = 8;

export function GuideChat({ prompt }: { prompt?: string }) {
  const theme = useTheme();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [session, setSession] = useState<GuideSession>(NEW_SESSION);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState('');
  const [starterOffset, setStarterOffset] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackSheet>(null);
  const saved = useSyncExternalStore(savedStore.subscribe, savedStore.get);
  const sessionRef = useRef(session);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  /** Shows Guide's replies one after another, with a thinking state between. */
  const play = useCallback((replies: GuideStep[], done?: () => void) => {
    setBusy(true);
    let elapsed = 0;
    replies.forEach(({ delay, reply }, index) => {
      const thinkingId = nextId();
      timers.current.push(setTimeout(() => setMessages((current) => [...current, { id: thinkingId, role: 'thinking' }]), elapsed));
      elapsed += delay;
      timers.current.push(
        setTimeout(() => {
          setMessages((current) => [...current.filter((message) => message.id !== thinkingId), { id: nextId(), role: 'guide', reply }]);
          if (index === replies.length - 1) {
            setBusy(false);
            done?.();
          }
        }, elapsed)
      );
    });
  }, []);

  const send = useCallback(
    (text: string, payload?: { devices?: string[] }) => {
      const { steps, session: next } = planReply(text, sessionRef.current, payload);
      sessionRef.current = next;
      setSession(next);
      setMessages((current) => [...current, { id: nextId(), role: 'user', text: plain(text) }]);
      play(steps);
    },
    [play]
  );

  // Opened with a question (from the Guide tab): ask it straight away.
  const asked = useRef(false);
  useEffect(() => {
    if (!prompt || asked.current) return;
    asked.current = true;
    send(prompt);
  }, [prompt, send]);

  const resetChat = () => {
    clearTimers();
    setBusy(false);
    setMessages([]);
    setSession(NEW_SESSION);
    sessionRef.current = NEW_SESSION;
  };

  const currentAsStored = (): StoredChat | null => {
    const first = messages.find((message) => message.role === 'user');
    if (!first || first.role !== 'user') return null;
    return { id: nextId(), title: titleFor(first.text), messages: messages.filter((message) => message.role !== 'thinking'), session: sessionRef.current };
  };

  /** Moves the current chat into History and starts a fresh one. */
  const startNewChat = () => {
    const current = currentAsStored();
    if (current) savedStore.set([current, ...savedStore.get()]);
    resetChat();
  };

  const openSavedChat = (id: string) => {
    const chat = saved.find((item) => item.id === id);
    if (!chat) return;
    const current = currentAsStored();
    const rest = saved.filter((item) => item.id !== id);
    savedStore.set(current ? [current, ...rest] : rest);
    clearTimers();
    setBusy(false);
    setMessages(chat.messages);
    setSession(chat.session);
    sessionRef.current = chat.session;
    setHistoryOpen(false);
  };

  const onChip = (chip: GuideChip) => {
    if (busy) return;
    if (chip.effect === 'new-topic') return setFeedback('new-topic');
    if (chip.effect === 'resolved') {
      setMessages((current) => [...current, { id: nextId(), role: 'user', text: chip.label }]);
      play([{ delay: 600, reply: RESOLVED_REPLY }], () => timers.current.push(setTimeout(() => setFeedback('resolved'), 500)));
      return;
    }
    send(chip.label);
  };
  const onAction = (action: GuideAction) => !busy && send(action.label);

  const onShuffleInChat = () => {
    if (busy) return;
    const offset = (starterOffset + 3) % STARTER_POOL.length;
    setStarterOffset(offset);
    play([{ delay: 300, reply: { text: 'Here are a few things you can ask me', chips: startersAt(offset).map((label) => ({ label })), extras: true } }]);
  };

  const onNewChat = () => {
    if (messages.length === 0) return;
    if (session.mode === 'support') return setFeedback('new-topic');
    startNewChat();
  };

  const submit = () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft('');
    send(text);
  };

  let lastGuideIndex = -1;
  messages.forEach((message, index) => {
    if (message.role === 'guide') lastGuideIndex = index;
  });
  const isLatest = (index: number) => index === lastGuideIndex && index === messages.length - 1;
  const tickets = [...session.ticketsRaised, ...saved.flatMap((chat) => chat.session.ticketsRaised)];
  const empty = messages.length === 0;

  return (
    <DetailScreen
      title="Guide"
      fallbackHref="/guide"
      scroll={false}
      actions={
        <>
          <HeaderControl icon="clock-counter-clockwise" onPress={() => setHistoryOpen(true)} accessibilityLabel="History" />
          <HeaderControl icon="plus" onPress={onNewChat} accessibilityLabel="New chat" />
        </>
      }>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[styles.messages, empty && styles.emptyContainer]}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
          {empty ? (
            <View style={styles.empty}>
              <GuideMark size={40} />
              <Text style={[styles.hello, { color: theme.colors.onSurface }]}>Hi {firstName()} 👋</Text>
              <Text style={[styles.helloSub, { color: theme.colors.onSurfaceVariant }]}>How can I help with your business today?</Text>
            </View>
          ) : (
            messages.map((message, index) => {
              if (message.role === 'user') return <UserMessage key={message.id} text={message.text} />;
              if (message.role === 'thinking') return <Thinking key={message.id} />;
              return (
                <GuideReplyView
                  key={message.id}
                  reply={message.reply}
                  latest={isLatest(index)}
                  active={isLatest(index) && !busy}
                  onChip={onChip}
                  onAction={onAction}
                  onPick={(option) => !busy && send(option)}
                  onDevices={(devices) => !busy && send('Enable VAS', { devices })}
                  onShuffle={onShuffleInChat}
                  onSupport={() => !busy && send(SUPPORT_OPENER)}
                />
              );
            })
          )}
        </ScrollView>
        {empty ? (
          <View style={styles.starters}>
            {startersAt(starterOffset).map((starter) => (
              <FollowUpChip key={starter} label={starter} onPress={() => send(starter)} />
            ))}
            <ExtraChips onShuffle={() => setStarterOffset((current) => (current + 3) % STARTER_POOL.length)} onSupport={() => send(SUPPORT_OPENER)} />
          </View>
        ) : null}
        {/* Runs to the screen's bottom edge, padded clear of the home indicator. */}
        <View style={[styles.composerBar, { backgroundColor: theme.colors.surface, paddingBottom: COMPOSER_END + insets.bottom }]}>
          <SupportChatComposer value={draft} onChange={setDraft} onSubmit={submit} placeholder="Ask Guide anything" inline />
        </View>
      </KeyboardAvoidingView>

      <GuideHistorySheet
        visible={historyOpen}
        onDismiss={() => setHistoryOpen(false)}
        saved={saved}
        tickets={tickets}
        onOpenChat={openSavedChat}
        onAsk={(query) => {
          setHistoryOpen(false);
          startNewChat();
          send(query);
        }}
        onOpenTickets={() => {
          setHistoryOpen(false);
          router.push('/support/tickets');
        }}
      />
      <GuideFeedbackSheets open={feedback} onChange={setFeedback} onStartNewChat={startNewChat} onSubmitted={(message) => toast(message)} />
    </DetailScreen>
  );
}

function UserMessage({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <View style={styles.userRow}>
      <View style={[styles.userBubble, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.userText, { color: theme.colors.onSurface }]}>{text}</Text>
      </View>
    </View>
  );
}

function Thinking() {
  const theme = useTheme();
  const [pulse] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <View style={styles.thinking} accessibilityRole="progressbar" accessibilityLabel="Guide is thinking">
      {[0, 1, 2].map((dot) => (
        <Animated.View
          key={dot}
          style={[
            styles.dot,
            {
              backgroundColor: theme.colors.onSurfaceVariant,
              opacity: pulse.interpolate({ inputRange: [0, (dot + 0.5) / 3, 1], outputRange: [0.3, 1, 0.3] }),
            },
          ]}
        />
      ))}
    </View>
  );
}

function GuideReplyView({
  reply,
  latest,
  active,
  onChip,
  onAction,
  onPick,
  onDevices,
  onShuffle,
  onSupport,
}: {
  reply: GuideReply;
  /** The newest message; chips and buttons only show here. */
  latest: boolean;
  active: boolean;
  onChip: (chip: GuideChip) => void;
  onAction: (action: GuideAction) => void;
  onPick: (option: string) => void;
  onDevices: (devices: string[]) => void;
  onShuffle: () => void;
  onSupport: () => void;
}) {
  const theme = useTheme();
  const showCard = reply.card && (!reply.ephemeralCard || latest);
  const actionsBelow = reply.actions && reply.actionsLayout !== 'card';
  const hasFollowUps = latest && (reply.chips?.length || actionsBelow || reply.extras);

  return (
    <View style={styles.reply}>
      {reply.text ? (
        <View style={styles.replyText}>
          <RichText text={reply.text} color={reply.tone === 'danger' ? (theme.dark ? '#f87171' : '#dc2626') : undefined} />
          {reply.note ? <Text style={[styles.note, { color: theme.colors.onSurfaceVariant }]}>{reply.note}</Text> : null}
        </View>
      ) : null}
      {showCard && reply.card ? (
        <GuideCardView
          card={reply.card}
          active={active}
          actions={reply.actionsLayout === 'card' ? reply.actions : undefined}
          onAction={onAction}
          onPick={onPick}
          onDevices={onDevices}
        />
      ) : null}
      {hasFollowUps ? (
        <View style={styles.followUps}>
          {actionsBelow && reply.actions ? (
            <GuideActions actions={reply.actions} layout={reply.actionsLayout === 'row' ? 'row' : 'stack'} onAction={onAction} disabled={!active} />
          ) : null}
          {reply.chips?.length ? <GuideChips chips={reply.chips} onChip={onChip} disabled={!active} /> : null}
          {reply.extras ? <ExtraChips onShuffle={onShuffle} onSupport={onSupport} disabled={!active} /> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  messages: { padding: 8, paddingTop: 24, gap: 20 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  hello: { fontFamily: Fonts.semiBold, fontSize: 32, lineHeight: 40, marginTop: 8 },
  helloSub: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  starters: { paddingHorizontal: 8, paddingBottom: 12, gap: 8, alignItems: 'flex-start' },
  composerBar: { paddingHorizontal: 8, paddingTop: 8 },
  userRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  userBubble: { maxWidth: '85%', paddingHorizontal: 12, paddingVertical: 10, borderRadius: Shape.max },
  userText: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  thinking: { flexDirection: 'row', gap: 4, paddingHorizontal: 4, paddingVertical: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  reply: { gap: 12, alignItems: 'flex-start' },
  replyText: { paddingHorizontal: 4, gap: 16 },
  note: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20 },
  followUps: { gap: 12, alignSelf: 'stretch' },
});
