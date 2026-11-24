import { router } from 'expo-router';
import { useState } from 'react';
import { LayoutAnimation, StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { Tabs } from '@/components/material3/tabs';
import { HeaderControl } from '@/components/page-header';
import { DetailScreen } from '@/components/shared/detail-screen';
import { PAGE_PADDING } from '@/components/tab-screen';
import { useAppColors } from '@/constants/app-colors';
import { Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { type AppNotification, markAllNotificationsRead, markNotificationRead, type NotificationKind, SOURCE_ICON, useNotifications } from '@/data/notifications';

import { FooterButton, profileStyles } from './profile-ui';

/**
 * Notifications (profile → Notifications), the old app's bell page:
 * Alerts and Offers tabs with their unread counts, notifications in day
 * bands — unread ones tinted with a dot — each with its source icon, title,
 * time, text (Read more past two lines) and its one action, which marks it
 * read and opens its page. Preferences in the header; Mark all as read in
 * the footer while the tab has unread ones.
 */
export function Notifications() {
  const theme = useTheme();
  const { items, isRead, unreadOf } = useNotifications();
  const [tab, setTab] = useState<NotificationKind>('alert');
  const rows = items.filter((item) => item.kind === tab);
  const days = [...new Set(rows.map((item) => item.day))];
  const unread = unreadOf(tab);
  const label = (kind: NotificationKind, name: string) => (unreadOf(kind) ? `${name} (${unreadOf(kind)})` : name);

  return (
    <DetailScreen
      title="Notifications"
      fallbackHref="/"
      actions={<HeaderControl icon="sliders-horizontal" label="Preferences" onPress={() => router.push('/notifications/preferences')} accessibilityLabel="Notification preferences" />}
      footer={unread ? <FooterButton label="Mark all as read" mode="outlined" icon="checks" onPress={() => markAllNotificationsRead(tab)} /> : undefined}>
      <View style={styles.tabs}>
        <Tabs
          variant="secondary"
          tabs={[
            { key: 'alert', label: label('alert', 'Alerts') },
            { key: 'offer', label: label('offer', 'Offers') },
          ]}
          activeKey={tab}
          onChange={(key) => setTab(key as NotificationKind)}
        />
      </View>
      {rows.length ? (
        days.map((day) => (
          <View key={day} style={profileStyles.stack}>
            <Text accessibilityRole="header" style={[styles.day, { color: theme.colors.onSurfaceVariant }]}>
              {day}
            </Text>
            {rows
              .filter((item) => item.day === day)
              .map((item) => (
                <NotificationCard key={item.id} item={item} unread={!isRead(item.id)} />
              ))}
          </View>
        ))
      ) : (
        <View style={[profileStyles.card, styles.empty, { backgroundColor: theme.colors.surface }]}>
          <Icon source="bell" size={32} color={theme.colors.onSurfaceVariant} />
          <Text style={[profileStyles.title, { color: theme.colors.onSurface }]}>You’re all caught up</Text>
          <Text style={[profileStyles.body, profileStyles.centreText, { color: theme.colors.onSurfaceVariant }]}>New {tab === 'alert' ? 'alerts' : 'offers'} will show up here.</Text>
        </View>
      )}
    </DetailScreen>
  );
}

function NotificationCard({ item, unread }: { item: AppNotification; unread: boolean }) {
  const theme = useTheme();
  const appColors = useAppColors();
  const [expanded, setExpanded] = useState(false);
  // Past about two lines on a phone: offer Read more.
  const clipped = item.detail.length > 105;
  const open = () => {
    markNotificationRead(item.id);
    if (item.cta) router.navigate(item.cta.href);
  };
  const muted = { color: theme.colors.onSurfaceVariant };
  return (
    <TouchableRipple
      onPress={open}
      borderless
      accessibilityRole="button"
      accessibilityLabel={`${unread ? 'Unread. ' : ''}${item.title}. ${item.detail}. ${item.day} ${item.time}`}
      style={[styles.card, { backgroundColor: unread ? appColors.highlight : theme.colors.surface }]}>
      <View style={styles.inner}>
        <View style={styles.head}>
          <View style={[styles.tile, { backgroundColor: unread ? theme.colors.surface : theme.colors.background }]}>
            <Icon source={SOURCE_ICON[item.source]} size={20} color={theme.colors.primary} />
          </View>
          <Text style={[profileStyles.medium, profileStyles.flex, { color: theme.colors.onSurface }]}>{item.title}</Text>
          <Text style={[profileStyles.small, muted]}>{item.day === 'Today' ? item.time : item.day}</Text>
          {unread ? <View style={[styles.dot, { backgroundColor: theme.colors.error }]} /> : null}
        </View>
        <View style={styles.body}>
          <Text
            numberOfLines={expanded ? undefined : 2}
            style={[profileStyles.body, muted]}>
            {item.detail}
          </Text>
          {clipped ? (
            <Text
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
                setExpanded((value) => !value);
              }}
              style={[styles.more, { color: theme.colors.onSurface }]}>
              {expanded ? 'Read less' : 'Read more'}
            </Text>
          ) : null}
          {item.cta ? (
            <View style={styles.cta}>
              <Text style={[styles.ctaLabel, { color: theme.colors.primary }]}>{item.cta.label}</Text>
              <Icon source="caret-right" size={14} color={theme.colors.primary} />
            </View>
          ) : null}
        </View>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  tabs: { marginHorizontal: -PAGE_PADDING, marginTop: -PAGE_PADDING },
  day: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.4, paddingHorizontal: 4, paddingTop: 8 },
  card: { borderRadius: Shape.max },
  inner: { padding: 12, gap: 8 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tile: { width: 32, height: 32, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  body: { paddingLeft: 42, gap: 6 },
  more: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16, textDecorationLine: 'underline' },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ctaLabel: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  empty: { alignItems: 'center', paddingVertical: 32 },
});
