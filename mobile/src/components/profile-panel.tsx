import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Icon, Portal, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SETTINGS_GROUPS } from '@/components/account/account-settings';
import { OrganisationLogo, OrganisationSwitcher } from '@/components/account/organisation-switcher';
import { OutlineTag } from '@/components/shared/status';
import { useAppColors } from '@/constants/app-colors';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { CURRENT_USER, ORGANISATIONS } from '@/data/businesses';
import { INITIAL_ROSTER } from '@/data/user-roster';
import { useBusiness } from '@/hooks/use-business';
import { type ThemeMode, useThemeMode } from '@/hooks/use-theme-mode';
import { useToast } from '@/hooks/use-toast';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'device-mobile' },
];
const SWITCHER_PADDING = 4;
/** Long enough to see the pick land before the app fades to the new look. */
const APPLY_DELAY_MS = 160;

const MAX_WIDTH = 320;
const PADDING = 16;
// M3 emphasized easings, as the app's sheets.
const EMPHASIZED_DECELERATE = Easing.bezier(0.05, 0.7, 0.1, 1);
const EMPHASIZED_ACCELERATE = Easing.bezier(0.3, 0, 0.8, 0.15);
/** Web's Tirth Trivedi roster entry — the signed-in mobile user. */
const USER_EMAIL = INITIAL_ROSTER.find((entry) => entry.name === CURRENT_USER.name)?.email ?? '';

/**
 * The profile panel, opened from the initials avatar in Overview's header: a
 * drawer from the leading edge, where the avatar is. Only what's about the
 * person, not the app's modules (those are in the navigation bar and More): who's
 * signed in; the organisation, with Switch opening the organisation sheet to
 * pick and confirm another (it starts on all its stores); the settings
 * sections in their groups, each opening its page; Light, Dark or System appearance; and Log out. Tap outside or Android Back closes it.
 */
export function ProfilePanel({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const business = useBusiness();
  const toast = useToast();
  const appColors = useAppColors();
  const [switching, setSwitching] = useState(false);
  const organisation = business.organisation;
  const width = Math.min(MAX_WIDTH, Math.round(windowWidth * 0.86));
  const [progress] = useState(() => new Animated.Value(0));
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

  return (
    <>
      {mounted ? (
        <Portal>
          <View style={StyleSheet.absoluteFill}>
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: theme.colors.scrim,
                  opacity: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.32],
                  }),
                },
              ]}>
              <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessibilityLabel="Close profile" />
            </Animated.View>
            <Animated.View
              accessibilityViewIsModal
              style={[
                styles.panel,
                {
                  width,
                  paddingTop: insets.top,
                  backgroundColor: theme.colors.background,
                  transform: [
                    {
                      translateX: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-width, 0],
                      }),
                    },
                  ],
                },
              ]}>
              <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Who's signed in. */}
                <View style={styles.profile}>
                  <View
                    style={[
                      styles.avatar,
                      {
                        borderColor: theme.colors.outlineVariant,
                        backgroundColor: theme.colors.surface,
                      },
                    ]}>
                    <Text style={[styles.initials, { color: appColors.brand }]}>{initials}</Text>
                  </View>
                  <View style={styles.flex}>
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
                </View>

                {/* The organisation everything shows; Switch opens the sheet to pick and confirm another. */}
                <View style={styles.section}>
                  <Text accessibilityRole="header" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                    ORGANISATION
                  </Text>
                  <View style={[styles.card, styles.row, { backgroundColor: theme.colors.surface }]}>
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
                        onPress={() => {
                          // The panel steps aside so the organisation sheet is in front.
                          onDismiss();
                          setSwitching(true);
                        }}
                        textColor={theme.colors.onSurface}
                        accessibilityLabel={`Switch organisation from ${organisation.name}`}
                        labelStyle={styles.switchLabel}
                        style={[styles.switchButton, { borderColor: theme.colors.outlineVariant }]}>
                        Switch
                      </Button>
                    ) : null}
                  </View>
                </View>

                {/* The settings, each opening its own page — reached from here rather than the navigation bar. */}
                {SETTINGS_GROUPS.map((group) => (
                  <View key={group.label} style={styles.section}>
                    <Text accessibilityRole="header" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                      {group.label.toUpperCase()}
                    </Text>
                    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                      {group.sections.map((section, index) => (
                        <View key={section.key}>
                          {index > 0 ? <View style={[styles.rowDivider, { backgroundColor: theme.colors.surfaceVariant }]} /> : null}
                          <TouchableRipple
                            onPress={() => {
                              onDismiss();
                              router.push({ pathname: '/account-settings/[section]', params: { section: section.key } });
                            }}
                            accessibilityRole="button">
                            <View style={[styles.row, styles.linkRow]}>
                              <View style={[styles.rowTile, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <Icon source={section.icon} size={16} color={theme.colors.onSurface} />
                              </View>
                              <Text numberOfLines={1} style={[styles.flex, styles.rowTitle, { color: theme.colors.onSurface }]}>
                                {section.title}
                              </Text>
                              <Icon source="caret-right" size={16} color={theme.colors.onSurfaceVariant} />
                            </View>
                          </TouchableRipple>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}

                <View style={styles.section}>
                  <Text accessibilityRole="header" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                    APPEARANCE
                  </Text>
                  <AppearanceSwitcher />
                </View>
              </ScrollView>

              <View style={[styles.footer, { paddingBottom: Math.max(PADDING, insets.bottom) }]}>
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
              </View>
            </Animated.View>
          </View>
        </Portal>
      ) : null}
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
  );
}

const CARD_RADIUS = Shape.max;

const styles = StyleSheet.create({
  // Attached to the leading edge: only the content-facing (trailing) corners are rounded.
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderTopRightRadius: Shape.max,
    borderBottomRightRadius: Shape.max,
    overflow: 'hidden',
  },
  content: { padding: PADDING, gap: 24 },
  flex: { flex: 1, minWidth: 0 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Shape.small,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontFamily: Fonts.medium, fontSize: 16, lineHeight: 20 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
    flexShrink: 1,
  },
  small: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16 },
  section: { gap: 8 },
  sectionLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    paddingHorizontal: 4,
  },
  card: { borderRadius: CARD_RADIUS, overflow: 'hidden' },
  switchButton: { borderRadius: Shape.small, margin: 0 },
  switchLabel: { fontSize: 12, marginVertical: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 10,
  },
  linkRow: { paddingRight: 12 },
  rowDivider: { height: 1, marginLeft: 12 + 32 + 12 },
  rowTile: { width: 32, height: 32, borderRadius: Shape.small, alignItems: 'center', justifyContent: 'center' },
  switcher: { flexDirection: 'row', padding: SWITCHER_PADDING },
  switcherThumb: { position: 'absolute', top: SWITCHER_PADDING, bottom: SWITCHER_PADDING, left: SWITCHER_PADDING, borderRadius: concentric(Shape.max, SWITCHER_PADDING) },
  switcherOption: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, height: 64 },
  switcherLabel: { fontSize: 12, lineHeight: 16 },
  switcherHint: { paddingHorizontal: 4 },
  rowTitle: { fontFamily: Fonts.medium, fontSize: 14, lineHeight: 20 },
  footer: { paddingHorizontal: PADDING, paddingTop: 8 },
  logout: { borderRadius: concentric(Shape.max, 0) },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
  },
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
  useEffect(() => () => {
    if (pending.current) clearTimeout(pending.current);
  }, []);

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
                transform: [{ translateX: thumb.interpolate({ inputRange: [0, THEME_OPTIONS.length - 1], outputRange: [0, segment * (THEME_OPTIONS.length - 1)] }) }],
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
