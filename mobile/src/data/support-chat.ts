/**
 * The scripted support chat (web: SupportChatContent), as pure state
 * transitions. Device & Hardware → GPRS / Network Issues or No SIM / SIM Lock
 * → device health check → printer issue → raise ticket follows the Figma
 * script; every other topic/question falls back to that question's FAQ answer.
 * The web stores click handlers inside messages; here messages are plain data
 * and the screen dispatches on their kind.
 */
import {
  buildChatTicketDraft,
  type ChatDevice,
  getSupportTopic,
  GPRS_STEPS,
  SIM_STEPS,
  SUPPORT_TOPICS,
  type SupportTopicSlug,
  type TicketEditDraft,
  TOPIC_FAQS,
} from './support';

export type HealthCard = { label: string; icon: 'battery-full' | 'printer' | 'gear' | 'wifi-high'; ok: boolean };

export type ChatMessage =
  | { id: string; role: 'user'; kind: 'text'; text: string }
  | { id: string; role: 'bot'; kind: 'text'; text: string }
  | { id: string; role: 'bot'; kind: 'steps'; heading: string; steps: string[]; footer: string }
  /** `topics`: pick a topic · `questions`: pick one of a topic's FAQs · `next-step`: health check or ticket. */
  | { id: string; role: 'bot'; kind: 'options'; purpose: 'topics' | 'questions' | 'next-step'; topicSlug?: SupportTopicSlug; prompt: string; options: string[] }
  | { id: string; role: 'bot'; kind: 'device-picker' }
  | {
      id: string;
      role: 'bot';
      kind: 'health-report';
      device: ChatDevice;
      cards: HealthCard[];
      issueNote?: string;
      message: string;
      suggestions: string[];
    }
  | { id: string; role: 'bot'; kind: 'raise-ticket'; draft: TicketEditDraft }
  | { id: string; role: 'bot'; kind: 'ticket-confirmation'; ticketId: string };

export type ChatState = { title: string; messages: ChatMessage[] };

export const RUN_HEALTH_CHECK = 'Run device health check';
export const RAISE_TICKET = 'Raise a ticket';
export const TRY_ANOTHER_CHECK = 'Try another device check';
export const RAISE_PRINTER_TICKET = 'Raise a ticket for printer issue';

let nextId = 0;
const uid = () => `m${(nextId += 1)}`;

type NewMessage = ChatMessage extends infer M ? (M extends ChatMessage ? Omit<M, 'id'> : never) : never;

function append(state: ChatState, ...messages: NewMessage[]): ChatState {
  return { ...state, messages: [...state.messages, ...messages.map((message) => ({ ...message, id: uid() }) as ChatMessage)] };
}

export function startChat(): ChatState {
  return append(
    { title: 'New support chat', messages: [] },
    {
      role: 'bot',
      kind: 'options',
      purpose: 'topics',
      prompt: 'Hi, tell us how can we help you today. For starters, select a topic of your issue.',
      options: SUPPORT_TOPICS.map((topic) => topic.label),
    }
  );
}

const nextStepPrompt: NewMessage = {
  role: 'bot',
  kind: 'options',
  purpose: 'next-step',
  prompt: "If this didn't resolve it, I can run a device health check or raise a ticket for you.",
  options: [RUN_HEALTH_CHECK, RAISE_TICKET],
};

export function selectTopic(state: ChatState, topicLabel: string): ChatState {
  const topic = SUPPORT_TOPICS.find((item) => item.label === topicLabel);
  if (!topic) return state;
  return append(
    { ...state, title: topic.label },
    { role: 'user', kind: 'text', text: topic.label },
    {
      role: 'bot',
      kind: 'options',
      purpose: 'questions',
      topicSlug: topic.slug,
      prompt: `Got it — here are some common ${topic.label} issues. Select the one closest to yours, or describe it below.`,
      options: (TOPIC_FAQS[topic.slug] ?? []).map((faq) => faq.question),
    }
  );
}

export function selectQuestion(state: ChatState, topicSlug: SupportTopicSlug, question: string): ChatState {
  const next = append({ ...state, title: question }, { role: 'user', kind: 'text', text: question });
  const footer = 'I can also use this context for a device check or ticket if the issue continues.';

  if (topicSlug === 'device-hardware' && question === 'GPRS / Network Issues') {
    return append(next, { role: 'bot', kind: 'steps', heading: 'Actions Configuration', steps: GPRS_STEPS, footer }, nextStepPrompt);
  }
  if (topicSlug === 'device-hardware' && question === 'No SIM / SIM Lock on PoS') {
    return append(
      next,
      { role: 'bot', kind: 'steps', heading: 'Steps — if this remains unresolved, raise a request for Terminal Issues.', steps: SIM_STEPS, footer },
      nextStepPrompt
    );
  }
  const topic = getSupportTopic(topicSlug);
  const faq = (TOPIC_FAQS[topicSlug] ?? []).find((item) => item.question === question);
  return append(
    next,
    { role: 'bot', kind: 'text', text: faq?.answer ?? `Here's what I found for "${question}" under ${topic?.label ?? 'this topic'}.` },
    nextStepPrompt
  );
}

export function runHealthCheck(state: ChatState): ChatState {
  return append(state, { role: 'user', kind: 'text', text: RUN_HEALTH_CHECK }, { role: 'bot', kind: 'device-picker' });
}

export function selectDevice(state: ChatState, device: ChatDevice): ChatState {
  const next = append(state, { role: 'user', kind: 'text', text: device.label });
  if (device.hasIssue) {
    return append(next, {
      role: 'bot',
      kind: 'health-report',
      device,
      cards: [
        { label: 'Battery', icon: 'battery-full', ok: true },
        { label: 'Printer', icon: 'printer', ok: false },
        { label: 'Software', icon: 'gear', ok: true },
        { label: 'Connectivity', icon: 'wifi-high', ok: true },
      ],
      issueNote: 'Printer is out of paper',
      message:
        'We detected an issue with your printer when we did the device check. If you want, I can raise a ticket for you and someone will get that checked.',
      suggestions: [RAISE_PRINTER_TICKET, TRY_ANOTHER_CHECK],
    });
  }
  return append(next, {
    role: 'bot',
    kind: 'health-report',
    device,
    cards: [
      { label: 'Battery', icon: 'battery-full', ok: true },
      { label: 'Printer', icon: 'printer', ok: true },
      { label: 'Software', icon: 'gear', ok: true },
      { label: 'Connectivity', icon: 'wifi-high', ok: true },
    ],
    message: `Good news — ${device.label} passed every check with no issues detected.`,
    suggestions: [TRY_ANOTHER_CHECK],
  });
}

export function raiseTicketForPrinter(state: ChatState, device: ChatDevice): ChatState {
  return append(
    state,
    { role: 'bot', kind: 'text', text: 'Please check your details for the ticket.' },
    { role: 'bot', kind: 'raise-ticket', draft: buildChatTicketDraft(device, 'Printer Issue') }
  );
}

export function raiseTicketDirect(state: ChatState): ChatState {
  return append(
    state,
    { role: 'user', kind: 'text', text: RAISE_TICKET },
    { role: 'bot', kind: 'text', text: 'Please check your details for the ticket.' },
    { role: 'bot', kind: 'raise-ticket', draft: buildChatTicketDraft(null, state.title) }
  );
}

export function updateTicketDraft(state: ChatState, messageId: string, draft: TicketEditDraft): ChatState {
  return {
    ...state,
    messages: state.messages.map((message) => (message.id === messageId && message.kind === 'raise-ticket' ? { ...message, draft } : message)),
  };
}

export function confirmTicket(state: ChatState, ticketId: string): ChatState {
  return append(state, { role: 'bot', kind: 'ticket-confirmation', ticketId });
}

export function sendFreeText(state: ChatState, text: string): ChatState {
  const trimmed = text.trim();
  if (!trimmed) return state;
  return append(
    state,
    { role: 'user', kind: 'text', text: trimmed },
    {
      role: 'bot',
      kind: 'text',
      text: "Got it — let me look into that. In the meantime, you can run a device health check or raise a ticket if this doesn't resolve it.",
    },
    nextStepPrompt
  );
}

/** Opening state for /support/chat: a topic chip pre-selects the topic; a typed prompt is sent straight away. */
export function initialChat({ topic, prompt }: { topic?: string; prompt?: string }): ChatState {
  const start = startChat();
  const topicLabel = topic ? getSupportTopic(topic)?.label : undefined;
  if (topicLabel) return selectTopic(start, topicLabel);
  if (prompt) return sendFreeText(start, prompt);
  return start;
}
