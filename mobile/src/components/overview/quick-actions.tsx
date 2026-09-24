import { type Href, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Badge, Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { disputeRecords } from '@/data/disputes';
import { useBusiness } from '@/hooks/use-business';

type QuickAction = { key: string; label: string; icon: string; href: () => Href; badge?: number };

const COLUMNS = 4;
const TILE_PADDING = 8;
const ICON_RADIUS = concentric(Shape.max, TILE_PADDING);

/**
 * Quick actions (mobile-only, replaces the web Overview's Analytics): the
 * tasks a merchant most often opens the app for, each one tap away. Actions
 * that start a flow open it directly (Generate report, New payment link,
 * Invite user); the rest open the right list. Disputes shows how many need a
 * response in the current channel.
 */
export function QuickActions() {
  const theme = useTheme();
  const { channel } = useBusiness();
  const pendingDisputes = disputeRecords.filter(
    (row) => row.status === 'Action pending' && (channel === 'all' || row.channel === channel)
  ).length;

  const actions: QuickAction[] = [
    // Timestamps make each tap a new request, so the flow opens even if the screen is already mounted.
    { key: 'report', label: 'Download report', icon: 'download-simple', href: () => ({ pathname: '/reports', params: { generate: String(Date.now()) } }) },
    { key: 'payment-link', label: 'Create payment link', icon: 'link-simple', href: () => ({ pathname: '/more/payment-links', params: { create: '1' } }) },
    { key: 'refund', label: 'Refund a payment', icon: 'arrow-u-up-left', href: () => '/payments?tab=transactions' },
    { key: 'settlements', label: 'Track settlements', icon: 'bank', href: () => '/payments?tab=settlements' },
    { key: 'disputes', label: 'Respond to disputes', icon: 'gavel', href: () => '/more/disputes', badge: pendingDisputes },
    { key: 'device', label: 'Manage devices', icon: 'cash-register', href: () => '/more/terminal-devices' },
    { key: 'invite', label: 'Invite user', icon: 'user-plus', href: () => ({ pathname: '/more/users', params: { invite: '1' } }) },
    { key: 'help', label: 'Get help', icon: 'chat-circle', href: () => '/support/chat' },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.title} accessibilityRole="header">
        Quick actions
      </Text>
      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableRipple
            key={action.key}
            onPress={() => router.push(action.href())}
            borderless
            accessibilityRole="button"
            accessibilityLabel={action.badge ? `${action.label}, ${action.badge} pending` : action.label}
            style={[styles.tile, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
            <View style={styles.tileContent}>
              <View style={[styles.iconTile, { backgroundColor: theme.colors.secondaryContainer }]}>
                <Icon source={action.icon} size={22} color={theme.colors.onSecondaryContainer} />
                {action.badge ? (
                  <Badge size={18} style={styles.badge}>
                    {action.badge}
                  </Badge>
                ) : null}
              </View>
              <Text variant="labelMedium" numberOfLines={2} style={styles.label}>
                {action.label}
              </Text>
            </View>
          </TouchableRipple>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  // Matches the Explore products title.
  title: { fontFamily: Fonts.semiBold, fontSize: 24, lineHeight: 31 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    flexBasis: `${100 / COLUMNS - 3}%`,
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: Shape.max,
  },
  tileContent: { alignItems: 'center', gap: 8, padding: TILE_PADDING, paddingTop: 12, minHeight: 96 },
  iconTile: { width: 44, height: 44, borderRadius: ICON_RADIUS, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -6, right: -8 },
  label: { textAlign: 'center', fontFamily: Fonts.medium },
});
