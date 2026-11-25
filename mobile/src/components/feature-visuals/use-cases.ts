import type { IconName } from '@/components/icons';
import type { AgentId } from '@/data/agents';

/**
 * The use cases the feature visuals cycle through. Everything shown comes
 * from the app's own data: agent cases are pending approvals in
 * data/agents.ts (web: APPROVALS) with what the agent looked at; Guide's
 * questions are its suggested ones and the answers its script gives
 * (data/guide.ts), so trying it after the visual shows the same thing.
 */

export type AgentUseCase = {
  agentId: AgentId;
  agentName: string;
  /** What the agent looked at, collected one by one. */
  signals: { icon: IconName; label: string }[];
  /** The case it brings to you (PENDING_APPROVALS id). */
  approvalId: string;
  /** The approval's confirmation, short enough for the scene's button (from its approvedMessage). */
  done: string;
};

export const AGENT_USE_CASES: AgentUseCase[] = [
  {
    agentId: 'chargeback',
    agentName: 'Chargeback Agent',
    signals: [
      { icon: 'file-text', label: 'Chargeslip' },
      { icon: 'receipt', label: 'Invoice' },
      { icon: 'chat-text', label: 'Customer chat' },
    ],
    approvalId: 'ap-cb-24116',
    done: 'Submitted to HDFC Bank',
  },
  {
    agentId: 'daily_business_snapshot',
    agentName: 'Snapshot',
    signals: [
      { icon: 'storefront', label: 'Indiranagar' },
      { icon: 'credit-card', label: 'Card payments' },
      { icon: 'trend-down', label: 'After 4 pm' },
    ],
    approvalId: 'ap-snap-indiranagar',
    done: 'Marked as reviewed',
  },
  {
    agentId: 'payment_failure_spike_alert',
    agentName: 'Spike Alert',
    signals: [
      { icon: 'qr-code', label: 'UPI' },
      { icon: 'cash-register', label: 'Bandra terminal' },
      { icon: 'trend-down', label: '98% → 91%' },
    ],
    approvalId: 'ap-spike-bandra',
    done: 'Restart sent',
  },
  {
    agentId: 'local-ads',
    agentName: 'Market Agent',
    signals: [
      { icon: 'target', label: 'Diwali Gift Hampers' },
      { icon: 'trend-up', label: 'Visits +31%' },
      { icon: 'money-wavy', label: '₹1,500 a day' },
    ],
    approvalId: 'ap-ads-budget',
    done: 'Budget raised to ₹2,000',
  },
];

export type GuideUseCase = {
  question: string;
  answer: {
    /** The figure, as Guide's script gives it. */
    value: string;
    line: string;
    icon: IconName;
  };
};

export const GUIDE_USE_CASES: GuideUseCase[] = [
  { question: 'Where is my last settlement', answer: { value: '₹42,180', line: 'Settled to HDFC XXXX3456', icon: 'bank' } },
  { question: 'What’s my total sales today', answer: { value: '₹56,732', line: '48 transactions today', icon: 'receipt' } },
  { question: 'How many transactions failed today', answer: { value: '2 failures', line: 'Amex cards on device P-3213', icon: 'warning-circle' } },
  { question: 'Aaj ka total collection kitna hai?', answer: { value: '₹56,732', line: '48 transactions today', icon: 'receipt' } },
];
