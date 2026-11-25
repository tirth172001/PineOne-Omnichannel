import { useSyncExternalStore } from 'react';

import type { AgentId } from './agents';

/**
 * Setting an agent up as a task (web: Pine AI's task builder, "Configure
 * task"): what each agent asks for, from its own "How it works" steps
 * (data/agents.ts), and the tasks the merchant has scheduled.
 */

export type ChoiceSection = { key: string; label: string; options: string[]; initial: string };

export type TaskConfig = {
  /** What the task is called once scheduled. */
  noun: string;
  /** When it runs, if not on a schedule the merchant picks (e.g. after each settlement). */
  trigger?: string;
  /** One-pick choices (schedule time, sensitivity, active hours). */
  choices: ChoiceSection[];
  /** Payment methods to include, when the agent reads them. */
  methods?: boolean;
};

export const PAYMENT_METHODS = ['Card', 'UPI', 'Wallet', 'Net banking'];

/** Where results go: Guide always, WhatsApp if the merchant wants it. */
export const DELIVERY = ['Guide', 'WhatsApp'] as const;

export const TASK_CONFIG: Partial<Record<AgentId, TaskConfig>> = {
  daily_business_snapshot: {
    noun: 'Daily summary',
    choices: [{ key: 'time', label: 'Send it every day at', options: ['7:00 am', '8:00 am', '9:00 am', '6:00 pm'], initial: '8:00 am' }],
    methods: true,
  },
  payment_failure_spike_alert: {
    noun: 'Failure alerts',
    trigger: 'Watches live, alerts only on a spike',
    choices: [{ key: 'sensitivity', label: 'Sensitivity', options: ['Low', 'Normal', 'High'], initial: 'Normal' }],
  },
  settlement_reconciliation_recon: {
    noun: 'Settlement recon',
    trigger: 'Runs after each settlement',
    choices: [],
  },
  refund_watchman: {
    noun: 'Daily refund check',
    choices: [{ key: 'time', label: 'Check every day at', options: ['8:00 am', '10:00 am', '9:00 pm'], initial: '8:00 am' }],
  },
  low_payment_volume_alert: {
    noun: 'Volume alerts',
    trigger: 'Watches during active hours',
    choices: [{ key: 'hours', label: 'Active hours', options: ['9 am – 9 pm', '10 am – 10 pm', 'Open all day'], initial: '10 am – 10 pm' }],
  },
};

export type ScheduledTask = { id: string; agentId: AgentId; title: string; summary: string; created: string };

let tasks: ScheduledTask[] = [
  { id: 't1', agentId: 'daily_business_snapshot', title: 'Daily summary', summary: 'All stores · 8:00 am · Guide', created: '19 Nov 2026' },
];
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
let taskCount = tasks.length;

export function scheduleTask(task: Omit<ScheduledTask, 'id'>) {
  tasks = [{ ...task, id: `t${(taskCount += 1)}` }, ...tasks];
  listeners.forEach((listener) => listener());
}

/** Scheduled tasks, live (one agent's, or all). */
export function useScheduledTasks(agentId?: AgentId) {
  const all = useSyncExternalStore(subscribe, () => tasks);
  return agentId ? all.filter((task) => task.agentId === agentId) : all;
}
