import { useSyncExternalStore } from 'react';

import type { AgentId } from './agents';

/**
 * Agent credits: the wallet agents (and Guide, when it hands work to an
 * agent) spend from. Each run costs credits; the merchant tops up from the
 * wallet. Prototype values: 1 credit = ₹1, and the Chargeback Agent's 12
 * credits match its web price (₹12 per chargeback); the other agents' costs
 * are samples until pricing is decided.
 */

export const RUPEES_PER_CREDIT = 1;

/** What one run of each agent costs, and what a run is. */
export const AGENT_CREDIT_COST: Record<AgentId, { credits: number; per: string }> = {
  chargeback: { credits: 12, per: 'chargeback' },
  'local-ads': { credits: 25, per: 'campaign' },
  'campaign-analyzer': { credits: 4, per: 'review' },
  daily_business_snapshot: { credits: 2, per: 'summary' },
  payment_failure_spike_alert: { credits: 3, per: 'day' },
  settlement_reconciliation_recon: { credits: 5, per: 'settlement' },
  refund_watchman: { credits: 2, per: 'day' },
  low_payment_volume_alert: { credits: 3, per: 'day' },
};

export const creditCostLabel = (agentId: AgentId) => {
  const { credits, per } = AGENT_CREDIT_COST[agentId];
  return `${credits} credits per ${per}`;
};

/** The packs offered on Add credits. */
export const CREDIT_PACKS = [250, 500, 1000] as const;

export type LedgerEntry = {
  id: string;
  /** Credits: positive when added, negative when an agent used them. */
  credits: number;
  /** The agent that used them; absent for top-ups. */
  agentId?: AgentId;
  title: string;
  detail: string;
  /** The day, as the app's listings write dates ("25 Nov 2026"); History groups by it. */
  day: string;
  time: string;
};

const SEED: LedgerEntry[] = [
  { id: 'l1', credits: -2, agentId: 'daily_business_snapshot', title: 'Snapshot', detail: 'Daily summary · 6 stores', day: '25 Nov 2026', time: '9:00 am' },
  { id: 'l2', credits: -3, agentId: 'payment_failure_spike_alert', title: 'Spike Alert', detail: 'UPI failures at Bandra', day: '25 Nov 2026', time: '8:12 am' },
  { id: 'l3', credits: -12, agentId: 'chargeback', title: 'Chargeback Agent', detail: 'Rebuttal for CB-24118 · ₹2,199', day: '24 Nov 2026', time: '6:40 pm' },
  { id: 'l4', credits: 500, title: 'Credits added', detail: 'UPI · ₹500', day: '24 Nov 2026', time: '3:05 pm' },
  { id: 'l5', credits: -2, agentId: 'daily_business_snapshot', title: 'Snapshot', detail: 'Daily summary · 6 stores', day: '24 Nov 2026', time: '9:00 am' },
  { id: 'l6', credits: -25, agentId: 'local-ads', title: 'Market Agent', detail: 'Diwali Gift Hampers campaign', day: '21 Nov 2026', time: '7:20 pm' },
  { id: 'l7', credits: -4, agentId: 'campaign-analyzer', title: 'Campaign Analyzer Agent', detail: 'Weekly Meta Ads review', day: '21 Nov 2026', time: '10:00 am' },
  { id: 'l8', credits: -12, agentId: 'chargeback', title: 'Chargeback Agent', detail: 'Rebuttal for CB-24116 · ₹4,299', day: '20 Nov 2026', time: '4:32 pm' },
  { id: 'l9', credits: 1000, title: 'Credits added', detail: 'Card ending 4421 · ₹1,000', day: '19 Nov 2026', time: '11:15 am' },
];

type WalletState = { ledger: LedgerEntry[] };
let state: WalletState = { ledger: SEED };
const listeners = new Set<() => void>();
const set = (next: WalletState) => {
  state = next;
  listeners.forEach((listener) => listener());
};
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

let entryCount = SEED.length;
const now = () => new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
/** Today in the listings' date format ("25 Nov 2026"). */
export const todayLabel = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace('Sept', 'Sep');

export function walletBalance() {
  return state.ledger.reduce((sum, entry) => sum + entry.credits, 0);
}

/** Adds a pack (or any amount) of credits. */
export function addCredits(credits: number, method = 'UPI') {
  set({ ledger: [{ id: `l${(entryCount += 1)}`, credits, title: 'Credits added', detail: `${method} · ₹${(credits * RUPEES_PER_CREDIT).toLocaleString('en-IN')}`, day: '25 Nov 2026', time: now() }, ...state.ledger] });
}

/** Records an agent run; returns false (and spends nothing) when the balance is short. */
export function spendCredits(agentId: AgentId, title: string, detail: string, credits: number) {
  if (walletBalance() < credits) return false;
  set({ ledger: [{ id: `l${(entryCount += 1)}`, credits: -credits, agentId, title, detail, day: '25 Nov 2026', time: now() }, ...state.ledger] });
  return true;
}

/** The balance and history, live. */
export function useWallet() {
  const current = useSyncExternalStore(subscribe, () => state);
  const balance = current.ledger.reduce((sum, entry) => sum + entry.credits, 0);
  const today = todayLabel();
  const usedToday = -current.ledger.filter((entry) => entry.day === today && entry.credits < 0).reduce((sum, entry) => sum + entry.credits, 0);
  return { balance, ledger: current.ledger, usedToday };
}

export const formatCredits = (credits: number) => Math.abs(credits).toLocaleString('en-IN');
