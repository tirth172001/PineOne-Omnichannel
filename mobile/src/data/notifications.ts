import type { Href } from 'expo-router';
import { useSyncExternalStore } from 'react';

/** The old app's two tabs: alerts about your business, and offers. */
export type NotificationKind = 'alert' | 'offer';
/** What raised it (old app: sourceSystem), which sets its icon. */
export type NotificationSource = 'TRANSACTION' | 'REFUND' | 'SETTLEMENT' | 'SUPPORT' | 'VAS' | 'DEVICE' | 'OFFER';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  source: NotificationSource;
  title: string;
  detail: string;
  /** "Today", "Yesterday" or "18 Nov": the day band it sits under. */
  day: string;
  time: string;
  /** The one action (old app: ctas[0]); opening it marks the notification read. */
  cta?: { label: string; href: Href };
};

export const SOURCE_ICON: Record<NotificationSource, string> = {
  TRANSACTION: 'receipt',
  REFUND: 'arrow-u-up-left',
  SETTLEMENT: 'bank',
  SUPPORT: 'lifebuoy',
  VAS: 'diamond',
  DEVICE: 'device-mobile',
  OFFER: 'gift',
};

/** Newest first. Web's NOTIFICATION_ITEMS, plus the old app's alert and offer kinds. */
export const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', kind: 'alert', source: 'SETTLEMENT', title: 'Settlement batch delayed', detail: 'One batch of ₹2,26,747.72 is delayed by 45 mins due to a bank-side issue. It will settle by 6:45 PM today.', day: 'Today', time: '11:40 AM', cta: { label: 'View settlements', href: '/settlements' } },
  { id: 'n2', kind: 'alert', source: 'TRANSACTION', title: 'High failure spike detected', detail: 'Online failure rate crossed 2.3% in the last hour, mostly on UPI collect. Customers may be retrying.', day: 'Today', time: '10:52 AM', cta: { label: 'View payments', href: '/payments' } },
  { id: 'n4', kind: 'alert', source: 'VAS', title: 'More documents needed', detail: 'Instant cashback: re-upload the scheme acceptance form. The earlier copy was unsigned.', day: 'Today', time: '09:30 AM', cta: { label: 'Upload document', href: '/value-added-services?service=instant-cashback' } },
  { id: 'n5', kind: 'alert', source: 'REFUND', title: 'Refund processed', detail: 'Refund of ₹1,250.00 for order #HG-48211 has been credited to the customer’s card.', day: 'Yesterday', time: '06:15 PM', cta: { label: 'View refunds', href: '/refunds' } },
  { id: 'n6', kind: 'alert', source: 'SUPPORT', title: 'Ticket resolved', detail: 'Your ticket #SR-20418 “Paper roll not printing” has been resolved. Rate your experience.', day: 'Yesterday', time: '02:05 PM', cta: { label: 'View ticket', href: '/support/tickets' } },
  { id: 'n7', kind: 'alert', source: 'DEVICE', title: 'Device offline for 24 hours', detail: 'Terminal 7738 at Koramangala hasn’t connected since yesterday. Check its power and network.', day: '18 Nov', time: '10:00 AM', cta: { label: 'View devices', href: '/terminal-devices' } },
  { id: 'o1', kind: 'offer', source: 'OFFER', title: 'Pay Later for your checkout', detail: 'Merchants who added Pay Later saw 12% more completed orders. Turn it on in two taps.', day: 'Today', time: '08:00 AM', cta: { label: 'Explore', href: '/checkout' } },
  { id: 'o2', kind: 'offer', source: 'OFFER', title: '20% off thermal paper rolls', detail: 'Stock up this week: bulk packs of 50 at ₹1,999, delivered free to your store.', day: 'Yesterday', time: '11:00 AM', cta: { label: 'Shop now', href: '/marketplace' } },
  { id: 'o3', kind: 'offer', source: 'OFFER', title: 'Refer and earn ₹499', detail: 'Know a business that should take payments with Pine Labs? Refer them and earn a voucher when they go live.', day: '17 Nov', time: '09:00 AM', cta: { label: 'Refer now', href: '/referrals' } },
];

// Which notifications have been opened this session (a mock: nothing is stored).
let read = new Set<string>(['n6', 'n7', 'o3']);
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const emit = () => listeners.forEach((listener) => listener());

export function markNotificationRead(id: string) {
  if (read.has(id)) return;
  read = new Set(read).add(id);
  emit();
}

/** Marks a tab's notifications read, or all of them. */
export function markAllNotificationsRead(kind?: NotificationKind) {
  read = new Set([...read, ...NOTIFICATIONS.filter((item) => !kind || item.kind === kind).map((item) => item.id)]);
  emit();
}

/** The notifications' read state, shared by the avatar's badge, the profile row and the Notifications page. */
export function useNotifications() {
  const readIds = useSyncExternalStore(subscribe, () => read, () => read);
  const unreadOf = (kind?: NotificationKind) => NOTIFICATIONS.filter((item) => (!kind || item.kind === kind) && !readIds.has(item.id)).length;
  return { items: NOTIFICATIONS, isRead: (id: string) => readIds.has(id), unread: unreadOf(), unreadOf };
}
