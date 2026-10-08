import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Icon, Portal, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SETTINGS_GROUPS } from '@/components/account/account-settings';
import { OrganisationLogo, OrganisationSwitcher } from '@/components/account/organisation-switcher';
import { PANEL_INNER_RADIUS, PANEL_PADDING, PanelSheet } from '@/components/shared/panel-sheet';
import { OutlineTag } from '@/components/shared/status';
import { useAppColors } from '@/constants/app-colors';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { CURRENT_USER, ORGANISATIONS } from '@/data/businesses';
import { markAllNotificationsRead, markNotificationRead, useNotifications } from '@/data/notifications';
import { INITIAL_ROSTER } from '@/data/user-roster';
import { useBusiness } from '@/hooks/use-business';
import { type ThemeMode, useThemeMode } from '@/hooks/use-theme-mode';
import { useToast } from '@/hooks/use-toast';

import { markReturnToProfile } from './profile-return';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'device-mobile' },
];
const SWITCHER_PADDING = 4;
/** Long enough to see the pick land before the app fades to the new look. */
const APPLY_DELAY_MS = 160;

const PADDING = 16;
// M3 emphasized easings, as the app's sheets.
const EMPHASIZED_DECELERATE = Easing.bezier(0.05, 0.7, 0.1, 1);
const EMPHASIZED_ACCELERATE = Easing.bezier(0.3, 0, 0.8, 0.15);
/** Web's Tirth Trivedi roster entry — the signed-in mobile user. */
const USER_EMAIL = INITIAL_ROSTER.find((entry) => entry.name === CURRENT_USER.name)?.email ?? '';

/**
 * The profile page (Figma 6622:916), opened from the initials avatar at the
 * end of Overview's header: a full page that comes in from the right, where
 * the avatar is, with Back to close. Centred at the top, who's signed in and
 * then the organisation as a card whose Switch opens the organisation
 * sheet; then one list
 * — Notifications (unread counted; a sheet whose items open their pages) and
 * the settings pages — then appearance and Log out. Not the app's modules
 * (those are in the navigation bar and More). Previously: the organisation, with Switch opening the organisation sheet to
 * pick and confirm another (it starts on all its stores); the settings
 * sections in their groups, each opening its page; Light, Dark or System appearance; and Log out. Tap outside or Android Back closes it.
 */
export function ProfilePanel({
  visible,
  onDismiss,
  instant = false,
}: {
  visible: boolean;
  onDismiss: () => void;
  /** Already open on first show, without sliding in (returning from a page opened here). */
  instant?: boolean;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const business = useBusiness();
  const toast = useToast();
  const appColors = useAppColors();
  const [switching, setSwitching] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifications = useNotifications();
  const organisation = business.organisation;
  const [progress] = useState(() => new Animated.Value(instant && visible ? 1 : 0));
  const [mounted, setMounted] = useState(visible);
  // Mount immediately on open; unmount only once the exit animation finishes.
  if (visible && !mounted) setMounted(true);
  const initials = CURRENT_USER.name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 380 : 220,
      easing: visible ? EMPHASIZED_DECELERATE : EMPHASIZED_ACCELERATE,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
  }, [visible, progress]);

  // Android Back closes the panel before leaving the page.
  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onDismiss();
      return true;
    });
    return () => subscription.remove();
  }, [visible, onDismiss]);

  // One list, as the reference: what needs a look first, then the settings pages.
  const rows: { key: string; icon: string; title: string; badge?: number; onPress: () => void }[] = [
    { key: 'notifications', icon: 'bell', title: 'Notifications', badge: notifications.unread, onPress: () => setNotificationsOpen(true) },
    ...SETTINGS_GROUPS.flatMap((group) =>
      group.sections.map((section) => ({
        key: section.key,
        icon: section.icon,
        title: section.title,
        onPress: () => {
          // Back from the page returns here (see profile-return).
          markReturnToProfile();
          onDismiss();
          router.push({ pathname: '/account-settings/[section]', params: { section: section.key } });
        },
      }))
    ),
  ];
  // Checkout configuration lives here too (not in More), after the payment settings.
  rows.splice(rows.findIndex((row) => row.key === 'online-payments') + 1, 0, {
    key: 'checkout',
    icon: 'palette',
    title: 'Checkout',
    onPress: () => {
      markReturnToProfile();
      onDismiss();
      router.push('/checkout');
    },
  });

  return (
    <>
      {mounted ? (
        <Portal>
          <Animated.View
            accessibilityViewIsModal
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: theme.colors.background,
                transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [windowWidth, 0] }) }],
              },
            ]}>
            {/* Back, as on every inner page; the page came in from the right, where the avatar is. */}
            <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
              <TouchableRipple
                onPress={onDismiss}
                borderless
                accessibilityRole="button"
                accessibilityLabel="Close profile"
                style={[styles.back, { backgroundColor: theme.colors.surface }]}>
                <Icon source="arrow-left" size={20} color={theme.colors.onSurface} />
              </TouchableRipple>
            </View>

            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(PADDING, insets.bottom) + 16 }]} showsVerticalScrollIndicator={false}>
              {/* Who's signed in and for which organisation, centred (Figma 6622:916). */}
              <View style={styles.identity}>
                <View style={[styles.avatar, { backgroundColor: appColors.highlight }]}>
                  <Text style={[styles.initials, { color: appColors.brand }]}>{initials}</Text>
                </View>
                <View style={styles.nameRow}>
                  <Text numberOfLines={1} style={[styles.name, { color: theme.colors.onSurface }]}>
                    {CURRENT_USER.name}
                  </Text>
                  <OutlineTag label={CURRENT_USER.roleLabel} radius={Shape.max} />
                </View>
                <Text numberOfLines={1} style={[styles.small, { color: theme.colors.onSurfaceVariant }]}>
                  {USER_EMAIL}
                </Text>
              </View>

              {/* The organisation everything shows, as a card; Switch opens the sheet to pick and confirm another. */}
              <View style={[styles.card, styles.orgCard, { backgroundColor: theme.colors.surface }]}>
                <OrganisationLogo organisation={organisation} />
                <View style={styles.flex}>
                  <Text numberOfLines={1} style={[styles.rowTitle, { color: theme.colors.onSurface }]}>
                    {organisation.name}
                  </Text>
                  <Text style={[styles.small, { color: theme.colors.onSurfaceVariant }]}>{organisation.shops.length} stores</Text>
                </View>
                {ORGANISATIONS.length > 1 ? (
                  <Button
                    mode="outlined"
                    compact
                    icon="arrows-left-right"
                    onPress={() => setSwitching(true)}
                    textColor={theme.colors.onSurface}
                    accessibilityLabel={`Switch organisation from ${organisation.name}`}
                    labelStyle={styles.switchLabel}
                    style={[styles.switchButton, { borderColor: theme.colors.outlineVariant }]}>
                    Switch
                  </Button>
                ) : null}
              </View>

              <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                {rows.map((row, index) => (
                  <View key={row.key}>
                    {index > 0 ? <View style={[styles.rowDivider, { backgroundColor: theme.colors.surfaceVariant }]} /> : null}
                    <TouchableRipple
                      onPress={row.onPress}
                      accessibilityRole="button"
                      accessibilityLabel={row.badge ? `${row.title}, ${row.badge} unread` : row.title}>
                      <View style={styles.row}>
                        <View>
                          <Icon source={row.icon} size={22} color={theme.colors.onSurface} />
                          {row.badge ? (
                            <View style={[styles.badge, { backgroundColor: theme.colors.error, borderColor: theme.colors.surface }]}>
                              <Text style={[styles.badgeLabel, { color: theme.colors.onError }]}>{row.badge}</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text numberOfLines={1} style={[styles.flex, styles.rowTitle, { color: theme.colors.onSurface }]}>
                          {row.title}
                        </Text>
                        <Icon source="caret-right" size={16} color={theme.colors.onSurfaceVariant} />
                      </View>
                    </TouchableRipple>
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <Text accessibilityRole="header" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                  APPEARANCE
                </Text>
                <AppearanceSwitcher />
              </View>

              <TouchableRipple
                onPress={() => toast("Sign-in isn't part of the mobile app yet")}
                borderless
                accessibilityRole="button"
                style={[styles.logout, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.logoutContent}>
                  <Icon source="sign-out" size={20} color={theme.colors.error} />
                  <Text style={[styles.rowTitle, { color: theme.colors.error }]}>Log out</Text>
                </View>
              </TouchableRipple>
            </ScrollView>
          </Animated.View>
        </Portal>
      ) : null}
      {/* Mounted after the page, so these sheets stack above it (Paper portals layer in mount order). */}
      {mounted ? (
        <>
          <PanelSheet
            visible={notificationsOpen}
            onDismiss={() => setNotificationsOpen(false)}
            title="Notifications"
            grouped
            height={520}
            footer={
              notifications.unread ? (
                <Button
                  mode="outlined"
                  onPress={markAllNotificationsRead}
                  textColor={theme.colors.onSurface}
                  style={[styles.markAll, { borderColor: theme.colors.outlineVariant }]}>
                  Mark all as read
                </Button>
              ) : undefined
            }>
            <View style={styles.sheetBody}>
              <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                {notifications.items.map((item, index) => {
                  const unread = !notifications.isRead(item.id);
                  return (
                    <View key={item.id}>
                      {index > 0 ? <View style={[styles.rowDivider, { backgroundColor: theme.colors.surfaceVariant }]} /> : null}
                      <TouchableRipple
                        onPress={() => {
                          markNotificationRead(item.id);
                          setNotificationsOpen(false);
                          onDismiss();
                          router.navigate(item.href);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`${unread ? 'Unread. ' : ''}${item.title}. ${item.detail}. ${item.time}`}>
                        <View style={[styles.notification, unread && { backgroundColor: appColors.highlight }]}>
                          <Icon source={item.icon} size={20} color={theme.colors.onSurface} />
                          <View style={styles.flex}>
                            <Text numberOfLines={1} style={[styles.rowTitle, { color: theme.colors.onSurface }]}>
                              {item.title}
                            </Text>
                            <Text numberOfLines={2} style={[styles.small, { color: theme.colors.onSurfaceVariant }]}>
                              {item.detail}
                            </Text>
                            <Text style={[styles.small, styles.time, { color: theme.colors.onSurfaceVariant }]}>{item.time}</Text>
                          </View>
                          {unread ? <View style={[styles.unreadDot, { backgroundColor: theme.colors.error }]} /> : null}
                        </View>
                      </TouchableRipple>
                    </View>
                  );
                })}
              </View>
            </View>
          </PanelSheet>
          <OrganisationSwitcher
            visible={switching}
            onDismiss={() => setSwitching(false)}
            organisations={ORGANISATIONS}
            currentId={organisation.id}
            onApply={(organisationId) => {
              business.applyScope({
                organisationId,
                shopIds: [],
                channel: business.channel,
              });
              toast(`Switched to ${ORGANISATIONS.find((org) => org.id === organisationId)?.name ?? 'organisation'}`);
            }}
          />
        </>
      ) : null}
    </>
  );
}

const CARD_RADIUS = Shape.max;

const styles = StyleSheet.create({
  topBar: { paddingHorizontal: PADDING, paddingBottom: 8 },
  back: { width: 40, height: 40, borderRadius: Shape.max, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: PADDING, gap: 24 },
  flex: { flex: 1, minWidth: 0 },
  identity: { alignItems: 'center', gap: 10, paddingTop: 4 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  initials: { fontFamily: Fonts.semiBold, fontSize: 24, lineHeight: 30 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: '100%' },
  name: { fontFamily: Fonts.semiBold, fontSize: 20, lineHeight: 26, flexShrink: 1 },
  orgCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 12, paddingRight: 8, paddingVertical: 12 },
  switchButton: { borderRadius: Shape.small, margin: 0 },
  switchLabel: { fontSize: 12, marginVertical: 6 },
  small: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16 },
  section: { gap: 8 },
  sectionLabel: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6, paddingHorizontal: 4 },
  card: { borderRadius: CARD_RADIUS, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 60, paddingHorizontal: 16 },
  rowDivider: { height: 1, marginLeft: 16 },
  rowTitle: { fontFamily: Fonts.medium, fontSize: 15, lineHeight: 20 },
  // The unread count, on the bell's top-left as in the reference.
  badge: {
    position: 'absolute',
    left: -8,
    top: -8,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: { fontFamily: Fonts.semiBold, fontSize: 10, lineHeight: 12 },
  switcher: { flexDirection: 'row', padding: SWITCHER_PADDING },
  switcherThumb: {
    position: 'absolute',
    top: SWITCHER_PADDING,
    bottom: SWITCHER_PADDING,
    left: SWITCHER_PADDING,
    borderRadius: concentric(Shape.max, SWITCHER_PADDING),
  },
  switcherOption: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, height: 64 },
  switcherLabel: { fontSize: 12, lineHeight: 16 },
  switcherHint: { paddingHorizontal: 4 },
  sheetBody: { padding: PANEL_PADDING },
  notification: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  time: { marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  markAll: { borderRadius: PANEL_INNER_RADIUS },
  logout: { borderRadius: CARD_RADIUS },
  logoutContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52 },
});

/**
 * Light, Dark or System as three equal tiles on a card, the pick marked by a
 * lime thumb that slides to it (as the listing heroes' view switch). The pick
 * lands first, then the app fades to the new look; under System, a line says
 * what the phone is set to.
 */
function AppearanceSwitcher() {
  const theme = useTheme();
  const appColors = useAppColors();
  const { mode, setMode, systemScheme } = useThemeMode();
  const [picked, setPicked] = useState<ThemeMode>(mode);
  const [trackWidth, setTrackWidth] = useState(0);
  const [thumb] = useState(() => new Animated.Value(THEME_OPTIONS.findIndex((option) => option.value === mode)));
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Follow a pick made elsewhere (or restored from storage after launch).
  const [lastMode, setLastMode] = useState(mode);
  if (mode !== lastMode) {
    setLastMode(mode);
    setPicked(mode);
  }
  const pickedIndex = THEME_OPTIONS.findIndex((option) => option.value === picked);
  useEffect(() => {
    Animated.timing(thumb, { toValue: pickedIndex, duration: 220, easing: EMPHASIZED_DECELERATE, useNativeDriver: true }).start();
  }, [pickedIndex, thumb]);
  useEffect(
    () => () => {
      if (pending.current) clearTimeout(pending.current);
    },
    []
  );

  const segment = trackWidth ? (trackWidth - SWITCHER_PADDING * 2) / THEME_OPTIONS.length : 0;
  const choose = (next: ThemeMode) => {
    setPicked(next);
    if (pending.current) clearTimeout(pending.current);
    pending.current = setTimeout(() => setMode(next), APPLY_DELAY_MS);
  };

  return (
    <View style={styles.section}>
      <View
        accessibilityRole="radiogroup"
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        style={[styles.card, styles.switcher, { backgroundColor: theme.colors.surface }]}>
        {segment ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.switcherThumb,
              {
                width: segment,
                backgroundColor: appColors.highlight,
                transform: [
                  { translateX: thumb.interpolate({ inputRange: [0, THEME_OPTIONS.length - 1], outputRange: [0, segment * (THEME_OPTIONS.length - 1)] }) },
                ],
              },
            ]}
          />
        ) : null}
        {THEME_OPTIONS.map((option) => {
          const active = option.value === picked;
          const color = active ? theme.colors.onSurface : theme.colors.onSurfaceVariant;
          return (
            <Pressable
              key={option.value}
              onPress={() => choose(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              aria-checked={active}
              accessibilityLabel={`${option.label} appearance`}
              style={styles.switcherOption}>
              <Icon source={option.icon} size={20} color={color} />
              <Text style={[styles.switcherLabel, { color, fontFamily: active ? Fonts.semiBold : Fonts.medium }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.small, styles.switcherHint, { color: theme.colors.onSurfaceVariant }]}>
        {picked === 'system' ? `Follows your phone · ${systemScheme === 'dark' ? 'Dark' : 'Light'} right now` : 'Stays this way until you change it'}
      </Text>
    </View>
  );
}
