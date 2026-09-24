import { Image } from 'expo-image';
import { type Href, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Card, Icon, Text, useTheme } from 'react-native-paper';

import { ListCard, ListRow } from '@/components/shared/listing';
import { OutlineTag } from '@/components/shared/status';
import { concentric, Shape } from '@/constants/shape';
import { Fonts } from '@/constants/theme';
import { CURRENT_USER } from '@/data/businesses';
import { useBusiness } from '@/hooks/use-business';
import { useToast } from '@/hooks/use-toast';

type MoreItem = { label: string; icon: string; href: Href };

/**
 * The web sidebar's destinations that don't have their own tab (Payments,
 * Settlement, Refunds, Reports and Support do), in the sidebar's groups:
 * web: navGroups + the "Other" group in TransactionsPlatformShell.
 */
const MORE_SECTIONS: { label: string; items: MoreItem[] }[] = [
  { label: 'Payments', items: [{ label: 'Disputes', icon: 'gavel', href: '/more/disputes' }] },
  {
    label: 'Products',
    items: [
      { label: 'Terminal devices', icon: 'cash-register', href: '/more/terminal-devices' },
      { label: 'Payment links', icon: 'link-simple', href: '/more/payment-links' },
      { label: 'Checkout', icon: 'palette', href: '/more/checkout' },
    ],
  },
  {
    label: 'Other',
    items: [
      { label: 'Manage store', icon: 'storefront', href: '/more/stores' },
      { label: 'Manage users and roles', icon: 'users', href: '/more/users' },
      { label: 'Account settings', icon: 'gear', href: '/more/account-settings' },
    ],
  },
];

const CARD_PADDING = 16;
const AVATAR_RADIUS = concentric(Shape.max, CARD_PADDING);

/**
 * More tab: the signed-in user and business, then every remaining module
 * grouped as in the web sidebar, and Logout (web: the account menu).
 */
export function MoreMenu() {
  const theme = useTheme();
  const toast = useToast();
  const business = useBusiness();
  const muted = { color: theme.colors.onSurfaceVariant };

  return (
    <View style={styles.container}>
      <Card mode="outlined" style={[styles.profile, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        <View style={styles.profileBody}>
          <Image source={CURRENT_USER.avatar} style={styles.avatar} contentFit="cover" accessibilityIgnoresInvertColors />
          <View style={styles.flex}>
            <Text variant="titleMedium" style={styles.semiBold}>
              {CURRENT_USER.name}
            </Text>
            <Text variant="bodySmall" style={muted} numberOfLines={1}>
              {business.organisation.name} · {business.scopeLabel}
            </Text>
          </View>
          <OutlineTag label={CURRENT_USER.roleLabel} radius={AVATAR_RADIUS} />
        </View>
      </Card>

      {MORE_SECTIONS.map((section) => (
        <View key={section.label} style={styles.section}>
          <Text variant="labelLarge" style={[styles.sectionLabel, muted]} accessibilityRole="header">
            {section.label}
          </Text>
          <ListCard>
            {section.items.map((item) => (
              <ListRow key={item.label} onPress={() => router.push(item.href)} accessibilityLabel={item.label}>
                <View style={styles.item}>
                  <Icon source={item.icon} size={20} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodyLarge">{item.label}</Text>
                </View>
              </ListRow>
            ))}
          </ListCard>
        </View>
      ))}

      <ListCard>
        {[
          <ListRow key="logout" onPress={() => toast("Sign-in isn't part of the mobile app yet")} accessibilityLabel="Logout">
            <View style={styles.item}>
              <Icon source="sign-out" size={20} color={theme.colors.error} />
              <Text variant="bodyLarge" style={{ color: theme.colors.error }}>
                Logout
              </Text>
            </View>
          </ListRow>,
        ]}
      </ListCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 24 },
  flex: { flex: 1 },
  semiBold: { fontFamily: Fonts.semiBold },
  profile: { borderRadius: Shape.max },
  profileBody: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: CARD_PADDING },
  avatar: { width: 48, height: 48, borderRadius: AVATAR_RADIUS },
  section: { gap: 8 },
  sectionLabel: { paddingHorizontal: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 24 },
});
