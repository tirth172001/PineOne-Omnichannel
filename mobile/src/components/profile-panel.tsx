import { useEffect, useState } from 'react';
import { Animated, BackHandler, Easing, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Icon, Portal, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrganisationLogo, OrganisationSwitcher } from '@/components/account/organisation-switcher';
import { CompactSegmentedButtons } from '@/components/shared/controls';
import { OutlineTag } from '@/components/shared/status';
import { useAppColors } from '@/constants/app-colors';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { CURRENT_USER, ORGANISATIONS } from '@/data/businesses';
import { INITIAL_ROSTER } from '@/data/user-roster';
import { useBusiness } from '@/hooks/use-business';
import { type ThemeMode, useThemeMode } from '@/hooks/use-theme-mode';
import { useToast } from '@/hooks/use-toast';

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

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
 * person, not the app's pages (those are in the navigation bar and More): who's
 * signed in; the organisation, with Switch opening the organisation sheet to
 * pick and confirm another (it starts on all its stores); Light, Dark or
 * System appearance; and Log out. Tap outside or Android Back closes it.
 */
export function ProfilePanel({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const business = useBusiness();
  const toast = useToast();
  const appColors = useAppColors();
  const themeMode = useThemeMode();
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

                <View style={styles.section}>
                  <Text accessibilityRole="header" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                    APPEARANCE
                  </Text>
                  <CompactSegmentedButtons value={themeMode.mode} onValueChange={themeMode.setMode} options={THEME_OPTIONS} radius={Shape.small} grow />
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
