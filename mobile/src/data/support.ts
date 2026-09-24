/**
 * Support mock data, ported verbatim from the web (lib/support-knowledge.ts,
 * lib/support-tickets.ts and the scripted chat in
 * components/support/support-chat-content.tsx): the 8-topic taxonomy, FAQs per
 * topic, tutorial videos, seeded tickets with their trail of changes, and the
 * chat's devices, steps and store details.
 */
import type { StatusTone } from './common';

export type SupportTopicSlug =
  'device-hardware' | 'payments' | 'upi' | 'settlements' | 'reports' | 'account-access' | 'training' | 'pine-checkout';

export type SupportTopic = {
  slug: SupportTopicSlug;
  label: string;
  /** Phosphor icon (web: components/support/support-topic-icon.tsx). */
  icon: string;
};

export type KnowledgeFaq = {
  question: string;
  answer: string;
};

export type KnowledgeVideo = {
  title: string;
  summary: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  topicSlug: SupportTopicSlug;
};

/** The 8-topic taxonomy shown across the support landing page, chat topic picker,
 *  FAQ tabs, and ticket categorization — same list, same order, everywhere. */
export const SUPPORT_TOPICS: SupportTopic[] = [
  { slug: 'device-hardware', label: 'Device & Hardware', icon: 'monitor' },
  { slug: 'payments', label: 'Payments', icon: 'credit-card' },
  { slug: 'upi', label: 'UPI', icon: 'qr-code' },
  { slug: 'settlements', label: 'Settlements', icon: 'receipt' },
  { slug: 'reports', label: 'Reports', icon: 'chart-bar' },
  { slug: 'account-access', label: 'Account & Access', icon: 'user-circle' },
  { slug: 'training', label: 'Training', icon: 'graduation-cap' },
  { slug: 'pine-checkout', label: 'Pine Checkout', icon: 'storefront' },
];

export function getSupportTopic(slug: string) {
  return SUPPORT_TOPICS.find((topic) => topic.slug === slug) ?? null;
}

/** FAQs per topic. Device & Hardware's list matches the Figma "All FAQs" screen exactly
 *  (11 questions); the rest are plausible mock content, reusing prior knowledge-hub
 *  copy where a topic maps cleanly. */
export const TOPIC_FAQS: Record<SupportTopicSlug, KnowledgeFaq[]> = {
  'device-hardware': [
    {
      question: 'Run Connectivity Check',
      answer:
        'Open the device diagnostics panel and run a connectivity check to confirm the terminal can reach the payment network. This tests GPRS/Wi-Fi signal, gateway ping, and last successful heartbeat.',
    },
    {
      question: 'GPRS / Network Issues',
      answer:
        'If the device shows a GPRS or network error, open Payments App → Menu → Set Connection, set the connection priority to GPRS, and submit Activate Connection. Restart the device if the issue continues.',
    },
    {
      question: 'No SIM / SIM Lock on PoS',
      answer:
        'A SIM lock usually resolves after a device restart and settling any pending batch. If the SIM is still not detected, reseat the SIM card and run a test transaction to confirm connectivity.',
    },
    {
      question: 'Alert Tampered Error',
      answer:
        'A tamper alert is a hardware security trigger. Power-cycle the terminal; if the alert persists after restart, the device must be sent for a physical inspection — raise a ticket with the device ID.',
    },
    {
      question: 'Invalid Batch Roc Iso Packet',
      answer:
        'This usually means the batch settlement packet was corrupted mid-transmission. Retry the batch settlement; if it fails again, download the batch log and raise a ticket with the diagnostic report attached.',
    },
    {
      question: 'Batch Locked Error',
      answer:
        'A locked batch means a previous settlement attempt did not complete cleanly. Wait a few minutes for the lock to clear automatically, then retry. If it stays locked for over 15 minutes, raise a ticket.',
    },
    {
      question: 'Pos Display Blank',
      answer:
        'Check the power connection and battery charge first. If the display stays blank after a full restart, it may indicate a display panel fault — run a device health check from the app to confirm.',
    },
    {
      question: 'Terminal Restarting During Txns',
      answer:
        'Unexpected restarts mid-transaction are commonly caused by a failing battery or a firmware mismatch. Check battery health, then confirm the terminal is on the latest stable firmware version.',
    },
    {
      question: 'Pos Not Responding',
      answer:
        "Hold the power button for 10 seconds to force a restart. If the terminal still doesn't respond, check the charging cable and power adapter before raising a hardware ticket.",
    },
    {
      question: 'Paper Roll Not Printing',
      answer:
        'Open the printer cover and confirm the paper roll is seated the right way round. Clean the print head gently with a dry cloth and run a test print from device settings.',
    },
    {
      question: 'Battery Or Charger Issue',
      answer:
        "Use only the charger shipped with the device. If the battery drains unusually fast or won't charge past a certain percentage, run a battery health check and raise a ticket if it fails.",
    },
  ],
  payments: [
    {
      question: 'Why are some checkout payments failing intermittently?',
      answer:
        'Intermittent failures usually happen because of bank-side timeouts, issuer risk checks, or peak-hour routing congestion. Use smart retries and monitor issuer-level failure patterns.',
    },
    {
      question: 'Failed transaction — what to do',
      answer:
        'Check the transaction status in the Payments tab before retrying — a failed status with no debit is safe to retry immediately, while a pending status should be given a few minutes to resolve on its own.',
    },
    {
      question: 'When should I trigger an automatic retry?',
      answer:
        'Trigger retries only on retry-safe failure codes such as timeout or technical decline. Avoid retries for hard declines like blocked account or invalid PIN.',
    },
  ],
  upi: [
    {
      question: 'UPI QR not working at checkout',
      answer:
        "Confirm the QR code hasn't expired and that the linked VPA is active. Regenerate the QR from the Payments app if it was created more than 24 hours ago.",
    },
    {
      question: 'How can I improve payment success for UPI users?',
      answer:
        'Enable multiple PSP routes, keep intent and collect options available, and surface alternate UPI apps when one app path is degraded.',
    },
    {
      question: 'Customer says amount was debited but order shows failed',
      answer:
        'This is usually a delayed webhook. Check the transaction status via RRN lookup — if the bank confirms a debit with no matching success status within 24 hours, it auto-reverses.',
    },
  ],
  settlements: [
    {
      question: 'Why is my settlement amount lower than gross transaction amount?',
      answer:
        'Settlement amount reflects net payout after MDR, GST, refunds, reversals, and any applicable risk holds or release adjustments.',
    },
    {
      question: 'How do same-day and on-demand settlement differ?',
      answer:
        'Same-day follows an accelerated standard cycle, while on-demand is merchant-triggered and typically has additional convenience fees.',
    },
    {
      question: 'How do I reconcile payout in bank statement?',
      answer:
        'Use UTR, bank reference, and batch-level transaction list together. Match net payout first, then verify deductions line-by-line.',
    },
  ],
  reports: [
    {
      question: 'Report download failed',
      answer:
        "Large date ranges can time out during generation. Narrow the date range or reduce the selected columns, then retry — you'll also see the report under History once it completes.",
    },
    {
      question: 'How do I schedule a recurring report?',
      answer:
        "Use Schedule report from the Reports page to set a frequency (daily/weekly/monthly) and recipients — the first report is delivered per the schedule's start date.",
    },
    {
      question: "Why don't yesterday's transactions show up in today's report?",
      answer: 'Reports are generated as of the report creation time, not real time. Regenerate the report to include the latest data.',
    },
  ],
  'account-access': [
    {
      question: "I can't log in to my account",
      answer:
        "Confirm you're using the registered email or mobile number. Use Forgot password to reset — if the account shows as locked, raise a ticket for a manual unlock.",
    },
    {
      question: 'How do I add a new team member?',
      answer:
        'Go to Settings → Manage users, invite by email, and assign a role. The invited user gets an activation link valid for 7 days.',
    },
    {
      question: 'How do I change store or user permissions?',
      answer:
        "Roles and permissions are managed under Settings → Manage users & roles. Only Admin and Owner roles can edit another user's permissions.",
    },
  ],
  training: [
    {
      question: 'Where can I find onboarding material for new staff?',
      answer:
        'The Training tab under All videos has short walkthroughs for daily POS operations, settlement checks, and common troubleshooting — a good first stop for new store staff.',
    },
    {
      question: 'Is there a certification for store staff?',
      answer:
        'Not currently — training content is self-paced. We recommend every new team member completes the core device-operations videos in their first week.',
    },
  ],
  'pine-checkout': [
    {
      question: 'How do I customize my checkout page?',
      answer: 'Checkout branding, accepted payment modes, and EMI options can be configured from Payments → Checkout settings.',
    },
    {
      question: 'Can I test checkout before going live?',
      answer: "Yes, use test mode (top-right toggle) to run sandbox transactions that don't affect real settlements.",
    },
    {
      question: 'Why is my checkout success rate dropping?',
      answer:
        'Check the Reports tab for a breakdown of failure reasons by payment mode — a sudden drop is usually isolated to one issuer or payment method rather than checkout as a whole.',
    },
  ],
};

/** Aggregated across all topics for the Videos listing page. Titles/summaries below reuse
 *  the prior knowledge-hub video catalogue where topics map, extended to cover all 8 topics. */
export const SUPPORT_VIDEOS: KnowledgeVideo[] = [
  {
    title: 'How to reconnect your billing terminal after a network drop',
    summary: 'Restoring connectivity on a POS device after a GPRS/Wi-Fi drop.',
    duration: '04:12',
    level: 'Beginner',
    topicSlug: 'device-hardware',
  },
  {
    title: 'Printer issue deep-dive',
    summary: 'Diagnosing print-head and paper-sensor issues quickly.',
    duration: '11:46',
    level: 'Intermediate',
    topicSlug: 'device-hardware',
  },
  {
    title: 'POS health checklist',
    summary: 'Daily health checks for store operators and field teams.',
    duration: '09:12',
    level: 'Beginner',
    topicSlug: 'device-hardware',
  },
  {
    title: 'Checkout diagnostics 101',
    summary: 'Reading failure reasons and prioritizing high-impact fixes.',
    duration: '08:24',
    level: 'Beginner',
    topicSlug: 'payments',
  },
  {
    title: 'How to retry a failed card payment without double charging',
    summary: 'Safe retry patterns for card and UPI failures.',
    duration: '05:40',
    level: 'Beginner',
    topicSlug: 'payments',
  },
  {
    title: 'Routing and retry strategy',
    summary: 'How to configure resilient routing for peak-hour reliability.',
    duration: '14:10',
    level: 'Intermediate',
    topicSlug: 'payments',
  },
  {
    title: 'How to check whether a pending UPI payment was captured correctly',
    summary: 'Using RRN lookup to confirm UPI debit status.',
    duration: '06:05',
    level: 'Beginner',
    topicSlug: 'upi',
  },
  {
    title: 'UPI collect vs intent — choosing the right flow',
    summary: 'When to use collect requests versus app-intent links.',
    duration: '07:30',
    level: 'Intermediate',
    topicSlug: 'upi',
  },
  {
    title: 'Daily MPR settlement steps',
    summary: 'Downloading and reading your daily merchant payout report.',
    duration: '05:15',
    level: 'Beginner',
    topicSlug: 'settlements',
  },
  {
    title: 'Settlement breakdown explained',
    summary: 'Understanding gross, deductions, and net payout values.',
    duration: '10:02',
    level: 'Beginner',
    topicSlug: 'settlements',
  },
  {
    title: 'Batch reconciliation workflow',
    summary: 'How finance teams reconcile batches and bank entries.',
    duration: '13:31',
    level: 'Advanced',
    topicSlug: 'settlements',
  },
  {
    title: 'Building your first custom report',
    summary: 'Filters, columns, and scheduling for the reports module.',
    duration: '08:47',
    level: 'Beginner',
    topicSlug: 'reports',
  },
  {
    title: 'Reading transaction reports for reconciliation',
    summary: 'Matching report columns against bank statements.',
    duration: '09:55',
    level: 'Intermediate',
    topicSlug: 'reports',
  },
  {
    title: 'Setting up roles and permissions',
    summary: 'Structuring access for store staff, managers, and admins.',
    duration: '06:48',
    level: 'Beginner',
    topicSlug: 'account-access',
  },
  {
    title: 'Recovering a locked account',
    summary: 'Self-serve steps before raising an access ticket.',
    duration: '03:58',
    level: 'Beginner',
    topicSlug: 'account-access',
  },
  {
    title: 'New staff onboarding walkthrough',
    summary: 'A guided first day on the POS and dashboard.',
    duration: '12:33',
    level: 'Beginner',
    topicSlug: 'training',
  },
  {
    title: 'How to fix card machine battery drain during store hours',
    summary: 'Battery care and charging best practices for handheld POS.',
    duration: '04:47',
    level: 'Beginner',
    topicSlug: 'training',
  },
  {
    title: 'Pine Labs DCC — choosing currency of choice made easy',
    summary: 'Configuring dynamic currency conversion at checkout.',
    duration: '05:02',
    level: 'Intermediate',
    topicSlug: 'pine-checkout',
  },
  {
    title: 'Customizing your checkout page',
    summary: 'Branding, payment modes, and EMI options walkthrough.',
    duration: '07:18',
    level: 'Beginner',
    topicSlug: 'pine-checkout',
  },
  {
    title: 'How to verify printer alignment and receipt readability on Pine devices',
    summary: 'Quick print-quality checks after paper roll changes.',
    duration: '03:36',
    level: 'Beginner',
    topicSlug: 'pine-checkout',
  },
];

export type TicketStatus = 'Open' | 'In progress' | 'Resolved';
export type TicketPriority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type TicketTrailStep = {
  title: string;
  timestamp: string;
  description: string;
  complete: boolean;
};

export type SupportTicket = {
  id: string;
  issue: string;
  category: string;
  topicSlug: SupportTopicSlug;
  product: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  deviceId?: string;
  diagnosticRunId?: string;
  storeDetails?: { name: string; contact: string; address: string };
};

/** Builds the "Trail of changes" timeline shown in the ticket detail panel — driven off
 *  status so every seeded ticket gets a coherent, status-appropriate trail without having
 *  to hand-author dozens of individual timelines. */
export function buildTicketTrail(ticket: SupportTicket): TicketTrailStep[] {
  const topicLabel = getSupportTopic(ticket.topicSlug)?.label ?? ticket.category;
  const steps: TicketTrailStep[] = [
    {
      title: 'Ticket created',
      timestamp: ticket.createdAt,
      description: `Request logged for ${topicLabel}.`,
      complete: true,
    },
  ];

  if (ticket.deviceId) {
    steps.push({
      title: 'Context captured',
      timestamp: ticket.createdAt,
      description: `${ticket.product} linked with device ${ticket.deviceId}.`,
      complete: true,
    });
  }

  if (ticket.diagnosticRunId) {
    steps.push({
      title: 'Diagnostic attached',
      timestamp: ticket.updatedAt,
      description: `Diagnostic run ${ticket.diagnosticRunId} is attached to the request.`,
      complete: true,
    });
  }

  if (ticket.status === 'Resolved') {
    steps.push({
      title: 'Open with support',
      timestamp: ticket.updatedAt,
      description: 'The ticket was reviewed and worked on by the support team.',
      complete: true,
    });
    steps.push({
      title: 'Resolved',
      timestamp: ticket.updatedAt,
      description: 'The issue was resolved and the ticket was closed.',
      complete: true,
    });
  } else if (ticket.status === 'In progress') {
    steps.push({
      title: 'Open with support',
      timestamp: ticket.updatedAt,
      description: 'The ticket is currently active with the support team.',
      complete: true,
    });
    steps.push({
      title: 'In progress',
      timestamp: ticket.updatedAt,
      description: 'A support specialist is actively working on this request.',
      complete: false,
    });
  } else {
    steps.push({
      title: 'Open with support',
      timestamp: ticket.updatedAt,
      description: 'The ticket is currently active with the support team.',
      complete: false,
    });
  }

  return steps;
}

export function expectedResolution(ticket: SupportTicket) {
  return ticket.status === 'Resolved' ? 'Resolved' : `Expected by ${ticket.updatedAt.split(',')[0]}, 8:17 pm`;
}

const TIMES = ['12:42 pm', '10:42 am', '8:42 pm', '1:42 am', '11:42 am', '9:42 am', '3:42 am', '2:42 pm', '5:42 pm', '12:42 pm'];

function seedTicket(
  index: number,
  overrides: Partial<SupportTicket> & Pick<SupportTicket, 'issue' | 'category' | 'topicSlug' | 'product'>
): SupportTicket {
  const day = 6 - Math.floor(index / 3);
  const createdAt = `${Math.max(1, day)} May 26, ${TIMES[index % TIMES.length]}`;
  const updatedAt = `06 May 26, ${TIMES[(index + 3) % TIMES.length]}`;
  const priorities: TicketPriority[] = ['Urgent', 'High', 'Medium', 'Low'];
  const statuses: TicketStatus[] = ['Open', 'Open', 'In progress', 'Resolved'];

  return {
    id: `PL-ITCH${String(index + 1).padStart(2, '0')}`,
    priority: priorities[index % priorities.length],
    status: statuses[index % statuses.length],
    createdAt,
    updatedAt,
    ...overrides,
  };
}

export const SUPPORT_TICKETS: SupportTicket[] = [
  seedTicket(0, {
    issue: 'PoS terminal not responding during a transaction',
    category: 'Terminal & Hardware Issue',
    topicSlug: 'device-hardware',
    product: 'Pine Touch',
    deviceId: 'TOU-ITCH-01',
    diagnosticRunId: 'diag-seeded-touch-01',
    status: 'Open',
  }),
  seedTicket(1, {
    issue: 'PoS terminal not responding during a transaction',
    category: 'Terminal & Hardware Issue',
    topicSlug: 'device-hardware',
    product: 'Pine Touch',
    deviceId: 'TOU-ITCH-02',
    diagnosticRunId: 'diag-seeded-touch-02',
    status: 'Open',
  }),
  seedTicket(2, {
    issue: 'PoS terminal not responding during a transaction',
    category: 'Terminal & Hardware Issue',
    topicSlug: 'device-hardware',
    product: 'Pine Touch',
    deviceId: 'TOU-ITCH-03',
    diagnosticRunId: 'diag-seeded-touch-03',
    status: 'In progress',
  }),
  seedTicket(3, {
    issue: 'Failed transaction — what to do',
    category: 'Payment acceptance',
    topicSlug: 'payments',
    product: 'Pine Checkout',
    status: 'Open',
  }),
  seedTicket(4, {
    issue: 'Failed transaction — what to do',
    category: 'Payment acceptance',
    topicSlug: 'payments',
    product: 'Pine Checkout',
    status: 'Resolved',
  }),
  seedTicket(5, {
    issue: 'Checkout success rate dropped for card payments',
    category: 'Payment acceptance',
    topicSlug: 'payments',
    product: 'Pine Checkout',
    status: 'In progress',
  }),
  seedTicket(6, {
    issue: 'UPI QR not working at checkout',
    category: 'UPI QR & Collect',
    topicSlug: 'upi',
    product: 'UPI',
    status: 'Open',
  }),
  seedTicket(7, {
    issue: 'UPI QR not working at checkout',
    category: 'UPI QR & Collect',
    topicSlug: 'upi',
    product: 'UPI',
    status: 'Open',
  }),
  seedTicket(8, {
    issue: 'Customer debited but order shows failed',
    category: 'UPI QR & Collect',
    topicSlug: 'upi',
    product: 'UPI',
    status: 'Resolved',
  }),
  seedTicket(9, {
    issue: 'Report download failed',
    category: 'Reports & Analytics',
    topicSlug: 'reports',
    product: 'Pine GrowthHub',
    status: 'Open',
  }),
  seedTicket(10, {
    issue: 'Scheduled report missing from history',
    category: 'Reports & Analytics',
    topicSlug: 'reports',
    product: 'Pine GrowthHub',
    status: 'In progress',
  }),
  seedTicket(11, {
    issue: 'Settlement amount lower than expected',
    category: 'Settlement & Payouts',
    topicSlug: 'settlements',
    product: 'Pine GrowthHub',
    status: 'Open',
  }),
  seedTicket(12, {
    issue: 'UTR reference missing on settlement batch',
    category: 'Settlement & Payouts',
    topicSlug: 'settlements',
    product: 'Pine GrowthHub',
    status: 'Resolved',
  }),
  seedTicket(13, {
    issue: 'Unable to reset account password',
    category: 'Account & Access',
    topicSlug: 'account-access',
    product: 'Pine Checkout',
    status: 'Open',
  }),
  seedTicket(14, {
    issue: 'New team member invite not received',
    category: 'Account & Access',
    topicSlug: 'account-access',
    product: 'Pine Checkout',
    status: 'In progress',
  }),
  seedTicket(15, {
    issue: 'PoS device restarting mid-transaction',
    category: 'Terminal & Hardware Issue',
    topicSlug: 'device-hardware',
    product: 'Pine Go',
    deviceId: 'GO-ITCH-04',
    diagnosticRunId: 'diag-seeded-go-04',
    status: 'Open',
  }),
  seedTicket(16, {
    issue: 'Paper roll not printing on billing counter',
    category: 'Terminal & Hardware Issue',
    topicSlug: 'device-hardware',
    product: 'Pine Go',
    deviceId: 'GO-ITCH-05',
    diagnosticRunId: 'diag-seeded-go-05',
    status: 'Resolved',
  }),
  seedTicket(17, {
    issue: 'Need onboarding videos for new store staff',
    category: 'Training',
    topicSlug: 'training',
    product: 'Pine Touch',
    status: 'Open',
  }),
  seedTicket(18, {
    issue: 'DCC not showing at checkout for international card',
    category: 'Pine Checkout',
    topicSlug: 'pine-checkout',
    product: 'Pine Checkout',
    status: 'Open',
  }),
  seedTicket(19, {
    issue: 'Battery draining fast on handheld terminal',
    category: 'Terminal & Hardware Issue',
    topicSlug: 'device-hardware',
    product: 'Pine Go',
    deviceId: 'GO-ITCH-06',
    diagnosticRunId: 'diag-seeded-go-06',
    status: 'In progress',
  }),
];

export function findTicketById(id: string) {
  return SUPPORT_TICKETS.find((ticket) => ticket.id === id) ?? null;
}

/** Web: ticketStatusTone() (landing, listing and detail panel). */
export function ticketStatusTone(status: TicketStatus): StatusTone {
  if (status === 'Resolved') return 'success';
  if (status === 'In progress') return 'initiated';
  return 'processing';
}

export const TICKET_STATUSES: TicketStatus[] = ['Open', 'In progress', 'Resolved'];

/** Web: TicketEditDraft in components/support/ticket-edit-panel.tsx. */
export type TicketEditDraft = {
  category: string;
  product: string;
  topic: string;
  posId: string;
  issueDescription: string;
  healthCheckReport: string;
  storeName: string;
  storeContact: string;
  storeAddress: string;
};

export function draftFromTicket(ticket: SupportTicket | null): TicketEditDraft {
  if (!ticket) {
    return {
      category: '',
      product: '',
      topic: '',
      posId: '',
      issueDescription: '',
      healthCheckReport: '',
      storeName: '',
      storeContact: '',
      storeAddress: '',
    };
  }
  return {
    category: ticket.category,
    product: ticket.product,
    topic: getSupportTopic(ticket.topicSlug)?.label ?? '',
    posId: ticket.deviceId ?? '',
    issueDescription: ticket.issue,
    healthCheckReport: ticket.diagnosticRunId ? `Report ${ticket.product} • A50 • ${ticket.diagnosticRunId.slice(-6)}` : '',
    storeName: ticket.storeDetails?.name ?? '',
    storeContact: ticket.storeDetails?.contact ?? '',
    storeAddress: ticket.storeDetails?.address ?? '',
  };
}

/** Applies an edit-panel draft to a ticket (web: handleSaveEdit). */
export function applyTicketDraft(ticket: SupportTicket, draft: TicketEditDraft): SupportTicket {
  return {
    ...ticket,
    category: draft.category,
    product: draft.product,
    issue: draft.issueDescription,
    deviceId: draft.posId || ticket.deviceId,
    storeDetails: { name: draft.storeName, contact: draft.storeContact, address: draft.storeAddress },
  };
}

// Scripted chat (web: support-chat-content.tsx).

export type ChatDevice = { id: string; label: string; meta: string; hasIssue?: boolean };

export const CHAT_DEVICES: ChatDevice[] = [
  { id: 'TOU-0143-01', label: 'Touch • Front counter', meta: 'TOU-0143-01 / Store 01 / Online' },
  { id: 'TOU-0143-02', label: 'Touch • Billing desk', meta: 'TOU-0143-02 / Store 02 / Idle' },
  { id: 'TOU-0143-03', label: 'Touch • Dispatch counter', meta: 'TOU-0143-03 / Store 03 / Needs Attention', hasIssue: true },
  { id: 'GO-0143-01', label: 'Go • Front counter', meta: 'GO-0143-01 / Store 01 / Online' },
  { id: 'GO-0143-02', label: 'Go • Billing desk', meta: 'GO-0143-02 / Store 02 / Idle' },
];

export const GPRS_STEPS = ['Open Payments App Menu Set Connection', 'Set Connection Priority To GPRS', 'Submit Activate Connection'];
export const SIM_STEPS = ['Restart machine', 'Settle batch', 'Check with test transaction'];

export const CHAT_STORE_DETAILS = {
  name: 'Sandowitch',
  contact: '7531810061',
  address: 'E-18/B-1, LPG House, Mohan Cooperative extension, Delhi Mathura road, Delhi, PIN: 110044',
};

/** Web: buildDraft() — the raise-ticket card's details for a device (or none). */
export function buildChatTicketDraft(device: ChatDevice | null, issue: string): TicketEditDraft {
  return {
    category: 'Hardware & Device Issue',
    product: device?.label.split(' • ')[0] === 'Go' ? 'Pine Go' : 'Pine Touch',
    topic: 'Device & Hardware',
    posId: device?.id ?? '',
    issueDescription: issue,
    healthCheckReport: device ? `Report ${device.label.split(' • ')[0]} • A50 • ${device.id.replace(/\D/g, '')}` : '',
    storeName: CHAT_STORE_DETAILS.name,
    storeContact: CHAT_STORE_DETAILS.contact,
    storeAddress: CHAT_STORE_DETAILS.address,
  };
}
