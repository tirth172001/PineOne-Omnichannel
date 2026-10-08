import type { Href } from 'expo-router';
import { useSyncExternalStore } from 'react';

export type AppNotification = { id: string; title: string; detail: string; time: string; icon: string; href: Href };

/** Web: NOTIFICATION_ITEMS (v2-topbar), each opening the mobile page it's about. */
export const NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', title: 'Settlement batch delayed', detail: 'One batch is delayed by 45 mins', time: '10 min ago', icon: 'bank', href: '/settlements' },
  { id: 'n2', title: 'High failure spike detected', detail: 'Online failure rate crossed 2.3%', time: '1 hr ago', icon: 'warning-circle', href: '/payments' },
  { id: 'n3', title: 'New product recommendation', detail: 'Pay Later can improve conversion on your checkout', time: 'Yesterday', icon: 'palette', href: '/checkout' },
];

// Which notifications have been opened this session (a mock: nothing is stored).
let read = new Set<string>();
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

export function markAllNotificationsRead() {
  read = new Set(NOTIFICATIONS.map((item) => item.id));
  emit();
}

/** The notifications' read state, shared by the avatar's badge and the profile panel. */
export function useNotifications() {
  const readIds = useSyncExternalStore(subscribe, () => read, () => read);
  return { items: NOTIFICATIONS, isRead: (id: string) => readIds.has(id), unread: NOTIFICATIONS.filter((item) => !readIds.has(item.id)).length };
}
